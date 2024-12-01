import { VsEdit } from "solid-icons/vs";
import { Component } from "solid-js";

import { Identity } from "../../../../interfaces";
import IconButton from "../../../shared/icon-button";

interface IdentityCardProps {
  identity: Identity;
  onEdit: (identity: Identity) => void;
}

const IdentityCard: Component<IdentityCardProps> = (props) => {
  const handleEditClick = () => {
    if (typeof props.onEdit === "function") {
      props.onEdit(props.identity);
    }
  };

  return (
    <div class="flex grow items-center justify-between rounded-lg border border-gray-700 bg-gray-800 p-3 shadow">
      <div class="text-white">{props.identity.label}</div>
      <IconButton tooltip="Edit" onClick={handleEditClick}>
        <VsEdit class="size-full" />
      </IconButton>
    </div>
  );
};

export default IdentityCard;
