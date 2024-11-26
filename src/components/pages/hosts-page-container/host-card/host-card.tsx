import { useNavigate } from "@solidjs/router";
import { VsEdit } from "solid-icons/vs";
import { VsTerminalBash } from "solid-icons/vs";
import { Component } from "solid-js";

import { hostService } from "../../../../services";
import { Host } from "../../../../services/host.service.ts";
import { useHost } from "../../../../stores";
import IconButton from "../../../shared/icon-button";

interface ServerCardProps {
  host: Host;
}

const HostCard: Component<ServerCardProps> = (props) => {
  const { add, exist } = useHost();
  const navigator = useNavigate();

  const openTerminal = async () => {
    if (!exist(props.host.id)) {
      const { futureId } = await hostService.starTerminalStream(props.host.id);
      add(props.host, futureId);
    }
    navigator(`/terminals/${props.host.id}`);
  };

  return (
    <div class="grow rounded-lg border border-gray-700 bg-gray-800 p-6 shadow">
      <h5 class="mb-2 text-2xl font-bold tracking-tight text-white">
        {props.host.label}
      </h5>
      <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">online</p>
      <div class="flex justify-end gap-4">
        <IconButton tooltip="Edit">
          <VsEdit class="size-full" />
        </IconButton>
        <IconButton tooltip="Open" onClick={openTerminal}>
          <VsTerminalBash class="size-full" />
        </IconButton>
      </div>
    </div>
  );
};

export default HostCard;
