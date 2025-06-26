import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { PrivateKey } from "../../../interfaces";
import { privateKeyService } from "../../../services";
import PrivateKeyCard from "./private-key-card";
import { PrivateKeySchema, Sidebar } from "./sidebar";

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
  const handleSaveClick = async (form: PrivateKeySchema) => {
    if (form.id) {
      await privateKeyService.update(form.id, form.label, form.content);
    } else {
      await privateKeyService.add(form.label, form.content);
    }
    setIsSidebarOpen(false);
    await refetch();
  };
  const handleDeleteClick = async (id?: string) => {
    if (id) {
      await privateKeyService.delete(id);
    }
    setIsSidebarOpen(false);
    await refetch();
  };

  const handleEditClick = async (privateKey: PrivateKey) => {
    setIsSidebarOpen(true);
    setSelected(privateKey);
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
        {data?.map((privateKey) => (
          <PrivateKeyCard
            key={privateKey.id}
            privateKey={privateKey}
            onEditClicked={handleEditClick}
          />
        ))}
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        privateKey={selected}
        onClose={handleSidebarClose}
        onSave={handleSaveClick}
        onDelete={handleDeleteClick}
      />
    </div>
  );
};

export default PrivateKeysPage;
