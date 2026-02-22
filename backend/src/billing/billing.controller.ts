import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { PermissionGuard } from '../auth/guards/permission.guard';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('api/internal/billing')
export class BillingController {
    constructor(private readonly billingService: BillingService) { }

    @RequirePermissions('transaction.write')
    @Post('invoices')
    createInvoice(@CurrentTenant() tenantId: string, @Body() data: any) {
        return this.billingService.createInvoice(tenantId, data);
    }

    @RequirePermissions('transaction.read')
    @Get('invoices')
    findAllInvoices(@CurrentTenant() tenantId: string) {
        return this.billingService.findAllInvoices(tenantId);
    }

    @RequirePermissions('transaction.read')
    @Get('invoices/:id')
    findOneInvoice(@CurrentTenant() tenantId: string, @Param('id') id: string) {
        return this.billingService.findOneInvoice(tenantId, id);
    }

    @RequirePermissions('transaction.read')
    @Get('invoices/:id/pdf')
    generatePdfUrl(@CurrentTenant() tenantId: string, @Param('id') id: string) {
        return this.billingService.generatePdfUrl(tenantId, id);
    }
}
