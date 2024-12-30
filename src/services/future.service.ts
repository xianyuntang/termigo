import { invoker } from "../core";
import { OKMessage } from "../interfaces";

class FutureService {
  stopFuture = (id: string) => {
    return invoker<OKMessage>("stop_future", { id });
  };
}

export default FutureService;
