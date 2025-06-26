export enum StatusType {
  _Pending = "Pending",
  _Connecting = "Connecting",
  _SessionCreated = "SessionCreated",
  _TryingToAuthenticate = "TryingToAuthenticate",
  _AuthSuccess = "AuthSuccess",
  _AuthFailed = "AuthFailed",
  _ChannelOpened = "ChannelOpened",
  _StartStreaming = "StartStreaming",
  _NewPublicKeyFound = "NewPublicKeyFound",
  _ConnectionFailed = "ConnectionFailed",
}

export const ERROR_STATUS = [
  StatusType._ConnectionFailed,
  StatusType._AuthFailed,
];
