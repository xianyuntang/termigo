import { Component } from "solid-js";
import { twMerge } from "tailwind-merge";

import Tabs from "./tabs";

interface NavbarProps {
  class?: string;
}

const Navbar: Component<NavbarProps> = (props) => {
  return (
    <nav class={twMerge("border-b border-gray-700  bg-gray-800", props.class)}>
      <div class="flex h-full items-center justify-start px-4">
        <Tabs />
      </div>
    </nav>
  );
};

export default Navbar;
