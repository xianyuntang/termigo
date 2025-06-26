import { createRootRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useEffect } from "react";

import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

import AppNavbar from "../components/app-navbar";
import TerminalsPage from "../components/pages/terminals-page";
import SideMenu from "../components/side-menu";
import { useTerminalStore } from "../stores";

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
    <div className="dark select-none">
      <div className="flex h-screen bg-background text-foreground">
        <SideMenu />

        <div className="flex flex-1 flex-col overflow-hidden">
          <AppNavbar />
          <main className="flex-1 p-4 min-h-0">
            <div
              className={cn(
                "flex-1 overflow-hidden h-full",
                activeTerminal ? "block" : "hidden"
              )}
            >
              <TerminalsPage />
            </div>
            <div
              className={cn(
                "flex-1 overflow-auto h-full",
                activeTerminal ? "hidden" : "block"
              )}
            >
              <Outlet />
            </div>
          </main>
        </div>

        {!import.meta.env.PROD && <TanStackRouterDevtools />}
      </div>
      <Toaster />
    </div>
  );
}
