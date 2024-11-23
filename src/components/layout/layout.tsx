import { ParentComponent } from "solid-js";

import Navbar from "./navbar";
import Sidebar from "./sidebar";

const Layout: ParentComponent = (props) => {
  return (
    <div class="h-screen w-screen">
      <Navbar class="h-16" />
      <Sidebar class="fixed top-16 left-0 z-40 w-48 h-[calc(100vh-4rem)]" />
      <main>
        <div class="fixed left-48 w-[calc(100%-12rem)] m h-[calc(100%-4rem)] overflow-auto bg-gray-900">
          {props.children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
