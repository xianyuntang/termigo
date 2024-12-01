import { FiPlusCircle } from "solid-icons/fi";
import { createResource, createSignal, For } from "solid-js";

import { useOutsideClick } from "../../../hooks/utility.hooks.ts";
import { Host } from "../../../interfaces";
import { hostService } from "../../../services";
import IconButton from "../../shared/icon-button";
import Toolbar from "../../shared/toolbar";
import HostCard from "./host-card";
import HostSidebar from "./host-sidebar";
import NewConnectionField from "./new-connection-field";

const HostsPageContainer = () => {
  const [sidebarRef, setSidebarRef] = createSignal<HTMLElement>();
  const [open, setOpen] = createSignal<boolean>(false);
  const [selectedHost, setSelectedHost] = createSignal<Host>();

  const [hosts, { refetch }] = createResource(hostService.listHosts);

  useOutsideClick({
    ref: sidebarRef,
    onClick: () => {
      setOpen(false);
    },
  });

  const handleOpenAddNewHostClick = () => {
    setSelectedHost(undefined);
    setOpen(true);
  };

  const handleHostEditClick = (host: Host) => {
    setSelectedHost(host);
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
          <IconButton
            tooltip="Add new host"
            onClick={handleOpenAddNewHostClick}
          >
            <FiPlusCircle class="size-full" />
          </IconButton>
          <NewConnectionField />
        </Toolbar>

        <div class="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4">
          <For each={hosts()}>
            {(host) => <HostCard host={host} onEdit={handleHostEditClick} />}
          </For>
        </div>
      </div>
      <HostSidebar
        ref={setSidebarRef}
        open={open()}
        host={selectedHost()}
        class="fixed -right-80 top-12 z-50 h-[calc(100vh-3rem)] w-80"
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </>
  );
};

export default HostsPageContainer;
