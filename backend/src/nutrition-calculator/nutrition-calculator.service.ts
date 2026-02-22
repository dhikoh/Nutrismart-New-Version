import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NutritionCalculatorService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get all NRC Standards available in the master database
     */
    async getNrcStandards() {
        return this.prisma.nrcStandard.findMany();
    }

    /**
     * Calculate a simple Pearson Square formulation for 2 feed ingredients 
     * to reach a target Crude Protein (PK) percentage.
     */
    async calculatePearsonSquare(tenantId: string, ingredientAId: string, ingredientBId: string, targetProtein: number) {
        const feedA = await this.prisma.feedIngredient.findFirst({
            where: { id: ingredientAId, OR: [{ tenantId: null }, { tenantId }] }
        });
        const feedB = await this.prisma.feedIngredient.findFirst({
            where: { id: ingredientBId, OR: [{ tenantId: null }, { tenantId }] }
        });

        if (!feedA || !feedB) {
            throw new NotFoundException('One or both feed ingredients could not be found');
        }

        const pkA = feedA.crudeProtein;
        const pkB = feedB.crudeProtein;

        // Validation
        if (targetProtein <= Math.min(pkA, pkB) || targetProtein >= Math.max(pkA, pkB)) {
            throw new BadRequestException('Target protein must be strictly between the protein levels of the two ingredients.');
        }

        // Pearson Square Logic
        const partsA = Math.abs(pkB - targetProtein);
        const partsB = Math.abs(pkA - targetProtein);
        const totalParts = partsA + partsB;

        const percentageA = (partsA / totalParts) * 100;
        const percentageB = (partsB / totalParts) * 100;

        return {
            targetProtein,
            result: [
                { id: feedA.id, name: feedA.name, percentage: Number(percentageA.toFixed(2)), requiredParts: partsA },
                { id: feedB.id, name: feedB.name, percentage: Number(percentageB.toFixed(2)), requiredParts: partsB }
            ],
            totalParts,
            disclaimer: "This is a basic Pearson Square calculation for Crude Protein. Always consult a nutritionist for complete vitamin/mineral balancing."
        };
    }

    // --- Feed Custom Master Data ---

    async createFeedIngredient(tenantId: string, data: any) {
        return this.prisma.feedIngredient.create({
            data: {
                ...data,
                tenantId, // Isolated to this tenant. Master system uses tenantId=null (Seeder)
            }
        });
    }

    async getFeedIngredients(tenantId: string) {
        return this.prisma.feedIngredient.findMany({
            where: {
                OR: [
                    { tenantId: null }, // Global presets
                    { tenantId } // Tenant's custom feeds
                ]
            }
        });
    }
}
