import { Controller, Get, Post, Body, UseGuards, Patch, Param, Delete } from '@nestjs/common';
import { NutritionCalculatorService } from './nutrition-calculator.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { PermissionGuard } from '../auth/guards/permission.guard';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('api/internal/nutrition')
export class NutritionCalculatorController {
    constructor(private readonly nrcService: NutritionCalculatorService) { }

    // ─── NRC Standards ────────────────────────────────────────────────────────
    @RequirePermissions('livestock.read')
    @Get('nrc-standards')
    getNrcStandards() { return this.nrcService.getNrcStandards(); }

    // ─── Feed Ingredients CRUD ────────────────────────────────────────────────
    @RequirePermissions('livestock.read')
    @Get('ingredients')
    getIngredients(@CurrentTenant() tenantId: string) {
        return this.nrcService.getFeedIngredients(tenantId);
    }

    @RequirePermissions('livestock.write')
    @Post('ingredients')
    createIngredient(@CurrentTenant() tenantId: string, @Body() data: any) {
        return this.nrcService.createFeedIngredient(tenantId, data);
    }

    @RequirePermissions('livestock.write')
    @Patch('ingredients/:id')
    updateIngredient(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() data: any) {
        return this.nrcService.updateFeedIngredient(tenantId, id, data);
    }

    @RequirePermissions('livestock.write')
    @Delete('ingredients/:id')
    deleteIngredient(@CurrentTenant() tenantId: string, @Param('id') id: string) {
        return this.nrcService.deleteFeedIngredient(tenantId, id);
    }

    // ─── Import / Export JSON ─────────────────────────────────────────────────
    @RequirePermissions('livestock.read')
    @Get('ingredients/export')
    exportIngredients(@CurrentTenant() tenantId: string) {
        return this.nrcService.exportFeedIngredients(tenantId);
    }

    @RequirePermissions('livestock.write')
    @Post('ingredients/import')
    importIngredients(@CurrentTenant() tenantId: string, @Body('items') items: any[]) {
        return this.nrcService.importFeedIngredients(tenantId, items);
    }

    // ─── Scoop Configuration ─────────────────────────────────────────────────
    @RequirePermissions('livestock.read')
    @Get('scoop-config')
    getScoopConfig(@CurrentTenant() tenantId: string) {
        return this.nrcService.getScoopConfig(tenantId);
    }

    @RequirePermissions('livestock.write')
    @Patch('scoop-config')
    updateScoopConfig(@CurrentTenant() tenantId: string, @Body() data: any) {
        return this.nrcService.updateScoopConfig(tenantId, data);
    }

    // ─── Ration Calculation ───────────────────────────────────────────────────
    @RequirePermissions('livestock.read')
    @Post('calculate-ration')
    calculateRation(
        @CurrentTenant() tenantId: string,
        @Body('items') items: { ingredientId: string; percentage: number }[],
        @Body('targetNrcId') targetNrcId?: string,
    ) { return this.nrcService.calculateRation(tenantId, items, targetNrcId); }

    @RequirePermissions('livestock.read')
    @Post('calculate/pearson')
    calculatePearsonSquare(
        @CurrentTenant() tenantId: string,
        @Body('ingredientAId') a: string,
        @Body('ingredientBId') b: string,
        @Body('targetProtein') target: number,
    ) { return this.nrcService.calculatePearsonSquare(tenantId, a, b, target); }
}
