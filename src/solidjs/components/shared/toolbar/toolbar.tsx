import { ParentComponent } from "solid-js";
import { twMerge } from "tailwind-merge";

interface ToolbarProps {
  class?: string;
}

const Toolbar: ParentComponent<ToolbarProps> = (props) => {
  return (
    <div
      class={twMerge(
        "flex items-center justify-between h-16 py-1 px-4",
        props.class,
      )}
    >
      {props.children}
    </div>
  );
};

export default Toolbar;
