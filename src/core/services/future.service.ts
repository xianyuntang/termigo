import { invoker } from "../api/invoker";
import { OKMessage } from "@/types/interfaces";

class FutureService {
  stopFuture = (id: string) => {
    return invoker<OKMessage>("stop_future", { id });
  };
}

export default new FutureService();
