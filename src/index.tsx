/* @refresh reload */
import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";

import App from "./App";
import WorkspacePage from "./pages/workspace-page";

render(
  () => (
    <Router root={App}>
      <Route path="/workspace" component={WorkspacePage} />
    </Router>
  ),
  document.getElementById("root") as HTMLElement,
);
