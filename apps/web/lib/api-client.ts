/**
 * Cliente de Integração com o Backend NestJS (apps/api)
 * Base URL: http://localhost:3001/api (ou NEXT_PUBLIC_API_URL)
 * 
 * Padrão Seguro:
 * - Autenticação JWT real com propagação estrita de headers Authorization: Bearer <token>
 * - Mapeamento seguro e normalizado de entidades para os componentes da UI
 */

import type { UserAccount } from '@/types/auth';
import type { OrdemServico, StatusOS, Prioridade } from '@/app/kanban/data';
import type { UnidadeItem, TipoUnidade } from '@/types/units';
import type { AgendaEvent, SystemSettings } from '@/context/orders-context';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/+$/, '');
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
    impedimento: item.impediment || item.impedimento,
    historico: item.history || item.historico,
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
    apiEndpoint: API_BASE,
    useMockData: false,
  };
}

export const apiClient = {
  baseUrl: API_BASE,

  // -------------------------------------------------------------
  // AUTENTICAÇÃO
  // -------------------------------------------------------------
  async login(email: string, password?: string): Promise<{ success: boolean; user?: UserAccount; token?: string; message?: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const resData = await res.json();
    const user = mapUserFromApi(resData.data?.user || resData.user);
    const token = resData.data?.token || resData.token;

    if (resData.success && token && typeof window !== 'undefined') {
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
  ): Promise<{ success: boolean; user?: UserAccount; token?: string }> {
    let email = 'gestor@urboa.gov.br';
    if (role === 'ADMIN') email = 'admin@urboa.gov.br';
    else if (role === 'TECNICO') email = 'carlos.tecnico@urboa.gov.br';
    else if (role === 'SOLICITANTE_ESCOLA') email = 'maria.escola@urboa.gov.br';
    else if (role === 'SOLICITANTE_UBS') email = 'marcelo.ubs@urboa.gov.br';

    const devPassword = passwordOverride || process.env.NEXT_PUBLIC_DEV_PASSWORD || 'Urboa@2026!';
    return this.login(email, devPassword);
  },

  async getMe(tokenOverride?: string): Promise<{ success: boolean; user?: UserAccount }> {
    const token = tokenOverride || getAuthToken();
    if (!token) return { success: false };

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        cache: 'no-store',
        headers: getAuthHeaders(tokenOverride ? { Authorization: `Bearer ${tokenOverride}` } : {}),
      });
      if (!res.ok) return { success: false };
      const resData = await res.json();
      const user = mapUserFromApi(resData.data || resData.user);
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
      await fetch(`${API_BASE}/auth/logout`, {
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
    const url = new URL(`${API_BASE}/work-orders`);
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
    const res = await fetch(`${API_BASE}/work-orders/${encodeURIComponent(idOrCode)}`, {
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
    const res = await fetch(`${API_BASE}/work-orders/public/track/${encodeURIComponent(codigo)}`, {
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
    };

    const res = await fetch(`${API_BASE}/work-orders`, {
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

    const res = await fetch(`${API_BASE}/work-orders/${encodeURIComponent(idOrCode)}`, {
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
    const res = await fetch(`${API_BASE}/work-orders/${encodeURIComponent(idOrCode)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ motivoCancelamento: motivoCancelamento || 'Cancelamento solicitado via painel web' }),
    });
    return await res.json();
  },

  // -------------------------------------------------------------
  // UNIDADES MUNICIPAIS (FACILITIES)
  // -------------------------------------------------------------
  async getFacilities(): Promise<{ success: boolean; units: UnidadeItem[] }> {
    const res = await fetch(`${API_BASE}/facilities`, {
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

    const res = await fetch(`${API_BASE}/facilities`, {
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

    const res = await fetch(`${API_BASE}/facilities/${encodeURIComponent(id)}`, {
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
    const res = await fetch(`${API_BASE}/facilities/${encodeURIComponent(id)}`, {
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
    const res = await fetch(`${API_BASE}/users`, {
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
    const res = await fetch(`${API_BASE}/agenda`, {
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

    const res = await fetch(`${API_BASE}/agenda`, {
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
    const res = await fetch(`${API_BASE}/agenda/${encodeURIComponent(id)}`, {
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
    const res = await fetch(`${API_BASE}/agenda/${encodeURIComponent(id)}/concluir`, {
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
    const res = await fetch(`${API_BASE}/settings`, {
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
    const res = await fetch(`${API_BASE}/settings`, {
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
      const res = await fetch(`${API_BASE}/ai/triage`, {
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
      const res = await fetch(`${API_BASE}/ai/chat`, {
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
      const res = await fetch(`${API_BASE}/ai/status`, {
        headers: getAuthHeaders(),
      });
      const resData = await res.json();
      return resData.data || { activeProvider: 'Desconhecido', hasApiKey: false, model: 'Local' };
    } catch {
      return { success: false, activeProvider: 'Offline', hasApiKey: false, model: 'Local' };
    }
  },
};
