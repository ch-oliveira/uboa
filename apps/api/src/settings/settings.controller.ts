import { Controller, Get, Put, Body } from '@nestjs/common';
import { SettingsService } from './settings.service.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '@repo/database';
import { UpdateSettingsDto } from './dto/settings.dto.js';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Roles(Role.ADMIN, Role.GESTOR)
  @Get()
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @Roles(Role.ADMIN)
  @Put()
  async updateSettings(@Body() body: UpdateSettingsDto) {
    return this.settingsService.updateSettings(body);
  }
}
