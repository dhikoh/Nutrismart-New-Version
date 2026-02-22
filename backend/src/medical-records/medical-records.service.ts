import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MedicalRecordsService {
    constructor(private prisma: PrismaService) { }

    async create(tenantId: string, data: any) {
        // 1. Verify livestock belongs to tenant
        const livestock = await this.prisma.livestock.findFirst({
            where: { id: data.livestockId, tenantId }
        });

        if (!livestock) {
            throw new NotFoundException('Livestock not found or does not belong to this tenant');
        }

        // 2. Interactive Transaction: Create record AND accumulate cost
        return this.prisma.$transaction(async (tx) => {
            const record = await tx.medicalRecord.create({
                data: {
                    ...data,
                    tenantId,
                }
            });

            if (data.cost && data.cost > 0) {
                // HPP Calculation: Add medical cost to asset value
                await tx.livestock.update({
                    where: { id: data.livestockId },
                    data: {
                        accumulatedCost: { increment: data.cost }
                    }
                });
            }

            return record;
        });
    }

    async findAll(tenantId: string) {
        return this.prisma.medicalRecord.findMany({
            where: { tenantId },
            orderBy: { date: 'desc' },
            include: {
                livestock: {
                    select: { name: true, species: true }
                }
            }
        });
    }

    async findAllByLivestock(tenantId: string, livestockId: string) {
        return this.prisma.medicalRecord.findMany({
            where: { tenantId, livestockId },
            orderBy: { date: 'desc' },
        });
    }

    async findOne(tenantId: string, id: string) {
        const record = await this.prisma.medicalRecord.findFirst({
            where: { id, tenantId },
        });
        if (!record) throw new NotFoundException('Medical Record not found');
        return record;
    }
}
