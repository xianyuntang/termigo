import { Box } from "@mui/material";

import { useTerminalStore } from "../../../stores";
import TerminalView from "./terminal-view/terminal-view";

const TerminalsPage = () => {
  const activeTerminal = useTerminalStore((state) => state.activeTerminal);
  const openedTerminals = useTerminalStore((state) => state.openedTerminals);

  return (
    <>
      {openedTerminals.map((openedTerminal) => (
        <Box
          key={openedTerminal}
          sx={{
            display: openedTerminal === activeTerminal ? "block" : "none",
            height: "100%",
          }}
        >
          <TerminalView terminal={openedTerminal} />
        </Box>
      ))}
    </>
  );
};

export default TerminalsPage;
