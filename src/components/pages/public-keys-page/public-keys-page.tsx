import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Grid2, Toolbar } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { PublicKey } from "../../../interfaces";
import { publicKeyService } from "../../../services";
import PublicKeyCard from "./public-key-card";
import { Sidebar } from "./sidebar";

const PublicKeysPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<PublicKey | undefined>(undefined);

  const { data, refetch } = useQuery({
    queryKey: ["public-key"],
    queryFn: publicKeyService.list,
  });

  const handleAddClick = () => {
    setSelected(undefined);
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };
  const handleSaveClick = () => {
    setIsSidebarOpen(false);
    refetch();
  };
  const handleDeleteClick = () => {
    setIsSidebarOpen(false);
    refetch();
  };

  const handleEditClick = (publicKey: PublicKey) => {
    setIsSidebarOpen(true);
    setSelected(publicKey);
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
        {data?.map((e) => (
          <Grid2 key={e.id}>
            <PublicKeyCard
              publicKey={e}
              onEditClicked={() => handleEditClick(e)}
            />
          </Grid2>
        ))}
      </Grid2>

      <Sidebar
        isOpen={isSidebarOpen}
        publicKey={selected}
        onClose={handleSidebarClose}
        onSave={handleSaveClick}
        onDelete={handleDeleteClick}
      />
    </Box>
  );
};

export default PublicKeysPage;
