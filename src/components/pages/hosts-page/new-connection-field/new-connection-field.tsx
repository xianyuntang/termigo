import { RiDeviceComputerLine } from "solid-icons/ri";

const NewConnectionField = () => {
  return (
    <div class="mx-auto flex w-44 items-center">
      <div class="relative w-full">
        <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
          <RiDeviceComputerLine class="text-white" />
        </div>
        <input
          type="text"
          id="simple-search"
          class="block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 ps-10 text-sm text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Find a host"
          autocorrect="off"
        />
      </div>
    </div>
  );
};

export default NewConnectionField;
