import { Controller, Post, Get, Body } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { Public } from './public.decorator.js';
import { CurrentUser } from './current-user.decorator.js';
import { LoginDto } from './dto/login.dto.js';
import type { AuthenticatedUserResponse } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Get('me')
  async getMe(@CurrentUser() user: AuthenticatedUserResponse) {
    return {
      success: true,
      data: user,
    };
  }

  @Post('logout')
  async logout(@CurrentUser() user?: AuthenticatedUserResponse) {
    if (user?.id) {
      await this.authService.revokeSession(user.id);
    }
    return { success: true, message: 'Sessão encerrada e revogada com sucesso.' };
  }
}
