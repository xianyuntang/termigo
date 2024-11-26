import { Component } from "solid-js";

import { Host } from "../../../services/host.service.ts";
import Terminal from "./terminal";

interface TerminalPageContainerProps {
  host: Host & { futureId: string };
}

const TerminalPageContainer: Component<TerminalPageContainerProps> = (
  props,
) => {
  return <Terminal host={props.host} />;
};

export default TerminalPageContainer;
