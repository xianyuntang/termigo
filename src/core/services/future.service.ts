import { OKMessage } from "@/types/response";

import { invoker } from "../api/invoker";

class FutureService {
  stopFuture = (id: string) => {
    return invoker<OKMessage>("stop_future", { id });
  };
}

export default new FutureService();
