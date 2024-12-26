import { useParams } from "@solidjs/router";
import { createEffect, createSignal, Show } from "solid-js";

import { useActiveTerminal } from "../../../stores";
import Terminal from "./terminal";

const TerminalsPage = () => {
  const { terminalId } = useParams();
  const [hostId, setHostId] = createSignal<string>();

  const { findOne } = useActiveTerminal();

  createEffect(() => {
    const activeTerminal = findOne(terminalId);
    setHostId(activeTerminal?.hostId);
  });

  return (
    <div class="size-full">
      <Show when={hostId()}>
        {(hostId) => <Terminal hostId={hostId()} terminalId={terminalId} />}
      </Show>
    </div>
  );
};

export default TerminalsPage;
