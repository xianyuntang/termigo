import { createFileRoute } from "@tanstack/react-router";

import HostsPage from "../../components/pages/hosts-page";

export const Route = createFileRoute("/hosts/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <HostsPage />;
}
