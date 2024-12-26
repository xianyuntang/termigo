import { createFileRoute } from "@tanstack/react-router";

import TerminalsPage from "../../components/pages/terminals-page";

export const Route = createFileRoute("/terminals/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <TerminalsPage />;
}
