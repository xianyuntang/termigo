import { Component, For } from "solid-js";
import { twMerge } from "tailwind-merge";

interface SidebarProps {
  class?: string;
}

const Sidebar: Component<SidebarProps> = (props) => {
  const items = [{ text: "Hosts", url: "/hosts" }];

  return (
    <aside class={twMerge(props.class)}>
      <div class="h-full overflow-y-auto bg-gray-800 px-3 py-4">
        <ul class="space-y-2 font-medium">
          <For each={items}>
            {(item) => (
              <li>
                <a
                  href={item.url}
                  class="group flex items-center rounded-lg p-2 text-white hover:bg-gray-700"
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
