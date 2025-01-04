import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface Portforward {
  tunnel: string;
  localAddress: string;
  localPort: string;
  destinationAddress: string;
  destinationPort: string;
}

interface PortforwardState {
  portforwards: Record<string, Portforward[]>;
  addPortforward: (host: string, pfData: Portforward) => void;
  removePortforward: (host: string, tunnel: string) => void;
}

const usePortforwardStore = create<PortforwardState>()(
  immer((set) => ({
    portforwards: {},
    addPortforward: (host: string, pfData: Portforward) => {
      set((state) => {
        if (!state.portforwards[host]) {
          state.portforwards[host] = [];
        }
        state.portforwards[host].push(pfData);
      });
    },

    removePortforward: (host: string, tunnel: string) => {
      set((state) => {
        state.portforwards[host].splice(
          state.portforwards[host].findIndex((pf) => pf.tunnel === tunnel),
          1,
        );
      });
    },
  })),
);

export { usePortforwardStore };
