import {
  Box,
  createTheme,
  CssBaseline,
  GlobalStyles,
  ThemeProvider,
} from "@mui/material";
import { createRootRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useEffect } from "react";

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
  const navigate = useNavigate();

  useEffect(() => {
    void navigate({ to: "/hosts" });
  }, [navigate]);

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
        <Box sx={{ display: "flex", height: "100vh" }}>
          <SideMenu />

          <Box
            sx={{
              display: "flex",
              flexGrow: 1,
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <AppNavbar />
            <Box
              component="main"
              sx={(theme) => ({
                flexGrow: 1,
                padding: theme.spacing(2),
                minHeight: 0,
              })}
            >
              <Box
                sx={{
                  flex: 1,
                  overflow: "hidden",
                  display: activeTerminal ? "block" : "none",
                  height: "100%",
                }}
              >
                <TerminalsPage />
              </Box>
              <Box
                sx={{
                  flex: 1,
                  overflow: "auto",
                  display: activeTerminal ? "none" : "block",
                  height: "100%",
                }}
              >
                <Outlet />
              </Box>
            </Box>
          </Box>

          {!import.meta.env.PROD && <TanStackRouterDevtools />}
        </Box>
      </ThemeProvider>
    </>
  );
}
