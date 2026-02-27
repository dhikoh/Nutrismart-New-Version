import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { PermissionGuard } from '../auth/guards/permission.guard';

@Controller('api/internal/logs')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
export class LogsController {
    constructor(private prisma: PrismaService) { }

    @Get()
    @RequirePermissions('dashboard.read') // Owner & Staff (via dashboard.read) or we can make a specific log.read if needed
    async getLogs(
        @CurrentTenant() tenantId: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20',
        @Query('entityType') entityType?: string,
    ) {
        const pageNumber = parseInt(page, 10) || 1;
        const limitNumber = parseInt(limit, 10) || 20;
        const skip = (pageNumber - 1) * limitNumber;

        const where: any = { tenantId };
        if (entityType) {
            where.entityType = entityType;
        }

        const [data, total] = await Promise.all([
            this.prisma.activityLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNumber,
                include: {
                    // Include optional user relation if present
                }
            }),
            this.prisma.activityLog.count({ where }),
        ]);

        return {
            data,
            meta: {
                total,
                page: pageNumber,
                lastPage: Math.ceil(total / limitNumber),
            },
        };
    }
}
