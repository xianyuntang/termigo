export interface TerminalEvent {
  data: OutEventData | WindowChangeEventData;
}

export interface OutEventData {
  out: Uint8Array;
}

export interface InEventData {
  in: string;
}

export interface WindowChangeEventData {
  size: [number, number];
}

export interface ConnectionEventData {
  status: "open";
}

export const isOutEventData = (
  data: TerminalEvent,
): data is { data: OutEventData } => {
  return "data" in data && "out" in data.data;
};
