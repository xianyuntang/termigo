import { Component } from "solid-js";
import { twMerge } from "tailwind-merge";

import Tabs from "./tabs";

interface NavbarProps {
  class?: string;
}

const Navbar: Component<NavbarProps> = (props) => {
  return (
    <nav class={twMerge("border-b border-gray-700  bg-gray-800", props.class)}>
      <div class="flex items-center justify-start h-full px-4">
        <a href="/" class="flex items-center space-x-3">
          <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white w-48">
            Termigo
          </span>
        </a>
        <Tabs />
      </div>
    </nav>
  );
};

export default Navbar;
