import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
    constructor(private prisma: PrismaService) { }

    async createItem(tenantId: string, data: any) {
        return this.prisma.inventoryItem.create({
            data: {
                ...data,
                tenantId,
            },
        });
    }

    async findAllItems(tenantId: string, type?: string, mode?: string) {
        const whereClause: any = { tenantId };
        if (type) {
            whereClause.type = type;
        }

        if (mode === 'AGRICULTURE') {
            whereClause.category = { in: ['SEED', 'FERTILIZER', 'EQUIPMENT'] };
        } else if (mode === 'LIVESTOCK') {
            whereClause.category = { in: ['FEED', 'MEDICINE', 'EQUIPMENT'] };
        }

        return this.prisma.inventoryItem.findMany({
            where: whereClause,
            orderBy: { name: 'asc' },
        });
    }

    async findOneItem(tenantId: string, id: string) {
        const item = await this.prisma.inventoryItem.findFirst({
            where: { id, tenantId }
        });
        if (!item) throw new NotFoundException('Inventory Item not found');
        return item;
    }

    // --- Transactions & Stock Logic ---
    // In a real double-entry system, 'stockQuantity' is normally a computed column
    // from a ledger. Here we rely on Prisma Transactions for atomic updates.

    async adjustStock(tenantId: string, itemId: string, quantityChange: number, notes?: string, isDeduction: boolean = false) {
        const item = await this.findOneItem(tenantId, itemId);
        const change = isDeduction ? -Math.abs(quantityChange) : Math.abs(quantityChange);

        return this.prisma.$transaction(async (tx) => {
            // Update Master Quantity
            const updatedItem = await tx.inventoryItem.update({
                where: { id: item.id },
                data: {
                    stock: { increment: change }
                }
            });

            // Optional: Log to an InventoryTransaction Ledger if one is created later

            return updatedItem;
        });
    }

}
