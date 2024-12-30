import { invoke } from "@tauri-apps/api/core";
import { InvokeArgs } from "@tauri-apps/api/core";

class InvokerError extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
    this.name = "InvokerError";
  }
}

export const isInvokerError = (error: unknown): error is InvokerError => {
  return error instanceof InvokerError;
};

export const invoker = async <T>(
  command: string,
  args?: InvokeArgs
): Promise<T> => {
  try {
    const { data } = await invoke<{ data: T }>(command, args);
    return data;
  } catch (e) {
    console.log(e);
    throw new InvokerError(JSON.parse(e as string).error);
  }
};
