import { Controller, Get, UseGuards } from '@nestjs/common';
import { PublicService } from './public.service';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { SkipThrottle } from '@nestjs/throttler';

@UseGuards(ApiKeyGuard)
@Controller('api/public')
export class PublicController {
    constructor(private readonly publicService: PublicService) { }

    // Some public endpoints may want to skip global throttle if the API Key tier allows.
    // We'll leave the default throttle on for now.
    @Get('livestock')
    getPublicLivestock(@CurrentTenant() tenantId: string) {
        return this.publicService.getPublicLivestock(tenantId);
    }
}
