import { Accessor, onCleanup, onMount } from "solid-js";

export const useOutsideClick = ({
  ref,
  onClick,
}: {
  ref: Accessor<HTMLElement | undefined>;
  onClick: () => void;
}) => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      ref() &&
      !ref()?.contains(event.target as Node) &&
      typeof onClick === "function"
    ) {
      onClick();
    }
  };

  onMount(() => {
    document.addEventListener("mousedown", handleClickOutside);
  });

  onCleanup(() => {
    document.removeEventListener("mousedown", handleClickOutside);
  });
};
