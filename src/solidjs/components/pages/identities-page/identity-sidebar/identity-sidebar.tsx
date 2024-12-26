import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import { AiOutlineSave } from "solid-icons/ai";
import { RiSystemDeleteBin2Line } from "solid-icons/ri";
import { createEffect, ParentComponent, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { twMerge } from "tailwind-merge";

import { readFile } from "../../../../../core";
import { Identity } from "../../../../../interfaces";
import { identityService } from "../../../../../services";
import DropUploadField from "../../../shared/drop-uplaod-field";
import IconButton from "../../../shared/icon-button";
import PropertyCard from "../../../shared/property-card";
import TextField from "../../../shared/text-field";
import Textarea from "../../../shared/textarea";

interface IdentitySidebarProps {
  open: boolean;
  identity?: Identity;
  class?: string;
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
  onSave?: () => void;
  onDelete?: () => void;
}

interface IdentityForm {
  label: string;
  username: string;
  password: string;
  key: string;
}

const DEFAULT_FORM = Object.freeze({
  label: "",
  username: "",
  password: "",
  key: "",
});

const IdentitySidebar: ParentComponent<IdentitySidebarProps> = (props) => {
  const [form, setForm] = createStore<IdentityForm>(DEFAULT_FORM);

  createEffect(() => {
    if (props.identity) {
      setForm("label", props.identity?.label || "");
      setForm("username", props.identity?.username || "");
      setForm("password", props.identity?.password || "");
      setForm("key", props.identity.key || "");
    } else {
      setForm(DEFAULT_FORM);
    }
  });

  const handleLabelChange = (value: string) => {
    setForm("label", value);
  };

  const handleUsernameChange = (value: string) => {
    setForm("username", value);
  };

  const handlePasswordChange = (value: string) => {
    setForm("password", value);
  };

  const handleUploadKey = async (file: File) => {
    const text = await readFile(file);
    setForm("key", text);
  };

  const handleKeyChange = (value: string) => {
    setForm("key", value);
  };

  const handleIdentitySaveClick = async () => {
    if (props.identity?.id) {
      await identityService.updateIdentity(
        props.identity?.id,
        form.username,
        form.label,
        form.password || undefined,
        form.key || undefined
      );
    } else {
      await identityService.addIdentity(
        form.username,
        form.label,
        form.password || undefined,
        form.key || undefined
      );
    }

    if (typeof props.onSave === "function") {
      props.onSave();
    }
  };

  const handleIdentityDeleteClick = async () => {
    if (props.identity?.id) {
      await identityService.deleteIdentity(props.identity.id);
    }
    if (typeof props.onDelete === "function") {
      props.onDelete();
    }
  };

  return (
    <div
      ref={props.ref}
      class={twMerge(
        "overflow-y-auto bg-gray-800 p-0.5 transition-transform",
        props.open && "-translate-x-full",
        props.class
      )}
    >
      <OverlayScrollbarsComponent
        class="h-full overflow-y-scroll p-3.5"
        defer
        options={{ scrollbars: { autoHide: "scroll" } }}
      >
        <div class="flex items-center justify-between">
          <h5 class="text-xs font-semibold uppercase text-white">
            Identity Details
          </h5>
          <div class="flex justify-around gap-4">
            <Show when={props.identity?.id}>
              <IconButton
                class="bg-red-600 hover:bg-red-700"
                tooltip="Delete"
                onClick={handleIdentityDeleteClick}
              >
                <RiSystemDeleteBin2Line class="size-full" />
              </IconButton>
            </Show>

            <IconButton tooltip="Save" onClick={handleIdentitySaveClick}>
              <AiOutlineSave class="size-full" />
            </IconButton>
          </div>
        </div>

        <div class="mt-4 flex flex-col gap-4 overflow-y-auto">
          <PropertyCard>
            <TextField
              label="Label"
              value={form.label}
              onChange={handleLabelChange}
            />
          </PropertyCard>
          <PropertyCard title="Identity">
            <TextField
              label="Username"
              value={form.username}
              onChange={handleUsernameChange}
            />
            <TextField
              label="Password"
              value={form.password}
              mask
              onChange={handlePasswordChange}
            />

            <Textarea label="Key" value={form.key} onChange={handleKeyChange} />
            <DropUploadField onUpload={handleUploadKey} />
          </PropertyCard>
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
};

export default IdentitySidebar;
