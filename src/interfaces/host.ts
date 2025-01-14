export enum AuthType {
  Local = "local",
  Identity = "identity",
}

export interface LocalAuth {
  type: AuthType.Local;
  data: {
    username: string;
    password?: string;
    privateKeyRef?: string;
  };
}

export interface IdentityAuth {
  type: AuthType.Identity;
  data: string;
}

export type Credential = LocalAuth | IdentityAuth;

export interface Host {
  id: string;
  address: string;
  port: number;
  label?: string;
  credential: Credential;
}
