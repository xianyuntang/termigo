import { invoker } from "../core";

export interface Host {
  id: string;
  label: string;
}

export const starTerminalStream = async (hostId: string) => {
  return invoker<{ futureId: string }>("start_terminal_stream", { hostId });
};
