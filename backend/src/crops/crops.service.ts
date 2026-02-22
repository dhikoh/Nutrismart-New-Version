import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CropsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(tenantId: string, data: any) {
        return this.prisma.cropPhase.create({
            data: {
                ...data,
                tenantId,
            },
        });
    }

    async findAll(tenantId: string) {
        return this.prisma.cropPhase.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(id: string, tenantId: string) {
        const crop = await this.prisma.cropPhase.findUnique({
            where: { id, tenantId }, // Zero-Trust verification
        });

        if (!crop) {
            throw new NotFoundException(`CropPhase with ID ${id} not found`);
        }

        return crop;
    }

    async update(id: string, tenantId: string, data: any) {
        await this.findOne(id, tenantId); // Validates existence and ownership

        return this.prisma.cropPhase.update({
            where: { id },
            data,
        });
    }

    async remove(id: string, tenantId: string) {
        await this.findOne(id, tenantId); // Validates existence and ownership

        return this.prisma.cropPhase.delete({
            where: { id },
        });
    }
}
