import { invoker } from "../api/invoker";

interface GetAgentCommandResponse {
  text: string;
}

class GptService {
  getAgentResponse = (text: string) => {
    return invoker<GetAgentCommandResponse>("get_agent_response", { text });
  };
}

export default new GptService();
