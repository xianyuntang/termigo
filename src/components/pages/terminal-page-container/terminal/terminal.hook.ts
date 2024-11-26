import "@xterm/xterm/css/xterm.css";

import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";
import {
  ITerminalInitOnlyOptions,
  ITerminalOptions,
  Terminal as Xterm,
} from "@xterm/xterm";
import { Accessor, createSignal, onCleanup, onMount } from "solid-js";

interface UseXtermProps {
  ref: Accessor<HTMLDivElement | undefined>;
  options?: ITerminalOptions & ITerminalInitOnlyOptions;
}

export const useXterm = ({ ref, options }: UseXtermProps) => {
  const [xterm, setXterm] = createSignal<Xterm>();

  const fitAddon = new FitAddon();
  const webglAddon = new WebglAddon();

  onMount(() => {
    const containerRef = ref();

    if (containerRef) {
      const xterm = new Xterm(options);
      xterm.loadAddon(fitAddon);
      xterm.loadAddon(webglAddon);

      xterm.open(containerRef);
      fitAddon.fit();

      setXterm(xterm);
    }
  });

  onCleanup(() => {
    xterm()?.dispose();
  });

  const fit = () => {
    fitAddon.fit();
  };

  return { xterm, fit };
};
