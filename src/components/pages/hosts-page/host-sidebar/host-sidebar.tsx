import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import { AiOutlineSave } from "solid-icons/ai";
import { RiSystemDeleteBin2Line } from "solid-icons/ri";
import { createEffect, createResource, ParentComponent, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { twMerge } from "tailwind-merge";

import { Host, Identity } from "../../../../interfaces";
import { hostService, identityService } from "../../../../services";
import IconButton from "../../../shared/icon-button";
import PropertyCard from "../../../shared/property-card";
import Select from "../../../shared/select";
import TextField from "../../../shared/text-field";

interface HostSidebarProps {
  open: boolean;
  host?: Host;
  identity?: Identity;
  class?: string;
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
  onSave?: () => void;
  onDelete?: () => void;
}

interface HostForm {
  address: string;
  label: string;
  port: string;
  identityId: string;
}

const DEFAULT_HOST_FORM = Object.freeze({
  label: "",
  address: "",
  port: "22",
  identityId: "",
});

const HostSidebar: ParentComponent<HostSidebarProps> = (props) => {
  const [host, setHost] = createStore<HostForm>(DEFAULT_HOST_FORM);
  const [identities] = createResource(identityService.listIdentities);

  createEffect(() => {
    if (props.host) {
      setHost("label", props.host?.label || "");
      setHost("address", props.host?.address || "");
      setHost("port", props.host?.port.toString() || "22");
      setHost("identityId", props.host?.identityId);
    } else {
      setHost(DEFAULT_HOST_FORM);
    }
  });

  const handleLabelChange = (value: string) => {
    setHost("label", value);
  };

  const handleAddressChange = (value: string) => {
    setHost("address", value);
  };

  const handlePortChange = (value: string) => {
    setHost("port", value);
  };

  const handleIdentityIdChange = (value: string) => {
    setHost("identityId", value);
  };

  const handleHostSaveClick = async () => {
    if (props.host?.id) {
      await hostService.updateHost(
        props.host.id,
        host.address,
        parseInt(host.port),
        host.identityId,
        host.label,
      );
    } else {
      await hostService.addHost(
        host.address,
        parseInt(host.port),
        host.identityId,
        host.label,
      );
    }
    if (typeof props.onSave === "function") {
      props.onSave();
    }
  };

  const handleHostDeleteClick = async () => {
    if (props.host?.id) {
      await hostService.removeHost(props.host?.id);
    }

    if (typeof props.onDelete === "function") {
      props.onDelete();
    }
  };

  return (
    <div
      ref={props.ref}
      class={twMerge(
        "bg-gray-800 transition-transform p-0.5",
        props.open && "-translate-x-full",
        props.class,
      )}
    >
      <OverlayScrollbarsComponent
        class="h-full overflow-y-scroll p-3.5"
        defer
        options={{ scrollbars: { autoHide: "scroll" } }}
      >
        <div class="flex items-center justify-between">
          <h5 class="text-xs font-semibold uppercase text-white">
            Host Details
          </h5>
          <div class="flex justify-around gap-4">
            <Show when={props.host?.id}>
              <IconButton
                class="bg-red-600 hover:bg-red-700"
                tooltip="Delete"
                onClick={handleHostDeleteClick}
              >
                <RiSystemDeleteBin2Line class="size-full" />
              </IconButton>
            </Show>
            <IconButton tooltip="Save" onClick={handleHostSaveClick}>
              <AiOutlineSave class="size-full" />
            </IconButton>
          </div>
        </div>

        <div class="mt-4 flex flex-col gap-4 overflow-y-auto">
          <PropertyCard>
            <TextField
              label="Label"
              value={host.label}
              onChange={handleLabelChange}
            />
          </PropertyCard>
          <PropertyCard title="Connection Infomation">
            <TextField
              label="Address"
              value={host.address}
              onChange={handleAddressChange}
            />
            <TextField
              label="Port"
              value={host.port}
              onChange={handlePortChange}
            />
          </PropertyCard>
          <PropertyCard title="Credential">
            <Show when={identities()}>
              {(items) => (
                <Select
                  label="Identity"
                  defaultValue={props.host?.identityId}
                  options={
                    items().map((identity) => ({
                      value: identity.id!,
                      label: identity.label || identity.username,
                    })) || []
                  }
                  onChange={handleIdentityIdChange}
                />
              )}
            </Show>
          </PropertyCard>
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
};

export default HostSidebar;
