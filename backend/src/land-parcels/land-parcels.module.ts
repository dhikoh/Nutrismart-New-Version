import { Module } from '@nestjs/common';
import { LandParcelsService } from './land-parcels.service';
import { LandParcelsController } from './land-parcels.controller';

@Module({
    controllers: [LandParcelsController],
    providers: [LandParcelsService],
    exports: [LandParcelsService]
})
export class LandParcelsModule { }
