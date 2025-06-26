import { StatusType } from "./constant";

export interface TerminalEvent {
  data:
    | OutEventData
    | WindowChangeEventData
    | StatusEventData
    | FingerprintEventData
    | TrustPublicKeyEventData;
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

export interface StatusEventData {
  status: {
    data: unknown;
    type: StatusType;
  };
}

export interface FingerprintEventData {
  fingerprint: string;
}

export interface TrustPublicKeyEventData {
  trustPublicKey: boolean;
}

export const isOutEventData = (
  data: TerminalEvent,
): data is { data: OutEventData } => {
  return "data" in data && "out" in data.data;
};

export const isStatusEventData = (
  data: TerminalEvent,
): data is { data: StatusEventData } => {
  return "data" in data && "status" in data.data;
};

export const isTrustPublicKeyEventData = (
  data: TerminalEvent,
): data is { data: TrustPublicKeyEventData } => {
  return "data" in data && "trustPublicKey" in data.data;
};
