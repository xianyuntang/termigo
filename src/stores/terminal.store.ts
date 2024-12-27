import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface TerminalState {
  activeTerminal: string | null;
  openedTerminals: string[];
  setActiveTerminal: (activeTerminal: string | null) => void;
  addTerminal: (terminal: string) => void;
  removeTerminal: (terminal: string) => void;
}

const useTerminalStore = create<TerminalState>()(
  immer((set) => ({
    activeTerminal: null,
    openedTerminals: [],
    setActiveTerminal: (activeTerminal: string | null) => {
      set({ activeTerminal });
    },
    addTerminal: (terminal: string) => {
      set((state) => {
        state.openedTerminals.push(terminal);
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
  }))
);

export { useTerminalStore };
