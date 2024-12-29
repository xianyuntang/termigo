import { invoker } from "../core";
import { AuthType, Host, OKMessage } from "../interfaces";

export const starTerminalStream = async (
  hostId: string,
  terminalId: string
) => {
  return invoker<OKMessage>("start_terminal_stream", { hostId, terminalId });
};

export const listHosts = async () => {
  return invoker<Host[]>("list_hosts");
};

export const addHost = async (
  address: string,
  port: number,
  authType: AuthType,
  label?: string,
  identity?: string,
  username?: string,
  password?: string,
  publicKey?: string
) => {
  return invoker<Host>("add_host", {
    label,
    address,
    port,
    authType,
    identity,
    username,
    password,
    publicKey,
  });
};

export const removeHost = async (id: string) => {
  return invoker<OKMessage>("delete_host", { id });
};

export const updateHost = async (
  id: string,
  address: string,
  port: number,
  authType: AuthType,
  label?: string,
  identity?: string,
  username?: string,
  password?: string,
  publicKey?: string
) => {
  return invoker<Host>("update_host", {
    id,
    label,
    address,
    port,
    authType,
    identity,
    username,
    password,
    publicKey,
  });
};
