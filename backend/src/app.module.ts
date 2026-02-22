import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LivestockModule } from './livestock/livestock.module';
import { TransactionsModule } from './transactions/transactions.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PublicModule } from './public/public.module';
import { AiModule } from './ai/ai.module';
import { MediaModule } from './media/media.module';
import { CropsModule } from './crops/crops.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ActivityLogInterceptor } from './common/interceptors/activity-log.interceptor';
import { EnclosuresModule } from './enclosures/enclosures.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { NutritionCalculatorModule } from './nutrition-calculator/nutrition-calculator.module';
import { InventoryModule } from './inventory/inventory.module';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100, // 100 requests per minute
    }]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    LivestockModule,
    TransactionsModule,
    DashboardModule,
    PublicModule,
    AiModule,
    MediaModule,
    CropsModule,
    EnclosuresModule,
    MedicalRecordsModule,
    NutritionCalculatorModule,
    InventoryModule,
    BillingModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityLogInterceptor,
    }
  ],
})
export class AppModule { }
