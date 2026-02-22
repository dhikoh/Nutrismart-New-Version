import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateLivestockDto } from './dto/create-livestock.dto';
import { UpdateLivestockDto } from './dto/update-livestock.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LivestockService {
    constructor(private prisma: PrismaService) { }

    async create(tenantId: string, createLivestockDto: CreateLivestockDto) {
        if (!tenantId) throw new UnauthorizedException('Tenant ID is missing in context');

        return this.prisma.livestock.create({
            data: {
                ...createLivestockDto,
                tenantId,
            },
        });
    }

    async findAll(tenantId: string) {
        return this.prisma.livestock.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(tenantId: string, id: string) {
        const livestock = await this.prisma.livestock.findUnique({
            where: { id },
        });

        // Zero-Trust Check: Ensure it belongs to the tenant
        if (!livestock || livestock.tenantId !== tenantId) {
            throw new NotFoundException(`Livestock with ID ${id} not found in current tenant`);
        }

        return livestock;
    }

    async update(tenantId: string, id: string, updateLivestockDto: UpdateLivestockDto) {
        await this.findOne(tenantId, id); // Validation check to ensure tenant owns it

        return this.prisma.livestock.update({
            where: { id },
            data: updateLivestockDto,
        });
    }

    async remove(tenantId: string, id: string) {
        await this.findOne(tenantId, id); // Zero-Trust verification

        return this.prisma.livestock.delete({
            where: { id },
        });
    }
}
