import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
    constructor(private prisma: PrismaService) { }

    async create(tenantId: string, createTransactionDto: CreateTransactionDto) {
        if (!tenantId) throw new UnauthorizedException('Tenant ID is missing in context');

        // Convert to Decimal
        return this.prisma.transaction.create({
            data: {
                ...createTransactionDto,
                amount: createTransactionDto.amount,
                tenantId,
            },
        });
    }

    async findAll(tenantId: string) {
        return this.prisma.transaction.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(tenantId: string, id: string) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id },
        });

        if (!transaction || transaction.tenantId !== tenantId) {
            throw new NotFoundException(`Transaction with ID ${id} not found in current tenant`);
        }

        return transaction;
    }

    async update(tenantId: string, id: string, updateTransactionDto: UpdateTransactionDto) {
        await this.findOne(tenantId, id);

        return this.prisma.transaction.update({
            where: { id },
            data: {
                ...updateTransactionDto,
                amount: updateTransactionDto.amount,
            },
        });
    }

    async remove(tenantId: string, id: string) {
        await this.findOne(tenantId, id);

        return this.prisma.transaction.delete({
            where: { id },
        });
    }
}
