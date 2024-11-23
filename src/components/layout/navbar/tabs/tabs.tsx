import { Component } from "solid-js";
import { twMerge } from "tailwind-merge";

interface TabsProps {
  class?: string;
}

const Tabs: Component<TabsProps> = (props) => {
  return (
    <div class={twMerge("border-gray-200 dark:border-gray-700", props.class)}>
      <ul class="flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400">
        <li class="me-2">
          <a
            href="#"
            class="inline-block px-4 py-3 text-white bg-blue-600 rounded-lg active"
            aria-current="page"
          >
            Tab 1
          </a>
        </li>
        <li class="me-2">
          <a
            href="#"
            class="inline-block px-4 py-3 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            Tab 2
          </a>
        </li>
        <li class="me-2">
          <a
            href="#"
            class="inline-block px-4 py-3 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            Tab 3
          </a>
        </li>
        <li class="me-2">
          <a
            href="#"
            class="inline-block px-4 py-3 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            Tab 4
          </a>
        </li>
      </ul>
    </div>
  );
};

export default Tabs;
