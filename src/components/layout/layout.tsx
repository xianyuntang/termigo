import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import { ParentComponent } from "solid-js";

import Navbar from "./navbar";
import Sidebar from "./sidebar";

const Layout: ParentComponent = (props) => {
  return (
    <div class="h-screen w-screen">
      <Navbar class="h-12" />
      <Sidebar class="fixed left-0 top-12 h-[calc(100vh-3rem)] w-48" />
      <main>
        <div class="fixed left-48 h-[calc(100%-3rem)] w-[calc(100%-12rem)] overflow-auto bg-gray-900 p-0.5">
          <OverlayScrollbarsComponent
            class="size-full overflow-y-scroll p-3.5"
            defer
            options={{ scrollbars: { autoHide: "scroll" } }}
          >
            {props.children}
          </OverlayScrollbarsComponent>
        </div>
      </main>
    </div>
  );
};

export default Layout;
