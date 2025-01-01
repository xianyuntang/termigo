import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Grid2, Toolbar } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { PrivateKey } from "../../../interfaces";
import { privateKeyService } from "../../../services";
import PrivateKeyCard from "./private-key-card";
import { PrivateKeyForm, Sidebar } from "./sidebar";

const PrivateKeysPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<PrivateKey | undefined>(undefined);

  const { data, refetch } = useQuery({
    queryKey: ["private-keys"],
    queryFn: privateKeyService.list,
  });

  const handleAddClick = () => {
    setSelected(undefined);
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };
  const handleSaveClick = async (form: PrivateKeyForm) => {
    if (form.id) {
      await privateKeyService.update(form.id, form.label, form.content);
    } else {
      await privateKeyService.add(form.label, form.content);
    }
    setIsSidebarOpen(false);
    refetch();
  };
  const handleDeleteClick = async (id?: string) => {
    if (id) {
      await privateKeyService.delete(id);
    }
    setIsSidebarOpen(false);
    refetch();
  };

  const handleEditClick = (privateKey: PrivateKey) => {
    setIsSidebarOpen(true);
    setSelected(privateKey);
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
        {data?.map((privateKey) => (
          <Grid2 key={privateKey.id}>
            <PrivateKeyCard
              privateKey={privateKey}
              onEditClicked={handleEditClick}
            />
          </Grid2>
        ))}
      </Grid2>

      <Sidebar
        isOpen={isSidebarOpen}
        privateKey={selected}
        onClose={handleSidebarClose}
        onSave={handleSaveClick}
        onDelete={handleDeleteClick}
      />
    </Box>
  );
};

export default PrivateKeysPage;
