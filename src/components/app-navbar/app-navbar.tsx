import { AppBar, Toolbar } from "@mui/material";

import TerminalShortcuts from "./terminal-shortcuts";

const AppNavbar = () => {
  return (
    <AppBar position="sticky">
      <Toolbar variant="dense" sx={(theme) => ({ paddingX: theme.spacing(1) })}>
        <TerminalShortcuts />
      </Toolbar>
    </AppBar>
  );
};

export default AppNavbar;
