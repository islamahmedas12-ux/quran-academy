import { Controller, Post, Get, Query, Body, UseGuards, Request } from '@nestjs/common';
import { IsEmail } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

class GenerateMagicLinkDto {
  @IsEmail()
  email: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('magic-link')
  async generateMagicLink(@Body() dto: GenerateMagicLinkDto) {
    await this.authService.generateMagicLink(dto.email);
    return {
      success: true,
      message: 'Magic link sent to email',
    };
  }

  @Get('verify')
  async verifyMagicLink(@Query('token') token: string) {
    const result = await this.authService.verifyMagicLink(token);
    return {
      success: true,
      message: 'Verification successful',
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
        user: {
          id: result.user.id,
          email: result.user.email,
          fullName: result.user.fullName,
          role: result.user.role,
        },
      },
    };
  }

  @Post('refresh')
  async refreshToken(@Body() body: { refreshToken: string }) {
    const result = await this.authService.refreshToken(body.refreshToken);
    return {
      success: true,
      data: {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    await this.authService.logout(token);
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}
