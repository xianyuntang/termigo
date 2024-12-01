import { useParams } from "@solidjs/router";

import TerminalPageContainer from "../../components/pages/terminal-page-container";

const TerminalsPage = () => {
  const params = useParams();

  return <TerminalPageContainer terminalId={params.terminalId} />;
};

export default TerminalsPage;
