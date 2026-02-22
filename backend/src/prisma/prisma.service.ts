import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Helper method for zero-trust queries
  withTenant(tenantId: string) {
    return this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }: any) {
            // Apply tenant id automatically if the model has a tenantId field.
            // Note: Since Prisma extensions don't natively inject easily into the existing $this instance types,
            // we manually pass tenantId in our service layer queries for explicit Zero-Trust enforcement,
            // but this client wrapper can be expanded.

            // For now, returning the raw client.
            return query(args);
          },
        },
      },
    });
  }
}
