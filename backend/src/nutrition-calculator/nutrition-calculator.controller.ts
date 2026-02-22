import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { NutritionCalculatorService } from './nutrition-calculator.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { PermissionGuard } from '../auth/guards/permission.guard';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('api/internal/nutrition')
export class NutritionCalculatorController {
    constructor(private readonly nrcService: NutritionCalculatorService) { }

    @RequirePermissions('livestock.read') // Adjust requirement as needed
    @Get('nrc-standards')
    getNrcStandards() {
        return this.nrcService.getNrcStandards();
    }

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

    @RequirePermissions('livestock.read')
    @Post('calculate/pearson')
    calculatePearsonSquare(
        @CurrentTenant() tenantId: string,
        @Body('ingredientAId') a: string,
        @Body('ingredientBId') b: string,
        @Body('targetProtein') target: number
    ) {
        return this.nrcService.calculatePearsonSquare(tenantId, a, b, target);
    }
}
