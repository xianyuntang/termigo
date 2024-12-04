import { invoker } from "../core";
import { OKMessage } from "../interfaces";

export const stopFuture = (id: string) => {
  return invoker<OKMessage>("stop_future", { id });
};
