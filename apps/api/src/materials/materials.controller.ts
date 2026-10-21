import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { MaterialsService } from './materials.service.js';
import { Roles } from '../auth/roles.decorator.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Role } from '@repo/database';
import { CreateMaterialDto } from './dto/create-material.dto.js';
import { UpdateMaterialDto } from './dto/update-material.dto.js';

@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get()
  async findAll(
    @Query('categoria') categoria?: string,
    @Query('search') search?: string,
    @Query('alertaEstoque') alertaEstoque?: string,
    @CurrentUser() user?: any,
  ) {
    return this.materialsService.findAll(
      {
        categoria,
        search,
        alertaEstoque: alertaEstoque === 'true',
      },
      user,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.materialsService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.GESTOR)
  @Post()
  async create(@Body() createDto: CreateMaterialDto, @CurrentUser() user?: any) {
    return this.materialsService.create(createDto, user);
  }

  @Roles(Role.ADMIN, Role.GESTOR)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMaterialDto,
    @CurrentUser() user?: any,
  ) {
    return this.materialsService.update(id, updateDto, user);
  }

  @Roles(Role.ADMIN, Role.GESTOR)
  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.materialsService.delete(id, user);
  }
}
