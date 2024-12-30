import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Grid2, Toolbar } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { PublicKey } from "../../../interfaces";
import { publicKeyService } from "../../../services";
import PublicKeyCard from "./public-key-card";
import { PublicKeyForm, Sidebar } from "./sidebar";

const PublicKeysPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<PublicKey | undefined>(undefined);

  const { data, refetch } = useQuery({
    queryKey: ["public-keys"],
    queryFn: publicKeyService.list,
  });

  const handleAddClick = () => {
    setSelected(undefined);
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };
  const handleSaveClick = async (form: PublicKeyForm) => {
    if (form.id) {
      await publicKeyService.update(form.id, form.label, form.content);
    } else {
      await publicKeyService.add(form.label, form.content);
    }
    setIsSidebarOpen(false);
    refetch();
  };
  const handleDeleteClick = async (id?: string) => {
    if (id) {
      await publicKeyService.delete(id);
    }
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
        {data?.map((publicKey) => (
          <Grid2 key={publicKey.id}>
            <PublicKeyCard
              publicKey={publicKey}
              onEditClicked={handleEditClick}
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
