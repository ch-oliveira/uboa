import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AssetsService } from './assets.service.js';
import { CreateAssetDto, UpdateAssetDto } from './dto/asset.dto.js';
import { Public } from '../auth/public.decorator.js';
import { Roles } from '../auth/roles.decorator.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Role } from '@repo/database';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Public()
  @Get()
  async findAll(
    @Query('facilityId') facilityId?: string,
    @Query('predioNome') predioNome?: string,
    @Query('categoria') categoria?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @CurrentUser() user?: any,
  ) {
    return this.assetsService.findAll(
      { facilityId, predioNome, categoria, status, search },
      user,
    );
  }

  @Public()
  @Get('qr/:code')
  async findByQrCode(@Param('code') code: string) {
    return this.assetsService.findByQrCode(code);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.assetsService.findOne(id, user);
  }

  @Post()
  @Roles(Role.ADMIN, Role.GESTOR)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateAssetDto, @CurrentUser() user?: any) {
    return this.assetsService.create(dto, user);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.GESTOR, Role.TECNICO)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAssetDto,
    @CurrentUser() user?: any,
  ) {
    return this.assetsService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.GESTOR)
  async remove(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.assetsService.remove(id, user);
  }
}

