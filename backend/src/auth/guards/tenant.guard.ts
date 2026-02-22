import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Check if route has explicit tenant param to validate against
        // Example: /tenant/:tenantId/livestock
        const routeTenantId = request.params.tenantId;

        if (routeTenantId && user.tenantId !== routeTenantId) {
            // Zero-Trust Boundary: Cross-tenant access attempt blocked
            throw new ForbiddenException('Zero-Trust Violation: Cross-Tenant Access Blocked');
        }

        return true;
    }
}
