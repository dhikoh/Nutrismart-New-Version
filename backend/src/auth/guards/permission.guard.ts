import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredPermissions) {
            return true; // No specific permissions required for this route
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user || !user.scopes) {
            throw new ForbiddenException('Access Denied: No scopes present');
        }

        const hasPermission = requiredPermissions.every((permission) =>
            user.scopes.includes(permission),
        );

        if (!hasPermission) {
            throw new ForbiddenException(`Access Denied: Requires permissions: [${requiredPermissions.join(', ')}]`);
        }

        return true;
    }
}
