import { nanoid } from "nanoid";
import { BsUpload } from "solid-icons/bs";
import { Component } from "solid-js";

interface DropUploadFieldProps {
  onUpload: (file: File) => void;
}

const DropUploadField: Component<DropUploadFieldProps> = (props) => {
  const handleFileUpload = (evt: Event & { target: HTMLInputElement }) => {
    if (evt.target.files?.[0] && typeof props.onUpload === "function") {
      props.onUpload(evt.target.files?.[0]);
    }
  };
  const id = nanoid();
  return (
    <div class="flex h-32 w-full items-center justify-center">
      <label
        for={id}
        class="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-600 bg-gray-700 hover:bg-gray-800 dark:hover:border-gray-500"
      >
        <div class="flex flex-col items-center justify-center pb-6 pt-5">
          <BsUpload class="size-6 text-gray-400" />
          <p class="mt-2 text-sm text-gray-400">
            <span class="font-semibold">Click to upload</span> or drag and drop
          </p>
        </div>
        <input id={id} type="file" class="hidden" onChange={handleFileUpload} />
      </label>
    </div>
  );
};

export default DropUploadField;
