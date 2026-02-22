import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { PermissionGuard } from '../auth/guards/permission.guard';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('api/internal/inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @RequirePermissions('transaction.write')
    @Post()
    createItem(@CurrentTenant() tenantId: string, @Body() data: any) {
        return this.inventoryService.createItem(tenantId, data);
    }

    @RequirePermissions('transaction.read')
    @Get()
    findAllItems(@CurrentTenant() tenantId: string, @Query('type') type?: string) {
        return this.inventoryService.findAllItems(tenantId, type);
    }

    @RequirePermissions('transaction.read')
    @Get(':id')
    findOneItem(@CurrentTenant() tenantId: string, @Param('id') id: string) {
        return this.inventoryService.findOneItem(tenantId, id);
    }

    @RequirePermissions('transaction.write')
    @Post(':id/adjust')
    adjustStock(
        @CurrentTenant() tenantId: string,
        @Param('id') id: string,
        @Body('quantity') quantity: number,
        @Body('isDeduction') isDeduction: boolean,
        @Body('notes') notes?: string
    ) {
        return this.inventoryService.adjustStock(tenantId, id, quantity, notes, isDeduction);
    }
}
