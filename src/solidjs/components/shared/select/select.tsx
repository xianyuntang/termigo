import { nanoid } from "nanoid";
import { Component, createEffect, createSignal, For } from "solid-js";

interface SelectProps {
  label: string;
  defaultValue?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

const Select: Component<SelectProps> = (props) => {
  const [value, setValue] = createSignal<string>("");
  const id = nanoid();

  const handleChange = (event: Event & { target: HTMLSelectElement }) => {
    setValue(event.target.value);
    if (typeof props.onChange === "function") {
      props.onChange(event.target.value);
    }
  };

  createEffect(() => {
    if (props.defaultValue) {
      setValue(props.defaultValue);
    } else {
      setValue("");
    }
  });

  return (
    <div class="relative">
      <label for={id} class="mb-2 block text-sm font-medium text-white">
        {props.label}
      </label>
      <select
        id={id}
        class="block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
        value={value()}
        onChange={handleChange}
      >
        <option value="">{props.placeholder}</option>
        <For each={props.options}>
          {(item) => <option value={item.value}>{item.label}</option>}
        </For>
      </select>
    </div>
  );
};

export default Select;
