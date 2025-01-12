export enum StatusType {
  Pending = "Pending",
  Connecting = "Connecting",
  Connected = "Connected",
  ChannelOpened = "ChannelOpened",
  StartStreaming = "StartStreaming",
  AuthFailed = "AuthFailed",
  PublicKeyVerified = "PublicKeyVerified",
  NewPublicKeyFound = "NewPublicKeyFound",
  UnknownPublicKey = "UnknownPublicKey",
  ConnectionTimeout = "ConnectionTimeout",
}

export interface TerminalEvent {
  data:
    | OutEventData
    | WindowChangeEventData
    | StatusEventData
    | FingerprintEventData;
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

export interface ConfirmPublicKeyEventData {
  confirm: boolean;
}

export const isOutEventData = (
  data: TerminalEvent
): data is { data: OutEventData } => {
  return "data" in data && "out" in data.data;
};

export const isStatusEventData = (
  data: TerminalEvent
): data is { data: StatusEventData } => {
  return "data" in data && "status" in data.data;
};
