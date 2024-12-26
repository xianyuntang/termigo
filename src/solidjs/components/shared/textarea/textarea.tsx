import { nanoid } from "nanoid";
import { Component, mergeProps } from "solid-js";

interface TextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

const Textarea: Component<TextareaProps> = (props) => {
  const mergedProps = mergeProps(props, { rows: 4 });

  const id = nanoid();

  const handleValueChange = (
    evt: Event & {
      target: HTMLTextAreaElement;
    },
  ) => {
    if (typeof mergedProps.onChange === "function") {
      mergedProps.onChange(evt.target.value);
    }
  };

  return (
    <div class="relative">
      <label for={id} class="mb-2 block text-sm font-medium text-white">
        {mergedProps.label}
      </label>
      <textarea
        id={id}
        rows={mergedProps.rows}
        class="block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
        placeholder={mergedProps.placeholder}
        value={mergedProps.value}
        onChange={handleValueChange}
      />
    </div>
  );
};

export default Textarea;
