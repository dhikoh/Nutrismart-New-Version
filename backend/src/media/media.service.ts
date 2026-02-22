import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MediaService {
    private readonly uploadDir = path.join(process.cwd(), 'uploads');

    constructor() {
        // Create 'uploads' directory if it doesn't exist
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async saveFile(file: Express.Multer.File, tenantId: string): Promise<string> {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        // Tenant isolated folder
        const tenantDir = path.join(this.uploadDir, tenantId);
        if (!fs.existsSync(tenantDir)) {
            fs.mkdirSync(tenantDir, { recursive: true });
        }

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        const filename = file.fieldname + '-' + uniqueSuffix + extension;
        const filePath = path.join(tenantDir, filename);

        // Save to disk
        fs.writeFileSync(filePath, file.buffer);

        // Return the relative URL path used for serving
        return `/uploads/${tenantId}/${filename}`;
    }
}
