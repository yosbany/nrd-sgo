import { AuthService } from '../services/auth.service';
import { Action, Permission, UserRole } from '../interfaces/auth.interface';

export class AuthGuard {
  private static instance: AuthGuard;
  private authService: AuthService;

  private constructor() {
    this.authService = new AuthService();
  }

  static getInstance(): AuthGuard {
    if (!AuthGuard.instance) {
      AuthGuard.instance = new AuthGuard();
    }
    return AuthGuard.instance;
  }

  isAuthenticated(): boolean {
    return !!this.authService.getCurrentUser();
  }

  hasRole(requiredRole: string): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;

    const roles: Record<UserRole, number> = {
      admin: 4,
      manager: 3,
      worker: 2,
      viewer: 1
    };

    const userRoleLevel = roles[user.role] || 0;
    const requiredRoleLevel = roles[requiredRole as UserRole] || 0;

    return userRoleLevel >= requiredRoleLevel;
  }

  hasPermission(resource: string, action: Action): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;

    // Admins have all permissions
    if (user.role === 'admin') return true;

    // Check specific permissions
    return user.permissions.some(permission => 
      (permission.resource === resource || permission.resource === '*') && 
      permission.actions.includes(action)
    );
  }

  hasPermissions(requiredPermissions: Permission[]): boolean {
    return requiredPermissions.every(permission =>
      permission.actions.every(action =>
        this.hasPermission(permission.resource, action)
      )
    );
  }

  requireAuthentication(): void {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required');
    }
  }

  requireRole(role: string): void {
    this.requireAuthentication();
    if (!this.hasRole(role)) {
      throw new Error(`Required role: ${role}`);
    }
  }

  requirePermission(resource: string, action: Action): void {
    this.requireAuthentication();
    if (!this.hasPermission(resource, action)) {
      throw new Error(`Required permission: ${action} ${resource}`);
    }
  }

  requirePermissions(permissions: Permission[]): void {
    this.requireAuthentication();
    if (!this.hasPermissions(permissions)) {
      throw new Error('Insufficient permissions');
    }
  }
} 