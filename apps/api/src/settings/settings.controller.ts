import { Controller, Get, Put, Body } from '@nestjs/common';
import { SettingsService } from './settings.service.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '@repo/database';
import { UpdateSettingsDto } from './dto/settings.dto.js';

@Roles(Role.ADMIN, Role.GESTOR)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @Put()
  async updateSettings(@Body() body: UpdateSettingsDto) {
    return this.settingsService.updateSettings(body);
  }
}
