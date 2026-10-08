import { OrdemServicoItem, OportunidadeProximidade, StatusOS, Prioridade, UsuarioSession } from '../types/domain';

let currentBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';

async function fetchWithFallback(endpoint: string, options?: RequestInit): Promise<Response> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const candidates = [
    `${currentBaseUrl}${cleanEndpoint}`,
    `http://127.0.0.1:3001/api${cleanEndpoint}`,
    `http://localhost:3001/api${cleanEndpoint}`,
    `http://192.168.3.11:3001/api${cleanEndpoint}`,
  ];
  const uniqueUrls = Array.from(new Set(candidates));

  let lastError: any = null;
  for (const url of uniqueUrls) {
    try {
      const res = await fetch(url, options);
      currentBaseUrl = url.substring(0, url.indexOf('/api') + 4);
      return res;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

function getAuthHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function mapToOrdemServicoItem(raw: any): OrdemServicoItem {
  const statusMap: Record<string, StatusOS> = {
    TRIAGE: 'EM_TRIAGEM',
    SCHEDULED: 'AGENDADO',
    IN_PROGRESS: 'EM_EXECUCAO',
    WAITING: 'AGUARDANDO',
    COMPLETED: 'CONCLUIDO',
    CANCELLED: 'CANCELADO',
    RECEBIDO: 'RECEBIDO',
    EM_TRIAGEM: 'EM_TRIAGEM',
    AGENDADO: 'AGENDADO',
    AGUARDANDO: 'AGUARDANDO',
    EM_EXECUCAO: 'EM_EXECUCAO',
    CONCLUIDO: 'CONCLUIDO',
    CANCELADO: 'CANCELADO',
  };

  const priorityMap: Record<string, Prioridade> = {
    URGENT: 'URGENTE',
    HIGH: 'ALTA',
    MEDIUM: 'MEDIA',
    LOW: 'BAIXA',
    URGENTE: 'URGENTE',
    ALTA: 'ALTA',
    MEDIA: 'MEDIA',
    BAIXA: 'BAIXA',
  };

  return {
    id: raw.id,
    codigo: raw.code || raw.codigo || 'OS-000000',
    titulo: raw.title || raw.titulo || 'Chamado de Zeladoria',
    descricao: raw.description || raw.descricao || '',
    categoria: raw.category || raw.categoria || 'GERAL',
    prioridade: priorityMap[raw.priority || raw.prioridade] || 'MEDIA',
    status: statusMap[raw.status] || 'EM_TRIAGEM',
    predio_id: raw.facilityId || raw.predio_id || '',
    predio: {
      id: raw.facilityId || raw.predio_id || '',
      nome: raw.facilityName || raw.predio?.nome || 'Unidade Municipal',
      tipo: (raw.predio?.tipo || 'UBS') as any,
      endereco: raw.predio?.endereco || raw.facilityName || 'Endereço da Unidade',
      latitude: raw.predio?.latitude,
      longitude: raw.predio?.longitude,
    },
    tecnico_atribuido_id: raw.technicianId || raw.tecnico_atribuido_id || null,
    fotos: raw.photos || raw.fotos || [],
    fotos_conclusao: raw.photosCompletion || raw.fotos_conclusao || [],
    motivo_pausa: raw.pauseReason || raw.motivo_pausa || null,
    data_limite_sla: raw.slaDeadline || raw.data_limite_sla || null,
    iniciado_em: raw.startedAt || raw.iniciado_em || null,
    concluido_em: raw.completedAt || raw.concluido_em || null,
    pausado_em: raw.pausedAt || raw.pausado_em || null,
    tempo_pausa_minutos: raw.pauseDurationMinutes || raw.tempo_pausa_minutos || 0,
    sla_violado: Boolean(raw.isSlaBreached || raw.sla_violado),
    criado_em: raw.openedAt || raw.criado_em || new Date().toISOString(),
    atualizado: raw.atualizado || new Date().toISOString(),
  };
}

export const apiClient = {
  // Autenticação Real via API NestJS
  async login(email: string, password: string): Promise<{ user: UsuarioSession; token: string }> {
    const response = await fetchWithFallback('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const errorMessage = data?.message || 'Falha na autenticação. Verifique seu e-mail e senha.';
      throw new Error(errorMessage);
    }

    const { user, token } = data.data;

    const mappedUser: UsuarioSession = {
      id: user.id,
      nome: user.name,
      email: user.email,
      role: user.role,
      especialidade: user.role === 'TECNICO' ? 'ELETRICA' : undefined,
      telefone: user.phoneNumber,
    };

    return { user: mappedUser, token };
  },

  // Buscar ordens de serviço reais da API
  async getOrdensTecnico(token?: string | null): Promise<OrdemServicoItem[]> {
    const response = await fetchWithFallback('/work-orders', {
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar ordens de serviço: HTTP ${response.status}`);
    }

    const json = await response.json();
    const items = Array.isArray(json.data) ? json.data : [];
    return items.map(mapToOrdemServicoItem);
  },

  // Buscar detalhes de uma ordem específica por ID
  async getOrdemById(id: string, token?: string | null): Promise<OrdemServicoItem> {
    const response = await fetchWithFallback(`/work-orders/${id}`, {
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Ordem de serviço #${id} não encontrada na API.`);
    }

    const json = await response.json();
    const item = json.data || json;
    return mapToOrdemServicoItem(item);
  },

  // Oportunidades próximas por competência técnica (calculadas no servidor)
  async getOportunidadesProximidade(
    coords?: { lat?: number; lng?: number; radius?: number },
    token?: string | null,
  ): Promise<OportunidadeProximidade[]> {
    const params = new URLSearchParams();
    if (coords?.lat) params.append('lat', String(coords.lat));
    if (coords?.lng) params.append('lng', String(coords.lng));
    if (coords?.radius) params.append('radius', String(coords.radius));

    const path = `/work-orders/nearby/opportunities${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetchWithFallback(path, {
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Erro ao consultar oportunidades próximas: HTTP ${response.status}`);
    }

    const json = await response.json();
    const items = Array.isArray(json.data) ? json.data : [];

    return items.map((op: any) => ({
      osId: op.osId || op.id,
      codigo: op.codigo || op.code,
      titulo: op.titulo || op.title,
      categoria: op.categoria || op.category || 'GERAL',
      prioridade: (op.prioridade || 'MEDIA') as Prioridade,
      predioNome: op.predioNome || op.facilityName || 'Unidade Municipal',
      distanciaKm: typeof op.distanciaKm === 'number' ? op.distanciaKm : 1.2,
      compatibilidade: op.compatibilidade || 'EXATA',
    }));
  },

  // Assumir ordem de serviço por proximidade (Claim)
  async assumirOrdem(osId: string, token?: string | null): Promise<OrdemServicoItem> {
    const response = await fetchWithFallback(`/work-orders/${osId}/claim`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      throw new Error(errorJson?.message || 'Falha ao incluir ordem de serviço na sua rota.');
    }

    const json = await response.json();
    return mapToOrdemServicoItem(json.data);
  },

  // Iniciar Atendimento
  async iniciarAtendimento(
    osId: string,
    payload: { latitude?: number; longitude?: number; justificativaGps?: string },
    token?: string | null,
  ): Promise<boolean> {
    const response = await fetchWithFallback(`/work-orders/${osId}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({
        status: 'IN_PROGRESS',
        ...payload,
      }),
    });
    return response.ok;
  },

  // Pausar Atendimento
  async pausarAtendimento(
    osId: string,
    payload: { motivoPausa: string; observacao?: string },
    token?: string | null,
  ): Promise<boolean> {
    const response = await fetchWithFallback(`/work-orders/${osId}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({
        status: 'WAITING',
        motivo_pausa: payload.motivoPausa,
      }),
    });
    return response.ok;
  },

  // Concluir Atendimento
  async concluirAtendimento(
    osId: string,
    payload: {
      fotosConclusao: string[];
      assinaturaUrl?: string;
      responsavelNome?: string;
      justificativaSemAssinatura?: string;
    },
    token?: string | null,
  ): Promise<boolean> {
    const response = await fetchWithFallback(`/work-orders/${osId}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({
        status: 'COMPLETED',
        fotos_conclusao: payload.fotosConclusao,
      }),
    });
    return response.ok;
  },

  // Listagem do Gestor com Metadados da API
  async getOrdensGestor(token?: string | null): Promise<{
    ordens: OrdemServicoItem[];
    meta: {
      totalCount: number;
      openCount: number;
      urgentCount: number;
      inProgressCount: number;
      completedCount: number;
    };
  }> {
    const response = await fetchWithFallback('/work-orders', {
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar dados do gestor: HTTP ${response.status}`);
    }

    const json = await response.json();
    const items = Array.isArray(json.data) ? json.data : [];
    return {
      ordens: items.map(mapToOrdemServicoItem),
      meta: json.meta || {
        totalCount: items.length,
        openCount: items.filter((i: any) => i.status !== 'COMPLETED').length,
        urgentCount: items.filter((i: any) => i.priority === 'URGENT').length,
        inProgressCount: items.filter((i: any) => i.status === 'IN_PROGRESS').length,
        completedCount: items.filter((i: any) => i.status === 'COMPLETED').length,
      },
    };
  },
};
