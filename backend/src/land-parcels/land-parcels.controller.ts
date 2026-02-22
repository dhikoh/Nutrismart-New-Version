import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LandParcelsService } from './land-parcels.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';

@UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
@Controller('api/internal/land-parcels')
export class LandParcelsController {
    constructor(private readonly landParcelsService: LandParcelsService) { }

    @Post()
    @RequirePermissions('crop.write')
    create(@Body() createParcelDto: any, @CurrentTenant() tenantId: string) {
        return this.landParcelsService.create(tenantId, createParcelDto);
    }

    @Get()
    @RequirePermissions('crop.read')
    findAll(@CurrentTenant() tenantId: string) {
        return this.landParcelsService.findAll(tenantId);
    }

    @Get(':id')
    @RequirePermissions('crop.read')
    findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
        return this.landParcelsService.findOne(id, tenantId);
    }

    @Patch(':id')
    @RequirePermissions('crop.write')
    update(
        @Param('id') id: string,
        @Body() updateParcelDto: any,
        @CurrentTenant() tenantId: string
    ) {
        return this.landParcelsService.update(id, tenantId, updateParcelDto);
    }

    @Delete(':id')
    @RequirePermissions('crop.delete')
    remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
        return this.landParcelsService.remove(id, tenantId);
    }
}
