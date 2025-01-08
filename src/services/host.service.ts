import { invoker } from "../core";
import { AuthType, Host, OKMessage } from "../interfaces";

class HostService {
  starTerminalStream = async (host: string, terminal: string) => {
    return invoker<OKMessage>("start_terminal_stream", { host, terminal });
  };

  startTunnelStream = async (
    host: string,
    tunnel: string,
    localAddress: string,
    localPort: number,
    destinationAddress: string,
    destinationPort: number,
  ) => {
    return invoker<OKMessage>("start_tunnel_stream", {
      host,
      tunnel,
      localAddress,
      localPort,
      destinationAddress,
      destinationPort,
    });
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
    privateKey?: string,
  ) => {
    return invoker<Host>("add_host", {
      label,
      address,
      port,
      authType,
      identity,
      username,
      password,
      privateKey,
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
    privateKey?: string,
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
      privateKey,
    });
  };
}

export default new HostService();
