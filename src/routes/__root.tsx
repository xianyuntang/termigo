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
import SideMenu from "../components/side-menu";

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
  component: () => (
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

          <Box sx={{ flexGrow: 1 }}>
            <AppNavbar />
            <Box component="main" sx={{ flexFlow: 1 }}>
              <Outlet />
            </Box>
          </Box>
          <TanStackRouterDevtools />
        </Box>
      </ThemeProvider>
    </>
  ),
});
