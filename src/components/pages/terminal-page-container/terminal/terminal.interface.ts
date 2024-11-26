export interface Message {
  text: string;
  source: MessageSource;
}

export enum MessageSource {
  Stdin = "stdin",
  Stdout = "stdout",
  Stderr = "stderr",
}

export interface StdoutEventData {
  message: Uint8Array;
}

export interface WindowChangeEventData {
  cols: number;
  rows: number;
}
