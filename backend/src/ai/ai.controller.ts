import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';

@UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
@Controller('api/internal/ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('recommend')
    @RequirePermissions('ai.read')
    async getRecommendation(
        @CurrentTenant() tenantId: string,
        @Body('prompt') prompt: string
    ) {
        return this.aiService.getRecommendation(tenantId, prompt);
    }
}
