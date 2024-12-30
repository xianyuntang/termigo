import { createFileRoute } from "@tanstack/react-router";

import PublicKeysPage from "../../components/pages/public-keys-page";

export const Route = createFileRoute("/public-keys/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <PublicKeysPage />;
}
