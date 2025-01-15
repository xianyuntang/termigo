export enum StatusType {
  Pending = "Pending",
  Connecting = "Connecting",
  SessionCreated = "SessionCreated",
  TryingToAuthenticate = "TryingToAuthenticate",
  AuthSuccess = "AuthSuccess",
  AuthFailed = "AuthFailed",
  ChannelOpened = "ChannelOpened",
  StartStreaming = "StartStreaming",
  NewPublicKeyFound = "NewPublicKeyFound",
  ConnectionFailed = "ConnectionFailed",
}

export const ERROR_STATUS = [
  StatusType.ConnectionFailed,
  StatusType.AuthFailed,
];
