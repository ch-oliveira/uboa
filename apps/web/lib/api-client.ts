/**
 * Cliente de Integração com o Backend NestJS (apps/api)
 * Base URL: http://localhost:3001/api (ou NEXT_PUBLIC_API_URL)
 * 
 * Padrão Internacional:
 * - Backend: 100% Inglês camelCase com Envelope REST { success, data, meta }
 * - Adapter: Mapeamento seguro para compatibilidade transparente com os componentes da UI
 */

import type { UserAccount } from '@/types/auth';
import type { OrdemServico, StatusOS, Prioridade } from '@/app/kanban/data';
import type { UnidadeItem } from '@/types/units';
import type { AgendaEvent, SystemSettings } from '@/context/orders-context';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/+$/, '');

function mapStatusToUi(status?: string): StatusOS {
  if (!status) return 'TRIAGEM';
  const s = status.toUpperCase();
  if (s === 'TRIAGE' || s === 'TRIAGEM' || s === 'RECEBIDO') return 'TRIAGEM';
  if (s === 'SCHEDULED' || s === 'AGENDADO') return 'AGENDADO';
  if (s === 'WAITING' || s === 'AGUARDANDO') return 'AGUARDANDO';
  if (s === 'IN_PROGRESS' || s === 'EM_EXECUCAO') return 'EM_EXECUCAO';
  if (s === 'COMPLETED' || s === 'CONCLUIDO') return 'CONCLUIDO';
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

function mapWorkOrderFromApi(item: any): OrdemServico {
  return {
    id: item.code || item.id,
    titulo: item.title || item.titulo,
    predio: item.facilityName || item.predio,
    prioridade: mapPriorityToUi(item.priority || item.prioridade),
    status: mapStatusToUi(item.status),
    dataAbertura: item.openedAt ? `Hoje, ${new Date(item.openedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : (item.dataAbertura || 'Hoje'),
    solicitante: item.requesterName || item.solicitante || 'Gestão Municipal',
    tecnico: item.technicianName || item.tecnico,
    descricao: item.description || item.descricao,
  };
}

function mapFacilityFromApi(item: any): UnidadeItem {
  return {
    id: item.id,
    nome: item.name || item.nome,
    tipo: item.type || item.tipo,
    endereco: item.address || item.endereco,
    gestor: item.managerName || item.gestor || 'Gestão da Unidade',
    telefone: item.phoneNumber || item.telefone || '(11) 4589-0000',
  };
}

function mapInspectionFromApi(item: any): AgendaEvent {
  return {
    id: item.id,
    time: item.scheduledTime || item.time || item.horario || '09:00',
    title: item.title || item.titulo,
    subtitle: item.location || item.subtitle || item.subtitulo || 'Unidade Municipal',
    completed: item.isCompleted ?? item.completed ?? false,
    type: item.type || item.tipo || 'geral',
    tecnico: item.technicianName || item.tecnico,
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

    return {
      success: Boolean(resData.success),
      user,
      token: resData.data?.token || resData.token,
      message: resData.message,
    };
  },

  async loginQuick(role: 'GESTOR' | 'TECNICO' | 'SOLICITANTE_ESCOLA' | 'SOLICITANTE_UBS'): Promise<{ success: boolean; user?: UserAccount; token?: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quickRole: role, role }),
    });
    const resData = await res.json();
    const user = mapUserFromApi(resData.data?.user || resData.user);

    return {
      success: Boolean(resData.success),
      user,
      token: resData.data?.token || resData.token,
    };
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    } catch {
      // Ignorar falha no logout
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
      headers: { 'Content-Type': 'application/json' },
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
    });
    const resData = await res.json();
    const rawOrder = resData.data || resData.order;
    return {
      success: Boolean(resData.success),
      order: rawOrder ? mapWorkOrderFromApi(rawOrder) : undefined,
    };
  },

  async createWorkOrder(order: Partial<OrdemServico>): Promise<{ success: boolean; order: OrdemServico; message?: string }> {
    const payload = {
      title: order.titulo,
      facilityName: order.predio,
      priority: order.prioridade,
      description: order.descricao,
      technicianName: order.tecnico,
      code: order.id,
      // Fallbacks
      titulo: order.titulo,
      predio: order.predio,
      prioridade: order.prioridade,
      descricao: order.descricao,
      tecnico: order.tecnico,
    };

    const res = await fetch(`${API_BASE}/work-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

    const res = await fetch(`${API_BASE}/work-orders/${encodeURIComponent(idOrCode)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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

  async deleteWorkOrder(idOrCode: string): Promise<{ success: boolean; message?: string }> {
    const res = await fetch(`${API_BASE}/work-orders/${encodeURIComponent(idOrCode)}`, {
      method: 'DELETE',
    });
    return await res.json();
  },

  // -------------------------------------------------------------
  // UNIDADES MUNICIPAIS (FACILITIES)
  // -------------------------------------------------------------
  async getFacilities(): Promise<{ success: boolean; units: UnidadeItem[] }> {
    const res = await fetch(`${API_BASE}/facilities`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
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
      address: facility.endereco,
      managerName: facility.gestor,
      phoneNumber: facility.telefone,
      // Fallbacks
      nome: facility.nome,
      tipo: facility.tipo,
      endereco: facility.endereco,
      gestor: facility.gestor,
      telefone: facility.telefone,
    };

    const res = await fetch(`${API_BASE}/facilities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

  // -------------------------------------------------------------
  // USUÁRIOS
  // -------------------------------------------------------------
  async getUsers(): Promise<{ success: boolean; users: any[] }> {
    const res = await fetch(`${API_BASE}/users`, {
      cache: 'no-store',
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
    });
    const resData = await res.json();
    const rawItem = resData.data || resData.agendaItem;
    return {
      success: Boolean(resData.success),
      agendaItem: rawItem ? mapInspectionFromApi(rawItem) : undefined,
    };
  },

  // -------------------------------------------------------------
  // CONFIGURAÇÕES DO SISTEMA (POSTGRESQL)
  // -------------------------------------------------------------
  async getSettings(): Promise<{ success: boolean; settings: SystemSettings }> {
    const res = await fetch(`${API_BASE}/settings`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
};
