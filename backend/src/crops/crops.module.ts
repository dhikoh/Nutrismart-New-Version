import { Module } from '@nestjs/common';
import { CropsService } from './crops.service';
import { CropsController } from './crops.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [CropsController],
    providers: [CropsService],
})
export class CropsModule { }
