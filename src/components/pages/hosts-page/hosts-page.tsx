import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { nanoid } from "nanoid";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { AuthType, Host } from "../../../interfaces";
import { futureService, hostService } from "../../../services";
import { usePortforwardStore, useTerminalStore } from "../../../stores";
import HostCard from "./host-card";
import Sidebar from "./sidebar";
import { HostSchema } from "./sidebar/sidebar.tsx";
import TunnelSidebar from "./tunnel-sidebar";
import { TunnelSchema } from "./tunnel-sidebar/tunnel-sidebar";

const HostsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isTunnelSidebarOpen, setIsTunnelSidebarOpen] =
    useState<boolean>(false);
  const [selected, setSelected] = useState<Host | undefined>(undefined);

  const addTerminal = useTerminalStore((state) => state.addTerminal);
  const setActiveTerminal = useTerminalStore(
    (state) => state.setActiveTerminal,
  );

  const addPortforward = usePortforwardStore((state) => state.addPortforward);
  const portforwards = usePortforwardStore((state) => state.portforwards);
  const removePortforward = usePortforwardStore(
    (state) => state.removePortforward,
  );

  const { data, refetch } = useQuery({
    queryKey: ["hosts"],
    queryFn: hostService.list,
  });

  const handleEditClick = (host: Host) => {
    setIsSidebarOpen(true);
    setSelected(host);
  };

  const handleConnectClick = (host: Host) => {
    const terminal = nanoid();
    addTerminal(terminal, host);
    setActiveTerminal(terminal);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const handleAddClick = () => {
    setIsSidebarOpen(true);
    setSelected(undefined);
  };

  const handleSaveClick = async (form: HostSchema) => {
    if (form.id) {
      if (form.authType === AuthType._Identity) {
        await hostService.update(
          form.id,
          form.address,
          parseInt(form.port),
          { type: AuthType._Identity, data: form.identityRef },
          form.label,
        );
      } else {
        await hostService.update(
          form.id,
          form.address,
          parseInt(form.port),
          {
            type: AuthType._Local,
            data: {
              username: form.username,
              password: form.password,
              privateKeyRef: form.privateKeyRef,
            },
          },
          form.label,
        );
      }
    } else {
      if (form.authType === AuthType._Identity) {
        await hostService.add(
          form.address,
          parseInt(form.port),
          { type: AuthType._Identity, data: form.identityRef },
          form.label,
        );
      } else {
        await hostService.add(
          form.address,
          parseInt(form.port),
          {
            type: AuthType._Local,
            data: {
              username: form.username,
              password: form.password,
              privateKeyRef: form.privateKeyRef,
            },
          },
          form.label,
        );
      }
    }
    setIsSidebarOpen(false);
    await refetch();
  };

  const handleDeleteClick = async (id?: string) => {
    if (id) {
      await hostService.remove(id);
    }

    setIsSidebarOpen(false);
    await refetch();
  };

  const handleTunnelClick = async (host: Host) => {
    setSelected(host);
    setIsTunnelSidebarOpen(true);
  };

  const handleTunnelStart = async (form: TunnelSchema) => {
    if (selected) {
      const tunnel = nanoid();
      await hostService.startTunnelStream(
        selected.id,
        tunnel,
        form.localAddress,
        parseInt(form.localPort),
        form.destinationAddress,
        parseInt(form.destinationPort),
      );
      addPortforward(selected.id, {
        tunnel,
        localAddress: form.localAddress,
        localPort: form.localPort,
        destinationAddress: form.destinationAddress,
        destinationPort: form.destinationPort,
      });
    }
  };

  const handleTunnelSidebarClose = () => {
    setIsTunnelSidebarOpen(false);
    setSelected(undefined);
  };

  const handleTunnelStop = async (tunnel: string) => {
    if (selected) {
      removePortforward(selected.id, tunnel);
      await futureService.stopFuture(tunnel);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Button onClick={handleAddClick}>
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data?.map((host) => (
          <HostCard
            key={host.id}
            host={host}
            onEditClicked={handleEditClick}
            onConnectClicked={handleConnectClick}
            onTunnelClicked={handleTunnelClick}
            portforwardCount={portforwards[host.id]?.length || 0}
          />
        ))}
      </div>

      <TunnelSidebar
        isOpen={isTunnelSidebarOpen}
        onClose={handleTunnelSidebarClose}
        onTunnelStart={handleTunnelStart}
        onTunnelStop={handleTunnelStop}
        portforwards={portforwards[selected?.id || ""]}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        host={selected}
        onClose={handleSidebarClose}
        onSave={handleSaveClick}
        onDelete={handleDeleteClick}
      />
    </div>
  );
};

export default HostsPage;
