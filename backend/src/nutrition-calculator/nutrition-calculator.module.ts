import { Module } from '@nestjs/common';
import { NutritionCalculatorService } from './nutrition-calculator.service';
import { NutritionCalculatorController } from './nutrition-calculator.controller';

@Module({
    controllers: [NutritionCalculatorController],
    providers: [NutritionCalculatorService],
})
export class NutritionCalculatorModule { }
