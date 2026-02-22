import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CropsService } from './crops.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';

@UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
@Controller('api/internal/crops')
export class CropsController {
    constructor(private readonly cropsService: CropsService) { }

    @Post()
    @RequirePermissions('crop.write')
    create(@Body() createCropDto: any, @CurrentTenant() tenantId: string) {
        return this.cropsService.create(tenantId, createCropDto);
    }

    @Get()
    @RequirePermissions('crop.read')
    findAll(@CurrentTenant() tenantId: string) {
        return this.cropsService.findAll(tenantId);
    }

    @Get(':id')
    @RequirePermissions('crop.read')
    findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
        return this.cropsService.findOne(id, tenantId);
    }

    @Patch(':id')
    @RequirePermissions('crop.write')
    update(
        @Param('id') id: string,
        @Body() updateCropDto: any,
        @CurrentTenant() tenantId: string
    ) {
        return this.cropsService.update(id, tenantId, updateCropDto);
    }

    @Delete(':id')
    @RequirePermissions('crop.delete')
    remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
        return this.cropsService.remove(id, tenantId);
    }
}
