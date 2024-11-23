import { Component, For } from "solid-js";
import { twMerge } from "tailwind-merge";

interface SidebarProps {
  class?: string;
}

const Sidebar: Component<SidebarProps> = (props) => {
  const items = [{ text: "Workspace", url: "/workspace" }];

  return (
    <aside class={twMerge(props.class)}>
      <div class="h-full px-3 py-4 overflow-y-auto bg-gray-800">
        <ul class="space-y-2 font-medium">
          <For each={items}>
            {(item) => (
              <li>
                <a
                  href={item.url}
                  class="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group"
                >
                  <span class="ms-3">{item.text}</span>
                </a>
              </li>
            )}
          </For>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
