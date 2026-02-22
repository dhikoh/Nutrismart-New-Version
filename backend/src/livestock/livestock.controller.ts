import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { LivestockService } from './livestock.service';
import { CreateLivestockDto } from './dto/create-livestock.dto';
import { UpdateLivestockDto } from './dto/update-livestock.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';

@UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
@Controller('api/internal/livestock')
export class LivestockController {
    constructor(private readonly livestockService: LivestockService) { }

    @Post()
    @RequirePermissions('livestock.write')
    create(@CurrentTenant() tenantId: string, @Body() createLivestockDto: CreateLivestockDto) {
        return this.livestockService.create(tenantId, createLivestockDto);
    }

    @Get()
    @RequirePermissions('livestock.read')
    findAll(@CurrentTenant() tenantId: string) {
        return this.livestockService.findAll(tenantId);
    }

    @Get('export/csv')
    @RequirePermissions('livestock.read')
    async exportCsv(@CurrentTenant() tenantId: string, @Res() res: Response) {
        const livestocks = await this.livestockService.findAll(tenantId);

        let csvString = 'ID,Name,Species,Breed,Current Weight (kg),Enclosure,ADG Updates Count,Status,Is For Sale,Acquisition Cost,Accumulated Medical Cost\n';

        livestocks.forEach(l => {
            const enclosureName = l.enclosure ? l.enclosure.name : 'Unassigned';
            const weightUpdates = l.weightRecords ? l.weightRecords.length : 0;
            // Escape values safely for CSV
            csvString += `"${l.id}","${l.name}","${l.species}","${l.breed}",${l.currentWeight},"${enclosureName}",${weightUpdates},"${l.status}",${l.isForSale},${l.acquisitionCost},${l.accumulatedCost}\n`;
        });

        res.header('Content-Type', 'text/csv');
        res.attachment(`livestock-export-${new Date().getTime()}.csv`);
        return res.send(csvString);
    }

    @Get(':id')
    @RequirePermissions('livestock.read')
    findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
        return this.livestockService.findOne(tenantId, id);
    }

    @Patch(':id')
    @RequirePermissions('livestock.write')
    update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() updateLivestockDto: UpdateLivestockDto) {
        return this.livestockService.update(tenantId, id, updateLivestockDto);
    }

    @Delete(':id')
    @RequirePermissions('livestock.delete')
    remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
        return this.livestockService.remove(tenantId, id);
    }
}
