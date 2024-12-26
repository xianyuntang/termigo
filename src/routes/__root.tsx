import { Box, createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

import AppNavbar from "../components/app-navbar";
import SideMenu from "../components/side-menu";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

export const Route = createRootRoute({
  component: () => (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <Box sx={{ display: "flex" }}>
          <SideMenu />
          <AppNavbar />
          <Outlet />
          <TanStackRouterDevtools />
        </Box>
      </ThemeProvider>
    </>
  ),
});
