import { useNavigate } from "@solidjs/router";
import { VsClose } from "solid-icons/vs";
import { Component, For } from "solid-js";
import { twMerge } from "tailwind-merge";

import { futureService } from "../../../../services";
import { useActiveTerminal } from "../../../../stores";
import IconButton from "../../../shared/icon-button";

interface TabsProps {
  class?: string;
}

const Tabs: Component<TabsProps> = (props) => {
  const { activeTerminals, remove } = useActiveTerminal();
  const navigator = useNavigate();

  const handleTabClick = (id: string) => {
    navigator(`/terminals/${id}`);
  };

  const handleCloseClick = async (evt: MouseEvent, id: string) => {
    evt.stopPropagation();
    remove(id);
    await futureService.stopFuture(id);
    if (activeTerminals.length === 0) {
      navigator(`/hosts`);
    }
  };

  return (
    <div
      class={twMerge(
        "border-gray-700 h-full flex items-center justify-center",
        props.class,
      )}
    >
      <ul class="flex flex-nowrap text-center text-sm font-medium text-gray-400">
        <For each={activeTerminals}>
          {(activeTerminal) => (
            <li class="me-2">
              <div
                onClick={() => handleTabClick(activeTerminal.terminalId)}
                class="flex w-44 cursor-pointer items-center justify-start gap-1 rounded-lg bg-blue-600 p-1 text-white"
              >
                <IconButton
                  tooltip="Close"
                  size="small"
                  onClick={(evt) =>
                    handleCloseClick(evt, activeTerminal.terminalId)
                  }
                >
                  <VsClose class="size-full" />
                </IconButton>
                {activeTerminal.label}
              </div>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
};

export default Tabs;
