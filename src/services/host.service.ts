import { invoker } from "../core";
import { AuthType, Host, OKMessage } from "../interfaces";

class HostService {
  starTerminalStream = async (host: string, terminal: string) => {
    return invoker<OKMessage>("start_terminal_stream", { host, terminal });
  };

  list = async () => {
    return invoker<Host[]>("list_hosts");
  };

  add = async (
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

  remove = async (id: string) => {
    return invoker<OKMessage>("delete_host", { id });
  };

  update = async (
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
}

export default HostService;
