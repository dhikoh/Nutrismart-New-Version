import { Controller, Post, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';

@UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
@Controller('api/internal/media')
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }

    @Post('upload')
    @RequirePermissions('media.upload')
    @UseInterceptors(FileInterceptor('file')) // the form field name expected is 'file'
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @CurrentTenant() tenantId: string
    ) {
        const fileUrl = await this.mediaService.saveFile(file, tenantId);
        return {
            message: 'File uploaded successfully',
            url: fileUrl
        };
    }
}
