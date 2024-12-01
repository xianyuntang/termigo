import { ParentComponent, Show } from "solid-js";

interface PropertyCardProps {
  title?: string;
}

const PropertyCard: ParentComponent<PropertyCardProps> = (props) => {
  return (
    <div class="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow">
      <Show when={props.title}>
        {(text) => <h6 class="text-base text-gray-200">{text()}</h6>}
      </Show>
      {props.children}
    </div>
  );
};

export default PropertyCard;
