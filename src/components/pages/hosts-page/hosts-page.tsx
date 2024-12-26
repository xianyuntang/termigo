import { Box, Grid2 } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Host } from "../../../interfaces";
import { hostService } from "../../../services";
import HostCard from "./host-card";
import Sidebar from "./sidebar";

const HostsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const { data: hosts } = useQuery({
    queryKey: ["hosts"],
    queryFn: hostService.listHosts,
  });

  const handleEditClick = (host: Host) => {
    console.log(host);
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <Box
      sx={(theme) => ({
        padding: theme.spacing(2),
      })}
    >
      <Grid2 container spacing={2} sx={{ flexGrow: 1 }}>
        {hosts?.map((host) => (
          <Grid2 key={host.id}>
            <HostCard host={host} onEditClicked={() => handleEditClick(host)} />
          </Grid2>
        ))}
      </Grid2>

      <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
    </Box>
  );
};

export default HostsPage;
