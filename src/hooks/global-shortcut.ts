import { useThrottleCallback } from "@react-hook/throttle";
import {
  isRegistered,
  register,
  ShortcutEvent,
  unregister,
} from "@tauri-apps/plugin-global-shortcut";
import { useEffect } from "react";

export const useGlobalShortcut = (shortcuts: string, onPressed: () => void) => {
  const handleEvent = useThrottleCallback((event: ShortcutEvent) => {
    if (event.state === "Pressed") {
      onPressed();
    }
  }, 100);

  useEffect(() => {
    const registerFn = async () => {
      if (!(await isRegistered(shortcuts))) {
        await register(shortcuts, handleEvent);
      }
    };

    const unregisterFn = async () => {
      await unregister(shortcuts);
    };

    void registerFn();

    return () => {
      void unregisterFn();
    };
  }, [handleEvent, shortcuts]);
};
