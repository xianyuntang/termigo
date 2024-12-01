import { FiPlusCircle } from "solid-icons/fi";
import { createResource, createSignal, For } from "solid-js";

import { useOutsideClick } from "../../../hooks/utility.hooks.ts";
import { Identity } from "../../../interfaces";
import { identityService } from "../../../services";
import IconButton from "../../shared/icon-button";
import Toolbar from "../../shared/toolbar";
import IdentityCard from "./identity-card";
import IdentitySidebar from "./identity-sidebar";

const IdentitiesPageContainer = () => {
  const [sidebarRef, setSidebarRef] = createSignal<HTMLElement>();
  const [open, setOpen] = createSignal<boolean>(false);
  const [selectedIdentity, setSelectedIdentity] = createSignal<Identity>();

  const [identities, { refetch }] = createResource(
    identityService.listIdentities,
  );

  useOutsideClick({
    ref: sidebarRef,
    onClick: () => {
      setOpen(false);
    },
  });

  const handleAddNewClick = () => {
    setSelectedIdentity(undefined);
    setOpen(true);
  };

  const handleIdentityEditClick = (identity: Identity) => {
    setSelectedIdentity(identity);
    setOpen(true);
  };

  const handleSave = async () => {
    refetch();
    setOpen(false);
  };

  const handleDelete = async () => {
    refetch();
    setOpen(false);
  };

  return (
    <>
      <div class="flex w-full flex-col">
        <Toolbar>
          <IconButton tooltip="Add new host" onClick={handleAddNewClick}>
            <FiPlusCircle class="size-full" />
          </IconButton>
        </Toolbar>

        <div class="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-4">
          <For each={identities()}>
            {(identity) => (
              <IdentityCard
                identity={identity}
                onEdit={handleIdentityEditClick}
              />
            )}
          </For>
        </div>
      </div>
      <IdentitySidebar
        ref={setSidebarRef}
        open={open()}
        identity={selectedIdentity()}
        class="fixed -right-80 top-12 z-50 h-[calc(100vh-3rem)] w-80"
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </>
  );
};

export default IdentitiesPageContainer;
