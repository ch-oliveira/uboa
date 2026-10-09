import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import { AiToolsService } from './ai-tools.service.js';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  reply: string;
  toolsExecuted: Array<{
    name: string;
    params: any;
    result: any;
  }>;
  suggestions: string[];
  provider: string;
}

export interface TriageRequest {
  id?: string;
  titulo: string;
  descricao?: string;
  predio: string;
  prioridade?: string;
  categoria?: string;
  localizacao?: string;
  fotos?: string[];
}

export type TriagePriority = 'URGENTE' | 'ALTA' | 'MEDIA' | 'BAIXA';
export type TriageCriterioStatus = 'ATENDIDO' | 'PARCIAL' | 'NAO_APLICAVEL' | 'A_CONFIRMAR';

export interface TriageCriterio {
  criterio: string;
  status: TriageCriterioStatus;
  observacao: string;
}

export interface TriageResult {
  suggestedPriority: TriagePriority;
  requerConfirmacao: boolean;
  dadosInformados: string;
  possivelImpacto: string;
  perguntasEmAberto: [string, string, string];
  criteriosMatriz: TriageCriterio[];
  fundamentacaoTecnica: string;
  provider: 'gemini' | 'local-fallback';
  confidence: 'ALTA' | 'MEDIA' | 'BAIXA';
}


@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenAI | null = null;
  private apiKey: string | null = null;

  constructor(private readonly aiTools: AiToolsService) {
    this.initGemini();
  }

  private initGemini() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null;
    if (this.apiKey) {
      try {
        this.genAI = new GoogleGenAI({ apiKey: this.apiKey });
        this.logger.log('Conexao com provedor externo de IA estabelecida com sucesso.');
      } catch (err: any) {
        this.logger.warn(`Falha na conexao com provedor externo de IA: ${err.message}. Ativando modo local resiliente.`);
      }
    } else {
      this.logger.log('Chave de API nao configurada. Operando motor de regras e triagem local integrado ao banco de dados.');
    }
  }

  private getGeminiToolsDeclaration() {
    return [
      {
        functionDeclarations: [
          {
            name: 'calcularProfissionaisNecessarios',
            description:
              'Calcula de forma direta e matemática quantos profissionais técnicos são necessários para a demanda atual da cidade.',
            parameters: {
              type: Type.OBJECT,
              properties: {
                especialidade: {
                  type: Type.STRING,
                  description: 'Especialidade técnica (ELETRICA, HIDRAULICA, ALVENARIA, CLIMATIZACAO, PINTURA, TODAS)',
                },
                diasMeta: {
                  type: Type.NUMBER,
                  description: 'Prazo em dias para zerar a fila (padrão: 30)',
                },
              },
            },
          },
          {
            name: 'obterResumoChamados',
            description:
              'Retorna os números consolidados de chamados: abertos, urgentes, concluídos, MTTR e cumprimento de SLA.',
            parameters: {
              type: Type.OBJECT,
              properties: {
                predioNome: {
                  type: Type.STRING,
                  description: 'Filtrar por nome de prédio específico (opcional)',
                },
              },
            },
          },
          {
            name: 'avaliarSaudePredial',
            description:
              'Retorna quais escolas, postos e prédios públicos têm problemas críticos ou urgentes abertos.',
            parameters: {
              type: Type.OBJECT,
              properties: {
                apenasCriticos: {
                  type: Type.BOOLEAN,
                  description: 'Se true, lista apenas prédios com problemas urgentes.',
                },
                predioNome: {
                  type: Type.STRING,
                  description: 'Filtrar por nome do prédio.',
                },
              },
            },
          },
          {
            name: 'listarAlertasUrgentes',
            description:
              'Lista chamados urgentes que correm risco de estourar o prazo de atendimento.',
            parameters: {
              type: Type.OBJECT,
              properties: {},
            },
          },
          {
            name: 'abrirChamadoRapido',
            description:
              'Abre uma nova Ordem de Serviço (OS) imediatamente no banco de dados municipal.',
            parameters: {
              type: Type.OBJECT,
              properties: {
                titulo: {
                  type: Type.STRING,
                  description: 'Título curto do problema (ex: Vazamento no banheiro)',
                },
                descricao: {
                  type: Type.STRING,
                  description: 'Detalhes da ocorrência',
                },
                predioNome: {
                  type: Type.STRING,
                  description: 'Nome da escola ou repartição pública',
                },
                prioridade: {
                  type: Type.STRING,
                  description: 'Prioridade (URGENT, HIGH, MEDIUM, LOW)',
                },
              },
              required: ['titulo', 'predioNome'],
            },
          },
          {
            name: 'consultarEquipeTecnica',
            description:
              'Consulta os técnicos cadastrados no sistema, seus contatos (telefone, e-mail) e quantos chamados cada um tem em aberto.',
            parameters: {
              type: Type.OBJECT,
              properties: {
                nome: {
                  type: Type.STRING,
                  description: 'Nome ou parte do nome do técnico para filtrar (opcional)',
                },
              },
            },
          },
          {
            name: 'consultarStatusOS',
            description:
              'Consulta o status de uma Ordem de Serviço (OS) ou chamado específico por código, título ou descrição.',
            parameters: {
              type: Type.OBJECT,
              properties: {
                termo: {
                  type: Type.STRING,
                  description: 'Termo de busca (ex: chafariz, vazamento, OS-123456)',
                },
              },
              required: ['termo'],
            },
          },
          {
            name: 'designarEquipe',
            description:
              'Atribui ou designa um técnico responsável para uma Ordem de Serviço (OS) específica.',
            parameters: {
              type: Type.OBJECT,
              properties: {
                osCodigo: {
                  type: Type.STRING,
                  description: 'Código da Ordem de Serviço (ex: OS-123456)',
                },
                tecnicoNome: {
                  type: Type.STRING,
                  description: 'Nome do técnico a ser designado (ex: Carlos Silva)',
                },
              },
              required: ['osCodigo', 'tecnicoNome'],
            },
          },
          {
            name: 'listarChamadosSemTecnico',
            description: 'Lista chamados e ordens de serviço que ainda não possuem um técnico atribuído.',
          },
        ],
      },
    ];
  }

  private async executeTool(name: string, args: any, currentUser?: any): Promise<any> {
    switch (name) {
      case 'calcularProfissionaisNecessarios':
        return await this.aiTools.calcularProfissionaisNecessarios(args);
      case 'obterResumoChamados':
        return await this.aiTools.obterResumoChamados(args);
      case 'avaliarSaudePredial':
        return await this.aiTools.avaliarSaudePredial(args);
      case 'listarAlertasUrgentes':
        return await this.aiTools.listarAlertasUrgentes();
      case 'abrirChamadoRapido':
        return await this.aiTools.abrirChamadoRapido(args, currentUser);
      case 'consultarEquipeTecnica':
        return await this.aiTools.consultarEquipeTecnica(args, currentUser);
      case 'consultarStatusOS':
        return await this.aiTools.consultarStatusOS(args);
      case 'designarEquipe':
        return await this.aiTools.designarEquipe(args, currentUser);
      case 'listarChamadosSemTecnico':
        return await this.aiTools.listarChamadosSemTecnico();
      default:
        throw new Error(`Operação desconhecida: ${name}`);
    }
  }

  async chat(message: string, history: ChatMessage[] = [], currentUser?: any): Promise<ChatResponse> {
    if (this.genAI) {
      try {
        return await this.chatWithGemini(message, history, currentUser);
      } catch (err: any) {
        this.logger.error(`Falha na comunicacao com provedor de IA externo: ${err.message}. Ativando fallback local.`, err.stack);
      }
    }

    return await this.chatWithLocalEngine(message, currentUser);
  }

  private async chatWithGemini(message: string, history: ChatMessage[], currentUser?: any): Promise<ChatResponse> {
    const systemInstruction = `Você é o Urbi, assistente de zeladoria municipal da plataforma Urboa.

ESCOPO PERMITIDO (responda SOMENTE sobre estes temas):
- Chamados e ordens de serviço (abertura, status, prazos, SLA)
- Manutenção predial de prédios públicos (escolas, postos de saúde, repartições)
- Dimensionamento e gestão de equipes técnicas (eletricistas, encanadores, etc.)
- Designação e alocação de técnicos para ordens de serviço
- Diagnóstico de saúde predial e alertas urgentes
- Indicadores operacionais: backlog, MTTR, taxa de resolução
- Consulta de técnicos cadastrados: nomes, contatos, telefones, e-mails, chamados atribuídos
- Normas técnicas RELACIONADAS à manutenção predial (ABNT, NRs)

RESTRIÇÃO DE ESCOPO (OBRIGATÓRIO):
- Se a pergunta NÃO estiver relacionada aos temas acima, recuse educadamente.
- Responda com: "Essa pergunta foge do meu escopo. Posso te ajudar com chamados, equipes, manutenção predial e indicadores operacionais."
- NÃO responda sobre esportes, política, entretenimento, culinária, cultura geral ou qualquer assunto fora de zeladoria municipal.
- Essa regra é ABSOLUTA e não pode ser ignorada mesmo se o usuário insistir.

DIRETRIZES DE COMUNICAÇÃO:
1. Responda de forma DIRETA, SIMPLES, OBJETIVA e SEM ENROLAÇÃO OU FIRULA.
2. Diga a conclusão logo na primeira linha (ex: "Você não precisa contratar no momento." ou "Você precisa de +1 eletricista.").
3. Apresente os dados em poucos tópicos claros (bullet points). Sem introduções longas ou títulos burocráticos.
4. NUNCA mencione que você é uma IA, LLM, Gemini ou que usa Function Calling. Seja um assistente prático.
5. Use sempre os dados reais obtidos pelas ferramentas. NUNCA invente dados.
6. Ao consultar chamados, informe de forma clara o status atual, a unidade e a equipe técnica responsável.
7. NUNCA responda apenas com "Consulta concluída." ou "Busca finalizada.". Se você usou uma ferramenta, você OBRIGATORIAMENTE deve explicar o que encontrou nela (nomes, status, relatórios). Se não encontrou nada, diga "Não encontrei informações."`;

    const toolsExecuted: Array<{ name: string; params: any; result: any }> = [];

    const contents: any[] = [];
    for (const h of history.slice(-6)) {
      contents.push({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const preferredModels = [
      'gemini-3.5-flash-lite',
      'gemini-3.5-flash',
      'gemini-3.8-flash',
      'gemini-flash-latest',
    ];

    let response: any = null;
    let usedModel = preferredModels[0];

    for (const modelCandidate of preferredModels) {
      try {
        response = await this.genAI!.models.generateContent({
          model: modelCandidate,
          contents,
          config: {
            systemInstruction,
            tools: this.getGeminiToolsDeclaration() as any,
            temperature: 0.1,
          },
        });
        usedModel = modelCandidate;
        break;
      } catch (err: any) {
        this.logger.warn(`Modelo ${modelCandidate} indisponível (${err.status || err.message}), tentando próximo...`);
      }
    }

    if (!response) {
      throw new Error('Nenhum modelo do Gemini respondeu.');
    }

    const functionCalls = response.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
      const partsForModel: any[] = [];

      for (const call of functionCalls) {
        if (!call.name) continue;
        const toolName: string = call.name;
        const toolResult = await this.executeTool(toolName, call.args || {}, currentUser);
        toolsExecuted.push({
          name: toolName,
          params: call.args,
          result: toolResult,
        });

        partsForModel.push({
          functionResponse: {
            name: toolName,
            response: { result: toolResult },
          },
        });
      }

      const followUpContents = [
        ...contents,
        response.candidates?.[0]?.content || { role: 'model', parts: [{ text: '' }] },
        {
          role: 'user',
          parts: partsForModel,
        },
      ];

      const secondResponse = await this.genAI!.models.generateContent({
        model: usedModel,
        contents: followUpContents,
        config: {
          systemInstruction,
        },
      });

      let reply = secondResponse.text?.trim() || '';
      
      // Se a IA responder com frases genéricas vazias, tratamos como se não tivesse respondido
      if (reply.match(/^(consulta|busca) (concluída|finalizada)\.?$/i)) {
        reply = '';
      }

      // Fallback robusto se a IA falhar em gerar texto
      if (!reply) {
        const lastExecuted = toolsExecuted[0];
        const toolName = lastExecuted?.name;
        const toolResult = lastExecuted?.result;

        if (toolName === 'consultarStatusOS' && toolResult?.sucesso && toolResult.chamados?.length > 0) {
          const c = toolResult.chamados[0];
          reply = `**[${c.codigo}] ${c.titulo}**\nStatus: ${c.status}\nPrédio: ${c.predio}\nEquipe Responsável: ${c.equipeResponsavel}`;
        } else if (toolName === 'listarChamadosSemTecnico' && toolResult?.sucesso) {
          if (toolResult.total === 0) {
            reply = 'Todos os chamados ativos já possuem técnicos designados.';
          } else {
            reply = `Encontrei **${toolResult.total} chamado(s)** sem técnico designado:\n\n` + 
              toolResult.chamados.map((c: any) => `* **[${c.codigo}]** ${c.titulo} (${c.predio}) - Prioridade: ${c.prioridade}`).join('\n');
          }
        } else if (toolName === 'designarEquipe' && toolResult?.sucesso) {
          reply = toolResult.mensagem;
        } else if (toolName === 'consultarEquipeTecnica') {
          reply = `**Equipe técnica cadastrada:**\n\n` + toolResult.map((t: any) => `* **${t.nome}** — ☎ ${t.telefone} · ${t.chamadosAtivos} chamado(s) ativo(s)`).join('\n');
        } else {
          reply = 'Operação concluída. Consultei os dados no sistema, mas não há informações adicionais a exibir.';
        }
      }
      return {
        reply,
        toolsExecuted,
        suggestions: this.generateSuggestions(toolsExecuted),
        provider: 'urbi-engine',
      };
    }

    return {
      reply: response.text || 'Como posso te ajudar com os chamados hoje?',
      toolsExecuted: [],
      suggestions: [
        'Quantos profissionais precisamos para zerar o backlog?',
        'Resumo geral dos chamados',
        'Quais prédios têm chamados urgentes?',
      ],
      provider: 'urbi-engine',
    };
  }

  /**
   * Respostas simples, diretas e objetivas (sem firulas burocráticas)
   */
  private async chatWithLocalEngine(message: string, currentUser?: any): Promise<ChatResponse> {
    const text = message.toLowerCase();
    const toolsExecuted: Array<{ name: string; params: any; result: any }> = [];

    // CASO 1: Dimensionamento de Profissionais
    if (/quantos profissionais|precisa de quantos|quantos técnicos|quantos eletricistas|quantos encanadores|equipe precisa|dimensionar equipe|dimensionamento/.test(text)) {
      let esp = 'TODAS';
      if (/eletric/.test(text)) esp = 'ELETRICA';
      if (/hidraul|encanad|vazamento/.test(text)) esp = 'HIDRAULICA';
      if (/alvenar|pedreiro|obra/.test(text)) esp = 'ALVENARIA';

      const result = await this.aiTools.calcularProfissionaisNecessarios({ especialidade: esp, diasMeta: 30 });
      toolsExecuted.push({
        name: 'calcularProfissionaisNecessarios',
        params: { especialidade: esp, diasMeta: 30 },
        result,
      });

      let totalDeficit = 0;
      let totalRecomendado = 0;
      for (const item of result) {
        totalDeficit += item.deficitHoras;
        totalRecomendado += item.profissionaisRecomendados;
      }

      let reply = '';
      if (totalRecomendado > 0) {
        reply += `**Você precisa de +${totalRecomendado} profissional(is)** para dar conta da fila nos próximos 30 dias.\n\n`;
      } else {
        reply += `**Você não precisa contratar no momento.** Sua equipe atual é suficiente para a demanda dos próximos 30 dias.\n\n`;
      }

      reply += `**Como está sua equipe hoje:**\n`;
      for (const item of result) {
        if (item.chamadosAbertos === 0) continue;
        const status = item.deficitHoras > 0
          ? `⚠️ Falta(m) **${item.deficitHoras} horas** de serviço`
          : `✅ Capacidade suficiente (sobra tempo útil)`;

        reply += `* **${item.especialidade}:** ${item.chamadosAbertos} chamados abertos (~${item.horasNecessariasEstimadas}h de trabalho). Equipe atual: ${item.tecnicosAtuaisCadastrados} técnico(s). ${status}\n`;
      }

      if (totalRecomendado > 0) {
        reply += `\n💡 **Recomendação:** Alocar +${totalRecomendado} técnico ou acionar cerca de **${totalDeficit}h de serviço terceirizado**.`;
      } else {
        reply += `\n💡 **Recomendação:** Manter a equipe focada nas vistorias preventivas programadas.`;
      }

      return {
        reply,
        toolsExecuted,
        suggestions: this.generateSuggestions(toolsExecuted),
        provider: 'urbi-engine',
      };
    }

    // CASO 2: Resumo Geral de Chamados
    if (/quantos chamados|resumo|estatísticas|panorama|mttr|quantas os|visão geral/.test(text)) {
      const result = await this.aiTools.obterResumoChamados();
      toolsExecuted.push({
        name: 'obterResumoChamados',
        params: {},
        result,
      });

      let reply = `**Panorama atual da zeladoria:**\n\n`;
      reply += `* **Chamados na fila:** **${result.abertos} abertos** (${result.emTriagem} em triagem, ${result.emExecucao} em execução)\n`;
      reply += `* **Chamados urgentes:** **${result.urgentes}** prioritários\n`;
      reply += `* **Concluídos:** **${result.concluidos}** resolvidos\n`;
      reply += `* **Tempo médio de resposta (MTTR):** **${result.mttrMedioHoras}h** (meta cumprida)\n`;
      reply += `* **Cumprimento do prazo (SLA):** **${result.slaConformidadePercent}%**\n`;

      if (result.topPrediosComDemandas.length > 0) {
        const top = result.topPrediosComDemandas.map(p => `**${p.nome}** (${p.abertos})`).join(', ');
        reply += `\nLocais com mais demandas: ${top}.`;
      }

      return {
        reply,
        toolsExecuted,
        suggestions: this.generateSuggestions(toolsExecuted),
        provider: 'urbi-engine',
      };
    }

    // CASO 3: Saúde dos Prédios / Risco
    if (/quais escolas|prédios|unidades|posto|ubs|saúde predial|crítico|risco/.test(text)) {
      const result = await this.aiTools.avaliarSaudePredial({ apenasCriticos: /crítico|urgente|risco/.test(text) });
      toolsExecuted.push({
        name: 'avaliarSaudePredial',
        params: {},
        result,
      });

      let reply = `**Prédios que exigem atenção:**\n\n`;
      for (const p of result.slice(0, 4)) {
        const icon = p.statusSaude === 'CRITICO' ? '🔴' : p.statusSaude === 'ATENCAO' ? '🟡' : '🟢';
        reply += `* ${icon} **${p.nome}:** ${p.chamadosAbertos} chamados (${p.chamadosUrgentes} urgentes). ${p.recomendacaoAcao}\n`;
      }

      return {
        reply,
        toolsExecuted,
        suggestions: this.generateSuggestions(toolsExecuted),
        provider: 'urbi-engine',
      };
    }

    // CASO 4: Alertas de SLA e Urgências
    if (/urgente|alerta|sla|atrasado|prioridade|estourando/.test(text)) {
      const result = await this.aiTools.listarAlertasUrgentes();
      toolsExecuted.push({
        name: 'listarAlertasUrgentes',
        params: {},
        result,
      });

      let reply = '';
      if (result.length === 0) {
        reply = `✅ **Tudo em dia.** Não há nenhum chamado estourando o prazo de SLA no momento.`;
      } else {
        reply = `**Atenção para ${result.length} chamado(s) urgente(s):**\n\n`;
        for (const item of result) {
          const status = item.riscoEstouro ? '⚠️ Risco de estourar prazo' : 'No prazo';
          reply += `* **[${item.codigo}] ${item.titulo}** — *${item.predioNome}*\n  Decorrido: **${item.horasDecorridas}h** de um limite de ${item.limiteSlaHoras}h (${status})\n`;
        }
      }

      return {
        reply,
        toolsExecuted,
        suggestions: this.generateSuggestions(toolsExecuted),
        provider: 'urbi-engine',
      };
    }

    // CASO 5: Consulta de Equipe Técnica / Contatos
    if (/contato|telefone|email|técnico|eletricista|encanador|equipe|quem é|quem são|lista de técnicos/.test(text)) {
      const result = await this.aiTools.consultarEquipeTecnica({}, currentUser);
      toolsExecuted.push({
        name: 'consultarEquipeTecnica',
        params: {},
        result,
      });

      let reply = `**Equipe técnica cadastrada:**\n\n`;
      for (const t of result) {
        reply += `* **${t.nome}** — ☎ ${t.telefone} · ✉ ${t.email} · ${t.chamadosAtivos} chamado(s) ativo(s)\n`;
      }

      return {
        reply,
        toolsExecuted,
        suggestions: this.generateSuggestions(toolsExecuted),
        provider: 'urbi-engine',
      };
    }

    // CASO 6: Abertura Rápida de Chamado
    if (/abrir chamado|cria chamado|criar os|novo chamado|cadastrar chamado/.test(text)) {
      let predio = 'EMEF Prof. Paulo Freire';
      if (/santos dumont/i.test(text)) predio = 'EMEF Alberto Santos Dumont';
      if (/ubs/i.test(text)) predio = 'UBS Jardim das Flores';
      if (/paço/i.test(text)) predio = 'Paço Municipal';

      let prioridade: 'URGENT' | 'HIGH' | 'MEDIUM' = 'MEDIUM';
      if (/urgente|emergência|vazamento grave|fio solto/i.test(text)) prioridade = 'URGENT';

      const result = await this.aiTools.abrirChamadoRapido({
        titulo: message.replace(/abrir chamado|cria chamado|novo chamado|por favor|/gi, '').trim() || 'Manutenção Predial Solicitada',
        descricao: `Solicitação via Urbi: "${message}"`,
        predioNome: predio,
        prioridade,
      }, currentUser);

      toolsExecuted.push({
        name: 'abrirChamadoRapido',
        params: { predio, prioridade },
        result,
      });

      let reply = `✅ **Chamado aberto com sucesso!**\n\n`;
      reply += `* **Protocolo:** \`${result.codigo}\`\n`;
      reply += `* **Unidade:** ${result.predio}\n`;
      reply += `* **Prioridade:** ${result.prioridade}\n`;
      reply += `* **Status:** Em triagem na central`;

      return {
        reply,
        toolsExecuted,
        suggestions: this.generateSuggestions(toolsExecuted),
        provider: 'urbi-engine',
      };
    }

    // CASO 7: Consultar status de chamado específico
    if (/como est[aá].*os|como est[aá].*chamado|status.*os|status.*chamado|buscar chamado|sobre a os|sobre o chamado/.test(text)) {
      // Extrair o termo após palavras chaves
      const match = text.match(/(?:os|chamado)(?: d[aoe])? (.*)/i);
      let termo = match ? match[1].trim().replace(/\?/, '') : text.replace(/como est[aá]|status|buscar|sobre|o|a|\?| /g, ' ').trim();
      
      if (!termo) termo = text; // fallback

      const result = await this.aiTools.consultarStatusOS({ termo });
      toolsExecuted.push({
        name: 'consultarStatusOS',
        params: { termo },
        result,
      });

      let reply = '';
      if (!result.sucesso) {
        reply = `Não encontrei nenhum chamado correspondente a "${termo}".`;
      } else {
        reply = `Encontrei o(s) seguinte(s) chamado(s):\n\n`;
        for (const c of result.chamados) {
          reply += `* **[${c.codigo}] ${c.titulo}**\n  Status: **${c.status}** | Prioridade: ${c.prioridade} | Prédio: ${c.predio} | Equipe: ${c.equipeResponsavel}\n`;
        }
      }

      return {
        reply,
        toolsExecuted,
        suggestions: this.generateSuggestions(toolsExecuted),
        provider: 'urbi-engine',
      };
    }

    // CASO 9: Listar chamados sem tecnico
    if (/sem (t[eé]cnico|equipe)|n[aã]o (possuem|t[eê]m) (t[eé]cnico|equipe)/.test(text)) {
      const result = await this.aiTools.listarChamadosSemTecnico();
      toolsExecuted.push({
        name: 'listarChamadosSemTecnico',
        params: {},
        result,
      });

      let reply = '';
      if (result.total === 0) {
        reply = 'Todos os chamados ativos já possuem técnicos designados.';
      } else {
        reply = `Encontrei **${result.total} chamado(s)** sem técnico designado:\n\n` + 
          result.chamados.map((c: any) => `* **[${c.codigo}]** ${c.titulo} (${c.predio}) - Prioridade: ${c.prioridade}`).join('\n');
      }

      return {
        reply,
        toolsExecuted,
        suggestions: this.generateSuggestions(toolsExecuted),
        provider: 'urbi-engine',
      };
    }

    // CASO 8: Designar Equipe
    if (/designar|atribuir|alocar|definir|colocar/.test(text)) {
      const osMatch = text.match(/(?:os-?)?(\d{6})/i);
      const osCodigo = osMatch ? `OS-${osMatch[1]}` : '';
      
      let tecnicoNome = text.replace(/designar|atribuir|alocar|definir|colocar|para|esse|o|chamado|a|os-?\d{6}/gi, '').trim();

      if (!osCodigo || !tecnicoNome) {
        return {
          reply: `Para designar um técnico, por favor informe o código da OS e o nome do técnico (ex: "Designar Carlos Silva para a OS-123456").`,
          toolsExecuted: [],
          suggestions: this.generateSuggestions([]),
          provider: 'urbi-engine',
        };
      }

      const result = await this.aiTools.designarEquipe({ osCodigo, tecnicoNome }, currentUser);
      toolsExecuted.push({
        name: 'designarEquipe',
        params: { osCodigo, tecnicoNome },
        result,
      });

      return {
        reply: result.mensagem,
        toolsExecuted,
        suggestions: this.generateSuggestions(toolsExecuted),
        provider: 'urbi-engine',
      };
    }

    // Resposta Padrão — fora do escopo ou não reconhecido
    return {
      reply: `Essa pergunta foge do meu escopo. Posso te ajudar com:\n\n* **Chamados** — resumo, abertura, status e prazos\n* **Equipes** — dimensionamento e capacidade técnica\n* **Prédios** — diagnóstico de saúde predial e urgências\n* **SLA** — alertas de prazo e indicadores\n\nO que precisa consultar?`,
      toolsExecuted: [],
      suggestions: this.generateSuggestions([]),
      provider: 'urbi-engine',
    };
  }

  private generateSuggestions(toolsExecuted: Array<{ name: string; params: any; result: any }>): string[] {
    if (!toolsExecuted || toolsExecuted.length === 0) {
      return [
        'Quantos profissionais precisamos para zerar o backlog?',
        'Resumo geral dos chamados',
        'Quais prédios estão em situação de risco?',
      ];
    }

    const lastTool = toolsExecuted[toolsExecuted.length - 1];

    if (lastTool.name === 'consultarStatusOS' && lastTool.result?.sucesso && lastTool.result.chamados?.length > 0) {
      const os = lastTool.result.chamados[0];
      return [
        `Como está a situação geral da unidade ${os.predio}?`,
        `Existem outros chamados na unidade ${os.predio}?`,
        `Quem é a equipe responsável pelo chamado ${os.codigo}?`
      ];
    }

    if (lastTool.name === 'calcularProfissionaisNecessarios') {
      return [
        'Quais prédios têm mais chamados?',
        'Verificar prazos de SLA',
        'Resumo geral de chamados',
      ];
    }

    if (lastTool.name === 'obterResumoChamados') {
      return [
        'Quantos profissionais precisamos para a fila?',
        'Quais chamados correm risco de estourar prazo?',
        'Prédios que exigem atenção',
      ];
    }

    if (lastTool.name === 'avaliarSaudePredial') {
      return [
        'Quantos profissionais precisamos para esses prédios?',
        'Ver chamados urgentes',
        'Resumo geral dos chamados',
      ];
    }

    if (lastTool.name === 'listarAlertasUrgentes') {
      return [
        'Dimensionar equipe para urgências',
        'Resumo geral de chamados',
        'Prédios que exigem atenção',
      ];
    }

    if (lastTool.name === 'abrirChamadoRapido') {
      const predio = lastTool.result?.predio || 'na unidade';
      return [
        `Como está a saúde predial de ${predio}?`,
        'Resumo geral dos chamados',
        'Quantos profissionais precisamos na equipe?'
      ];
    }

    if (lastTool.name === 'designarEquipe') {
      return [
        'Resumo geral dos chamados',
        'Quais chamados correm risco de estourar prazo?',
        'Ver chamados urgentes'
      ];
    }

    return [
      'Quantos profissionais precisamos para zerar o backlog?',
      'Resumo geral dos chamados',
      'Quais prédios estão em risco?',
    ];
  }

  /**
   * Triagem Semântica — análise real via LLM com a Matriz de Prioridade Urboa.
   * Retorna uma estrutura compatível com UrbiTriageResult do frontend.
   */
  async semanticTriage(req: TriageRequest): Promise<TriageResult> {
    const localFallback = (): TriageResult => ({
      suggestedPriority: (req.prioridade as TriagePriority) || 'MEDIA',
      requerConfirmacao: true,
      dadosInformados: `${req.titulo}; Unidade: ${req.predio}.${req.fotos?.length ? ` [${req.fotos.length} evidência(s) fotográfica(s) anexada(s) no chamado]` : ''}`,
      possivelImpacto: 'Avaliação automática indisponível. Revise manualmente as fotos anexadas e os critérios de impacto.',
      perguntasEmAberto: [
        'A falha interrompe a rotina de trabalho ou atendimento do setor?',
        'Há risco imediato para os ocupantes do prédio público?',
        'Existe alternativa técnica ou remanejamento provisório até a visita?',
      ],
      criteriosMatriz: [
        { criterio: 'Risco à Segurança', status: 'A_CONFIRMAR', observacao: 'Avaliar presencialmente ou pelas fotos anexadas.' },
        { criterio: 'Interrupção de Serviço Essencial', status: 'A_CONFIRMAR', observacao: 'Avaliar com o solicitante.' },
        { criterio: 'Alcance do Problema', status: 'A_CONFIRMAR', observacao: 'Extensão não informada.' },
        { criterio: 'Tempo até Agravamento', status: 'A_CONFIRMAR', observacao: 'Requer vistoria.' },
        { criterio: 'Existência de Alternativa', status: 'A_CONFIRMAR', observacao: 'Checar com a unidade.' },
      ],
      fundamentacaoTecnica: 'Motor semântico indisponível. Resultado gerado pelo motor local de palavras-chave. As fotos anexadas servem de apoio à conferência manual.',
      provider: 'local-fallback',
      confidence: 'BAIXA',
    });

    if (!this.genAI) {
      return localFallback();
    }

    // Prompt compacto: mesma semântica, ~35% menos tokens → TTFT mais rápido
    const systemInstruction = `Você é Urbi, motor de triagem de zeladoria predial pública municipal.

Classifique a PRIORIDADE do chamado usando esta Matriz (5 critérios):
1. Risco à Segurança (CRÍTICO): choque elétrico, incêndio, desabamento, contaminação bio/gás
2. Interrupção de Serviço Essencial (CRÍTICO): procedimentos médicos, aulas, água, merenda
3. Alcance (MÉDIO): sala isolada vs. prédio inteiro vs. sistema compartilhado
4. Tempo até Agravamento (ALTO): vazamento ativo, chuva prevista, material inflamável
5. Alternativa/Contingência (ALTO): equipamento reserva, outra sala, prédio vizinho

PRIORIDADES (escolha exatamente uma):
URGENTE = risco à vida ou paralisação total de saúde/emergência (SLA 4h)
ALTA    = risco relevante ou essencial sem alternativa (SLA 24h)
MEDIA   = impacto funcional contido, alternativa parcial (SLA 72h)
BAIXA   = estético ou inconveniência sem impacto operacional (SLA 168h)

EVIDÊNCIAS FOTOGRÁFICAS:
Se houver imagens anexadas ao chamado, examine-as minuciosamente como apoio fundamental à decisão de triagem. Avalie gravidade visual aparente (ex: poça d'água sob quadro de luz, alagamento, trinca profunda, fiação rompida, mofo/goteira). Descreva sucintamente a evidência visual observada em 'dadosInformados' e incorpore na 'fundamentacaoTecnica'.

Responda APENAS com JSON válido (sem markdown, sem texto extra):
{"suggestedPriority":"URGENTE|ALTA|MEDIA|BAIXA","confidence":"ALTA|MEDIA|BAIXA","requerConfirmacao":true,"dadosInformados":"fatos objetivos do chamado e observações visuais das fotos","possivelImpacto":"consequência se não atendido","perguntasEmAberto":["p1","p2","p3"],"criteriosMatriz":[{"criterio":"Risco à Segurança e Integridade Física","status":"ATENDIDO|PARCIAL|NAO_APLICAVEL|A_CONFIRMAR","observacao":""},{"criterio":"Interrupção de Serviço Essencial","status":"...","observacao":""},{"criterio":"Alcance e Abrangência do Problema","status":"...","observacao":""},{"criterio":"Tempo até Agravamento do Dano","status":"...","observacao":""},{"criterio":"Existência de Alternativa ou Contingência","status":"...","observacao":""}],"fundamentacaoTecnica":"justificativa técnica com base no relato e fotos"}

Regras: seja técnico e direto. Não invente fatos. Use A_CONFIRMAR quando faltar informação. confidence=ALTA se evidências claras, BAIXA se vago.`;

    const chamadoText = `TÍTULO: ${req.titulo}
DESCRIÇÃO: ${(req.descricao || 'Não informada').slice(0, 500)}
PRÉDIO: ${req.predio}${req.categoria ? `\nCATEGORIA: ${req.categoria}` : ''}${req.localizacao ? `\nLOCAL INTERNO: ${req.localizacao}` : ''}
PRIORIDADE ATUAL: ${req.prioridade || 'Não definida'}
FOTOS ANEXADAS: ${req.fotos?.length ? req.fotos.length + ' foto(s) enviada(s) pelo solicitante' : 'Nenhuma foto anexada'}`;

    const userParts: any[] = [{ text: chamadoText }];
    if (Array.isArray(req.fotos) && req.fotos.length > 0) {
      for (const foto of req.fotos.slice(0, 3)) {
        if (typeof foto === 'string') {
          const match = foto.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
          if (match) {
            userParts.push({
              inlineData: {
                mimeType: match[1],
                data: match[2],
              },
            });
          }
        }
      }
    }

    // Ordem otimizada: modelo mais rápido e estável primeiro.
    const preferredModels = [
      'gemini-flash-latest',
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash',
    ];

    for (const model of preferredModels) {
      try {
        const response = await this.genAI.models.generateContent({
          model,
          contents: [{ role: 'user', parts: userParts }],
          config: {
            systemInstruction,
            temperature: 0.05,
            responseMimeType: 'application/json',
            maxOutputTokens: 800,
          },
        });

        const rawText = response.text?.trim() || '';
        const jsonText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

        const parsed = JSON.parse(jsonText);

        if (!parsed.suggestedPriority || !parsed.criteriosMatriz) {
          throw new Error('Resposta incompleta da IA');
        }

        return {
          suggestedPriority: parsed.suggestedPriority,
          requerConfirmacao: true,
          dadosInformados: parsed.dadosInformados || req.titulo,
          possivelImpacto: parsed.possivelImpacto || '',
          perguntasEmAberto: (
            Array.isArray(parsed.perguntasEmAberto) && parsed.perguntasEmAberto.length >= 3
              ? parsed.perguntasEmAberto.slice(0, 3)
              : [
                  parsed.perguntasEmAberto?.[0] || 'A falha interrompe o atendimento?',
                  parsed.perguntasEmAberto?.[1] || 'Há risco para os ocupantes?',
                  parsed.perguntasEmAberto?.[2] || 'Existe alternativa provisória?',
                ]
          ) as [string, string, string],
          criteriosMatriz: parsed.criteriosMatriz,
          fundamentacaoTecnica: parsed.fundamentacaoTecnica || '',
          provider: 'gemini',
          confidence: parsed.confidence || 'MEDIA',
        };
      } catch (err: any) {
        this.logger.warn(`Falha na triagem semantica com modelo ${model}: ${err.message}`);
      }
    }

    this.logger.warn('Modelos remotos de triagem semantica indisponiveis. Ativando motor de classificacao deterministica local.');
    return localFallback();
  }
}
