import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

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

        const access_token = this.jwtService.sign(payload);
        const refresh_token = crypto.randomBytes(40).toString('hex');

        // Save to DB
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 Days validity

        await this.prisma.refreshToken.create({
            data: {
                token: refresh_token,
                userId: user.id,
                expiresAt
            }
        });

        return {
            access_token,
            refresh_token
        };
    }

    async refreshTokens(refreshToken: string) {
        const tokenRecord = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: {
                user: {
                    include: {
                        userRoles: {
                            include: { role: { include: { permissions: { include: { permission: true } } } } }
                        }
                    }
                }
            }
        });

        if (!tokenRecord || tokenRecord.isRevoked || tokenRecord.expiresAt < new Date()) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        // Revoke old token to prevent reuse (Refresh Token Rotation)
        await this.prisma.refreshToken.update({
            where: { id: tokenRecord.id },
            data: { isRevoked: true }
        });

        return this.login(tokenRecord.user);
    }
}
