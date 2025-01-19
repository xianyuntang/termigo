import { invoker } from "../core";
import { OKMessage } from "../interfaces";

class SettingService {
  getSettings() {
    return invoker<{ gptApiKey: string }>("get_settings");
  }

  updateSettings(gptApiKey: string) {
    return invoker<OKMessage>("update_settings", { gptApiKey });
  }

  clearData() {
    return invoker<OKMessage>("clear_data");
  }

  checkUpdate() {
    return invoker<OKMessage>("check_update");
  }
}

export default new SettingService();
