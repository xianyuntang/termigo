import "@xterm/xterm/css/xterm.css";
import "./xterm.css";

import { emit, listen, UnlistenFn } from "@tauri-apps/api/event";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";
import { Terminal as Xterm } from "@xterm/xterm";
import { ImCheckmark, ImCross } from "solid-icons/im";
import {
  Component,
  createEffect,
  createResource,
  createSignal,
  Match,
  onCleanup,
  Switch,
} from "solid-js";
import { twMerge } from "tailwind-merge";

import { uint8ArrayToString } from "../../../../core/index.ts";
import { hostService } from "../../../../services/index.ts";
import { useTerminalHistory } from "../../../../stores/index.ts";
import {
  InEventData,
  isOutEventData,
  isStatusEventData,
  StatusType,
  TerminalEvent,
  WindowChangeEventData,
} from "./terminal.interface.ts";

interface TerminalProps {
  hostId: string;
  terminalId: string;
}

const Terminal: Component<TerminalProps> = (props) => {
  const [ref, setRef] = createSignal<HTMLDivElement>();
  const [xterm, setXterm] = createSignal<Xterm>();
  const [localHistory, setLocalHistory] = createSignal<string>("");
  const [localStatus, setLocalStatus] = createSignal<StatusType>(
    StatusType.Pending
  );

  createResource(() =>
    hostService.starTerminalStream(props.hostId, props.terminalId)
  );

  const { findOne, update, updateStatus, getStatus } = useTerminalHistory();

  const fitAddon = new FitAddon();
  const webglAddon = new WebglAddon();

  createEffect(() => {
    const element = ref();
    const terminalId = props.terminalId;

    if (element) {
      const xterm = new Xterm({
        cursorBlink: true,
        convertEol: true,
        theme: { background: "#111827FF" },
      });

      xterm.loadAddon(fitAddon);
      xterm.loadAddon(webglAddon);
      xterm.open(element);

      const handleResize = () => {
        fitAddon.fit();
      };

      const history = findOne(props.terminalId);

      if (history) {
        setLocalHistory(history);
        xterm.write(history);
        xterm.focus();
      }

      const status = getStatus(props.terminalId);
      if (status) {
        setLocalStatus(status);
      }

      xterm.onData(async (data) => {
        await emit(terminalId, {
          data: { in: data } as InEventData,
        });
      });
      xterm.onResize(async (evt) => {
        await emit(terminalId, {
          data: { size: [evt.cols, evt.rows] } as WindowChangeEventData,
        });
      });

      setXterm(xterm);

      window.addEventListener("resize", handleResize);

      onCleanup(() => {
        window.removeEventListener("resize", handleResize);
        xterm.dispose();
        webglAddon.dispose();
        fitAddon.dispose();
        setXterm(undefined);
        update(terminalId, localHistory());
        updateStatus(terminalId, localStatus());
        setLocalHistory("");
        setLocalStatus(StatusType.Pending);
      });
    }
  });

  let unlistenOutFn: UnlistenFn | undefined;
  createEffect(() => {
    const currentXterm = xterm();

    const terminalId = props.terminalId;
    if (!currentXterm || !terminalId) return;

    (async () => {
      unlistenOutFn = await listen<TerminalEvent>(terminalId, ({ payload }) => {
        if (isOutEventData(payload)) {
          setLocalHistory((p) => p + uint8ArrayToString(payload.data.out));
          currentXterm.write(payload.data.out);
        } else if (isStatusEventData(payload)) {
          setLocalStatus(payload.data.status);
          if (payload.data.status === StatusType.ChannelOpened) {
            currentXterm.focus();
          } else if (
            [StatusType.ConnectionTimeout, StatusType.AuthFailed].includes(
              payload.data.status
            )
          ) {
            currentXterm.dispose();
          }
        }
      });
    })();

    onCleanup(() => {
      if (unlistenOutFn) {
        unlistenOutFn();
      }
    });
  });

  createEffect(() => {
    const currentXterm = xterm();
    if (currentXterm) {
      fitAddon.fit();
    }
  });

  return (
    <div
      class="relative flex size-full items-center justify-center"
      ref={setRef}
    >
      <div
        class={twMerge(
          "absolute transition-opacity opacity-100 z-10 flex h-60 w-80 max-w-sm flex-col items-center justify-center rounded-lg border border-gray-700 bg-gray-800 p-6 text-white shadow",
          localStatus() === StatusType.Connected && "opacity-0",
          localStatus() === StatusType.ChannelOpened && "hidden"
        )}
      >
        <Switch>
          <Match
            when={[StatusType.Pending, StatusType.Connecting].includes(
              localStatus()
            )}
          >
            <div class="flex w-full justify-center">
              <svg
                aria-hidden="true"
                class="size-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
            </div>
          </Match>
          <Match
            when={[
              StatusType.ConnectionTimeout,
              StatusType.AuthFailed,
            ].includes(localStatus())}
          >
            <ImCross class="size-8" />
          </Match>
          <Match
            when={[StatusType.Connected, StatusType.ChannelOpened].includes(
              localStatus()
            )}
          >
            <ImCheckmark class="size-8" />
          </Match>
        </Switch>

        <div class="mt-4">{localStatus()}</div>
      </div>
    </div>
  );
};

export default Terminal;
