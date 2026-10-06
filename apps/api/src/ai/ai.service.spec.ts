import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AiToolsService } from './ai-tools.service.js';
import { AiService } from './ai.service.js';
import { StatusOS, Prioridade, Role } from '@repo/database';

describe('AiToolsService', () => {
  let aiTools: AiToolsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      ordemServico: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'os-1',
            codigo: 'OS-100001',
            titulo: 'Curto circuito no quadro elétrico',
            descricao: 'Fiação derretida na sala 4',
            prioridade: Prioridade.URGENTE,
            status: StatusOS.EM_TRIAGEM,
            criado_em: new Date(Date.now() - 3600000 * 3),
            atualizado: new Date(),
            predio: { nome: 'EMEF Santos Dumont' },
          },
          {
            id: 'os-2',
            codigo: 'OS-100002',
            titulo: 'Vazamento de água na torneira',
            descricao: 'Torneira quebrada no pátio',
            prioridade: Prioridade.MEDIA,
            status: StatusOS.EM_EXECUCAO,
            criado_em: new Date(Date.now() - 3600000 * 20),
            atualizado: new Date(),
            predio: { nome: 'UBS Jardim das Flores' },
          },
        ]),
        create: vi.fn().mockResolvedValue({
          id: 'os-new',
          codigo: 'OS-999999',
          titulo: 'Vazamento teste',
          prioridade: Prioridade.URGENTE,
          status: StatusOS.EM_TRIAGEM,
        }),
      },
      usuario: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'tech-1', nome: 'Carlos Eletricista', role: Role.TECNICO },
        ]),
        findFirst: vi.fn().mockResolvedValue({ id: 'user-1', nome: 'Solicitante Teste' }),
      },
      predio: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'pred-1',
            nome: 'EMEF Santos Dumont',
            tipo: 'ESCOLA',
            endereco: 'Rua das Flores 123',
            ordens_servico: [
              { status: StatusOS.EM_TRIAGEM, prioridade: Prioridade.URGENTE },
            ],
          },
        ]),
        findFirst: vi.fn().mockResolvedValue({ id: 'pred-1', nome: 'EMEF Santos Dumont' }),
        create: vi.fn().mockResolvedValue({ id: 'pred-new', nome: 'Novo Prédio' }),
      },
      auditoriaLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
      },
    };

    aiTools = new AiToolsService(mockPrisma);
  });

  it('deve calcular corretamente a necessidade de profissionais', async () => {
    const recomendacoes = await aiTools.calcularProfissionaisNecessarios({ especialidade: 'ELETRICA' });
    expect(recomendacoes).toBeDefined();
    expect(recomendacoes.length).toBeGreaterThan(0);
    expect(recomendacoes[0].especialidade).toBe('ELETRICA');
    expect(recomendacoes[0].chamadosAbertos).toBe(1);
  });

  it('deve gerar resumo geral de chamados e MTTR', async () => {
    const resumo = await aiTools.obterResumoChamados();
    expect(resumo.totalGeral).toBe(2);
    expect(resumo.urgentes).toBe(1);
    expect(resumo.distribuicaoEspecialidade.ELETRICA).toBe(1);
    expect(resumo.distribuicaoEspecialidade.HIDRAULICA).toBe(1);
  });

  it('deve avaliar a saúde predial das unidades', async () => {
    const saude = await aiTools.avaliarSaudePredial();
    expect(saude.length).toBe(1);
    expect(saude[0].statusSaude).toBe('CRITICO');
  });

  it('deve sugerir despacho inteligente priorizando proximidade geográfica e especialidade', async () => {
    mockPrisma.ordemServico.findFirst = vi.fn().mockResolvedValue({
      id: 'os-despacho-1',
      codigo: 'OS-123456',
      titulo: 'Vazamento no banheiro infantil',
      categoria: 'HIDRAULICA',
      predio: {
        id: 'pred-1',
        nome: 'EMEF Santos Dumont',
        latitude: -23.5505,
        longitude: -46.6333,
      },
    });

    mockPrisma.usuario.findMany = vi.fn().mockResolvedValue([
      {
        id: 'tec-distante',
        nome: 'Técnico Longe',
        role: Role.TECNICO,
        especialidade: 'HIDRAULICA',
        ativo: true,
        chamados_atribuidos: [
          {
            status: StatusOS.EM_EXECUCAO,
            predio: {
              nome: 'Distrito Industrial',
              latitude: -23.6800,
              longitude: -46.7500, // ~19 km de distância
            },
          },
        ],
      },
      {
        id: 'tec-perto',
        nome: 'Técnico Perto',
        role: Role.TECNICO,
        especialidade: 'HIDRAULICA',
        ativo: true,
        chamados_atribuidos: [
          {
            status: StatusOS.EM_EXECUCAO,
            predio: {
              nome: 'UBS Central',
              latitude: -23.5520,
              longitude: -46.6350, // ~0.2 km de distância
            },
          },
        ],
      },
    ]);

    const res = await aiTools.sugerirDespachoInteligente({ osCodigo: 'OS-123456' });
    expect(res.sucesso).toBe(true);
    expect(res.recomendacoes).toBeDefined();
    expect(res.recomendacoes!.length).toBe(2);
    // Técnico mais próximo deve ser o primeiro recomendado
    expect(res.recomendacoes![0].tecnicoNome).toBe('Técnico Perto');
    expect(res.recomendacoes![0].distanciaKm).toBeLessThan(1.0);
    expect(res.recomendacoes![0].score).toBeGreaterThan(res.recomendacoes![1].score);
  });
});

describe('AiService', () => {
  it('deve responder perguntas de dimensionamento via motor local quando sem API key', async () => {
    const mockAiTools: any = {
      calcularProfissionaisNecessarios: vi.fn().mockResolvedValue([
        {
          especialidade: 'ELETRICA',
          chamadosAbertos: 4,
          horasNecessariasEstimadas: 14,
          tecnicosAtuaisCadastrados: 1,
          capacidadeHorasMensaisAtuais: 112,
          deficitHoras: 0,
          profissionaisRecomendados: 0,
          horasTerceirizadasSugeridas: 0,
          diagnostico: 'Equipe atual suficiente',
          acoesRecomendadas: ['Manter preventivas'],
        },
      ]),
    };

    const aiService = new AiService(mockAiTools);
    const res = await aiService.chat('quantos profissionais de eletrica precisamos?');
    expect(res.reply).toContain('Você não precisa contratar no momento');
    expect(res.toolsExecuted.length).toBe(1);
    expect(res.toolsExecuted[0].name).toBe('calcularProfissionaisNecessarios');
  });
});
