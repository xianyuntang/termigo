import { Component } from "solid-js";

import IconButton from "../../../shared/icon-button";
import EditIcon from "../../../shared/icons/edit-icon";
import TerminalIcon from "../../../shared/icons/terminal-icon";

interface ServerCardProps {
  label: string;
}

const ServerCard: Component<ServerCardProps> = (props) => {
  return (
    <div class="grow rounded-lg border border-gray-700 bg-gray-800 p-6 shadow">
      <h5 class="mb-2 text-2xl font-bold tracking-tight text-white">
        {props.label}
      </h5>
      <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">online</p>
      <div class="flex justify-end gap-4">
        <IconButton icon={<EditIcon />} tooltip="Edit" />
        <IconButton icon={<TerminalIcon />} tooltip="Open" />
      </div>
    </div>
  );
};

export default ServerCard;
