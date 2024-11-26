import { useNavigate } from "@solidjs/router";
import { VsClose } from "solid-icons/vs";
import { Component, For } from "solid-js";
import { twMerge } from "tailwind-merge";

import { useHost } from "../../../../stores";
import IconButton from "../../../shared/icon-button";

interface TabsProps {
  class?: string;
}

const Tabs: Component<TabsProps> = (props) => {
  const { hosts, remove } = useHost();
  const navigator = useNavigate();

  const handleTabClick = (id: string) => {
    navigator(`/terminals/${id}`);
  };

  const handleCloseClick = (evt: MouseEvent, id: string) => {
    evt.stopPropagation();
    remove(id);
    if (hosts.length === 0) {
      navigator(`/hosts`);
    }
  };

  return (
    <div class={twMerge("border-gray-700", props.class)}>
      <ul class="flex flex-wrap text-center text-sm font-medium text-gray-400">
        <For each={hosts}>
          {(host) => (
            <li class="me-2">
              <div
                onClick={() => handleTabClick(host.id)}
                class="flex w-44 cursor-pointer items-center justify-start gap-1 rounded-lg bg-blue-600 p-1 text-white"
              >
                <IconButton
                  tooltip="Close"
                  size="small"
                  onClick={(evt) => handleCloseClick(evt, host.id)}
                >
                  <VsClose class="size-full" />
                </IconButton>
                {host.label}
              </div>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
};

export default Tabs;
