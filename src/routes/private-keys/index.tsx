import { createFileRoute } from "@tanstack/react-router";

import { PrivateKeysPage } from "@/features/private-keys";

export const Route = createFileRoute("/private-keys/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <PrivateKeysPage />;
}
