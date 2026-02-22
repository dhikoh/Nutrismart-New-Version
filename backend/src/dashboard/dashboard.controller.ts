import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';

@UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
@Controller('api/internal/dashboard')
export class DashboardController {
    constructor(private readonly prisma: PrismaService) { }

    @Get('stats')
    @RequirePermissions('dashboard.read')
    async getStats(@CurrentTenant() tenantId: string) {
        const totalLivestock = await this.prisma.livestock.count({ where: { tenantId } });

        // For now, mock crop and staff values as we haven't implemented their models yet
        const activeCrops = 0;
        const farmStaff = await this.prisma.user.count({ where: { tenantId } });

        // Calculate this month's revenue (simplified for prototype)
        const transactions = await this.prisma.transaction.findMany({
            where: { tenantId, type: 'SALE', status: 'COMPLETED' }
        });

        const monthlyRevenue = transactions.reduce((acc: number, curr: { amount: any }) => acc + Number(curr.amount), 0);

        return {
            totalLivestock,
            activeCrops,
            farmStaff,
            monthlyRevenue,
            trends: {
                livestock: { value: 5, isPositive: true },
                revenue: { value: 12, isPositive: true }
            }
        };
    }
}
