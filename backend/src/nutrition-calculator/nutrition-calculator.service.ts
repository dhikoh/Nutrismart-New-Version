import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NutritionCalculatorService {
    constructor(private prisma: PrismaService) { }

    async getNrcStandards() {
        return this.prisma.nrcStandard.findMany();
    }

    async getFeedIngredients(tenantId: string) {
        return this.prisma.feedIngredient.findMany({
            where: {
                OR: [
                    { tenantId: null },  // Global master presets (read-only)
                    { tenantId }         // Tenant's own feeds
                ]
            },
            orderBy: { name: 'asc' }
        });
    }

    async createFeedIngredient(tenantId: string, data: any) {
        const { name, dryMatter, crudeProtein, crudeFiber, crudeFat, ash, calcium, phosphorus,
            metabolizableEnergy, tdn, ndf, stock, category, pricePerKg } = data;
        return this.prisma.feedIngredient.create({
            data: {
                tenantId,
                name, dryMatter, crudeProtein, crudeFiber, crudeFat, ash,
                calcium, phosphorus, metabolizableEnergy,
                tdn: tdn ?? 0, ndf: ndf ?? 0,
                stock: stock ?? 0, category: category ?? 'SEDANG',
                pricePerKg: pricePerKg ?? 0,
            }
        });
    }

    async updateFeedIngredient(tenantId: string, id: string, data: any) {
        const item = await this.prisma.feedIngredient.findFirst({ where: { id, tenantId } });
        if (!item) throw new NotFoundException('Bahan pakan tidak ditemukan atau bukan milik Anda.');
        const { name, dryMatter, crudeProtein, crudeFiber, crudeFat, ash, calcium, phosphorus,
            metabolizableEnergy, tdn, ndf, stock, category, pricePerKg } = data;
        return this.prisma.feedIngredient.update({
            where: { id },
            data: {
                name, dryMatter, crudeProtein, crudeFiber, crudeFat, ash,
                calcium, phosphorus, metabolizableEnergy,
                ...(tdn !== undefined && { tdn }),
                ...(ndf !== undefined && { ndf }),
                ...(stock !== undefined && { stock }),
                ...(category !== undefined && { category }),
                ...(pricePerKg !== undefined && { pricePerKg }),
            }
        });
    }

    async deleteFeedIngredient(tenantId: string, id: string) {
        const item = await this.prisma.feedIngredient.findFirst({ where: { id, tenantId } });
        if (!item) throw new NotFoundException('Bahan tidak ditemukan atau tidak bisa dihapus (data master global).');
        return this.prisma.feedIngredient.delete({ where: { id } });
    }

    // ─── Scoop Configuration ─────────────────────────────────────────────────

    async getScoopConfig(tenantId: string) {
        let config = await this.prisma.scoopConfig.findUnique({ where: { tenantId } });
        if (!config) {
            config = await this.prisma.scoopConfig.create({
                data: { tenantId, ringanKgPerScoop: 0.275, sedangKgPerScoop: 0.600, beratKgPerScoop: 0.615 }
            });
        }
        return config;
    }

    async updateScoopConfig(tenantId: string, data: { ringanKgPerScoop: number; sedangKgPerScoop: number; beratKgPerScoop: number }) {
        return this.prisma.scoopConfig.upsert({
            where: { tenantId },
            update: data,
            create: { tenantId, ...data },
        });
    }

    // ─── Import / Export JSON ─────────────────────────────────────────────────

    async exportFeedIngredients(tenantId: string) {
        const feeds = await this.prisma.feedIngredient.findMany({
            where: { tenantId },       // Only export tenant's own data
            orderBy: { name: 'asc' },
        });
        return feeds.map(f => ({
            name: f.name, dryMatter: f.dryMatter, crudeProtein: f.crudeProtein,
            crudeFiber: f.crudeFiber, crudeFat: f.crudeFat, ash: f.ash,
            calcium: f.calcium, phosphorus: f.phosphorus,
            metabolizableEnergy: f.metabolizableEnergy, tdn: f.tdn, ndf: f.ndf,
            stock: f.stock, category: f.category, pricePerKg: Number(f.pricePerKg),
        }));
    }

    async importFeedIngredients(tenantId: string, items: any[]) {
        if (!Array.isArray(items) || items.length === 0) {
            throw new BadRequestException('Data JSON tidak valid atau kosong.');
        }
        let created = 0; let updated = 0;
        for (const item of items) {
            if (!item.name) continue;
            const existing = await this.prisma.feedIngredient.findFirst({ where: { name: item.name, tenantId } });
            if (existing) {
                await this.prisma.feedIngredient.update({ where: { id: existing.id }, data: { ...item, pricePerKg: item.pricePerKg ?? 0 } });
                updated++;
            } else {
                await this.prisma.feedIngredient.create({
                    data: {
                        tenantId, name: item.name,
                        dryMatter: item.dryMatter ?? 0, crudeProtein: item.crudeProtein ?? 0,
                        crudeFiber: item.crudeFiber ?? 0, crudeFat: item.crudeFat ?? 0,
                        ash: item.ash ?? 0, calcium: item.calcium ?? 0,
                        phosphorus: item.phosphorus ?? 0, metabolizableEnergy: item.metabolizableEnergy ?? 0,
                        tdn: item.tdn ?? 0, ndf: item.ndf ?? 0,
                        stock: item.stock ?? 0, category: item.category ?? 'SEDANG',
                        pricePerKg: item.pricePerKg ?? 0,
                    }
                });
                created++;
            }
        }
        return { message: `Import selesai: ${created} bahan ditambahkan, ${updated} bahan diperbarui.`, created, updated };
    }


    /**
     * Calculate a multi-ingredient ration based on user-specified percentages.
     * Computes actual nutrient content, LCR cost, and optional NRC comparison.
     */
    async calculateRation(
        tenantId: string,
        items: { ingredientId: string; percentage: number }[],
        targetNrcId?: string
    ) {
        if (!items || items.length === 0) {
            throw new BadRequestException('At least one feed ingredient is required.');
        }

        const totalPercentage = items.reduce((sum, i) => sum + i.percentage, 0);
        if (Math.abs(totalPercentage - 100) > 0.01) {
            throw new BadRequestException(`Total harus 100%. Saat ini: ${totalPercentage.toFixed(2)}%`);
        }

        const ingredientIds = items.map(i => i.ingredientId);
        const feeds = await this.prisma.feedIngredient.findMany({
            where: {
                id: { in: ingredientIds },
                OR: [{ tenantId: null }, { tenantId }]
            }
        });

        if (feeds.length !== ingredientIds.length) {
            throw new NotFoundException('Satu atau lebih bahan tidak ditemukan.');
        }

        // Weighted sum of nutrients
        let pkActual = 0, meActual = 0, caActual = 0, pActual = 0;
        let dmActual = 0, fatActual = 0, fiberActual = 0, costPerKg = 0;

        const rationDetails = items.map(item => {
            const feed = feeds.find(f => f.id === item.ingredientId)!;
            const ratio = item.percentage / 100;

            pkActual += feed.crudeProtein * ratio;
            meActual += feed.metabolizableEnergy * ratio;
            caActual += feed.calcium * ratio;
            pActual += feed.phosphorus * ratio;
            dmActual += feed.dryMatter * ratio;
            fatActual += feed.crudeFat * ratio;
            fiberActual += feed.crudeFiber * ratio;
            costPerKg += Number(feed.pricePerKg) * ratio;

            return {
                id: feed.id,
                name: feed.name,
                percentage: item.percentage,
                contribution: {
                    pk: +(feed.crudeProtein * ratio).toFixed(2),
                    me: +(feed.metabolizableEnergy * ratio).toFixed(1),
                    ca: +(feed.calcium * ratio).toFixed(3),
                    p: +(feed.phosphorus * ratio).toFixed(3),
                },
                pricePerKg: Number(feed.pricePerKg),
                costContribution: +(Number(feed.pricePerKg) * ratio).toFixed(0),
            };
        });

        const actualNutrients = {
            dryMatter: +dmActual.toFixed(2),
            crudeProtein: +pkActual.toFixed(2),
            crudeFat: +fatActual.toFixed(2),
            crudeFiber: +fiberActual.toFixed(2),
            calcium: +caActual.toFixed(3),
            phosphorus: +pActual.toFixed(3),
            metabolizableEnergy: +meActual.toFixed(1),
        };

        const lcr = {
            costPerKgRation: +costPerKg.toFixed(0),
            costPer100kg: +(costPerKg * 100).toFixed(0),
        };

        let nrcComparison = null;
        if (targetNrcId) {
            const nrc = await this.prisma.nrcStandard.findUnique({ where: { id: targetNrcId } });
            if (!nrc) throw new NotFoundException('Standar NRC tidak ditemukan.');

            const analysis = {
                crudeProtein: { actual: actualNutrients.crudeProtein, required: nrc.reqCrudeProtein, met: actualNutrients.crudeProtein >= nrc.reqCrudeProtein, gap: +(actualNutrients.crudeProtein - nrc.reqCrudeProtein).toFixed(2) },
                metabolizableEnergy: { actual: actualNutrients.metabolizableEnergy, required: nrc.reqEnergy, met: actualNutrients.metabolizableEnergy >= nrc.reqEnergy, gap: +(actualNutrients.metabolizableEnergy - nrc.reqEnergy).toFixed(1) },
                calcium: { actual: actualNutrients.calcium, required: nrc.reqCalcium, met: actualNutrients.calcium >= nrc.reqCalcium, gap: +(actualNutrients.calcium - nrc.reqCalcium).toFixed(3) },
                phosphorus: { actual: actualNutrients.phosphorus, required: nrc.reqPhosphorus, met: actualNutrients.phosphorus >= nrc.reqPhosphorus, gap: +(actualNutrients.phosphorus - nrc.reqPhosphorus).toFixed(3) },
                dryMatter: { actual: actualNutrients.dryMatter, required: nrc.reqDryMatter, met: actualNutrients.dryMatter >= nrc.reqDryMatter, gap: +(actualNutrients.dryMatter - nrc.reqDryMatter).toFixed(2) },
            };

            nrcComparison = {
                standard: { species: nrc.species, stage: nrc.stage, weightRange: nrc.weightRange },
                analysis,
                overallStatus: Object.values(analysis).every(a => a.met) ? 'MEMENUHI STANDAR NRC' : 'BELUM MEMENUHI STANDAR NRC',
            };
        }

        return { rationDetails, actualNutrients, lcr, nrcComparison };
    }

    async calculatePearsonSquare(tenantId: string, ingredientAId: string, ingredientBId: string, targetProtein: number) {
        const feedA = await this.prisma.feedIngredient.findFirst({ where: { id: ingredientAId, OR: [{ tenantId: null }, { tenantId }] } });
        const feedB = await this.prisma.feedIngredient.findFirst({ where: { id: ingredientBId, OR: [{ tenantId: null }, { tenantId }] } });

        if (!feedA || !feedB) throw new NotFoundException('Bahan tidak ditemukan');

        const pkA = feedA.crudeProtein;
        const pkB = feedB.crudeProtein;
        if (targetProtein <= Math.min(pkA, pkB) || targetProtein >= Math.max(pkA, pkB)) {
            throw new BadRequestException('Target protein harus di antara nilai protein kedua bahan.');
        }

        const partsA = Math.abs(pkB - targetProtein);
        const partsB = Math.abs(pkA - targetProtein);
        const total = partsA + partsB;

        return {
            targetProtein,
            result: [
                { id: feedA.id, name: feedA.name, percentage: +((partsA / total) * 100).toFixed(2) },
                { id: feedB.id, name: feedB.name, percentage: +((partsB / total) * 100).toFixed(2) }
            ],
        };
    }
}
