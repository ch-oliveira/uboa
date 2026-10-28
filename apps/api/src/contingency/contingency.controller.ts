import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { ContingencyService } from './contingency.service.js';
import {
  CreateAlertDto,
  TriggerContingencyDto,
  CompleteContingencyChecklistDto,
} from './dto/contingency.dto.js';
import { Role } from '@repo/database';

@Controller('contingency')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContingencyController {
  constructor(private readonly contingencyService: ContingencyService) {}

  @Get('alerts')
  async findAllAlerts(@CurrentUser() user: any) {
    return this.contingencyService.findAllAlerts(user);
  }

  @Get('alerts/:id')
  async findAlertById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.contingencyService.findAlertById(id, user);
  }

  @Post('alerts')
  @Roles(Role.ADMIN, Role.GESTOR)
  @HttpCode(HttpStatus.CREATED)
  async createAlert(
    @Body() dto: CreateAlertDto,
    @CurrentUser() user: any,
  ) {
    return this.contingencyService.createAlert(dto, user);
  }

  @Put('alerts/:id/resolve')
  @Roles(Role.ADMIN, Role.GESTOR)
  async resolveAlert(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.contingencyService.resolveAlert(id, user);
  }

  @Post('trigger')
  @Roles(Role.ADMIN, Role.GESTOR)
  @HttpCode(HttpStatus.CREATED)
  async triggerContingencyPlan(
    @Body() dto: TriggerContingencyDto,
    @CurrentUser() user: any,
  ) {
    return this.contingencyService.triggerContingencyPlan(dto, user);
  }

  @Put('inspections/:id/complete')
  @Roles(Role.ADMIN, Role.GESTOR, Role.TECNICO)
  async completeContingencyInspection(
    @Param('id') id: string,
    @Body() dto: CompleteContingencyChecklistDto,
    @CurrentUser() user: any,
  ) {
    return this.contingencyService.completeContingencyInspection(id, dto, user);
  }
}
