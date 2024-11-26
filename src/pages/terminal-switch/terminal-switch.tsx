import { useLocation, useParams } from "@solidjs/router";
import { For, ParentComponent, Show } from "solid-js";
import { twMerge } from "tailwind-merge";

import TerminalPageContainer from "../../components/pages/terminal-page-container";
import { useHost } from "../../stores";

const TerminalSwitch: ParentComponent = (props) => {
  const params = useParams();
  const location = useLocation();
  const isTerminalPage = () => location.pathname.startsWith("/terminals");

  const { hosts } = useHost();

  return (
    <>
      <div class={twMerge("size-full", isTerminalPage() ? "block" : "hidden")}>
        <For each={hosts}>
          {(host) => (
            <div
              class={twMerge(
                "size-full",
                host.id === params.hostId ? "block" : "hidden",
              )}
            >
              <TerminalPageContainer host={host} />
            </div>
          )}
        </For>
      </div>
      <Show when={!isTerminalPage()}>{props.children}</Show>
    </>
  );
};

export default TerminalSwitch;
