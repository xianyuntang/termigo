import { Component } from "solid-js";
import { twMerge } from "tailwind-merge";

interface SidebarProps {
  class?: string;
}

const Sidebar: Component<SidebarProps> = (props) => {
  return (
    <aside class={twMerge(props.class)}>
      <div class="h-full px-3 py-4 overflow-y-auto bg-gray-800">
        <ul class="space-y-2 font-medium">
          <li>
            <a
              href="#"
              class="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group"
            >
              <span class="ms-3">Workspace</span>
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
