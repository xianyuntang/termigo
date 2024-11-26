import { emit, listen, UnlistenFn } from "@tauri-apps/api/event";
import { Component, createSignal, onCleanup, onMount } from "solid-js";

import { Host } from "../../../../services/host.service.ts";
import { useXterm } from "./terminal.hook.ts";
import {
  StdoutEventData,
  WindowChangeEventData,
} from "./terminal.interface.ts";

interface TerminalProps {
  host: Host & { futureId: string };
}

const Terminal: Component<TerminalProps> = (props) => {
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();

  const { xterm, fit } = useXterm({
    ref: containerRef,
    options: {
      cursorBlink: true,
      convertEol: true,
      theme: { background: "#111827FF" },
    },
  });

  let unlistenFn: UnlistenFn | undefined;

  onMount(async () => {
    if (xterm()) {
      const { futureId } = props.host;

      unlistenFn = await listen<StdoutEventData>(`${futureId}_out`, (evt) => {
        xterm()?.write(evt.payload.message);
      });

      xterm()?.onData(async (data) => {
        await emit(`${futureId}_in`, { key: data });
      });
      xterm()?.onResize(async (evt) => {
        await emit(`${futureId}_resize`, {
          cols: evt.cols,
          rows: evt.rows,
        } as WindowChangeEventData);
      });

      xterm()?.onRender(() => {
        fit();
      });
    }
  });

  onCleanup(() => {
    unlistenFn?.();
  });

  return <div class="size-full" ref={setContainerRef} />;
};

export default Terminal;
