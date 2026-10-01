import { Controller, Post, Get, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AiService } from './ai.service.js';
import { Public } from '../auth/public.decorator.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { ChatDto, TriageDto } from './dto/ai.dto.js';
import type { ApiResponse } from '../common/interfaces/api-response.interface.js';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post('chat')
  async chat(@Body() body: ChatDto, @CurrentUser() user?: any): Promise<ApiResponse<any>> {
    const response = await this.aiService.chat(body.message, body.history || [], user);
    return {
      success: true,
      data: response,
    };
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post('triage')
  async triage(@Body() body: TriageDto): Promise<ApiResponse<any>> {
    const result = await this.aiService.semanticTriage(body);
    return {
      success: true,
      data: result,
    };
  }

  @Public()
  @Get('status')
  getStatus(): ApiResponse<{ name: string; role: string; status: 'ONLINE' | 'OFFLINE' }> {
    return {
      success: true,
      data: {
        name: 'Urbi',
        role: 'Copiloto de Zeladoria Municipal Urboa',
        status: 'ONLINE',
      },
    };
  }
}
