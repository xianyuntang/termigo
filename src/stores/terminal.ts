import { createContextProvider } from "@solid-primitives/context";
import { createStore } from "solid-js/store";

import { StatusType } from "../components/pages/terminal-page-container/terminal/terminal.interface.ts";

export interface ActiveTerminal {
  hostId: string;
  terminalId: string;
  label: string;
}

const [ActiveTerminalProvider, useActiveTerminal] = createContextProvider(
  () => {
    const [activeTerminals, setActiveTerminal] = createStore<ActiveTerminal[]>(
      [],
    );

    const add = (hostId: string, terminalId: string, label: string) => {
      setActiveTerminal((prev) => [...prev, { hostId, terminalId, label }]);
    };

    const remove = (terminalId: string) => {
      setActiveTerminal((prev) =>
        prev.filter((e) => e.terminalId !== terminalId),
      );
    };

    const findOne = (terminalId: string) => {
      return activeTerminals.find((e) => e.terminalId === terminalId);
    };

    return {
      activeTerminals,
      add,
      remove,
      findOne,
    };
  },
  {
    activeTerminals: [],
    add: () => {},
    remove: () => {},
    findOne: () => undefined,
  },
);

const [TerminalHistoryProvider, useTerminalHistory] = createContextProvider(
  () => {
    const [terminalHistories, setTerminalHistories] = createStore<
      Record<string, string>
    >({});

    const [terminalStatues, setTerminalStatues] = createStore<
      Record<string, StatusType>
    >({});

    const update = (terminalId: string, history: string) => {
      setTerminalHistories(terminalId, history);
    };

    const findOne = (terminalId: string): string | undefined => {
      return terminalHistories[terminalId];
    };

    const updateStatus = (terminalId: string, status: StatusType) => {
      setTerminalStatues(terminalId, status);
    };

    const getStatus = (terminalId: string): StatusType | undefined => {
      return terminalStatues[terminalId];
    };

    return {
      update,
      findOne,
      updateStatus,
      getStatus,
    };
  },
  {
    update: () => {},
    findOne: () => undefined,
    updateStatus: () => {},
    getStatus: () => undefined,
  },
);

export {
  ActiveTerminalProvider,
  TerminalHistoryProvider,
  useActiveTerminal,
  useTerminalHistory,
};
