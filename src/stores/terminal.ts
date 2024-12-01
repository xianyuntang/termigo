import { createContextProvider } from "@solid-primitives/context";
import { createStore } from "solid-js/store";

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

    const update = (terminalId: string, history: string) => {
      setTerminalHistories(terminalId, history);
    };

    const findOne = (terminalId: string): string | undefined => {
      return terminalHistories[terminalId];
    };

    return {
      update,
      findOne,
    };
  },
  {
    update: () => {},
    findOne: () => undefined,
  },
);

export {
  ActiveTerminalProvider,
  TerminalHistoryProvider,
  useActiveTerminal,
  useTerminalHistory,
};
