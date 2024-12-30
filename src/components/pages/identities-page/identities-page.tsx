import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Grid2, Toolbar } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Identity } from "../../../interfaces";
import { identityService } from "../../../services";
import IdentityCard from "./identity-card";
import Sidebar from "./sidebar";
import { IdentityForm } from "./sidebar/sidebar";

const PublicKeysPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<Identity | undefined>(undefined);

  const { data, refetch } = useQuery({
    queryKey: ["identities"],
    queryFn: identityService.list,
  });

  const handleAddClick = () => {
    setSelected(undefined);
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };
  const handleSaveClick = async (form: IdentityForm) => {
    if (form.id) {
      await identityService.update(
        form.id,
        form.label,
        form.username,
        form.password,
        form.publicKey
      );
    } else {
      await identityService.add(
        form.label,
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
      await identityService.delete(id);
    }
    setIsSidebarOpen(false);
    refetch();
  };

  const handleEditClick = (identity: Identity) => {
    setIsSidebarOpen(true);
    setSelected(identity);
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
        {data?.map((identity) => (
          <Grid2 key={identity.id}>
            <IdentityCard identity={identity} onEditClicked={handleEditClick} />
          </Grid2>
        ))}
      </Grid2>

      <Sidebar
        isOpen={isSidebarOpen}
        identity={selected}
        onClose={handleSidebarClose}
        onSave={handleSaveClick}
        onDelete={handleDeleteClick}
      />
    </Box>
  );
};

export default PublicKeysPage;
