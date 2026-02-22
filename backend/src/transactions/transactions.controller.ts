import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';

@UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
@Controller('api/internal/transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Post()
    @RequirePermissions('finance.write') // specific permission for finance
    create(@CurrentTenant() tenantId: string, @Body() createTransactionDto: CreateTransactionDto) {
        return this.transactionsService.create(tenantId, createTransactionDto);
    }

    @Get()
    @RequirePermissions('finance.read')
    findAll(@CurrentTenant() tenantId: string) {
        return this.transactionsService.findAll(tenantId);
    }

    @Get(':id')
    @RequirePermissions('finance.read')
    findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
        return this.transactionsService.findOne(tenantId, id);
    }

    @Patch(':id')
    @RequirePermissions('finance.write')
    update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
        return this.transactionsService.update(tenantId, id, updateTransactionDto);
    }

    @Delete(':id')
    @RequirePermissions('finance.delete')
    remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
        return this.transactionsService.remove(tenantId, id);
    }
}
