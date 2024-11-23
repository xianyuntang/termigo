import "flowbite";
import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { ParentComponent } from "solid-js";

import Layout from "./components/layout";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

const App: ParentComponent = (props) => {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Layout>{props.children}</Layout>
      </QueryClientProvider>
    </>
  );
};

export default App;
