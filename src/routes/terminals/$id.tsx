import { createFileRoute, useParams } from "@tanstack/react-router";

import TerminalsPage from "../../components/pages/terminals-page";

export const Route = createFileRoute("/terminals/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = useParams({
    from: "/terminals/$id",
  });

  return <TerminalsPage terminalId={id} />;
}
