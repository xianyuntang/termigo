import {
  Box,
  createTheme,
  CssBaseline,
  GlobalStyles,
  ThemeProvider,
} from "@mui/material";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

import AppNavbar from "../components/app-navbar";
import TerminalsPage from "../components/pages/terminals-page";
import SideMenu from "../components/side-menu";
import { useTerminalStore } from "../stores";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
  components: {
    MuiCardHeader: {
      styleOverrides: {
        root: {
          cursor: "default",
        },
      },
    },
  },
});

export const Route = createRootRoute({
  component: RouteComponent,
});

function RouteComponent() {
  const activeTerminal = useTerminalStore((state) => state.activeTerminal);

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <GlobalStyles
          styles={{
            "*": {
              userSelect: "none",
            },
          }}
        />
        <Box sx={{ display: "flex" }}>
          <SideMenu />

          <Box sx={{ flexGrow: 1, overflowX: "hidden" }}>
            <AppNavbar />
            <Box component="main" sx={{ flexFlow: 1 }}>
              {activeTerminal ? <TerminalsPage /> : <Outlet />}
            </Box>
          </Box>
          <TanStackRouterDevtools />
        </Box>
      </ThemeProvider>
    </>
  );
}
