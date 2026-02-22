import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { PermissionGuard } from '../common/guards/permission.guard';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('api/internal/medical-records')
export class MedicalRecordsController {
    constructor(private readonly medicalRecordsService: MedicalRecordsService) { }

    @RequirePermissions('livestock.write')
    @Post()
    create(@CurrentTenant() tenantId: string, @Body() createDto: any) {
        return this.medicalRecordsService.create(tenantId, createDto);
    }

    @RequirePermissions('livestock.read')
    @Get('livestock/:livestockId')
    findAllByLivestock(
        @CurrentTenant() tenantId: string,
        @Param('livestockId') livestockId: string
    ) {
        return this.medicalRecordsService.findAllByLivestock(tenantId, livestockId);
    }

    @RequirePermissions('livestock.read')
    @Get(':id')
    findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
        return this.medicalRecordsService.findOne(tenantId, id);
    }
}
