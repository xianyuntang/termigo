import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Grid2, Toolbar } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { useState } from "react";

import { Host } from "../../../interfaces";
import { hostService } from "../../../services";
import { useTerminalStore } from "../../../stores";
import HostCard from "./host-card";
import Sidebar from "./sidebar";
import { HostForm } from "./sidebar/sidebar";
import TunnelDialog from "./tunnel-dialog";
import { StartTunnelForm } from "./tunnel-dialog/tunnel-dialog";

const HostsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isTunnelDialogOpen, setIsTunnelDialogOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<Host | undefined>(undefined);

  const addTerminal = useTerminalStore((state) => state.addTerminal);
  const setActiveTerminal = useTerminalStore(
    (state) => state.setActiveTerminal
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
        form.publicKey
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
        form.publicKey
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
    setIsTunnelDialogOpen(true);
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
        parseInt(form.destinationPort)
      );
    }
    setIsTunnelDialogOpen(false);
    setSelected(undefined);
  };

  const handleDialogClose = () => {
    setIsTunnelDialogOpen(false);
    setSelected(undefined);
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
            />
          </Grid2>
        ))}
      </Grid2>
      {selected && (
        <TunnelDialog
          isOpen={isTunnelDialogOpen}
          onClose={handleDialogClose}
          onTunnelStart={handleTunnelStart}
        ></TunnelDialog>
      )}

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
