import { nanoid } from "nanoid";
import { Component, mergeProps } from "solid-js";

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  mask?: boolean;
}

const TextField: Component<TextFieldProps> = (props) => {
  const mergedProps = mergeProps({ mask: false }, props);

  const id = nanoid();

  const handleValueChange = (evt: Event & { target: HTMLInputElement }) => {
    if (typeof mergedProps.onChange === "function") {
      mergedProps.onChange(evt.target.value);
    }
  };

  return (
    <div class="relative">
      <label for={id} class="mb-2 block text-sm font-medium text-white">
        {mergedProps.label}
      </label>
      <input
        id={id}
        class="block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
        placeholder={mergedProps.placeholder}
        autocorrect="off"
        autoCapitalize="off"
        value={mergedProps.value}
        type={mergedProps.mask ? "password" : "text"}
        onChange={handleValueChange}
      />
    </div>
  );
};

export default TextField;
