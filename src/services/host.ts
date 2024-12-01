import { invoker } from "../core";
import { Host, OKMessage } from "../interfaces";

export const starTerminalStream = async (
  hostId: string,
  terminalId: string,
) => {
  return invoker<OKMessage>("start_terminal_stream", { hostId, terminalId });
};

export const listHosts = async () => {
  return invoker<Host[]>("list_hosts");
};

export const addHost = async (
  address: string,
  port: number,
  identityId: string,
  label?: string,
) => {
  return invoker<OKMessage>("add_host", { label, address, port, identityId });
};

export const removeHost = async (id: string) => {
  return invoker<OKMessage>("delete_host", { id });
};

export const updateHost = async (
  id: string,
  address: string,
  port: number,
  identityId: string,
  label?: string,
) => {
  return invoker<OKMessage>("update_host", {
    id,
    label,
    address,
    port,
    identityId,
  });
};
