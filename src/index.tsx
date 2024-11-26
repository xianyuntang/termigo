/* @refresh reload */
import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";

import App from "./App";
import HostsPage from "./pages/hosts-page";
import TerminalSwitch from "./pages/terminal-switch";

render(
  () => (
    <Router root={App}>
      <Route component={TerminalSwitch}>
        <Route path="/terminals/:hostId" />
        <Route path="/hosts" component={HostsPage} />
      </Route>
    </Router>
  ),
  document.getElementById("root") as HTMLElement,
);
