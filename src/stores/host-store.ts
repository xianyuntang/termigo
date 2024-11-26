import { createContextProvider } from "@solid-primitives/context";
import { createStore } from "solid-js/store";

import { Host } from "../services/host.service.ts";

const [HostProvider, useHost] = createContextProvider(
  () => {
    const [hosts, setHosts] = createStore<(Host & { futureId: string })[]>([]);

    const add = (host: Host, futureId: string) => {
      setHosts((prev) => [...prev, { ...host, futureId }]);
    };

    const remove = (id: string) => {
      setHosts((prev) => prev.filter((e) => e.id !== id));
    };

    const exist = (id: string) => {
      return hosts.findIndex((e) => e.id === id) !== -1;
    };

    return {
      hosts,
      add,
      remove,
      exist,
    };
  },
  {
    hosts: [],
    add: () => {},
    remove: () => {},
    exist: () => false,
  },
);

export { HostProvider, useHost };
