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

const HostsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [selectedHost, setSelectedHost] = useState<Host | undefined>(undefined);

  const addTerminal = useTerminalStore((state) => state.addTerminal);
  const setActiveTerminal = useTerminalStore(
    (state) => state.setActiveTerminal
  );

  const { data: hosts, refetch } = useQuery({
    queryKey: ["hosts"],
    queryFn: hostService.listHosts,
  });

  const handleEditClick = (host: Host) => {
    setIsSidebarOpen(true);
    setSelectedHost(host);
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
    setSelectedHost(undefined);
  };

  const handleSaveClick = () => {
    setIsSidebarOpen(false);
    refetch();
  };

  return (
    <Box>
      <Toolbar>
        <Button endIcon={<AddIcon />} onClick={handleAddClick}>
          add new
        </Button>
      </Toolbar>
      <Grid2 container spacing={2} sx={{ flexGrow: 1 }}>
        {hosts?.map((host) => (
          <Grid2 key={host.id}>
            <HostCard
              host={host}
              onEditClicked={() => handleEditClick(host)}
              onConnectClicked={() => handleConnectClick(host)}
            />
          </Grid2>
        ))}
      </Grid2>

      <Sidebar
        isOpen={isSidebarOpen}
        host={selectedHost}
        onClose={handleSidebarClose}
        onSave={handleSaveClick}
      />
    </Box>
  );
};

export default HostsPage;
