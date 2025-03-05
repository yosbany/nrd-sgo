import { AuthGuard } from '../guards/auth.guard';
import { Action, Permission } from '../interfaces/auth.interface';

type AuthOptions = {
  role?: string;
  resource?: string;
  action?: Action;
  permissions?: Permission[];
};

export function Auth(options: AuthOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const authGuard = AuthGuard.getInstance();

    descriptor.value = function (...args: any[]) {
      // Always check authentication first
      authGuard.requireAuthentication();

      // Check role if specified
      if (options.role) {
        authGuard.requireRole(options.role);
      }

      // Check single permission if resource and action are specified
      if (options.resource && options.action) {
        authGuard.requirePermission(options.resource, options.action);
      }

      // Check multiple permissions if specified
      if (options.permissions) {
        authGuard.requirePermissions(options.permissions);
      }

      // If all checks pass, execute the original method
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

// Helper decorators for common cases
export function RequireAuth() {
  return Auth();
}

export function RequireRole(role: string) {
  return Auth({ role });
}

export function RequirePermission(resource: string, action: Action) {
  return Auth({ resource, action });
}

export function RequirePermissions(permissions: Permission[]) {
  return Auth({ permissions });
} 