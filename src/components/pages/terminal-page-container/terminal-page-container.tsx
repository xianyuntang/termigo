import { Component, createEffect, createSignal, Show } from "solid-js";

import { useActiveTerminal } from "../../../stores";
import Terminal from "./terminal";

interface TerminalPageContainerProps {
  terminalId: string;
}

const TerminalPageContainer: Component<TerminalPageContainerProps> = (
  props,
) => {
  const [hostId, setHostId] = createSignal<string>();

  const { findOne } = useActiveTerminal();

  createEffect(() => {
    const activeTerminal = findOne(props.terminalId);
    setHostId(activeTerminal?.hostId);
  });

  return (
    <div class="size-full">
      <Show when={hostId()}>
        {(hostId) => (
          <Terminal hostId={hostId()} terminalId={props.terminalId} />
        )}
      </Show>
    </div>
  );
};

export default TerminalPageContainer;
