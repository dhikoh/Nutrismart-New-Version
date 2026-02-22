import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BillingService {
    constructor(private prisma: PrismaService) { }

    async createInvoice(tenantId: string, data: any) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Create the Invoice Record
            const invoice = await tx.invoice.create({
                data: {
                    tenantId,
                    invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    type: data.type, // 'SALE' or 'PURCHASE'
                    status: data.status || 'DRAFT',
                    date: new Date(),
                    subtotal: data.totalAmount, // Assuming no tax/discount initially
                    total: data.totalAmount,
                    dueDate: data.dueDate ? new Date(data.dueDate) : null,
                    customerName: data.clientName,
                }
            });

            // 2. Create the Ledger Transaction mapped to the Invoice
            await tx.transaction.create({
                data: {
                    tenantId,
                    invoiceId: invoice.id,
                    type: data.type === 'SALE' ? 'INCOME' : 'EXPENSE',
                    amount: data.totalAmount, // Transaction schema uses 'amount' and DTO provides 'totalAmount'
                    category: `INVOICE_${data.type}`,
                    notes: `Auto-generated transaction for Invoice ${invoice.invoiceNumber}`
                }
            });

            // 3. Mark Livestock as Sold if this is a livestock sale
            if (data.livestockIds && data.livestockIds.length > 0 && data.type === 'SALE') {
                await tx.livestock.updateMany({
                    where: {
                        id: { in: data.livestockIds },
                        tenantId
                    },
                    data: {
                        status: 'SOLD',
                        isForSale: false
                    }
                });
            }

            return invoice;
        });
    }

    async findAllInvoices(tenantId: string) {
        return this.prisma.invoice.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            include: {
                transactions: true
            }
        });
    }

    async findOneInvoice(tenantId: string, id: string) {
        const invoice = await this.prisma.invoice.findFirst({
            where: { id, tenantId },
            include: {
                transactions: true
            }
        });
        if (!invoice) throw new NotFoundException('Invoice not found');
        return invoice;
    }

    // Future Endpoint: Abstracted PDF Generator
    // In a full implementation, this stream would pipe to a frontend React-PDF Blob
    async generatePdfUrl(tenantId: string, id: string) {
        const invoice = await this.findOneInvoice(tenantId, id);
        // Simulating PDF generation
        return {
            url: `/downloads/invoices/${invoice.invoiceNumber}.pdf`,
            generatedAt: new Date(),
            meta: invoice
        };
    }
}
