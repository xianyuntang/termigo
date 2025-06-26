import { useTerminalStore } from "@/stores";

import TerminalView from "../components/terminal-view/terminal-view";

const TerminalsPage = () => {
  const activeTerminal = useTerminalStore((state) => state.activeTerminal);
  const openedTerminals = useTerminalStore((state) => state.openedTerminals);

  return (
    <>
      {openedTerminals.map((openedTerminal) => (
        <div
          key={openedTerminal}
          className={`h-full ${openedTerminal === activeTerminal ? "block" : "hidden"}`}
        >
          <TerminalView terminal={openedTerminal} />
        </div>
      ))}
    </>
  );
};

export default TerminalsPage;
