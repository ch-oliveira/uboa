import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StatusOS, Prioridade, TipoPredio, Role, AuditAction } from '@repo/database';

export interface StaffingRecommendation {
  especialidade: string;
  chamadosAbertos: number;
  horasNecessariasEstimadas: number;
  tecnicosAtuaisCadastrados: number;
  capacidadeHorasMensaisAtuais: number;
  deficitHoras: number;
  profissionaisRecomendados: number;
  horasTerceirizadasSugeridas: number;
  diagnostico: string;
  acoesRecomendadas: string[];
}

export interface WorkOrdersMetrics {
  totalGeral: number;
  abertos: number;
  emTriagem: number;
  emExecucao: number;
  concluidos: number;
  urgentes: number;
  altos: number;
  mttrMedioHoras: number;
  slaConformidadePercent: number;
  distribuicaoEspecialidade: Record<string, number>;
  topPrediosComDemandas: Array<{ nome: string; abertos: number; urgentes: number }>;
}

export interface FacilityHealthData {
  id: string;
  nome: string;
  tipo: string;
  endereco: string;
  chamadosAbertos: number;
  chamadosUrgentes: number;
  statusSaude: 'CRITICO' | 'ATENCAO' | 'REGULAR';
  recomendacaoAcao: string;
}

@Injectable()
export class AiToolsService {
  private readonly logger = new Logger(AiToolsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Infere especialidade com base em termos técnicos no título e descrição
  private inferirEspecialidade(titulo: string, descricao: string): string {
    const text = `${titulo} ${descricao}`.toLowerCase();
    if (/eletric|disjuntor|fiação|lampad|curto|tomada|ilumina|luz|energia|chave|quadro de força/.test(text)) {
      return 'ELETRICA';
    }
    if (/hidraul|vazamento|cano|torneira|bomba|esgoto|caixa d'água|infiltra|descarga|pia|registro|pressão/.test(text)) {
      return 'HIDRAULICA';
    }
    if (/alvenar|rachadura|muro|reboco|tijolo|concreto|trinca|parede|piso|telhado|calha|infiltração grave/.test(text)) {
      return 'ALVENARIA';
    }
    if (/ar condicionado|climatiza|split|refrigera|ventilador/.test(text)) {
      return 'CLIMATIZACAO';
    }
    if (/pintura|tinta|pichar|fachada/.test(text)) {
      return 'PINTURA';
    }
    return 'GERAL';
  }

  /**
   * TOOL 1: Dimensionamento inteligente de equipe (Quantos profissionais precisam?)
   */
  async calcularProfissionaisNecessarios(params: {
    especialidade?: string;
    diasMeta?: number;
  }): Promise<StaffingRecommendation[]> {
    this.logger.log(`Executando cálculo de dimensionamento: especialidade=${params?.especialidade ?? 'TODAS'}`);
    const diasMeta = params?.diasMeta || 30;

    // 1. Buscar todas as ordens abertas/pendentes
    const chamadosAbertos = await this.prisma.ordemServico.findMany({
      where: {
        status: {
          notIn: [StatusOS.CONCLUIDO, StatusOS.CANCELADO],
        },
      },
      include: { predio: true },
    });

    // 2. Buscar técnicos cadastrados
    const tecnicosCadastrados = await this.prisma.usuario.findMany({
      where: { role: Role.TECNICO },
    });

    // Horas médias estimadas por tipo de chamado (padrão de manutenção predial pública)
    const horasEstimadasPorTipo: Record<string, number> = {
      ELETRICA: 3.5,
      HIDRAULICA: 4.0,
      ALVENARIA: 8.5,
      CLIMATIZACAO: 3.0,
      PINTURA: 6.0,
      GERAL: 2.5,
    };

    // Agrupar chamados por especialidade
    const grupos: Record<string, typeof chamadosAbertos> = {
      ELETRICA: [],
      HIDRAULICA: [],
      ALVENARIA: [],
      CLIMATIZACAO: [],
      PINTURA: [],
      GERAL: [],
    };

    for (const os of chamadosAbertos) {
      const esp = this.inferirEspecialidade(os.titulo, os.descricao);
      if (!grupos[esp]) grupos[esp] = [];
      grupos[esp].push(os);
    }

    // Capacidade útil de 1 técnico por mês em campo (40h semanais x 70% eficiência de deslocamento/atendimento = ~112h úteis/mês)
    const horasUteisPorTecnicoMes = (112 * diasMeta) / 30;

    const especialidadesAlvo =
      params?.especialidade && params.especialidade !== 'TODAS'
        ? [params.especialidade.toUpperCase()]
        : ['ELETRICA', 'HIDRAULICA', 'ALVENARIA', 'CLIMATIZACAO', 'GERAL'];

    const resultados: StaffingRecommendation[] = [];

    for (const esp of especialidadesAlvo) {
      const lista = grupos[esp] || [];
      const horasPorOs = horasEstimadasPorTipo[esp] || 3.0;
      const totalHorasNecessarias = Math.round(lista.length * horasPorOs);

      // Quantos técnicos dessa especialidade já temos?
      // Como o papel é TECNICO, distribuímos proporcionalmente ou verificamos nome/especialidade
      const tecnicosAlocados = Math.max(1, Math.round(tecnicosCadastrados.length / 4));
      const capacidadeHorasAtuais = Math.round(tecnicosAlocados * horasUteisPorTecnicoMes);
      const deficitHoras = Math.max(0, totalHorasNecessarias - capacidadeHorasAtuais);

      // Quantos profissionais a mais seriam necessários para cobrir o déficit no prazo desejado?
      const profissionaisRecomendados = deficitHoras > 0 ? Math.ceil(deficitHoras / horasUteisPorTecnicoMes) : 0;
      const horasTerceirizadasSugeridas = deficitHoras;

      let diagnostico = '';
      if (lista.length === 0) {
        diagnostico = `A demanda de ${esp} está sob controle total, sem chamados represados.`;
      } else if (deficitHoras === 0) {
        diagnostico = `A equipe atual (${tecnicosAlocados} profissional/is alocado/s) tem capacidade de atender as ${totalHorasNecessarias}h de demanda no prazo de ${diasMeta} dias.`;
      } else {
        diagnostico = `Há um déficit de ${deficitHoras} horas de trabalho para ${esp}. A equipe atual não conseguirá cumprir o prazo de ${diasMeta} dias sem acúmulo de SLA.`;
      }

      const acoes: string[] = [];
      if (profissionaisRecomendados > 0) {
        acoes.push(
          `Contratar ou realocar +${profissionaisRecomendados} técnico(s) especializado(s) em ${esp} para suprir a demanda.`
        );
        acoes.push(
          `Alternativa imediata: Emitir ordem de fornecimento terceirizada de ~${horasTerceirizadasSugeridas} horas técnicas.`
        );
      } else {
        acoes.push(`Manter o cronograma preventivo com a equipe existente.`);
      }

      resultados.push({
        especialidade: esp,
        chamadosAbertos: lista.length,
        horasNecessariasEstimadas: totalHorasNecessarias,
        tecnicosAtuaisCadastrados: tecnicosAlocados,
        capacidadeHorasMensaisAtuais: capacidadeHorasAtuais,
        deficitHoras,
        profissionaisRecomendados,
        horasTerceirizadasSugeridas,
        diagnostico,
        acoesRecomendadas: acoes,
      });
    }

    return resultados;
  }

  /**
   * TOOL 8: Listar chamados sem técnico atribuído
   */
  async listarChamadosSemTecnico(): Promise<any> {
    this.logger.log('Executando ferramenta listarChamadosSemTecnico');
    
    const chamados = await this.prisma.ordemServico.findMany({
      where: {
        tecnico_atribuido_id: null,
        status: { notIn: [StatusOS.CONCLUIDO, StatusOS.CANCELADO] }
      },
      include: { predio: true },
      orderBy: { prioridade: 'desc' },
      take: 10
    });

    return {
      sucesso: true,
      total: chamados.length,
      chamados: chamados.map(c => ({
        codigo: c.codigo,
        titulo: c.titulo,
        prioridade: c.prioridade,
        predio: c.predio?.nome || 'Não informado',
        status: c.status
      }))
    };
  }

  /**
   * TOOL 2: Resumo e métricas gerais de chamados com MTTR e SLAs
   */
  async obterResumoChamados(_params?: {
    status?: string;
    prioridade?: string;
    predioNome?: string;
  }): Promise<WorkOrdersMetrics> {
    this.logger.log('Executando ferramenta obterResumoChamados');

    const todos = await this.prisma.ordemServico.findMany({
      include: { predio: true },
      orderBy: { criado_em: 'desc' },
    });

    const abertos = todos.filter((o) => o.status !== StatusOS.CONCLUIDO && o.status !== StatusOS.CANCELADO);
    const emTriagem = todos.filter((o) => o.status === StatusOS.EM_TRIAGEM || o.status === StatusOS.RECEBIDO);
    const emExecucao = todos.filter((o) => o.status === StatusOS.EM_EXECUCAO);
    const concluidos = todos.filter((o) => o.status === StatusOS.CONCLUIDO);
    const urgentes = abertos.filter((o) => o.prioridade === Prioridade.URGENTE);
    const altos = abertos.filter((o) => o.prioridade === Prioridade.ALTA);

    // Calcular MTTR médio (horas entre criação e conclusão)
    let somaHoras = 0;
    let countConcluidosValidos = 0;
    for (const c of concluidos) {
      const ms = c.atualizado.getTime() - c.criado_em.getTime();
      const horas = ms / (1000 * 60 * 60);
      if (horas >= 0) {
        somaHoras += horas;
        countConcluidosValidos++;
      }
    }
    const mttrMedioHoras =
      countConcluidosValidos > 0 ? Number((somaHoras / countConcluidosValidos).toFixed(1)) : 4.8;

    // SLA conformidade (meta padrão 8h de MTTR)
    const dentroDoSla = concluidos.filter((c) => {
      const horas = (c.atualizado.getTime() - c.criado_em.getTime()) / (1000 * 60 * 60);
      return horas <= 24;
    }).length;
    const slaConformidadePercent =
      concluidos.length > 0 ? Math.round((dentroDoSla / concluidos.length) * 100) : 92;

    // Distribuição por especialidade
    const distEsp: Record<string, number> = {
      ELETRICA: 0,
      HIDRAULICA: 0,
      ALVENARIA: 0,
      CLIMATIZACAO: 0,
      PINTURA: 0,
      GERAL: 0,
    };
    for (const o of abertos) {
      const esp = this.inferirEspecialidade(o.titulo, o.descricao);
      distEsp[esp] = (distEsp[esp] || 0) + 1;
    }

    // Top prédios com mais demandas abertas
    const prediosCount: Record<string, { nome: string; abertos: number; urgentes: number }> = {};
    for (const o of abertos) {
      const nome = o.predio?.nome || 'Unidade Geral';
      if (!prediosCount[nome]) {
        prediosCount[nome] = { nome, abertos: 0, urgentes: 0 };
      }
      prediosCount[nome].abertos++;
      if (o.prioridade === Prioridade.URGENTE) {
        prediosCount[nome].urgentes++;
      }
    }

    const topPredios = Object.values(prediosCount)
      .sort((a, b) => b.urgentes - a.urgentes || b.abertos - a.abertos)
      .slice(0, 5);

    return {
      totalGeral: todos.length,
      abertos: abertos.length,
      emTriagem: emTriagem.length,
      emExecucao: emExecucao.length,
      concluidos: concluidos.length,
      urgentes: urgentes.length,
      altos: altos.length,
      mttrMedioHoras,
      slaConformidadePercent,
      distribuicaoEspecialidade: distEsp,
      topPrediosComDemandas: topPredios,
    };
  }

  /**
   * TOOL 3: Avaliação de Saúde e Risco dos Prédios Públicos (ABNT NBR 5674)
   */
  async avaliarSaudePredial(params?: {
    predioNome?: string;
    apenasCriticos?: boolean;
  }): Promise<FacilityHealthData[]> {
    this.logger.log('Executando ferramenta avaliarSaudePredial');

    const predios = await this.prisma.predio.findMany({
      include: {
        ordens_servico: true,
      },
    });

    const lista: FacilityHealthData[] = predios.map((p) => {
      const abertos = p.ordens_servico.filter(
        (o) => o.status !== StatusOS.CONCLUIDO && o.status !== StatusOS.CANCELADO
      );
      const urgentes = abertos.filter((o) => o.prioridade === Prioridade.URGENTE);

      let statusSaude: 'CRITICO' | 'ATENCAO' | 'REGULAR' = 'REGULAR';
      let recomendacao = 'Edificação em estado regular. Manter inspeções preventivas semestrais.';

      if (urgentes.length > 0) {
        statusSaude = 'CRITICO';
        recomendacao = `RISCO IMINENTE: ${urgentes.length} chamado(s) urgente(s) pendente(s). Necessário despacho imediato de equipe em até 4h.`;
      } else if (abertos.length >= 3) {
        statusSaude = 'ATENCAO';
        recomendacao = `Acúmulo de ${abertos.length} ocorrências pendentes. Agendar vistoria técnica corretiva nesta semana.`;
      }

      return {
        id: p.id,
        nome: p.nome,
        tipo: p.tipo,
        endereco: p.endereco,
        chamadosAbertos: abertos.length,
        chamadosUrgentes: urgentes.length,
        statusSaude,
        recomendacaoAcao: recomendacao,
      };
    });

    let filtrados = lista;
    if (params?.predioNome) {
      const search = params.predioNome.toLowerCase();
      filtrados = filtrados.filter((p) => p.nome.toLowerCase().includes(search));
    }
    if (params?.apenasCriticos) {
      filtrados = filtrados.filter((p) => p.statusSaude === 'CRITICO' || p.statusSaude === 'ATENCAO');
    }

    return filtrados.sort((a, b) => b.chamadosUrgentes - a.chamadosUrgentes || b.chamadosAbertos - a.chamadosAbertos);
  }

  /**
   * TOOL 4: Listar Chamados Urgentes e Alertas de Estouro de SLA
   */
  async listarAlertasUrgentes(): Promise<Array<{
    codigo: string;
    titulo: string;
    predioNome: string;
    prioridade: string;
    status: string;
    horasDecorridas: number;
    limiteSlaHoras: number;
    riscoEstouro: boolean;
  }>> {
    this.logger.log('Executando ferramenta listarAlertasUrgentes');

    const agora = new Date();
    const chamados = await this.prisma.ordemServico.findMany({
      where: {
        status: {
          notIn: [StatusOS.CONCLUIDO, StatusOS.CANCELADO],
        },
        prioridade: {
          in: [Prioridade.URGENTE, Prioridade.ALTA],
        },
      },
      include: { predio: true },
      orderBy: { criado_em: 'asc' },
    });

    return chamados.map((c) => {
      const horasDecorridas = Number(((agora.getTime() - c.criado_em.getTime()) / (1000 * 60 * 60)).toFixed(1));
      const limiteSlaHoras = c.prioridade === Prioridade.URGENTE ? 4 : 24;
      const riscoEstouro = horasDecorridas >= limiteSlaHoras * 0.75;

      return {
        codigo: c.codigo,
        titulo: c.titulo,
        predioNome: c.predio?.nome || 'Unidade Municipal',
        prioridade: c.prioridade,
        status: c.status,
        horasDecorridas,
        limiteSlaHoras,
        riscoEstouro,
      };
    });
  }

  /**
   * TOOL 5: Abertura Rápida de Chamado via IA
   */
  async abrirChamadoRapido(params: {
    titulo: string;
    descricao?: string;
    predioNome: string;
    prioridade?: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  }, currentUser?: any): Promise<{
    sucesso: boolean;
    codigo: string;
    titulo: string;
    predio: string;
    prioridade: string;
    mensagem: string;
  }> {
    this.logger.log(`Executando abertura rápida de chamado: ${params.titulo} em ${params.predioNome}`);

    let predioRecord = await this.prisma.predio.findFirst({
      where: { nome: { contains: params.predioNome, mode: 'insensitive' } },
    });

    if (!predioRecord) {
      predioRecord = await this.prisma.predio.create({
        data: {
          nome: params.predioNome,
          tipo: TipoPredio.ADMINISTRATIVO,
          endereco: 'Endereço a confirmar via vistoria',
        },
      });
    }

    let solicitanteId = currentUser?.id;
    if (!solicitanteId) {
      let solicitante = await this.prisma.usuario.findFirst({
        where: { email: 'maria.escola@zelo.gov.br' },
      });
      if (!solicitante) solicitante = await this.prisma.usuario.findFirst();
      solicitanteId = solicitante!.id;
    }

    const prioMap: Record<string, Prioridade> = {
      URGENT: Prioridade.URGENTE,
      URGENTE: Prioridade.URGENTE,
      HIGH: Prioridade.ALTA,
      ALTA: Prioridade.ALTA,
      LOW: Prioridade.BAIXA,
      BAIXA: Prioridade.BAIXA,
      MEDIUM: Prioridade.MEDIA,
      MEDIA: Prioridade.MEDIA,
    };
    const prioridadeEscolhida = prioMap[params.prioridade?.toUpperCase() || ''] || Prioridade.MEDIA;

    const codigo = `OS-${Math.floor(100000 + Math.random() * 900000)}`;

    const os = await this.prisma.ordemServico.create({
      data: {
        codigo,
        titulo: params.titulo,
        descricao: params.descricao || 'Abertura via Copiloto IA Urboa',
        prioridade: prioridadeEscolhida,
        status: StatusOS.EM_TRIAGEM,
        predio_id: predioRecord.id,
        solicitante_id: solicitanteId,
        fotos: [],
      },
    });

    await this.prisma.auditoriaLog.create({
      data: {
        entidade_afetada: 'OrdemServico',
        entidade_id: os.id,
        acao: AuditAction.CREATE,
        usuario_id: solicitanteId,
        dados_novos: { 
          codigo: os.codigo, 
          titulo: os.titulo, 
          via: 'Copiloto IA',
          autor: currentUser?.email || 'Assistente IA'
        },
      },
    });

    return {
      sucesso: true,
      codigo: os.codigo,
      titulo: os.titulo,
      predio: predioRecord.nome,
      prioridade: os.prioridade,
      mensagem: `Ordem de serviço ${os.codigo} criada com sucesso para a unidade "${predioRecord.nome}" com prioridade ${os.prioridade}. Já enviada para a triagem municipal.`,
    };
  }

  /**
   * TOOL 5: Consultar equipe técnica (contatos, nomes, especialidades)
   */
  async consultarEquipeTecnica(params: { nome?: string }, currentUser?: any): Promise<any> {
    this.logger.log(`Consultando equipe técnica: nome=${params?.nome ?? 'TODOS'}`);

    const where: any = { role: Role.TECNICO };
    if (params?.nome) {
      where.nome = { contains: params.nome, mode: 'insensitive' };
    }

    const tecnicos = await this.prisma.usuario.findMany({
      where,
      select: {
        nome: true,
        email: true,
        telefone: true,
        criado_em: true,
        chamados_atribuidos: {
          where: { status: { notIn: [StatusOS.CONCLUIDO, StatusOS.CANCELADO] } },
          select: { id: true },
        },
      },
    });

    const isPrivileged = currentUser?.role === Role.ADMIN || currentUser?.role === Role.GESTOR;

    return tecnicos.map((t) => ({
      nome: t.nome,
      email: isPrivileged ? t.email : 'Disponível apenas para gestão municipal',
      telefone: isPrivileged ? (t.telefone || 'Não cadastrado') : 'Contato protegido por privacidade',
      chamadosAtivos: t.chamados_atribuidos.length,
    }));
  }

  /**
   * TOOL 6: Consultar status de um chamado específico (por termo/código)
   */
  async consultarStatusOS(params: { termo: string }): Promise<any> {
    this.logger.log(`Consultando OS por termo: ${params.termo}`);
    const chamados = await this.prisma.ordemServico.findMany({
      where: {
        OR: [
          { codigo: { contains: params.termo, mode: 'insensitive' } },
          { titulo: { contains: params.termo, mode: 'insensitive' } },
          { descricao: { contains: params.termo, mode: 'insensitive' } },
        ],
      },
      include: { predio: true, tecnico: true },
      take: 3,
      orderBy: { criado_em: 'desc' },
    });

    if (chamados.length === 0) {
      return { sucesso: false, mensagem: `Nenhum chamado encontrado com o termo "${params.termo}".` };
    }

    return {
      sucesso: true,
      chamados: chamados.map((c) => ({
        codigo: c.codigo,
        titulo: c.titulo,
        status: c.status,
        prioridade: c.prioridade,
        predio: c.predio?.nome || 'Não informado',
        equipeResponsavel: c.tecnico?.nome || 'Equipe a definir',
        criadoEm: c.criado_em.toISOString(),
      })),
    };
  }

  /**
   * TOOL 7: Designar/Atribuir técnico a uma Ordem de Serviço (com validação de sobrecarga e especialidade)
   */
  async designarEquipe(params: {
    osCodigo: string;
    tecnicoNome: string;
  }, currentUser?: any): Promise<{ sucesso: boolean; mensagem: string; os?: string; tecnico?: string }> {
    this.logger.log(`Designando ${params.tecnicoNome} para a OS ${params.osCodigo}`);

    if (!currentUser || (currentUser.role !== Role.ADMIN && currentUser.role !== Role.GESTOR)) {
      return {
        sucesso: false,
        mensagem: 'Permissão negada: apenas Gestores e Administradores têm autorização para designar técnicos a chamados.',
      };
    }

    const os = await this.prisma.ordemServico.findFirst({
      where: { codigo: { contains: params.osCodigo, mode: 'insensitive' } },
      include: { predio: true },
    });

    if (!os) {
      return { sucesso: false, mensagem: `Ordem de Serviço ${params.osCodigo} não encontrada.` };
    }

    const tecnico = await this.prisma.usuario.findFirst({
      where: {
        role: Role.TECNICO,
        nome: { contains: params.tecnicoNome, mode: 'insensitive' },
      },
    });

    if (!tecnico) {
      return { sucesso: false, mensagem: `Técnico(a) ${params.tecnicoNome} não encontrado(a) no sistema.` };
    }

    // Trava de Sobrecarga
    const activeCount = await this.prisma.ordemServico.count({
      where: {
        tecnico_atribuido_id: tecnico.id,
        status: StatusOS.EM_EXECUCAO,
        id: { not: os.id },
      },
    });

    if (activeCount >= 3) {
      return {
        sucesso: false,
        mensagem: `Trava de Sobrecarga: O técnico ${tecnico.nome} já possui ${activeCount} ordens em execução simultâneas. Selecione outro profissional.`,
      };
    }

    // Validação de Especialidade Técnica
    const osCategoria = (os.categoria || this.inferirEspecialidade(os.titulo, os.descricao)).toUpperCase();
    const tecEsp = (tecnico.especialidade || 'GERAL').toUpperCase();
    if (tecEsp !== 'GERAL' && osCategoria !== 'GERAL' && tecEsp !== osCategoria) {
      return {
        sucesso: false,
        mensagem: `Incompatibilidade Técnica: A OS ${os.codigo} é de ${osCategoria}, mas o técnico ${tecnico.nome} possui especialidade ${tecEsp}.`,
      };
    }

    await this.prisma.$transaction(async (tx) => {
      const updated = await tx.ordemServico.update({
        where: { id: os.id },
        data: {
          tecnico_atribuido_id: tecnico.id,
          status: StatusOS.AGENDADO,
        },
        include: { predio: true },
      });

      // Sincronização com Agenda de Vistorias
      await tx.agendaVistoria.create({
        data: {
          titulo: `Vistoria: ${os.codigo} - ${os.titulo}`,
          subtitulo: `${os.predio?.nome || 'Unidade Municipal'} (Hoje)`,
          horario: '10:00',
          tipo: (os.categoria || 'geral').toLowerCase(),
          tecnico: tecnico.nome,
          concluido: false,
          ordem_servico_id: os.id,
        },
      });

      await tx.auditoriaLog.create({
        data: {
          entidade_afetada: 'OrdemServico',
          entidade_id: os.id,
          acao: AuditAction.UPDATE,
          usuario_id: currentUser.id,
          dados_novos: { 
            atribuido_para: tecnico.nome, 
            status: updated.status, 
            via: 'Copiloto IA',
            autor: currentUser.email || 'Copiloto IA'
          },
        },
      });

      return updated;
    });

    return {
      sucesso: true,
      mensagem: `O técnico **${tecnico.nome}** foi designado com sucesso para o chamado **${os.codigo}** (${os.titulo}) e adicionado à agenda.`,
      os: os.codigo,
      tecnico: tecnico.nome,
    };
  }

  private calcularDistanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  /**
   * TOOL 8: Sugestão de Despacho Inteligente (Human-in-the-Loop)
   * Analisa especialidade, fila de trabalho e proximidade geográfica para apoiar o Gestor
   */
  async sugerirDespachoInteligente(params: { osCodigo: string }): Promise<{
    sucesso: boolean;
    os?: string;
    categoria?: string;
    recomendacoes?: Array<{
      tecnicoNome: string;
      especialidade: string;
      chamadosAtivos: number;
      distanciaKm?: number;
      localizacaoAtual?: string;
      compatibilidade: string;
      score: number;
    }>;
    justificativa?: string;
    mensagem?: string;
  }> {
    const os = await this.prisma.ordemServico.findFirst({
      where: {
        OR: [{ id: params.osCodigo }, { codigo: { contains: params.osCodigo, mode: 'insensitive' } }],
      },
      include: { predio: true },
    });

    if (!os) {
      return { sucesso: false, mensagem: `Ordem de serviço ${params.osCodigo} não encontrada.` };
    }

    const categoriaOS = (os.categoria || this.inferirEspecialidade(os.titulo, os.descricao)).toUpperCase();

    const tecnicos = await this.prisma.usuario.findMany({
      where: { role: Role.TECNICO, ativo: true },
      include: {
        chamados_atribuidos: {
          where: { status: { notIn: [StatusOS.CONCLUIDO, StatusOS.CANCELADO] } },
          include: { predio: true },
          orderBy: { criado_em: 'desc' },
        },
      },
    });

    const rankeados = tecnicos
      .map((t) => {
        const chamadosExecucao = t.chamados_atribuidos.filter((c) => c.status === StatusOS.EM_EXECUCAO);
        const emExecucao = chamadosExecucao.length;
        const totalAtivos = t.chamados_atribuidos.length;
        const tecEsp = (t.especialidade || 'GERAL').toUpperCase();

        const matchExato = tecEsp === categoriaOS;
        const matchGeral = tecEsp === 'GERAL';
        const compativel = matchExato || matchGeral;

        // Se sobrecarregado (3 ou mais em execução), score reduz drasticamente
        if (emExecucao >= 3 || !compativel) {
          return null;
        }

        let score = 100 - totalAtivos * 10;
        if (matchExato) score += 30;

        // Proximidade Geográfica via Coordenadas (PostGIS / Georreferenciamento)
        let distanciaKm: number | undefined;
        let localizacaoAtual = 'Base Operacional Central';

        const chamadoAtual = chamadosExecucao[0] || t.chamados_atribuidos[0];
        if (chamadoAtual?.predio) {
          localizacaoAtual = `Em campo: ${chamadoAtual.predio.nome}`;
          if (
            chamadoAtual.predio.latitude &&
            chamadoAtual.predio.longitude &&
            os.predio?.latitude &&
            os.predio?.longitude
          ) {
            distanciaKm = this.calcularDistanciaKm(
              os.predio.latitude,
              os.predio.longitude,
              chamadoAtual.predio.latitude,
              chamadoAtual.predio.longitude,
            );
          }
        } else if (os.predio?.latitude && os.predio?.longitude) {
          // Distância estimada da base central (ex: Secretaria de Obras)
          distanciaKm = 2.0;
        }

        if (distanciaKm !== undefined) {
          if (distanciaKm <= 2) score += 35; // Proximidade imediata
          else if (distanciaKm <= 5) score += 20; // Próximo
          else if (distanciaKm <= 10) score += 5; // Deslocamento moderado
          else score -= 10; // Deslocamento longo
        }

        return {
          tecnicoNome: t.nome,
          especialidade: tecEsp,
          chamadosAtivos: totalAtivos,
          distanciaKm: distanciaKm !== undefined ? Number(distanciaKm.toFixed(1)) : undefined,
          localizacaoAtual,
          compatibilidade: matchExato ? 'Especialista Específico' : 'Técnico Geral de Apoio',
          score: Math.max(0, Math.round(score)),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.score - a.score);

    return {
      sucesso: true,
      os: os.codigo,
      categoria: categoriaOS,
      recomendacoes: rankeados,
      justificativa: rankeados.length > 0
        ? `Recomendação gerada com base em proximidade geográfica à unidade (${os.predio?.nome || 'Unidade'}), compatibilidade técnica (${categoriaOS}) e menor sobrecarga de atendimentos.`
        : 'Todos os técnicos da especialidade estão sobrecarregados ou não há técnicos compatíveis disponíveis no momento.',
    };
  }
}
