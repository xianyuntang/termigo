import { createFileRoute } from "@tanstack/react-router";

import PrivateKeysPage from "../../components/pages/private-keys-page";

export const Route = createFileRoute("/private-keys/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <PrivateKeysPage />;
}
