import { invoker } from "../core";
import { Identity, OKMessage } from "../interfaces";

class identityService {
  list = async () => {
    return invoker<Identity[]>("list_identities");
  };

  add = async (
    label: string,
    username: string,
    password: string,
    publicKey: string
  ) => {
    return invoker<OKMessage>("add_identity", {
      label,
      username,
      password,
      publicKey,
    });
  };

  update = async (
    id: string,
    label: string,
    username: string,
    password: string,
    publicKey: string
  ) => {
    return invoker<OKMessage>("update_identity", {
      id,
      label,
      username,
      password,
      publicKey,
    });
  };

  delete = async (id: string) => {
    return invoker<OKMessage>("delete_identity", { id });
  };
}

export default identityService;
