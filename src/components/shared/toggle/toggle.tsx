import { Component, createSignal, Show } from "solid-js";
import { twMerge } from "tailwind-merge";

interface ToggleProps {
  leftText?: string;
  rightText?: string;
  onChange?: (value: boolean) => void;
  class?: string;
}

const Toggle: Component<ToggleProps> = (props) => {
  const [value, setValue] = createSignal<boolean>(false);

  const handleInputChange = () => {
    setValue(!value());
    if (typeof props.onChange === "function") {
      props.onChange(!value());
    }
  };

  return (
    <div class={twMerge("relative", props.class)}>
      <label class="inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          value=""
          class="peer sr-only"
          onChange={handleInputChange}
        />
        <Show when={props.leftText}>
          {(text) => (
            <span class="me-3 text-sm font-medium text-white">{text()}</span>
          )}
        </Show>
        <div class="peer relative h-6 w-11 rounded-full border-gray-600 bg-gray-700 after:absolute after:start-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800" />
        <Show when={props.rightText}>
          {(text) => (
            <span class="ms-3 text-sm font-medium text-white">{text()}</span>
          )}
        </Show>
      </label>
    </div>
  );
};

export default Toggle;
