export enum AuthType {
  _Local = "local",
  _Identity = "identity",
}

export interface LocalAuth {
  type: AuthType._Local;
  data: {
    username: string;
    password?: string;
    privateKeyRef?: string;
  };
}

export interface IdentityAuth {
  type: AuthType._Identity;
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
