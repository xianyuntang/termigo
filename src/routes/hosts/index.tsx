import { createFileRoute } from "@tanstack/react-router";

import { HostsPage } from "@/features/hosts";

export const Route = createFileRoute("/hosts/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <HostsPage />;
}
