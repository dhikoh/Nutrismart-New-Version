import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnclosuresService {
    constructor(private prisma: PrismaService) { }

    async create(tenantId: string, data: any) {
        return this.prisma.enclosure.create({
            data: {
                ...data,
                tenantId,
            },
        });
    }

    async findAll(tenantId: string) {
        return this.prisma.enclosure.findMany({
            where: { tenantId },
            include: {
                _count: {
                    select: { livestocks: true }
                }
            }
        });
    }

    async findOne(tenantId: string, id: string) {
        const enc = await this.prisma.enclosure.findFirst({
            where: { id, tenantId },
            include: {
                livestocks: true
            }
        });
        if (!enc) throw new NotFoundException('Enclosure not found');
        return enc;
    }

    async update(tenantId: string, id: string, data: any) {
        // Zero-trust verification implicitly via tenantId
        await this.findOne(tenantId, id);
        return this.prisma.enclosure.update({
            where: { id },
            data,
        });
    }

    async remove(tenantId: string, id: string) {
        const enc = await this.findOne(tenantId, id);
        if (enc.livestocks.length > 0) {
            throw new BadRequestException('Cannot delete enclosure with active livestock. Reallocate them first.');
        }
        return this.prisma.enclosure.delete({
            where: { id },
        });
    }

    // --- Specialized Pen Operations ---

    async assignLivestock(tenantId: string, enclosureId: string, livestockId: string) {
        const enclosure = await this.findOne(tenantId, enclosureId);

        // Check Tenant Boundaries for Livestock
        const livestock = await this.prisma.livestock.findFirst({
            where: { id: livestockId, tenantId }
        });
        if (!livestock) throw new NotFoundException('Livestock not found or not owned by tenant');

        // Capacity Check
        const currentCount = await this.prisma.livestock.count({ where: { enclosureId } });
        if (currentCount >= enclosure.capacity) {
            throw new BadRequestException(`Enclosure is at full capacity (${enclosure.capacity})`);
        }

        return this.prisma.livestock.update({
            where: { id: livestockId },
            data: { enclosureId }
        });
    }
}
