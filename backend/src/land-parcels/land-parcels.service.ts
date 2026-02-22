import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LandParcelsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(tenantId: string, data: any) {
        return this.prisma.landParcel.create({
            data: {
                ...data,
                tenantId,
            },
        });
    }

    async findAll(tenantId: string) {
        return this.prisma.landParcel.findMany({
            where: { tenantId },
            include: {
                cropPhases: {
                    select: { name: true, phase: true, status: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(id: string, tenantId: string) {
        const parcel = await this.prisma.landParcel.findUnique({
            where: { id, tenantId },
            include: { cropPhases: true }
        });

        if (!parcel) {
            throw new NotFoundException(`Land Parcel with ID ${id} not found`);
        }

        return parcel;
    }

    async update(id: string, tenantId: string, data: any) {
        await this.findOne(id, tenantId); // Validates existence and ownership

        return this.prisma.landParcel.update({
            where: { id },
            data,
        });
    }

    async remove(id: string, tenantId: string) {
        await this.findOne(id, tenantId); // Validates existence and ownership

        return this.prisma.landParcel.delete({
            where: { id },
        });
    }
}
