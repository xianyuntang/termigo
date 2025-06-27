// Re-export interfaces from features for backward compatibility
export type {
  Credential,
  Host,
  IdentityAuth,
  LocalAuth,
} from "@/features/hosts/types/host";
export { AuthType } from "@/features/hosts/types/host";
export type { Identity } from "@/features/identities/types/identity";
export type { PrivateKey } from "@/features/private-keys/types/private-key";
export type {
  DownloadEvent,
  DownloadFinishedEvent,
  DownloadProgressEvent,
  isDownloadProgressEvent,
  UpdateInformation,
} from "@/features/settings/types/setting";
export type { OKMessage } from "./response";

export interface Terminal {
  id: string;
  name: string;
  hostId: string;
}
