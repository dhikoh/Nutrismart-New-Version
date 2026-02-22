import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'super-secret',
        });
    }

    async validate(payload: any) {
        // Zero-Trust: We validate the token and extract tenant isolation details
        if (!payload.sub || !payload.tenantId) {
            throw new UnauthorizedException('Invalid token payload structure');
        }

        return {
            userId: payload.sub,
            email: payload.email,
            tenantId: payload.tenantId,
            scopes: payload.scopes
        };
    }
}
