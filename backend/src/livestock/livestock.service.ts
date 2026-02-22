import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateLivestockDto } from './dto/create-livestock.dto';
import { UpdateLivestockDto } from './dto/update-livestock.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LivestockService {
    constructor(private prisma: PrismaService) { }

    async create(tenantId: string, createLivestockDto: CreateLivestockDto) {
        if (!tenantId) throw new UnauthorizedException('Tenant ID is missing in context');

        return this.prisma.$transaction(async (tx) => {
            // 1. Create Livestock
            const livestock = await tx.livestock.create({
                data: {
                    ...createLivestockDto,
                    tenantId,
                },
            });

            // 2. Initial Weight Record for ADG calculations
            await tx.weightRecord.create({
                data: {
                    tenantId,
                    livestockId: livestock.id,
                    weight: createLivestockDto.currentWeight,
                    date: new Date(),
                    notes: 'Initial weight logging',
                }
            });

            // 3. If assigned to an enclosure, bump currentLoad
            if (createLivestockDto.enclosureId) {
                await tx.enclosure.update({
                    where: { id: createLivestockDto.enclosureId },
                    data: { currentLoad: { increment: 1 } }
                });
            }

            // 4. Record initial investment (HPP Expense)
            if (createLivestockDto.acquisitionCost && createLivestockDto.acquisitionCost > 0) {
                await tx.transaction.create({
                    data: {
                        tenantId,
                        type: 'EXPENSE',
                        category: 'ASSET_ACQUISITION',
                        amount: createLivestockDto.acquisitionCost,
                        notes: `Initial livestock acquisition: ${livestock.name}`,
                        status: 'COMPLETED'
                    }
                });
            }

            return livestock;
        });
    }

    async findAll(tenantId: string) {
        return this.prisma.livestock.findMany({
            where: { tenantId },
            include: {
                enclosure: true,
                weightRecords: {
                    orderBy: { date: 'desc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(tenantId: string, id: string) {
        const livestock = await this.prisma.livestock.findUnique({
            where: { id },
            include: {
                enclosure: true,
                weightRecords: {
                    orderBy: { date: 'desc' }
                },
                medicalRecords: {
                    orderBy: { date: 'desc' }
                }
            }
        });

        // Zero-Trust Check: Ensure it belongs to the tenant
        if (!livestock || livestock.tenantId !== tenantId) {
            throw new NotFoundException(`Livestock with ID ${id} not found in current tenant`);
        }

        return livestock;
    }

    async update(tenantId: string, id: string, updateLivestockDto: UpdateLivestockDto) {
        const currentLivestock = await this.findOne(tenantId, id); // Validation check

        return this.prisma.$transaction(async (tx) => {
            // Handle Enclosure Transfer Logic
            if (updateLivestockDto.enclosureId !== undefined && updateLivestockDto.enclosureId !== currentLivestock.enclosureId) {
                // Decrement old enclosure if it existed
                if (currentLivestock.enclosureId) {
                    await tx.enclosure.update({
                        where: { id: currentLivestock.enclosureId },
                        data: { currentLoad: { decrement: 1 } }
                    });
                }
                // Increment new enclosure if provided
                if (updateLivestockDto.enclosureId) {
                    await tx.enclosure.update({
                        where: { id: updateLivestockDto.enclosureId },
                        data: { currentLoad: { increment: 1 } }
                    });
                }
            }

            // Handle Weight Update (Create new ADG record)
            if (updateLivestockDto.currentWeight && updateLivestockDto.currentWeight !== currentLivestock.currentWeight) {
                await tx.weightRecord.create({
                    data: {
                        tenantId,
                        livestockId: id,
                        weight: updateLivestockDto.currentWeight,
                        date: new Date(),
                        notes: 'Weight updated via profile modification',
                    }
                });
            }

            return tx.livestock.update({
                where: { id },
                data: updateLivestockDto,
            });
        });
    }

    async remove(tenantId: string, id: string) {
        const livestock = await this.findOne(tenantId, id); // Zero-Trust verification

        return this.prisma.$transaction(async (tx) => {
            if (livestock.enclosureId) {
                await tx.enclosure.update({
                    where: { id: livestock.enclosureId },
                    data: { currentLoad: { decrement: 1 } }
                });
            }
            return tx.livestock.delete({
                where: { id },
            });
        });
    }
}
