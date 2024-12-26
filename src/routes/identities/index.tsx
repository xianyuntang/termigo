import { createFileRoute } from "@tanstack/react-router";

import IdentitiesPage from "../../components/pages/identities-page";

export const Route = createFileRoute("/identities/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <IdentitiesPage />;
}
