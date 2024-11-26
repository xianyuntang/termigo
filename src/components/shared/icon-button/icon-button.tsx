import { initTooltips } from "flowbite";
import { nanoid } from "nanoid";
import { mergeProps, onMount, ParentComponent } from "solid-js";
import { twMerge } from "tailwind-merge";

interface IconButtonProps {
  tooltip: string;
  size?: "small" | "medium" | "large";
  class?: string;
  onClick?: (evt: MouseEvent) => void;
}

const IconButton: ParentComponent<IconButtonProps> = (props) => {
  const mergedProps = mergeProps({ size: "medium" }, props);
  const id = nanoid();

  onMount(() => {
    initTooltips();
  });

  const handleButtonClick = (evt: MouseEvent) => {
    if (typeof mergedProps.onClick === "function") {
      mergedProps.onClick(evt);
    }
  };

  return (
    <>
      <button
        data-tooltip-target={id}
        class={twMerge(
          "rounded-lg bg-blue-600 p-1.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-800",
          mergedProps.size === "small" && "size-6",
          mergedProps.size === "medium" && "size-8",
          mergedProps.size === "large" && "size-10",
          mergedProps.class,
        )}
        onClick={handleButtonClick}
      >
        {mergedProps.children}
      </button>
      <div
        id={id}
        class={twMerge(
          "tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-700 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-sm transition-opacity duration-300",
        )}
      >
        {mergedProps.tooltip}
        <div class="tooltip-arrow" />
      </div>
    </>
  );
};

export default IconButton;
