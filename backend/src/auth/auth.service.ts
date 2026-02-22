import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                tenant: true,
                userRoles: {
                    include: {
                        role: {
                            include: {
                                permissions: {
                                    include: { permission: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (user && user.isActive && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        // Extract permissions
        const scopes = new Set<string>();
        user.userRoles.forEach((ur: any) => {
            ur.role.permissions.forEach((rp: any) => {
                scopes.add(rp.permission.action);
            });
        });

        const payload = {
            sub: user.id,
            email: user.email,
            tenantId: user.tenantId,
            scopes: Array.from(scopes),
        };

        return {
            access_token: this.jwtService.sign(payload),
            // In a real scenario, also generate and store a refresh token
        };
    }
}
