export enum AuthType {
  Username = "Username",
  Identity = "Identity",
}

export interface Host {
  id: string;
  address: string;
  port: number;
  label?: string;
  authType: AuthType;
  identity?: string;
  username?: string;
  password?: string;
  privateKey?: string;
}
