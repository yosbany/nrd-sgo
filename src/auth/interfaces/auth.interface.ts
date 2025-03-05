export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  lastLogin: Date;
}

export type UserRole = 'admin' | 'manager' | 'worker' | 'viewer';

export interface Permission {
  resource: string;
  actions: Action[];
}

export type Action = 'create' | 'read' | 'update' | 'delete' | 'list';

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterUserData extends LoginCredentials {
  displayName: string;
  role: UserRole;
  permissions?: Permission[];
} 