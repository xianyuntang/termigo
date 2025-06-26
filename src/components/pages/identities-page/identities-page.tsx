import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { Identity } from "../../../interfaces";
import { identityService } from "../../../services";
import IdentityCard from "./identity-card";
import Sidebar from "./sidebar";
import { IdentitySchema } from "./sidebar/sidebar.tsx";

const PrivateKeysPage = () => {
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
  const handleSaveClick = async (form: IdentitySchema) => {
    if (form.id) {
      await identityService.update(
        form.id,
        form.label,
        form.username,
        form.password,
        form.privateKeyRef,
      );
    } else {
      await identityService.add(
        form.label,
        form.username,
        form.password,
        form.privateKeyRef,
      );
    }
    setIsSidebarOpen(false);
    await refetch();
  };
  const handleDeleteClick = async (id?: string) => {
    if (id) {
      await identityService.delete(id);
    }
    setIsSidebarOpen(false);
    await refetch();
  };

  const handleEditClick = async (identity: Identity) => {
    setIsSidebarOpen(true);
    setSelected(identity);
    await refetch();
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
        {data?.map((identity) => (
          <IdentityCard
            key={identity.id}
            identity={identity}
            onEditClicked={handleEditClick}
          />
        ))}
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        identity={selected}
        onClose={handleSidebarClose}
        onSave={handleSaveClick}
        onDelete={handleDeleteClick}
      />
    </div>
  );
};

export default PrivateKeysPage;
