import { nanoid } from "nanoid";
import { Component, JSX, Show } from "solid-js";

interface IconButtonProps {
  icon: JSX.Element;
  tooltip: string;
}

const IconButton: Component<IconButtonProps> = (props) => {
  const id = `tooltip-${nanoid()}`;
  return (
    <>
      <button
        data-tooltip-target={id}
        type="button"
        class="rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-800"
      >
        {props.icon}
      </button>
      <Show when={props.tooltip}>
        <div
          id={id}
          role="tooltip"
          class="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-700 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-sm transition-opacity duration-300"
        >
          {props.tooltip}
          <div class="tooltip-arrow" />
        </div>
      </Show>
    </>
  );
};

export default IconButton;
