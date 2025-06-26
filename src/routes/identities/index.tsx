import { createFileRoute } from "@tanstack/react-router";

import { IdentitiesPage } from "@/features/identities";

export const Route = createFileRoute("/identities/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <IdentitiesPage />;
}
