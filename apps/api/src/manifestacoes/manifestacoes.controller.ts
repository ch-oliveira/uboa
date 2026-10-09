import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ManifestacoesService } from './manifestacoes.service.js';
import { Public } from '../auth/public.decorator.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role, StatusManifestacao, TipoManifestacao } from '@repo/database';
import {
  CreateManifestacaoDto,
  ResponderManifestacaoDto,
  ConverterManifestacaoOsDto,
} from './dto/manifestacao.dto.js';

@Controller('manifestacoes')
export class ManifestacoesController {
  constructor(private readonly manifestacoesService: ManifestacoesService) {}

  /**
   * Endpoint público para cidadão enviar reclamação/manifestação
   */
  @Public()
  @Post()
  async create(@Body() body: CreateManifestacaoDto) {
    return this.manifestacoesService.create(body);
  }

  /**
   * Endpoint público de consulta/rastreio por protocolo OUV-XXXXXX
   */
  @Public()
  @Get('public/track/:protocolo')
  async trackPublic(@Param('protocolo') protocolo: string) {
    return this.manifestacoesService.trackPublic(protocolo);
  }

  /**
   * Listagem de manifestações para a gestão municipal
   */
  @Roles(Role.ADMIN, Role.GESTOR, Role.SOLICITANTE)
  @Get()
  async findAll(
    @Query('predioId') predioId?: string,
    @Query('status') status?: StatusManifestacao,
    @Query('tipo') tipo?: TipoManifestacao,
    @Query('categoria') categoria?: string,
    @Query('busca') busca?: string,
    @CurrentUser() user?: any,
  ) {
    return this.manifestacoesService.findAll(
      { predioId, status, tipo, categoria, busca },
      user,
    );
  }

  /**
   * Detalhes de uma manifestação específica
   */
  @Roles(Role.ADMIN, Role.GESTOR, Role.SOLICITANTE)
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.manifestacoesService.findOne(id, user);
  }

  /**
   * Emissão de resposta oficial ou arquivamento pelo Gestor
   */
  @Roles(Role.ADMIN, Role.GESTOR)
  @Post(':id/responder')
  async responder(
    @Param('id') id: string,
    @Body() body: ResponderManifestacaoDto,
    @CurrentUser() user?: any,
  ) {
    return this.manifestacoesService.responder(id, body, user);
  }

  /**
   * Conversão de manifestação em Ordem de Serviço técnica
   */
  @Roles(Role.ADMIN, Role.GESTOR)
  @Post(':id/converter-os')
  async converterEmOS(
    @Param('id') id: string,
    @Body() body: ConverterManifestacaoOsDto,
    @CurrentUser() user?: any,
  ) {
    return this.manifestacoesService.converterEmOS(id, body, user);
  }
}
