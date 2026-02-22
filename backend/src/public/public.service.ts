import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicService {
    constructor(private prisma: PrismaService) { }

    async getPublicLivestock(tenantId: string) {
        return this.prisma.livestock.findMany({
            where: {
                tenantId,
                isForSale: true
            },
            select: {
                id: true,
                name: true,
                species: true,
                breed: true,
                currentWeight: true,
                salePrice: true,
                publicNotes: true,
                // Zero-Trust Concept: Explicitly DO NOT return `updatedAt`, `dob`, `status`, `createdAt`, or `tenantId`
            }
        });
    }
}
