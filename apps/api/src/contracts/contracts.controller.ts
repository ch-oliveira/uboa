import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { ContractsService } from './contracts.service.js';
import { CreateContractDto } from './dto/create-contract.dto.js';
import { UpdateContractDto } from './dto/update-contract.dto.js';
import { CreateBoletimDto, PreviewBoletimQueryDto } from './dto/boletim-medicao.dto.js';
import { Role } from '@repo/database';

@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.contractsService.findAll(user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.contractsService.findOne(id, user);
  }

  @Post()
  @Roles(Role.ADMIN, Role.GESTOR)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateContractDto,
    @CurrentUser() user: any,
  ) {
    return this.contractsService.create(dto, user);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.GESTOR)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateContractDto,
    @CurrentUser() user: any,
  ) {
    return this.contractsService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.GESTOR)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.contractsService.remove(id, user);
  }

  @Get('boletins/all')
  async findAllBoletins(
    @Query('contratoId') contratoId: string,
    @CurrentUser() user: any,
  ) {
    return this.contractsService.findAllBoletins(contratoId, user);
  }

  @Get('boletins/:boletimId')
  async findBoletimById(
    @Param('boletimId') boletimId: string,
    @CurrentUser() user: any,
  ) {
    return this.contractsService.findBoletimById(boletimId, user);
  }

  @Get(':id/boletim-preview')
  async previewBoletim(
    @Param('id') id: string,
    @Query() query: PreviewBoletimQueryDto,
    @CurrentUser() user: any,
  ) {
    return this.contractsService.previewBoletim(id, query, user);
  }

  @Post(':id/boletins')
  @Roles(Role.ADMIN, Role.GESTOR)
  @HttpCode(HttpStatus.CREATED)
  async createBoletim(
    @Param('id') id: string,
    @Body() dto: CreateBoletimDto,
    @CurrentUser() user: any,
  ) {
    return this.contractsService.createBoletim(id, dto, user);
  }
}
