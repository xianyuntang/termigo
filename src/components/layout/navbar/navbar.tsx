import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import { Component } from "solid-js";
import { twMerge } from "tailwind-merge";

import Tabs from "./tabs";

interface NavbarProps {
  class?: string;
}

const Navbar: Component<NavbarProps> = (props) => {
  return (
    <nav
      class={twMerge(
        "flex items-center justify-start border-b border-gray-700 bg-gray-800 h-full px-4 overflow-x-auto",
        props.class,
      )}
    >
      <OverlayScrollbarsComponent
        class="h-full"
        options={{ scrollbars: { clickScroll: true } }}
      >
        <Tabs />
      </OverlayScrollbarsComponent>
    </nav>
  );
};

export default Navbar;
