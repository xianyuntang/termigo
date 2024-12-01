import "flowbite";
import "./index.css";
import "overlayscrollbars/styles/overlayscrollbars.css";

import { MultiProvider } from "@solid-primitives/context";
import { Route, Router } from "@solidjs/router";

import Layout from "./components/layout";
import HostsPage from "./pages/hosts-page";
import IdentitiesPage from "./pages/identities-page";
import TerminalsPage from "./pages/terminals-page";
import { ActiveTerminalProvider, TerminalHistoryProvider } from "./stores";

const App = () => {
  return (
    <>
      <MultiProvider values={[ActiveTerminalProvider, TerminalHistoryProvider]}>
        <Router root={Layout}>
          <Route path="/terminals/:terminalId" component={TerminalsPage} />
          <Route path="/hosts" component={HostsPage} />
          <Route path="/identities" component={IdentitiesPage} />
        </Router>
      </MultiProvider>
    </>
  );
};

export default App;
