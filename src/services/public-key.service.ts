import { invoker } from "../core";
import { OKMessage, PublicKey } from "../interfaces";

class PublicKeyService {
  list = async () => {
    return invoker<PublicKey[]>("list_public_keys");
  };

  add = async (label: string, content: string) => {
    return invoker<PublicKey>("add_public_key", {
      label,
      content,
    });
  };

  update = async (id: string, label: string, content: string) => {
    return invoker<PublicKey>("update_public_key", {
      id,
      label,
      content,
    });
  };

  delete = async (id: string) => {
    return invoker<OKMessage>("delete_public_key", { id });
  };
}

export default PublicKeyService;
