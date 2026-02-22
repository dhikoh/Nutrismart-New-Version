import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
    private readonly logger = new Logger(ActivityLogInterceptor.name);

    constructor(private prisma: PrismaService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const { method, url, ip, user } = req;

        // Skip GET requests to avoid spamming the log for simple reads
        if (method === 'GET') {
            return next.handle();
        }

        const now = Date.now();

        return next.handle().pipe(
            tap(async () => {
                const responseTime = Date.now() - now;
                this.logger.log(`[${method}] ${url} - ${responseTime}ms`);

                // If user is authenticated, log their activity
                if (user && user.tenantId) {
                    try {
                        let action = method;
                        // Map HTTP methods to semantic actions
                        if (method === 'POST') action = 'CREATE';
                        if (method === 'PUT' || method === 'PATCH') action = 'UPDATE';
                        if (method === 'DELETE') action = 'DELETE';

                        // Example extraction of entity from URL (e.g., /api/internal/livestock)
                        const segments = url.split('/');
                        const entityType = segments[segments.length - 1] || segments[segments.length - 2] || 'UNKNOWN_MODULE';

                        await this.prisma.activityLog.create({
                            data: {
                                tenantId: user.tenantId,
                                userId: user.sub || user.id,
                                action: action,
                                entityType: entityType.toUpperCase().replace(/[^A-Z0-9_]/g, '_'),
                                details: JSON.stringify({
                                    url,
                                    method,
                                    responseTimeMs: responseTime,
                                    // Be careful not to log sensitive body payload here in a real production environment unless sanitized
                                }),
                                ipAddress: ip || req.headers['x-forwarded-for'] || 'Unknown IP'
                            }
                        });
                    } catch (err) {
                        this.logger.error(`Failed to record Activity Log: ${err.message}`);
                    }
                }
            }),
        );
    }
}
