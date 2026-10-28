import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service.js';
import { Public } from '../auth/public.decorator.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '@repo/database';
import { CreateWorkOrderDto, UpdateWorkOrderDto, AddConsumedMaterialDto, UpdateFinancialsDto, AtestoWorkOrderDto } from './dto/work-order.dto.js';

@Controller('work-orders')
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Get()
  async findAll(
    @Query('role') role?: string,
    @Query('predio') predio?: string,
    @Query('tecnico') tecnico?: string,
    @Query('status') status?: string,
    @Query('prioridade') prioridade?: string,
    @CurrentUser() user?: any,
  ) {
    return this.workOrdersService.findAll({ role, predio, tecnico, status, prioridade }, user);
  }

  @Public()
  @Get('public/track/:codigo')
  async trackPublic(@Param('codigo') codigo: string) {
    return this.workOrdersService.trackPublic(codigo);
  }

  @Roles(Role.ADMIN, Role.GESTOR, Role.TECNICO)
  @Get('nearby/opportunities')
  async findNearby(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radius') radius?: string,
    @CurrentUser() user?: any,
  ) {
    return this.workOrdersService.findNearbyOpportunities(
      {
        lat: lat ? parseFloat(lat) : undefined,
        lng: lng ? parseFloat(lng) : undefined,
        radiusKm: radius ? parseFloat(radius) : 5,
      },
      user,
    );
  }

  @Roles(Role.ADMIN, Role.GESTOR, Role.TECNICO)
  @Put(':id/claim')
  async claim(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.workOrdersService.claim(id, user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.workOrdersService.findOne(id, user);
  }

  @Public()
  @Post()
  async create(@Body() body: CreateWorkOrderDto, @CurrentUser() user?: any) {
    return this.workOrdersService.create(body, user);
  }

  @Roles(Role.ADMIN, Role.GESTOR, Role.TECNICO)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateWorkOrderDto, @CurrentUser() user?: any) {
    return this.workOrdersService.update(id, body, user);
  }

  @Roles(Role.ADMIN, Role.GESTOR, Role.TECNICO)
  @Post(':id/materials')
  async addMaterial(
    @Param('id') id: string,
    @Body() dto: AddConsumedMaterialDto,
    @CurrentUser() user?: any,
  ) {
    return this.workOrdersService.addMaterial(id, dto, user);
  }

  @Roles(Role.ADMIN, Role.GESTOR, Role.TECNICO)
  @Delete(':id/materials/:itemId')
  async removeMaterial(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @CurrentUser() user?: any,
  ) {
    return this.workOrdersService.removeMaterial(id, itemId, user);
  }

  @Roles(Role.ADMIN, Role.GESTOR)
  @Put(':id/financials')
  async updateFinancials(
    @Param('id') id: string,
    @Body() dto: UpdateFinancialsDto,
    @CurrentUser() user?: any,
  ) {
    return this.workOrdersService.updateFinancials(id, dto, user);
  }

  @Roles(Role.ADMIN, Role.GESTOR)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Body() body?: { motivoCancelamento?: string; motivo?: string },
    @CurrentUser() user?: any,
  ) {
    return this.workOrdersService.remove(id, body?.motivoCancelamento || body?.motivo, user);
  }

  @Roles(Role.ADMIN, Role.GESTOR, Role.SOLICITANTE)
  @Post(':id/atesto')
  async atestar(
    @Param('id') id: string,
    @Body() dto: AtestoWorkOrderDto,
    @CurrentUser() user?: any,
  ) {
    return this.workOrdersService.atestar(id, dto, user);
  }
}

