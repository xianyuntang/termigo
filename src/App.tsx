import "flowbite";
import "./index.css";

import { MultiProvider } from "@solid-primitives/context";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { ParentComponent } from "solid-js";

import Layout from "./components/layout";
import { HostProvider } from "./stores";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

const App: ParentComponent = (props) => {
  return (
    <>
      <MultiProvider values={[HostProvider]}>
        <QueryClientProvider client={queryClient}>
          <Layout>{props.children}</Layout>
        </QueryClientProvider>
      </MultiProvider>
    </>
  );
};

export default App;
