import { createRootRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useEffect } from "react";

import { Toaster } from "@/shared/ui/sonner";

import AppNavbar from "@/shared/layouts/AppNavbar";
import { TerminalsPage } from "@/features/terminals";
import SideMenu from "@/shared/layouts/SideMenu";
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
              className={`flex-1 overflow-hidden h-full ${
                activeTerminal ? "block" : "hidden"
              }`}
            >
              <TerminalsPage />
            </div>
            <div
              className={`flex-1 overflow-auto h-full ${
                activeTerminal ? "hidden" : "block"
              }`}
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
