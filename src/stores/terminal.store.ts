import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { Host } from "../interfaces";

interface TerminalState {
  activeTerminal: string | null;
  openedTerminals: string[];
  hostMapper: Record<string, Host>;
  setActiveTerminal: (_activeTerminal: string | null) => void;
  addTerminal: (_terminal: string, _host: Host) => void;
  removeTerminal: (_terminal: string) => void;
}

const useTerminalStore = create<TerminalState>()(
  immer((set) => ({
    activeTerminal: null,
    openedTerminals: [],
    hostMapper: {},
    setActiveTerminal: (activeTerminal: string | null) => {
      set({ activeTerminal });
    },
    addTerminal: (terminal: string, host: Host) => {
      set((state) => {
        state.openedTerminals.push(terminal);
        state.hostMapper[terminal] = host;
      });
    },
    removeTerminal: (terminal: string) => {
      set((state) => {
        state.openedTerminals.splice(
          state.openedTerminals.findIndex((t) => t === terminal),
          1,
        );
        delete state.hostMapper[terminal];
      });
    },
  })),
);

export { useTerminalStore };
