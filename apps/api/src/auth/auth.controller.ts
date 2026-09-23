import { Controller, Post, Get, Body, Headers } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { email?: string; password?: string; role?: string }
  ) {
    return this.authService.login(body.email, body.password, body.role);
  }

  @Get('me')
  async getMe(@Headers('authorization') authHeader?: string) {
    // Extrai o id do token (ex: zelo_jwt_token_user-gestor_...)
    let userId = 'user-gestor';
    if (authHeader && authHeader.includes('zelo_jwt_token_')) {
      const parts = authHeader.replace('Bearer ', '').split('_');
      if (parts[3]) userId = parts[3];
    }
    return this.authService.getMe(userId);
  }

  @Post('logout')
  async logout() {
    return { success: true, message: 'Sessão encerrada com sucesso.' };
  }
}
