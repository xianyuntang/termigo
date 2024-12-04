import "@xterm/xterm/css/xterm.css";
import "./xterm.css";

import { emit, listen, UnlistenFn } from "@tauri-apps/api/event";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";
import { Terminal as Xterm } from "@xterm/xterm";
import {
  Component,
  createEffect,
  createResource,
  createSignal,
  onCleanup,
} from "solid-js";

import { uint8ArrayToString } from "../../../../core";
import { hostService } from "../../../../services";
import { useTerminalHistory } from "../../../../stores";
import {
  InEventData,
  isOutEventData,
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

  createResource(() =>
    hostService.starTerminalStream(props.hostId, props.terminalId),
  );

  const { findOne, update } = useTerminalHistory();

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
        setLocalHistory("");
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

  return <div class="size-full" ref={setRef} />;
};

export default Terminal;
