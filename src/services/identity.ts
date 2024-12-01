import { invoker } from "../core";
import { Identity, OKMessage } from "../interfaces";

export const listIdentities = async () => {
  return invoker<Identity[]>("list_identities");
};

export const addIdentity = async (
  username: string,
  label?: string,
  password?: string,
  key?: string,
) => {
  return invoker<OKMessage>("add_identity", {
    username,
    label,
    password,
    key,
  });
};

export const updateIdentity = async (
  id: string,
  username: string,
  label?: string,
  password?: string,
  key?: string,
) => {
  return invoker<OKMessage>("update_identity", {
    id,
    username,
    label,
    password,
    key,
  });
};

export const deleteIdentity = async (id: string) => {
  return invoker<OKMessage>("delete_identity", { id });
};
