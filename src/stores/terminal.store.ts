import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { Host } from "../interfaces";

interface TerminalState {
  activeTerminal: string | null;
  openedTerminals: string[];
  map: Record<string, Host>;
  setActiveTerminal: (activeTerminal: string | null) => void;
  addTerminal: (terminal: string, host: Host) => void;
  removeTerminal: (terminal: string) => void;
  getHost: (terminal: string) => Host;
}

const useTerminalStore = create<TerminalState>()(
  immer((set, get) => ({
    activeTerminal: null,
    openedTerminals: [],
    map: {},
    setActiveTerminal: (activeTerminal: string | null) => {
      set({ activeTerminal });
    },
    addTerminal: (terminal: string, host: Host) => {
      set((state) => {
        state.openedTerminals.push(terminal);
        state.map[terminal] = host;
      });
    },
    removeTerminal: (terminal: string) => {
      set((state) => {
        state.openedTerminals.splice(
          state.openedTerminals.findIndex((t) => t === terminal),
          1
        );
      });
    },
    getHost: (terminal: string) => {
      return get().map[terminal];
    },
  }))
);

export { useTerminalStore };
