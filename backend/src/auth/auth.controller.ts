import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus, Res, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() loginDto: Record<string, any>, @Res({ passthrough: true }) res: Response) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const tokens = await this.authService.login(user); // returns access_token & refresh_token

        // Set HttpOnly cookie
        res.cookie('refresh_token', tokens.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return { access_token: tokens.access_token };
    }

    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies['refresh_token'];
        if (!refreshToken) {
            throw new UnauthorizedException('No refresh token provided');
        }

        const tokens = await this.authService.refreshTokens(refreshToken);

        // Rotating token cookie
        res.cookie('refresh_token', tokens.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return { access_token: tokens.access_token };
    }

    /**
     * POST /auth/logout
     * Guard: JwtAuthGuard (requires valid access token in Authorization header)
     * Reads refresh_token from HttpOnly cookie, revokes it in DB, clears cookie.
     */
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('logout')
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies['refresh_token'];
        await this.authService.logout(refreshToken);

        // Clear the cookie on client side
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

        return { message: 'Logged out successfully' };
    }
}
