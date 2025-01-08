import { invoker } from "../core";
import { OKMessage, PrivateKey } from "../interfaces";

class PrivateKeyService {
  list = async () => {
    return invoker<PrivateKey[]>("list_private_keys");
  };

  add = async (label: string, content: string) => {
    return invoker<PrivateKey>("add_private_key", {
      label,
      content,
    });
  };

  update = async (id: string, label: string, content: string) => {
    return invoker<PrivateKey>("update_private_key", {
      id,
      label,
      content,
    });
  };

  delete = async (id: string) => {
    return invoker<OKMessage>("delete_private_key", { id });
  };
}

export default new PrivateKeyService();
