import { invoker } from "../core";
import { Identity, OKMessage } from "../interfaces";

class IdentityService {
  list = async () => {
    return invoker<Identity[]>("list_identities");
  };

  add = async (
    label: string,
    username: string,
    password: string,
    privateKeyRef: string
  ) => {
    return invoker<OKMessage>("add_identity", {
      label,
      username,
      password,
      privateKeyRef,
    });
  };

  update = async (
    id: string,
    label: string,
    username: string,
    password: string,
    privateKeyRef: string
  ) => {
    return invoker<OKMessage>("update_identity", {
      id,
      label,
      username,
      password,
      privateKeyRef,
    });
  };

  delete = async (id: string) => {
    return invoker<OKMessage>("delete_identity", { id });
  };
}

export default new IdentityService();
