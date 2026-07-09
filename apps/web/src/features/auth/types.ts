export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
}

export interface AuthWorkspace {
  id: string;
  name: string;
}

export interface AuthProject {
  id: string;
  name: string;
}

export interface AuthSession {
  user: AuthUser;
  workspace?: AuthWorkspace;
  project?: AuthProject;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
  workspaceName?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
