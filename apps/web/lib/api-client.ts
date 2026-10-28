/**
 * Cliente de Integração com o Backend NestJS (apps/api)
 * Base URL: http://localhost:3001/api (ou NEXT_PUBLIC_API_URL)
 * 
 * Padrão Seguro:
 * - Autenticação JWT real com propagação estrita de headers Authorization: Bearer <token>
 * - Mapeamento seguro e normalizado de entidades para os componentes da UI
 */

import type { UserAccount } from '@/types/auth';
import type { OrdemServico, StatusOS, Prioridade, MaterialItem, ItemConsumoOS, ContratoItem } from '@/app/kanban/data';
import type { UnidadeItem, TipoUnidade } from '@/types/units';
import type { AgendaEvent, SystemSettings } from '@/context/orders-context';

export interface AtivoPredialItem {
  id: string;
  codigoPatrimonio: string;
  nome: string;
  categoria: string;
  ambiente: string;
  marcaModelo?: string;
  numeroSerie?: string;
  status: 'OPERACIONAL' | 'EM_MANUTENCAO' | 'CRITICO' | 'INATIVO';
  garantiaAte?: string;
  custoAcumulado: number;
  totalChamados: number;
  chamadosAbertos: number;
  emGarantia: boolean;
  alertaSubstituicao: boolean;
  recomendacaoTce: string;
  qrCodeUrl: string;
  predioId: string;
  predioNome: string;
}

export function getApiBase(): string {
  if (typeof window !== 'undefined') {
    // No navegador, sempre usamos a origem do mesmo domínio + /api (ex: https://uboa.vercel.app/api),
    // 100% compatível com o construtor new URL() e mantendo o transporte seguro de cookies HttpOnly
    return `${window.location.origin}/api`;
  }
  return (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api').trim().replace(/[\r\n]+/g, '').replace(/\/+$/, '');
}

const STORAGE_KEY_TOKEN = 'zelo_auth_token_v1';

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY_TOKEN);
  } catch {
    return null;
  }
}

function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function mapStatusToUi(status?: string): StatusOS {
  if (!status) return 'TRIAGEM';
  const s = status.toUpperCase();
  if (s === 'TRIAGE' || s === 'TRIAGEM' || s === 'RECEBIDO') return 'TRIAGEM';
  if (s === 'SCHEDULED' || s === 'AGENDADO') return 'AGENDADO';
  if (s === 'WAITING' || s === 'AGUARDANDO') return 'AGUARDANDO';
  if (s === 'IN_PROGRESS' || s === 'EM_EXECUCAO') return 'EM_EXECUCAO';
  if (s === 'COMPLETED' || s === 'CONCLUIDO') return 'CONCLUIDO';
  if (s === 'CANCELLED' || s === 'CANCELADO') return 'CANCELADO';
  return 'TRIAGEM';
}

function mapPriorityToUi(priority?: string): Prioridade {
  if (!priority) return 'MEDIA';
  const p = priority.toUpperCase();
  if (p === 'URGENT' || p === 'URGENTE') return 'URGENTE';
  if (p === 'HIGH' || p === 'ALTA') return 'ALTA';
  if (p === 'LOW' || p === 'BAIXA') return 'BAIXA';
  return 'MEDIA';
}

function mapUserFromApi(userObj: any): UserAccount | undefined {
  if (!userObj) return undefined;
  return {
    id: userObj.id,
    nome: userObj.name || userObj.nome,
    email: userObj.email,
    senhaHash: userObj.senhaHash || '***',
    role: userObj.role,
    telefone: userObj.phoneNumber || userObj.telefone,
    predio: userObj.role === 'SOLICITANTE' ? (userObj.facilityName || userObj.predio) : undefined,
    avatar: userObj.avatar,
    prefeituraId: userObj.prefeituraId,
    prefeituraNome: userObj.prefeituraNome,
    prefeituraSlug: userObj.prefeituraSlug,
    modulosAtivos: userObj.modulosAtivos,
  };
}

function formatOrderDate(dateStr?: string): string {
  if (!dateStr) return 'Hoje';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return `Hoje, ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  }
  return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}, ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

function inferCategoryFromText(title?: string, desc?: string, existing?: string): string {
  if (existing && existing !== 'Geral') return existing;
  const text = `${title || ''} ${desc || ''}`.toLowerCase();
  if (text.includes('vazamento') || text.includes('torneira') || text.includes('bomba') || text.includes('cano') || text.includes('hidráulica') || text.includes('sanitário') || text.includes('chafariz') || text.includes('esgoto') || text.includes('refluxo') || text.includes('sifão')) return 'Hidráulica';
  if (text.includes('elétrica') || text.includes('lâmpada') || text.includes('disjuntor') || text.includes('fiação') || text.includes('quadro elétrico') || text.includes('curto') || text.includes('energia') || text.includes('reator') || text.includes('refletor') || text.includes('superaquecimento')) return 'Elétrica';
  if (text.includes('rampa') || text.includes('cadeirante') || text.includes('acessibilidade') || text.includes('corrimão') || text.includes('barra de apoio') || text.includes('portão') || text.includes('fechadura') || text.includes('nbr 9050')) return 'Acessibilidade';
  if (text.includes('calha') || text.includes('telhado') || text.includes('infiltração') || text.includes('goteira') || text.includes('forro') || text.includes('manta') || text.includes('telhas')) return 'Telhado e Calhas';
  if (text.includes('alvenaria') || text.includes('parede') || text.includes('piso') || text.includes('trinca') || text.includes('rachadura') || text.includes('porta') || text.includes('janela') || text.includes('vidro') || text.includes('caixilho')) return 'Alvenaria';
  if (text.includes('pintura') || text.includes('fachada') || text.includes('tinta')) return 'Pintura';
  return 'Geral';
}

function mapWorkOrderFromApi(item: any): OrdemServico {
  return {
    id: item.code || item.id,
    titulo: item.title || item.titulo,
    predio: item.facilityName || item.predio,
    prioridade: mapPriorityToUi(item.priority || item.prioridade),
    status: mapStatusToUi(item.status),
    openedAt: item.openedAt,
    dataAbertura: formatOrderDate(item.openedAt || item.dataAbertura),
    iniciadoEm: item.startedAt || item.iniciadoEm,
    concluidoEm: item.completedAt || item.concluidoEm,
    dataLimiteSla: item.slaDeadline || item.dataLimiteSla,
    solicitante: item.requesterName || item.solicitante || 'Gestão Municipal',
    tecnico: item.technicianName || item.tecnico,
    descricao: item.description || item.descricao,
    prazoEstimado: item.estimatedDeadline || item.prazoEstimado,
    localizacao: item.locationDetail || item.localizacao,
    categoria: inferCategoryFromText(item.title || item.titulo, item.description || item.descricao, item.category || item.categoria),
    fotos: item.photos || item.fotos,
    fotosConclusao: item.photosCompletion || item.fotosConclusao || [],
    motivoPausa: item.pauseReason || item.motivoPausa,
    motivoCancelamento: item.cancellationReason || item.motivoCancelamento,
    ordemVinculadaId: item.linkedOrderId || item.ordemVinculadaId,
    slaViolado: Boolean(item.isSlaBreached ?? item.sla_violado),
    motivoViolacaoSla: item.slaBreachReason || item.motivo_violacao_sla,
    tempoPausaMinutos: item.pauseDurationMinutes ?? item.tempo_pausa_minutos ?? 0,
    pausadoEm: item.pausedAt || item.pausado_em,
    historicoPausas: item.pauseHistory || item.historico_pausas || [],
    liquidRepairTimeMinutes: item.liquidRepairTimeMinutes,
    impedimento: item.impediment || item.impedimento,
    historico: item.history || item.historico,
    custoMateriais: item.custoMateriais !== undefined ? Number(item.custoMateriais) : Number(item.custo_materiais ?? 0),
    custoMaoDeObra: item.custoMaoDeObra !== undefined ? Number(item.custoMaoDeObra) : Number(item.custo_mao_de_obra ?? 0),
    custoTotal: item.custoTotal !== undefined ? Number(item.custoTotal) : Number(item.custo_total ?? 0),
    contratoId: item.contratoId || item.contrato_id || undefined,
    empresaTerceirizada: item.empresaTerceirizada || item.empresa_terceirizada || undefined,
    numeroEmpenho: item.numeroEmpenho || item.numero_empenho || undefined,
    statusAtesto: item.statusAtesto || item.status_atesto || 'NAO_APLICAVEL',
    atestadoEm: item.atestadoEm || item.atestado_em,
    atestadoPorId: item.atestadoPorId || item.atestado_por_id,
    atestadoPorNome: item.atestadoPorNome || item.atestado_por?.nome,
    parecerAtesto: item.parecerAtesto || item.parecer_atesto,
    assinaturaDigitalHash: item.assinaturaDigitalHash || item.assinatura_digital_hash,
    avaliacaoAtesto: item.avaliacaoAtesto ?? item.avaliacao_atesto,
    boletimMedicaoId: item.boletimMedicaoId || item.boletim_medicao_id,
    materiaisConsumidos: (item.materiaisConsumidos || item.materiais_consumidos || []).map((m: any) => ({
      id: m.id,
      materialId: m.materialId || m.material_id,
      descricao: m.descricao,
      quantidade: Number(m.quantidade || 0),
      unidadeMedida: m.unidadeMedida || m.unidade_medida || 'UN',
      precoUnitario: Number(m.precoUnitario ?? m.preco_unitario ?? 0),
      precoTotal: Number(m.precoTotal ?? m.preco_total ?? 0),
      criadoEm: m.criadoEm || m.criado_em,
    })),
  };
}

function inferUnitType(name: string, currentType: string): TipoUnidade {
  const n = (name || '').toLowerCase();
  if (n.startsWith('emef') || n.startsWith('emei') || n.includes('escola') || n.includes('creche') || n.includes('colegio') || n.includes('educa')) {
    return 'ESCOLA';
  }
  if (n.startsWith('ubs') || n.startsWith('upa') || n.includes('saude') || n.includes('posto') || n.includes('hospital') || n.includes('clinica')) {
    return 'UBS';
  }
  if (n.includes('praca') || n.includes('praça') || n.includes('parque') || n.includes('bosque') || n.includes('jardim')) {
    return 'PRACA';
  }
  return 'ADMINISTRATIVO';
}

function mapFacilityFromApi(item: any): UnidadeItem {
  return {
    id: item.id,
    nome: item.name || item.nome,
    tipo: inferUnitType(item.name || item.nome, item.type || item.tipo),
    setor: item.setor,
    porte: item.porte || 'MEDIO',
    capacidade: item.capacidade ? Number(item.capacidade) : undefined,
    endereco: item.address || item.endereco,
    latitude: item.latitude !== undefined && item.latitude !== null ? Number(item.latitude) : undefined,
    longitude: item.longitude !== undefined && item.longitude !== null ? Number(item.longitude) : undefined,
    ativo: item.ativo !== false,
    motivoDesativacao: item.motivoDesativacao || item.motivo_desativacao,
    gestor: item.managerName || item.gestor || 'Gestor da Unidade',
    telefone: item.phoneNumber || item.telefone || '(11) 3241-8900',
    email: item.email || undefined,
    openTicketsCount: item.openTicketsCount,
    urgentTicketsCount: item.urgentTicketsCount,
    completedTicketsCount: item.completedTicketsCount,
    totalTicketsCount: item.totalTicketsCount,
    healthStatus: item.healthStatus,
  };
}

function mapInspectionFromApi(item: any): AgendaEvent {
  return {
    id: item.id,
    title: item.title || item.titulo,
    subtitle: item.location || item.subtitulo || item.subtitle || 'Unidade Municipal',
    time: item.scheduledTime || item.horario || item.time || '14:00',
    dataAgendada: item.scheduledDate || item.data_agendada || undefined,
    completed: Boolean(item.completed ?? item.concluido),
    type: (item.type || item.tipo || 'geral') as any,
    recorrencia: item.recorrencia || 'UNICA',
    tecnico: item.technicianName || item.tecnico,
    orderId: item.workOrderId || item.orderId,
    laudoTecnico: item.laudoTecnico || item.laudo_tecnico,
    proximaEtapaSugerida: item.proximaEtapaSugerida,
  };
}

function mapSettingsFromApi(item: any): SystemSettings {
  return {
    prefeituraNome: item.municipalityName || item.prefeituraNome || 'Prefeitura Municipal',
    secretariaNome: item.departmentName || item.secretariaNome || 'Secretaria de Obras',
    gestorNome: item.managerName || item.gestorNome || 'Mariana Alves',
    gestorCargo: item.managerRole || item.gestorCargo || 'Gestora Municipal',
    gestorEmail: item.managerEmail || item.gestorEmail || 'mariana.alves@gestaourbana.gov.br',
    gestorTelefone: item.managerPhone || item.gestorTelefone || '(11) 3241-8900',
    slaUrgenteHours: item.slaUrgentHours ?? item.slaUrgenteHours ?? 4,
    slaAltaHours: item.slaHighHours ?? item.slaAltaHours ?? 24,
    slaMediaHours: item.slaMediumHours ?? item.slaMediaHours ?? 72,
    slaBaixaHours: item.slaLowHours ?? item.slaBaixaHours ?? 168,
    mttrAlertHours: item.mttrAlertHours ?? 8,
    preventivaGoal: item.preventiveGoal ?? item.preventivaGoal ?? 90,
    soundAlerts: item.soundAlertsEnabled ?? item.soundAlerts ?? true,
    pushNotifications: item.pushNotificationsEnabled ?? item.pushNotifications ?? true,
    whatsappAlerts: item.whatsappAlertsEnabled ?? item.whatsappAlerts ?? false,
    autoDispatch: item.autoDispatchEnabled ?? item.autoDispatch ?? false,
    tecnicosList: item.tecnicosList || [],
    themeMode: item.themeMode || 'system',
    apiEndpoint: getApiBase(),
    useMockData: false,
  };
}

export const apiClient = {
  get baseUrl() {
    return getApiBase();
  },

  // -------------------------------------------------------------
  // AUTENTICAÇÃO
  // -------------------------------------------------------------
  async login(email: string, password?: string): Promise<{ success: boolean; user?: UserAccount; token?: string; message?: string }> {
    const res = await fetch(`${getApiBase()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const resData = await res.json();
    const user = mapUserFromApi(resData.data?.user || resData.user);
    const token = resData.data?.token || resData.token;

    if (typeof window !== 'undefined' && token) {
      try {
        localStorage.setItem(STORAGE_KEY_TOKEN, token);
      } catch {
        // Ignora erro de storage
      }
    }

    return {
      success: Boolean(resData.success),
      user,
      token,
      message: resData.message,
    };
  },

  async loginQuick(
    role: 'GESTOR' | 'TECNICO' | 'SOLICITANTE_ESCOLA' | 'SOLICITANTE_UBS' | 'ADMIN',
    passwordOverride?: string,
  ): Promise<{ success: boolean; user?: UserAccount; token?: string; message?: string }> {
    if (process.env.NODE_ENV === 'production') {
      return { success: false, message: 'Acesso rápido desabilitado em ambiente de produção por segurança.' };
    }

    let email = 'gestor@urboa.gov.br';
    if (role === 'ADMIN') email = 'admin@urboa.gov.br';
    else if (role === 'TECNICO') email = 'carlos.tecnico@urboa.gov.br';
    else if (role === 'SOLICITANTE_ESCOLA') email = 'maria.escola@urboa.gov.br';
    else if (role === 'SOLICITANTE_UBS') email = 'marcelo.ubs@urboa.gov.br';

    const devPassword = passwordOverride || process.env.NEXT_PUBLIC_DEV_PASSWORD || 'Urboa@2026!';
    if (!devPassword) {
      return { success: false, message: 'Senha de desenvolvimento não configurada.' };
    }
    return this.login(email, devPassword);
  },

  async getMe(tokenOverride?: string): Promise<{ success: boolean; user?: UserAccount }> {
    try {
      const headers = getAuthHeaders(tokenOverride ? { Authorization: `Bearer ${tokenOverride}` } : {});
      const res = await fetch(`${getApiBase()}/auth/me`, {
        cache: 'no-store',
        headers,
      });
      if (!res.ok) return { success: false };
      const resData = await res.json();
      const user = mapUserFromApi(resData.data?.user || resData.data || resData.user);
      return {
        success: Boolean(resData.success && user),
        user,
      };
    } catch {
      return { success: false };
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${getApiBase()}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch {
      // Ignorar falha no logout
    } finally {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(STORAGE_KEY_TOKEN);
        } catch {
          // Ignora
        }
      }
    }
  },

  // -------------------------------------------------------------
  // ORDENS DE SERVIÇO (WORK ORDERS)
  // -------------------------------------------------------------
  async getWorkOrders(params?: {
    role?: string;
    predio?: string;
    tecnico?: string;
    status?: string;
    prioridade?: string;
  }): Promise<{ success: boolean; orders: OrdemServico[]; stats?: any }> {
    const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3003';
    const apiBase = getApiBase();
    const url = new URL(apiBase.startsWith('http') ? `${apiBase}/work-orders` : `${base}${apiBase}/work-orders`);
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val) url.searchParams.set(key, val);
      });
    }

    const res = await fetch(url.toString(), {
      cache: 'no-store',
      headers: getAuthHeaders(),
    });
    const resData = await res.json();
    const rawList = Array.isArray(resData.data) ? resData.data : (resData.orders || []);
    const orders: OrdemServico[] = rawList.map(mapWorkOrderFromApi);

    return {
      success: Boolean(resData.success),
      orders,
      stats: resData.meta || resData.stats,
    };
  },

  async getWorkOrder(idOrCode: string): Promise<{ success: boolean; order?: OrdemServico }> {
    const res = await fetch(`${getApiBase()}/work-orders/${encodeURIComponent(idOrCode)}`, {
      cache: 'no-store',
      headers: getAuthHeaders(),
    });
    const resData = await res.json();
    const rawOrder = resData.data || resData.order;
    return {
      success: Boolean(resData.success),
      order: rawOrder ? mapWorkOrderFromApi(rawOrder) : undefined,
    };
  },

  async getPublicTrack(codigo: string): Promise<{ success: boolean; data?: any; message?: string }> {
    const res = await fetch(`${getApiBase()}/work-orders/public/track/${encodeURIComponent(codigo)}`, {
      cache: 'no-store',
    });
    const resData = await res.json();
    return resData;
  },

  async createWorkOrder(order: Partial<OrdemServico>): Promise<{ success: boolean; order: OrdemServico; message?: string }> {
    const payload = {
      title: order.titulo,
      facilityName: order.predio,
      priority: order.prioridade,
      description: order.descricao,
      technicianName: order.tecnico,
      code: order.id,
      titulo: order.titulo,
      predio: order.predio,
      prioridade: order.prioridade,
      descricao: order.descricao,
      tecnico: order.tecnico,
      categoria: order.categoria,
      fotos: order.fotos || (order as any).photos || [],
      photos: order.fotos || (order as any).photos || [],
      fotosConclusao: order.fotosConclusao || [],
      ativoId: (order as any).ativoId,
      codigoPatrimonio: (order as any).codigoPatrimonio,
    };

    const res = await fetch(`${getApiBase()}/work-orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const resData = await res.json();
    const rawOrder = resData.data || resData.order;
    const mapped = rawOrder ? mapWorkOrderFromApi(rawOrder) : (order as OrdemServico);

    return {
      success: Boolean(resData.success),
      order: mapped,
      message: resData.message,
    };
  },

  async updateWorkOrder(idOrCode: string, updates: Partial<OrdemServico>): Promise<{ success: boolean; order: OrdemServico; message?: string }> {
    const payload: any = { ...updates };
    if (updates.titulo) payload.title = updates.titulo;
    if (updates.predio) payload.facilityName = updates.predio;
    if (updates.prioridade) payload.priority = updates.prioridade;
    if (updates.status) payload.status = updates.status;
    if (updates.descricao) payload.description = updates.descricao;
    if (updates.tecnico) payload.technicianName = updates.tecnico;
    if (updates.categoria) payload.categoria = updates.categoria;
    if (updates.fotos || (updates as any).photos) {
      payload.fotos = updates.fotos || (updates as any).photos;
      payload.photos = updates.fotos || (updates as any).photos;
    }
    if (updates.fotosConclusao) {
      payload.fotosConclusao = updates.fotosConclusao;
      payload.fotos_conclusao = updates.fotosConclusao;
    }

    const res = await fetch(`${getApiBase()}/work-orders/${encodeURIComponent(idOrCode)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const resData = await res.json();
    const rawOrder = resData.data || resData.order;
    const mapped = rawOrder ? mapWorkOrderFromApi(rawOrder) : (updates as OrdemServico);

    return {
      success: Boolean(resData.success),
      order: mapped,
      message: resData.message,
    };
  },

  async deleteWorkOrder(idOrCode: string, motivoCancelamento?: string): Promise<{ success: boolean; message?: string }> {
    const res = await fetch(`${getApiBase()}/work-orders/${encodeURIComponent(idOrCode)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ motivoCancelamento: motivoCancelamento || 'Cancelamento solicitado via painel web' }),
    });
    return await res.json();
  },

  async atestarWorkOrder(
    idOrCode: string,
    dto: { aprovado: boolean; parecer?: string; avaliacao?: number },
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    const res = await fetch(`${getApiBase()}/work-orders/${encodeURIComponent(idOrCode)}/atesto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(dto),
    });
    return await res.json();
  },

  // -------------------------------------------------------------
  // MATERIAIS & MEDIÇÃO FINANCEIRA DE ORDENS DE SERVIÇO
  // -------------------------------------------------------------
  async getMaterials(): Promise<{ success: boolean; materials: MaterialItem[]; message?: string }> {
    const res = await fetch(`${getApiBase()}/materials`, {
      cache: 'no-store',
      headers: getAuthHeaders(),
    });
    const resData = await res.json();
    const rawList = Array.isArray(resData.data) ? resData.data : (resData.materials || []);
    const materials: MaterialItem[] = rawList.map((m: any) => ({
      id: m.id,
      codigo: m.codigo,
      nome: m.nome,
      categoria: m.categoria,
      unidadeMedida: m.unidade_medida || m.unidadeMedida || 'UN',
      precoUnitario: Number(m.preco_unitario ?? m.precoUnitario ?? 0),
      estoqueAtual: Number(m.estoque_atual ?? m.estoqueAtual ?? 0),
      estoqueMinimo: Number(m.estoque_minimo ?? m.estoqueMinimo ?? 0),
    }));
    return {
      success: Boolean(resData.success ?? true),
      materials,
      message: resData.message,
    };
  },

  async createMaterial(data: Partial<MaterialItem>): Promise<{ success: boolean; material?: MaterialItem; message?: string }> {
    const res = await fetch(`${getApiBase()}/materials`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        codigo: data.codigo,
        nome: data.nome,
        categoria: data.categoria,
        unidadeMedida: data.unidadeMedida || 'UN',
        precoUnitario: data.precoUnitario || 0,
        estoqueAtual: data.estoqueAtual || 0,
        estoqueMinimo: data.estoqueMinimo || 0,
      }),
    });
    const resData = await res.json();
    return resData;
  },

  async addWorkOrderMaterial(orderId: string, item: {
    materialId?: string;
    descricao: string;
    quantidade: number;
    unidadeMedida?: string;
    precoUnitario: number;
  }): Promise<{ success: boolean; data?: any; message?: string }> {
    const res = await fetch(`${getApiBase()}/work-orders/${encodeURIComponent(orderId)}/materials`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });
    const resData = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        message: Array.isArray(resData.message) ? resData.message.join(', ') : (resData.message || 'Erro ao registrar peça.'),
      };
    }
    return resData;
  },

  async removeWorkOrderMaterial(orderId: string, itemId: string): Promise<{ success: boolean; data?: any; message?: string }> {
    const res = await fetch(`${getApiBase()}/work-orders/${encodeURIComponent(orderId)}/materials/${encodeURIComponent(itemId)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const resData = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        message: Array.isArray(resData.message) ? resData.message.join(', ') : (resData.message || 'Erro ao remover peça.'),
      };
    }
    return resData;
  },

  async updateWorkOrderFinancials(orderId: string, data: {
    contratoId?: string;
    custoMaoDeObra?: number;
    empresaTerceirizada?: string;
    numeroEmpenho?: string;
  }): Promise<{ success: boolean; data?: any; message?: string }> {
    const res = await fetch(`${getApiBase()}/work-orders/${encodeURIComponent(orderId)}/financials`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const resData = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        message: Array.isArray(resData.message) ? resData.message.join(', ') : (resData.message || 'Erro ao processar medição financeira.'),
      };
    }
    return resData;
  },

  // -------------------------------------------------------------
  // CONTRATOS & EMPENHOS PÚBLICOS
  // -------------------------------------------------------------
  async getContracts(): Promise<{ success: boolean; contracts: ContratoItem[]; message?: string }> {
    const res = await fetch(`${getApiBase()}/contracts`, {
      cache: 'no-store',
      headers: getAuthHeaders(),
    });
    const resData = await res.json();
    const rawList = Array.isArray(resData.data) ? resData.data : (resData.contracts || []);
    const contracts: ContratoItem[] = rawList.map((c: any) => ({
      id: c.id,
      numeroContrato: c.numeroContrato || c.numero_contrato,
      numeroEmpenho: c.numeroEmpenho || c.numero_empenho,
      empresaContratada: c.empresaContratada || c.empresa_contratada,
      cnpjContratada: c.cnpjContratada || c.cnpj_contratada,
      objeto: c.objeto,
      categoriaPadrao: c.categoriaPadrao || c.categoria_padrao || 'GERAL',
      valorTotalEmpenhado: Number(c.valorTotalEmpenhado ?? c.valor_total_empenhado ?? 0),
      valorTotalMedido: Number(c.valorTotalMedido ?? c.valor_total_medido ?? 0),
      saldoRestante: Number(c.saldoRestante ?? c.saldo_restante ?? 0),
      percentualExecutado: Number(c.percentualExecutado ?? c.percentual_executado ?? 0),
      vigenciaInicio: c.vigenciaInicio || c.vigencia_inicio,
      vigenciaFim: c.vigenciaFim || c.vigencia_fim,
      ativo: c.ativo !== false,
      ordensCount: c.ordensCount ?? 0,
      prefeituraId: c.prefeituraId || c.prefeitura_id,
    }));
    return {
      success: Boolean(resData.success ?? true),
      contracts,
      message: resData.message,
    };
  },

  async createContract(data: Partial<ContratoItem>): Promise<{ success: boolean; contract?: ContratoItem; message?: string }> {
    const res = await fetch(`${getApiBase()}/contracts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        numeroContrato: data.numeroContrato,
        numeroEmpenho: data.numeroEmpenho,
        empresaContratada: data.empresaContratada,
        cnpjContratada: data.cnpjContratada,
        objeto: data.objeto,
        categoriaPadrao: data.categoriaPadrao || 'GERAL',
        valorTotalEmpenhado: data.valorTotalEmpenhado || 0,
        vigenciaInicio: data.vigenciaInicio,
        vigenciaFim: data.vigenciaFim,
      }),
    });
    const resData = await res.json();
    return resData;
  },

  async getBoletimPreview(
    contratoId: string,
    params?: { mes?: number; ano?: number; bdiPercentual?: number },
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    const base = getApiBase();
    const url = new URL(`${base}/contracts/${encodeURIComponent(contratoId)}/boletim-preview`);
    if (params) {
      if (params.mes) url.searchParams.set('mes', String(params.mes));
      if (params.ano) url.searchParams.set('ano', String(params.ano));
      if (params.bdiPercentual) url.searchParams.set('bdiPercentual', String(params.bdiPercentual));
    }
    const res = await fetch(url.toString(), {
      cache: 'no-store',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async createBoletim(
    contratoId: string,
    payload: { mesCompetencia: number; anoCompetencia: number; bdiPercentual?: number; observacoes?: string },
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    const res = await fetch(`${getApiBase()}/contracts/${encodeURIComponent(contratoId)}/boletins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getAllBoletins(contratoId?: string): Promise<{ success: boolean; data?: any[] }> {
    const base = getApiBase();
    const url = new URL(`${base}/contracts/boletins/all`);
    if (contratoId) url.searchParams.set('contratoId', contratoId);
    const res = await fetch(url.toString(), {
      cache: 'no-store',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getBoletimById(id: string): Promise<{ success: boolean; data?: any }> {
    const res = await fetch(`${getApiBase()}/contracts/boletins/${encodeURIComponent(id)}`, {
      cache: 'no-store',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // -------------------------------------------------------------
  // UNIDADES MUNICIPAIS (FACILITIES)
  // -------------------------------------------------------------
  async getFacilities(): Promise<{ success: boolean; units: UnidadeItem[] }> {
    const res = await fetch(`${getApiBase()}/facilities`, {
      cache: 'no-store',
      headers: getAuthHeaders(),
    });
    const resData = await res.json();
    const rawList = Array.isArray(resData.data) ? resData.data : (resData.units || []);
    const units: UnidadeItem[] = rawList.map(mapFacilityFromApi);

    return {
      success: Boolean(resData.success),
      units,
    };
  },

  async createFacility(facility: Partial<UnidadeItem>): Promise<{ success: boolean; unit: UnidadeItem; message?: string }> {
    const payload = {
      name: facility.nome,
      type: facility.tipo,
      setor: facility.setor,
      porte: facility.porte,
      capacidade: facility.capacidade,
      address: facility.endereco,
      latitude: facility.latitude,
      longitude: facility.longitude,
      managerName: facility.gestor,
      phoneNumber: facility.telefone,
      nome: facility.nome,
      tipo: facility.tipo,
      endereco: facility.endereco,
      gestor: facility.gestor,
      telefone: facility.telefone,
    };

    const res = await fetch(`${getApiBase()}/facilities`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const resData = await res.json();
    const rawUnit = resData.data || resData.unit;
    return {
      success: Boolean(resData.success),
      unit: rawUnit ? mapFacilityFromApi(rawUnit) : (facility as UnidadeItem),
      message: resData.message,
    };
  },

  async updateFacility(id: string, facility: Partial<UnidadeItem>): Promise<{ success: boolean; unit?: UnidadeItem; message?: string }> {
    const payload = {
      name: facility.nome,
      type: facility.tipo,
      setor: facility.setor,
      porte: facility.porte,
      capacidade: facility.capacidade,
      address: facility.endereco,
      latitude: facility.latitude,
      longitude: facility.longitude,
      managerName: facility.gestor,
      phoneNumber: facility.telefone,
      ativo: facility.ativo,
      motivoDesativacao: facility.motivoDesativacao,
      nome: facility.nome,
      tipo: facility.tipo,
      endereco: facility.endereco,
      gestor: facility.gestor,
      telefone: facility.telefone,
    };

    const res = await fetch(`${getApiBase()}/facilities/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const resData = await res.json();
    const rawUnit = resData.data || resData.unit;
    return {
      success: Boolean(resData.success),
      unit: rawUnit ? mapFacilityFromApi(rawUnit) : undefined,
      message: resData.message,
    };
  },

  async deleteFacility(id: string): Promise<{ success: boolean; message?: string }> {
    const res = await fetch(`${getApiBase()}/facilities/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const resData = await res.json();
    return {
      success: Boolean(resData.success),
      message: resData.message,
    };
  },

  // -------------------------------------------------------------
  // USUÁRIOS
  // -------------------------------------------------------------
  async getUsers(): Promise<{ success: boolean; users: any[] }> {
    const res = await fetch(`${getApiBase()}/users`, {
      cache: 'no-store',
      headers: getAuthHeaders(),
    });
    const resData = await res.json();
    const rawList = Array.isArray(resData.data) ? resData.data : (resData.users || []);
    return {
      success: Boolean(resData.success),
      users: rawList,
    };
  },

  // -------------------------------------------------------------
  // AGENDA / VISTORIAS (POSTGRESQL)
  // -------------------------------------------------------------
  async getAgenda(): Promise<{ success: boolean; agenda: AgendaEvent[] }> {
    const res = await fetch(`${getApiBase()}/agenda`, {
      cache: 'no-store',
      headers: getAuthHeaders(),
    });
    const resData = await res.json();
    const rawList = Array.isArray(resData.data) ? resData.data : (resData.agenda || []);
    const agenda: AgendaEvent[] = rawList.map(mapInspectionFromApi);

    return {
      success: Boolean(resData.success),
      agenda,
    };
  },

  async createAgendaEvent(event: any): Promise<{ success: boolean; agendaItem: AgendaEvent }> {
    const payload = {
      title: event.title || event.titulo,
      location: event.subtitle || event.subtitulo || event.location,
      scheduledTime: event.time || event.horario || event.scheduledTime,
      type: event.type || event.tipo,
      technicianName: event.tecnico || event.technicianName,
    };

    const res = await fetch(`${getApiBase()}/agenda`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const resData = await res.json();
    const rawItem = resData.data || resData.agendaItem;
    return {
      success: Boolean(resData.success),
      agendaItem: rawItem ? mapInspectionFromApi(rawItem) : event,
    };
  },

  async toggleAgendaItem(id: string): Promise<{ success: boolean; agendaItem: any }> {
    const res = await fetch(`${getApiBase()}/agenda/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    const resData = await res.json();
    const rawItem = resData.data || resData.agendaItem;
    return {
      success: Boolean(resData.success),
      agendaItem: rawItem ? mapInspectionFromApi(rawItem) : undefined,
    };
  },

  async completeAgendaItem(id: string, payload: { laudoTecnico: string; fotosVistoria?: string[] }): Promise<{ success: boolean; agendaItem?: AgendaEvent; message?: string }> {
    const res = await fetch(`${getApiBase()}/agenda/${encodeURIComponent(id)}/concluir`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const resData = await res.json();
    const rawItem = resData.data || resData.agendaItem;
    return {
      success: Boolean(resData.success),
      agendaItem: rawItem ? mapInspectionFromApi(rawItem) : undefined,
      message: resData.message,
    };
  },

  // -------------------------------------------------------------
  // CONFIGURAÇÕES DO SISTEMA (POSTGRESQL)
  // -------------------------------------------------------------
  async getSettings(): Promise<{ success: boolean; settings: SystemSettings }> {
    const res = await fetch(`${getApiBase()}/settings`, {
      cache: 'no-store',
      headers: getAuthHeaders(),
    });
    const resData = await res.json();
    const rawSettings = resData.data || resData.settings;
    return {
      success: Boolean(resData.success),
      settings: rawSettings ? mapSettingsFromApi(rawSettings) : rawSettings,
    };
  },

  async updateSettings(updates: any): Promise<{ success: boolean; settings: SystemSettings; message?: string }> {
    const res = await fetch(`${getApiBase()}/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const resData = await res.json();
    const rawSettings = resData.data || resData.settings;
    return {
      success: Boolean(resData.success),
      settings: rawSettings ? mapSettingsFromApi(rawSettings) : updates,
      message: resData.message,
    };
  },

  // -------------------------------------------------------------
  // COPILOTO IA / ASSISTENTE GOVTECH (GOOGLE GEMINI + FUNCTION CALLING)
  // -------------------------------------------------------------

  async sendAiTriage(order: {
    titulo: string;
    descricao?: string;
    predio: string;
    prioridade?: string;
    categoria?: string;
    localizacao?: string;
    fotos?: string[];
  }): Promise<{
    success: boolean;
    suggestedPriority: 'URGENTE' | 'ALTA' | 'MEDIA' | 'BAIXA';
    requerConfirmacao: boolean;
    dadosInformados: string;
    possivelImpacto: string;
    perguntasEmAberto: [string, string, string];
    criteriosMatriz: Array<{ criterio: string; status: string; observacao: string }>;
    fundamentacaoTecnica: string;
    provider: 'gemini' | 'local-fallback';
    confidence: 'ALTA' | 'MEDIA' | 'BAIXA';
    error?: string;
  }> {
    try {
      const res = await fetch(`${getApiBase()}/ai/triage`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(order),
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        return {
          success: false,
          suggestedPriority: (order.prioridade as any) || 'MEDIA',
          requerConfirmacao: true,
          dadosInformados: order.titulo,
          possivelImpacto: '',
          perguntasEmAberto: [
            'A falha interrompe o atendimento?',
            'Há risco para os ocupantes?',
            'Existe alternativa provisória?',
          ],
          criteriosMatriz: [],
          fundamentacaoTecnica: '',
          provider: 'local-fallback',
          confidence: 'BAIXA',
          error: resData.message || 'Triagem semântica indisponível.',
        };
      }
      return { success: true, ...resData.data };
    } catch {
      return {
        success: false,
        suggestedPriority: (order.prioridade as any) || 'MEDIA',
        requerConfirmacao: true,
        dadosInformados: order.titulo,
        possivelImpacto: '',
        perguntasEmAberto: [
          'A falha interrompe o atendimento?',
          'Há risco para os ocupantes?',
          'Existe alternativa provisória?',
        ],
        criteriosMatriz: [],
        fundamentacaoTecnica: '',
        provider: 'local-fallback',
        confidence: 'BAIXA',
        error: 'Backend offline.',
      };
    }
  },

  async sendAiChat(message: string, history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = []): Promise<{
    success: boolean;
    reply: string;
    toolsExecuted: Array<{ name: string; params: any; result: any }>;
    suggestions: string[];
    provider: string;
    message?: string;
  }> {
    try {
      const res = await fetch(`${getApiBase()}/ai/chat`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message, history }),
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        return {
          success: false,
          reply: resData.message || 'Falha ao processar solicitação no assistente.',
          toolsExecuted: [],
          suggestions: [],
          provider: 'error',
        };
      }
      return {
        success: true,
        reply: resData.data.reply,
        toolsExecuted: resData.data.toolsExecuted || [],
        suggestions: resData.data.suggestions || [],
        provider: resData.data.provider || 'local',
      };
    } catch (err: any) {
      return {
        success: false,
        reply: 'Não foi possível conectar ao servidor da API. Verifique se o backend NestJS está rodando.',
        toolsExecuted: [],
        suggestions: [],
        provider: 'offline',
      };
    }
  },

  async getAiStatus(): Promise<{
    success: boolean;
    activeProvider: string;
    hasApiKey: boolean;
    model: string;
  }> {
    try {
      const res = await fetch(`${getApiBase()}/ai/status`, {
        headers: getAuthHeaders(),
      });
      const resData = await res.json();
      return resData.data || { activeProvider: 'Desconhecido', hasApiKey: false, model: 'Local' };
    } catch {
      return { success: false, activeProvider: 'Offline', hasApiKey: false, model: 'Local' };
    }
  },

  // -------------------------------------------------------------
  // RELATÓRIOS FISCAIS E AUDITORIA (TCE / CGU)
  // -------------------------------------------------------------
  async getReportsSummary(filter?: { period?: string; predioId?: string }): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> {
    try {
      const query = new URLSearchParams();
      if (filter?.period) query.append('period', filter.period);
      if (filter?.predioId) query.append('predioId', filter.predioId);

      const res = await fetch(`${getApiBase()}/reports/summary?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      const resData = await res.json();
      return {
        success: Boolean(resData.success),
        data: resData.data,
        message: resData.message,
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Falha ao buscar resumo de relatórios.' };
    }
  },

  async exportAuditCsv(filter?: { period?: string; predioId?: string }): Promise<{
    success: boolean;
    data?: {
      filename: string;
      csvContent: string;
      totalRegistros: number;
      responsavel: string;
    };
    message?: string;
  }> {
    try {
      const query = new URLSearchParams();
      if (filter?.period) query.append('period', filter.period);
      if (filter?.predioId) query.append('predioId', filter.predioId);

      const res = await fetch(`${getApiBase()}/reports/export/audit-csv?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      const resData = await res.json();
      return {
        success: Boolean(resData.success),
        data: resData.data,
        message: resData.message,
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Falha ao exportar CSV para auditoria.' };
    }
  },

  // -------------------------------------------------------------
  // MANIFESTAÇÕES & OUVIDORIA CIDADÃ
  // -------------------------------------------------------------
  async createManifestacao(data: {
    predioId?: string;
    localReferencia?: string;
    bairro?: string;
    tipo?: string;
    categoria?: string;
    descricao: string;
    anonimo?: boolean;
    nome?: string;
    email?: string;
    telefone?: string;
  }): Promise<{
    success: boolean;
    protocolo?: string;
    message?: string;
    data?: any;
  }> {
    try {
      const res = await fetch(`${getApiBase()}/manifestacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      return {
        success: Boolean(resData.success),
        protocolo: resData.protocolo,
        message: resData.message || (res.ok ? 'Manifestação registrada com sucesso.' : 'Falha ao registrar manifestação.'),
        data: resData.data,
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Erro de conexão ao enviar manifestação.' };
    }
  },

  async trackManifestacao(protocolo: string): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> {
    try {
      const clean = encodeURIComponent(protocolo.trim().toUpperCase());
      const res = await fetch(`${getApiBase()}/manifestacoes/public/track/${clean}`);
      const resData = await res.json();
      return {
        success: Boolean(resData.success),
        data: resData.data,
        message: resData.message,
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Falha ao consultar manifestação.' };
    }
  },

  async getManifestacoes(params?: {
    predioId?: string;
    status?: string;
    tipo?: string;
    categoria?: string;
    busca?: string;
  }): Promise<{
    success: boolean;
    data?: any[];
    meta?: any;
    message?: string;
  }> {
    try {
      const query = new URLSearchParams();
      if (params?.predioId) query.append('predioId', params.predioId);
      if (params?.status) query.append('status', params.status);
      if (params?.tipo) query.append('tipo', params.tipo);
      if (params?.categoria) query.append('categoria', params.categoria);
      if (params?.busca) query.append('busca', params.busca);

      const res = await fetch(`${getApiBase()}/manifestacoes?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      const resData = await res.json();
      return {
        success: Boolean(resData.success),
        data: resData.data || [],
        meta: resData.meta,
        message: resData.message,
      };
    } catch (err: any) {
      return { success: false, data: [], message: err?.message || 'Falha ao buscar manifestações.' };
    }
  },

  async responderManifestacao(
    id: string,
    data: {
      resposta: string;
      acao?: 'RESPONDER' | 'ARQUIVAR' | 'ENCAMINHAR';
      motivoArquivamento?: string;
    },
  ): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> {
    try {
      const res = await fetch(`${getApiBase()}/manifestacoes/${id}/responder`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      return {
        success: Boolean(resData.success),
        data: resData.data,
        message: resData.message,
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Falha ao emitir parecer oficial.' };
    }
  },

  async converterManifestacaoOS(
    id: string,
    data?: {
      predioId?: string;
      titulo?: string;
      categoria?: string;
      prioridade?: string;
    },
  ): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> {
    try {
      const res = await fetch(`${getApiBase()}/manifestacoes/${id}/converter-os`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data || {}),
      });
      const resData = await res.json();
      return {
        success: Boolean(resData.success),
        data: resData.data,
        message: resData.message,
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Falha ao converter em OS técnica.' };
    }
  },

  // -------------------------------------------------------------
  // ATIVOS, EQUIPAMENTOS & ETIQUETAS QR CODE POR UNIDADE
  // -------------------------------------------------------------
  async getAssets(params?: {
    facilityId?: string;
    predioNome?: string;
    categoria?: string;
    search?: string;
  }): Promise<{
    success: boolean;
    assets: AtivoPredialItem[];
    message?: string;
  }> {
    try {
      const query = new URLSearchParams();
      if (params?.facilityId) query.append('facilityId', params.facilityId);
      if (params?.predioNome) query.append('predioNome', params.predioNome);
      if (params?.categoria) query.append('categoria', params.categoria);
      if (params?.search) query.append('search', params.search);

      const res = await fetch(`${getApiBase()}/assets?${query.toString()}`, {
        cache: 'no-store',
        headers: getAuthHeaders(),
      });
      const resData = await res.json();
      const rawList = Array.isArray(resData.data) ? resData.data : [];
      return {
        success: Boolean(resData.success),
        assets: rawList,
        message: resData.message,
      };
    } catch (err: any) {
      return {
        success: false,
        assets: [],
        message: err?.message || 'Falha ao consultar ativos prediais.',
      };
    }
  },

  async createAsset(data: {
    codigoPatrimonio: string;
    nome: string;
    categoria?: string;
    ambiente: string;
    predioId: string;
    marcaModelo?: string;
    numeroSerie?: string;
    garantiaAte?: string;
  }): Promise<{
    success: boolean;
    asset?: AtivoPredialItem;
    message?: string;
  }> {
    try {
      const res = await fetch(`${getApiBase()}/assets`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      return {
        success: Boolean(resData.success),
        asset: resData.data,
        message: resData.message,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Falha ao cadastrar equipamento.',
      };
    }
  },
};

