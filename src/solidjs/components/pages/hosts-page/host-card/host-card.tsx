import { useNavigate } from "@solidjs/router";
import { nanoid } from "nanoid";
import { BiRegularTerminal } from "solid-icons/bi";
import { VsEdit } from "solid-icons/vs";
import { Component } from "solid-js";

import { Host } from "../../../../../interfaces";
import { useActiveTerminal } from "../../../../stores";
import IconButton from "../../../shared/icon-button";

interface ServerCardProps {
  host: Host;
  onEdit: (host: Host) => void;
}

const HostCard: Component<ServerCardProps> = (props) => {
  const { add, findOne } = useActiveTerminal();
  const navigator = useNavigate();

  const openTerminal = async () => {
    if (!props.host.id) return;

    if (!findOne(props.host.id)) {
      const terminalId = nanoid();
      add(props.host.id, terminalId, props.host.label || props.host.address);
      navigator(`/terminals/${terminalId}`);
    }
  };

  const handleHostEditClick = () => {
    if (typeof props.onEdit === "function") {
      props.onEdit(props.host);
    }
  };

  return (
    <div class="grow rounded-lg border border-gray-700 bg-gray-800 p-6 shadow">
      <h5 class="mb-2 text-2xl font-bold tracking-tight text-white">
        {props.host.label || props.host.address}
      </h5>
      <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">online</p>
      <div class="flex justify-end gap-4">
        <IconButton tooltip="Edit" onClick={handleHostEditClick}>
          <VsEdit class="size-full" />
        </IconButton>
        <IconButton tooltip="Open" onClick={openTerminal}>
          <BiRegularTerminal class="size-full" />
        </IconButton>
      </div>
    </div>
  );
};

export default HostCard;
