import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { EnclosuresService } from './enclosures.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { PermissionGuard } from '../auth/guards/permission.guard';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('api/internal/enclosures')
export class EnclosuresController {
    constructor(private readonly enclosuresService: EnclosuresService) { }

    @RequirePermissions('livestock.write')
    @Post()
    create(@CurrentTenant() tenantId: string, @Body() createDto: any) {
        return this.enclosuresService.create(tenantId, createDto);
    }

    @RequirePermissions('livestock.read')
    @Get()
    findAll(@CurrentTenant() tenantId: string) {
        return this.enclosuresService.findAll(tenantId);
    }

    @RequirePermissions('livestock.read')
    @Get('export/csv')
    async exportCsv(@CurrentTenant() tenantId: string, @Res() res: Response) {
        const enclosures = await this.enclosuresService.findAll(tenantId);

        let csvString = 'ID,Name,Type,Capacity,Current Load,Status,Created At\n';

        enclosures.forEach(e => {
            csvString += `"${e.id}","${e.name}","${e.type}",${e.capacity},${e.currentLoad},"${e.status}","${e.createdAt.toISOString()}"\n`;
        });

        res.header('Content-Type', 'text/csv');
        res.attachment(`enclosure-export-${new Date().getTime()}.csv`);
        return res.send(csvString);
    }

    @RequirePermissions('livestock.read')
    @Get(':id')
    findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
        return this.enclosuresService.findOne(tenantId, id);
    }

    @RequirePermissions('livestock.write')
    @Patch(':id')
    update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() updateDto: any) {
        return this.enclosuresService.update(tenantId, id, updateDto);
    }

    @RequirePermissions('livestock.delete')
    @Delete(':id')
    remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
        return this.enclosuresService.remove(tenantId, id);
    }

    @RequirePermissions('livestock.write')
    @Post(':id/assign')
    assignLivestock(
        @CurrentTenant() tenantId: string,
        @Param('id') id: string,
        @Body('livestockId') livestockId: string
    ) {
        return this.enclosuresService.assignLivestock(tenantId, id, livestockId);
    }
}
