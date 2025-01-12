import { invoker } from "../core";
import { AuthMethod, Host, OKMessage } from "../interfaces";

class HostService {
  starTerminalStream = async (hostId: string, eventId: string) => {
    return invoker<OKMessage>("start_terminal_stream", { hostId, eventId });
  };

  startTunnelStream = async (
    hostId: string,
    eventId: string,
    localAddress: string,
    localPort: number,
    destinationAddress: string,
    destinationPort: number
  ) => {
    return invoker<OKMessage>("start_tunnel_stream", {
      hostId,
      eventId,
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
    authMethod: AuthMethod,
    label?: string
  ) => {
    return invoker<Host>("add_host", {
      label,
      address,
      port,
      authMethod,
    });
  };

  remove = async (id: string) => {
    return invoker<OKMessage>("delete_host", { id });
  };

  update = async (
    id: string,
    address: string,
    port: number,
    authMethod: AuthMethod,
    label?: string
  ) => {
    return invoker<Host>("update_host", {
      id,
      label,
      address,
      port,
      authMethod,
    });
  };

  updateFingerprint = async (id: string, fingerprint: string) => {
    return invoker<OKMessage>("update_host_fingerprint", { id, fingerprint });
  };
}

export default new HostService();
