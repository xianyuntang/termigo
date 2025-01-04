import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Grid2, Toolbar } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { useState } from "react";

import { Host } from "../../../interfaces";
import { futureService, hostService } from "../../../services";
import { usePortforwardStore, useTerminalStore } from "../../../stores";
import HostCard from "./host-card";
import Sidebar from "./sidebar";
import { HostForm } from "./sidebar/sidebar";
import TunnelSidebar from "./tunnel-sidebar";
import { StartTunnelForm } from "./tunnel-sidebar/tunnel-sidebar";

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

  const handleSaveClick = async (form: HostForm) => {
    if (form.id) {
      await hostService.update(
        form.id,
        form.address,
        parseInt(form.port),
        form.authType,
        form.label,
        form.identity,
        form.username,
        form.password,
        form.privateKey,
      );
    } else {
      await hostService.add(
        form.address,
        parseInt(form.port),
        form.authType,
        form.label,
        form.identity,
        form.username,
        form.password,
        form.privateKey,
      );
    }
    setIsSidebarOpen(false);
    refetch();
  };

  const handleDeleteClick = async (id?: string) => {
    if (id) {
      await hostService.remove(id);
    }

    setIsSidebarOpen(false);
    refetch();
  };

  const handleTunnelClick = async (host: Host) => {
    setSelected(host);
    setIsTunnelSidebarOpen(true);
  };

  const handleTunnelStart = async (form: StartTunnelForm) => {
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
    <Box>
      <Toolbar>
        <Button endIcon={<AddIcon />} onClick={handleAddClick}>
          add new
        </Button>
      </Toolbar>
      <Grid2 container spacing={2} sx={{ flexGrow: 1 }}>
        {data?.map((host) => (
          <Grid2 key={host.id}>
            <HostCard
              host={host}
              onEditClicked={handleEditClick}
              onConnectClicked={handleConnectClick}
              onTunnelClicked={handleTunnelClick}
              portforwardCount={portforwards[host.id]?.length || 0}
            />
          </Grid2>
        ))}
      </Grid2>

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
    </Box>
  );
};

export default HostsPage;
