import { Channel } from "@tauri-apps/api/core";

import { invoker } from "@/core";
import { OKMessage } from "@/types/response";

import { DownloadEvent, UpdateInformation } from "../types/setting";

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
    return invoker<UpdateInformation>("check_update");
  }

  applyUpdate(event: string, onEvent: Channel<DownloadEvent>) {
    return invoker<OKMessage>("apply_update", { event, onEvent });
  }
}

export default new SettingService();
