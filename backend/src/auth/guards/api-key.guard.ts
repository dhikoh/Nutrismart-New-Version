import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(private prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['x-api-key'];

        if (!apiKey) {
            throw new UnauthorizedException('API Key is missing');
        }

        const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

        const keyRecord = await this.prisma.apiKey.findUnique({
            where: { keyHash },
        });

        if (!keyRecord || !keyRecord.isActive) {
            throw new UnauthorizedException('Invalid or inactive API Key');
        }

        // Attach tenantId directly to the request, as there is no user attached to a public API key
        request.tenantId = keyRecord.tenantId;
        return true;
    }
}
