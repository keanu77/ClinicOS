import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, RoleHierarchy } from '../../shared';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userRole = user.role as Role;
    const userLevel = RoleHierarchy[userRole] || 0;

    // Check if user has any of the required roles or higher
    const hasAccess = requiredRoles.some((role) => {
      const requiredLevel = RoleHierarchy[role] || 0;
      return userLevel >= requiredLevel;
    });

    if (!hasAccess) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
