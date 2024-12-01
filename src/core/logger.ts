export const forwardConsole = (
  fnName: "log" | "debug" | "info" | "warn" | "error",
  logger: (message: string) => Promise<void>,
) => {
  const original = console[fnName];
  console[fnName] = async (message) => {
    original(message);
    await logger(message);
  };
};
