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
  StdoutEventData,
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

  const [streamResponse] = createResource(() =>
    hostService.starTerminalStream(props.hostId, props.terminalId),
  );

  const { findOne, update } = useTerminalHistory();

  createEffect(() => {
    const element = ref();
    const terminalId = props.terminalId;

    const fitAddon = new FitAddon();
    const webglAddon = new WebglAddon();

    if (element) {
      const xterm = new Xterm({
        cursorBlink: true,
        convertEol: true,
        theme: { background: "#111827FF" },
      });

      xterm.loadAddon(fitAddon);
      xterm.loadAddon(webglAddon);

      xterm.open(element);
      fitAddon.fit();

      const handleResize = () => {
        fitAddon.fit();
      };

      const history = findOne(props.terminalId);
      if (history) {
        setLocalHistory(history);
        xterm.write(history);
      }

      xterm.onData(async (data) => {
        await emit(`${terminalId}_in`, { key: data });
      });
      xterm.onResize(async (evt) => {
        await emit(`${terminalId}_resize`, {
          cols: evt.cols,
          rows: evt.rows,
        } as WindowChangeEventData);
      });

      setXterm(xterm);

      window.addEventListener("resize", handleResize);

      onCleanup(() => {
        window.removeEventListener("resize", handleResize);
        xterm.dispose();
        webglAddon.dispose();
        setXterm(undefined);
        update(terminalId, localHistory());
        setLocalHistory("");
      });
    }
  });

  let unlistenFn: UnlistenFn | undefined;
  createEffect(() => {
    const currentXterm = xterm();

    const terminalId = props.terminalId;
    if (!currentXterm || !terminalId) return;

    (async () => {
      unlistenFn = await listen<StdoutEventData>(`${terminalId}_out`, (evt) => {
        setLocalHistory((p) => p + uint8ArrayToString(evt.payload.message));
        currentXterm.write(evt.payload.message);
      });
    })();

    onCleanup(() => {
      if (unlistenFn) {
        unlistenFn();
      }
    });
  });

  return <div class="size-full" ref={setRef} />;
};

export default Terminal;
