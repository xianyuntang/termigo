// Re-export interfaces from features for backward compatibility
export { AuthType } from "@/features/hosts/types/host";
export type { Host, Credential, LocalAuth, IdentityAuth } from "@/features/hosts/types/host";
export type { Identity } from "@/features/identities/types/identity";
export type { PrivateKey } from "@/features/private-keys/types/private-key";
export type { UpdateInformation, DownloadEvent, DownloadProgressEvent, DownloadFinishedEvent, isDownloadProgressEvent } from "@/features/settings/types/setting";

// Common interfaces
export interface OKMessage {
  success: boolean;
  message?: string;
}

export interface Terminal {
  id: string;
  name: string;
  hostId: string;
}