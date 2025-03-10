import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User, UserRole } from '../interfaces/auth.interface';
import { Permission, Action } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  private readonly roles: Record<UserRole, number> = {
    admin: 3,
    manager: 2,
    user: 1
  };

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    const user = await this.authService.getCurrentUser();
    
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    const requiredRole = route.data['role'] as UserRole;
    const requiredPermission = route.data['permission'] as Permission;

    if (requiredRole) {
      const userRoleLevel = this.roles[user.role as UserRole] || 0;
      const requiredRoleLevel = this.roles[requiredRole];
      
      if (userRoleLevel < requiredRoleLevel) {
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }

    if (requiredPermission) {
      if (user.role === 'admin') return true;
      
      const hasPermission = user.permissions?.some(permission =>
        permission.resource === requiredPermission.resource &&
        permission.actions?.every(action =>
          requiredPermission.actions.includes(action)
        )
      );

      if (!hasPermission) {
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }

    return true;
  }
} 