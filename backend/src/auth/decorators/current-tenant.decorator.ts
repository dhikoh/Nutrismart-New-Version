import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentTenant = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        // In Zero-Trust, we NEVER trust query/body param for tenantId.
        // Support extracting tenantId from either authenticated user JWT or API Key Guard binding.
        return request.user?.tenantId || request.tenantId;
    },
);
