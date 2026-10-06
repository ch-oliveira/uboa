'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  type OrdemServico, 
  type StatusOS, 
  type Prioridade
} from '../app/kanban/data';
import { useAuth } from './auth-context';
import { apiClient } from '@/lib/api-client';
import { logger } from '@/lib/logger';

import { type UnidadeItem, type TipoUnidade } from '@/types/units';

export type { OrdemServico, StatusOS, Prioridade, UnidadeItem, TipoUnidade };

export interface AgendaEvent {
  id: string;
  time: string;
  dataAgendada?: string;
  title: string;
  subtitle: string;
  completed: boolean;
  type: 'eletrica' | 'hidraulica' | 'acessibilidade' | 'estrutural' | 'geral';
  recorrencia?: string;
  tecnico?: string;
  orderId?: string;
  laudoTecnico?: string;
  proximaEtapaSugerida?: string;
}

export interface ActivityEvent {
  id: string;
  title: string;
  time: string;
  iconType: 'file' | 'check' | 'alert' | 'wrench';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  orderId?: string;
  time: string;
  unread: boolean;
  priority: Prioridade;
}

export interface UnitWithStats extends UnidadeItem {
  openCount: number;
  urgentCount: number;
  completedCount: number;
  totalCount: number;
  statusHealth: 'CRITICO' | 'ATENCAO' | 'REGULAR';
}

export interface TecnicoSettings {
  id: string;
  nome: string;
  especialidade: string;
  status: 'ATIVO' | 'FERIAS' | 'INDISPONIVEL';
  telefone: string;
}

export interface SystemSettings {
  prefeituraNome: string;
  secretariaNome: string;
  gestorNome: string;
  gestorCargo: string;
  gestorEmail: string;
  gestorTelefone: string;
  slaUrgenteHours: number;
  slaAltaHours: number;
  slaMediaHours: number;
  slaBaixaHours: number;
  mttrAlertHours: number;
  preventivaGoal: number;
  soundAlerts: boolean;
  pushNotifications: boolean;
  whatsappAlerts: boolean;
  autoDispatch: boolean;
  tecnicosList: TecnicoSettings[];
  themeMode: 'light' | 'dark' | 'system';
  apiEndpoint: string;
  useMockData: boolean;
}

export const DEFAULT_SETTINGS: SystemSettings = {
  prefeituraNome: 'Prefeitura Municipal de Gestão Urbana',
  secretariaNome: 'Secretaria de Infraestrutura e Zeladoria Predial',
  gestorNome: 'Mariana Alves',
  gestorCargo: 'Gestora Municipal de Zeladoria',
  gestorEmail: 'mariana.alves@gestaourbana.gov.br',
  gestorTelefone: '(11) 3241-8900',
  slaUrgenteHours: 4,
  slaAltaHours: 24,
  slaMediaHours: 72,
  slaBaixaHours: 168,
  mttrAlertHours: 8,
  preventivaGoal: 90,
  soundAlerts: true,
  pushNotifications: true,
  whatsappAlerts: false,
  autoDispatch: false,
  tecnicosList: [
    { id: 'tec-1', nome: 'Carlos Silva', especialidade: 'Elétrica & Hidráulica', status: 'ATIVO', telefone: '(11) 98765-4321' },
    { id: 'tec-2', nome: 'Marcos Oliveira', especialidade: 'Alvenaria & Pintura', status: 'ATIVO', telefone: '(11) 98765-4322' },
    { id: 'tec-3', nome: 'Roberto Santos', especialidade: 'Hidráulica & Bombas', status: 'ATIVO', telefone: '(11) 98765-4323' },
    { id: 'tec-4', nome: 'Lucas Pereira', especialidade: 'Acessibilidade & Estruturas', status: 'ATIVO', telefone: '(11) 98765-4324' },
  ],
  themeMode: 'light',
  apiEndpoint: '/api',
  useMockData: false,
};

export const DEFAULT_ACTIVITIES: ActivityEvent[] = [
  { id: 'act-1', title: 'Chamado #OS-104923 em execução por Roberto Santos', time: 'Há 18 min', iconType: 'wrench' },
  { id: 'act-2', title: 'Vistoria elétrica concluída na EMEI Sementinha', time: 'Há 45 min', iconType: 'check' },
  { id: 'act-3', title: 'Novo chamado urgente registrado na UBS Vila Nova', time: 'Há 2h', iconType: 'alert' },
  { id: 'act-4', title: 'Agendamento de vistoria preventiva concluído', time: 'Hoje, 08:30', iconType: 'file' },
];

interface OrdersContextType {
  orders: OrdemServico[];
  units: UnidadeItem[];
  agenda: AgendaEvent[];
  activities: ActivityEvent[];
  notifications: NotificationItem[];
  isLoadingData: boolean;
  refreshData: () => Promise<void>;
  
  // Order actions
  addOrder: (order: OrdemServico) => Promise<OrdemServico | void>;
  updateOrder: (order: OrdemServico) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  setOrders: React.Dispatch<React.SetStateAction<OrdemServico[]>>;
  
  // Unit actions
  addUnit: (unit: UnidadeItem) => Promise<void>;

  // Agenda actions
  addAgendaEvent: (event: AgendaEvent) => Promise<void>;
  toggleAgendaItem: (id: string) => Promise<void>;

  // Other actions
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // Settings & System Config
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
  resetSettings: () => void;

  // Sidebar Retrátil
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Copilot IA (Google Gemini Function Calling)
  isCopilotOpen: boolean;
  openCopilot: () => void;
  closeCopilot: () => void;
  toggleCopilot: () => void;

  // Backup & Restore
  exportBackupData: () => string;
  importBackupData: (jsonData: string) => { success: boolean; message: string };
  resetAllData: () => void;

  // Computed metrics
  stats: {
    totalOpen: number;
    triagem: number;
    emExecucao: number;
    aguardando: number;
    concluidos: number;
    urgentes: number;
  };
  
  // Computed units with ticket counts & health
  unitsWithStats: UnitWithStats[];
  unitsAttention: {
    name: string;
    openCount: number;
    urgentCount: number;
  }[];
  
  allUnits: {
    name: string;
    openCount: number;
    totalCount: number;
  }[];
  allUnitsSummary: {
    name: string;
    openCount: number;
    totalCount: number;
  }[];
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

const STORAGE_KEY_ORDERS = 'zelo_orders_data_v1';
const STORAGE_KEY_UNITS = 'zelo_units_data_v1';
const STORAGE_KEY_AGENDA = 'zelo_agenda_data_v1';
const STORAGE_KEY_ACTIVITIES = 'zelo_activities_data_v1';
const STORAGE_KEY_SETTINGS = 'zelo_settings_data_v1';
const STORAGE_KEY_SIDEBAR = 'zelo_sidebar_collapsed_v1';


export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const { user, role } = useAuth();

  const [orders, setOrders] = useState<OrdemServico[]>([]);
  const [units, setUnits] = useState<UnidadeItem[]>([]);
  const [agenda, setAgenda] = useState<AgendaEvent[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>(DEFAULT_ACTIVITIES);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());

  const openCopilot = useCallback(() => setIsCopilotOpen(true), []);
  const closeCopilot = useCallback(() => setIsCopilotOpen(false), []);
  const toggleCopilot = useCallback(() => setIsCopilotOpen((prev) => !prev), []);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Função centralizada para carregar dados reais da API conforme o perfil ativo
  const refreshData = useCallback(async () => {
    setIsLoadingData(true);

    // Se o usuário não estiver autenticado (ex: página pública de abertura de chamado ou landing),
    // NÃO carrega a lista geral de ordens de serviço, agenda ou configurações internas do município!
    if (!user) {
      setOrders([]);
      setAgenda([]);
      try {
        const unitsRes = await apiClient.getFacilities().catch(() => null);
        if (unitsRes?.success && Array.isArray(unitsRes.units)) {
          setUnits(unitsRes.units);
        }
      } catch {
        // Ignora
      } finally {
        setIsLoadingData(false);
      }
      return;
    }

    try {
      const params: any = {};
      if (role) params.role = role;
      // Gestor vê a cidade inteira; apenas SOLICITANTE filtra por prédio específico
      if (role === 'SOLICITANTE' && user?.predio) params.predio = user.predio;
      if (role === 'TECNICO' && user?.nome) params.tecnico = user.nome;

      const [ordersRes, unitsRes, agendaRes, settingsRes] = await Promise.all([
        apiClient.getWorkOrders(params).catch(() => null),
        apiClient.getFacilities().catch(() => null),
        apiClient.getAgenda().catch(() => null),
        apiClient.getSettings().catch(() => null),
      ]);

      if (ordersRes?.success && Array.isArray(ordersRes.orders)) {
        setOrders(ordersRes.orders);
        if (Array.isArray((ordersRes as any).activities) && (ordersRes as any).activities.length > 0) {
          setActivities((ordersRes as any).activities);
        } else if (ordersRes.orders.length > 0) {
          const liveActivities: ActivityEvent[] = ordersRes.orders.slice(0, 6).map((ord, idx) => {
            const isUrg = ord.prioridade === 'URGENTE';
            const isExec = ord.status === 'EM_EXECUCAO';
            const isDone = ord.status === 'CONCLUIDO';
            return {
              id: `act-${ord.id}-${idx}`,
              title: isDone 
                ? `Chamado #${ord.id} concluído na ${ord.predio}`
                : isExec 
                  ? `Chamado #${ord.id} em execução por ${ord.tecnico || 'equipe técnica'}`
                  : `Chamado #${ord.id} registrado na ${ord.predio}`,
              time: ord.dataAbertura || 'Hoje',
              iconType: isDone ? 'check' : isUrg ? 'alert' : isExec ? 'wrench' : 'file',
            };
          });
          setActivities(liveActivities);
        }
      }

      if (unitsRes?.success && Array.isArray(unitsRes.units)) {
        setUnits(unitsRes.units);
      }

      if (agendaRes?.success && Array.isArray(agendaRes.agenda)) {
        setAgenda(agendaRes.agenda);
      }

      if (settingsRes?.success && settingsRes.settings) {
        setSettings((prev) => ({ ...prev, ...settingsRes.settings }));
      }
    } catch (e) {
      logger.error('Erro ao conectar com API de dados', e);
    } finally {
      setIsLoadingData(false);
    }
  }, [user, role]);

  // Carrega da API sempre que o usuário/perfil mudar
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Carrega preferências do localStorage no mount e limpa caches legados de mocks
  useEffect(() => {
    try {
      // Limpeza preventiva de caches de dados mockados antigos
      localStorage.removeItem(STORAGE_KEY_ORDERS);
      localStorage.removeItem(STORAGE_KEY_UNITS);
      localStorage.removeItem(STORAGE_KEY_AGENDA);
      localStorage.removeItem(STORAGE_KEY_ACTIVITIES);

      const savedSidebar = localStorage.getItem(STORAGE_KEY_SIDEBAR);
      if (savedSidebar !== null) {
        setIsSidebarCollapsed(savedSidebar === 'true');
      }
    } catch (e) {
      logger.error('Error loading preferences from localStorage', e);
    } finally {
      setHasHydrated(true);
    }
  }, []);

  // Salva apenas preferências de interface
  useEffect(() => {
    if (!hasHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY_SIDEBAR, String(isSidebarCollapsed));
    } catch (e) {
      logger.error('Error saving sidebar state to localStorage', e);
    }
  }, [isSidebarCollapsed, hasHydrated]);

  // Atalho de teclado global: Cmd+B / Ctrl+B (sidebar) e Cmd+J / Ctrl+J (Copilot IA)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarCollapsed((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsCopilotOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Order Actions integradas com a API NestJS
  async function addOrder(order: OrdemServico): Promise<OrdemServico | void> {
    setOrders((prev) => [order, ...prev]);
    
    const newAct: ActivityEvent = {
      id: `act-${Date.now()}`,
      title: `Novo chamado "${order.titulo}" cadastrado (${order.predio})`,
      time: 'Agora mesmo',
      iconType: order.prioridade === 'URGENTE' ? 'alert' : 'file',
    };
    setActivities((prev) => [newAct, ...prev.slice(0, 9)]);

    try {
      const data = await apiClient.createWorkOrder(order);
      if (data.success && data.order) {
        setOrders((prev) => prev.map((o) => (o.id === order.id ? data.order : o)));
        return data.order;
      }
    } catch {
      // API offline, mantendo registro local
    }
  }

  async function updateOrder(updatedOrder: OrdemServico) {
    setOrders((prev) =>
      prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
    );

    const newAct: ActivityEvent = {
      id: `act-${Date.now()}`,
      title: `Chamado "${updatedOrder.titulo}" atualizado para ${updatedOrder.status}`,
      time: 'Agora mesmo',
      iconType: updatedOrder.status === 'CONCLUIDO' ? 'check' : 'wrench',
    };
    setActivities((prev) => [newAct, ...prev.slice(0, 9)]);

    try {
      await apiClient.updateWorkOrder(updatedOrder.id, updatedOrder);
    } catch {
      // API offline, mantendo registro local
    }
  }

  async function deleteOrder(id: string) {
    const target = orders.find((o) => o.id === id);
    setOrders((prev) => prev.filter((o) => o.id !== id));

    if (target) {
      const newAct: ActivityEvent = {
        id: `act-${Date.now()}`,
        title: `Chamado "${target.titulo}" foi removido`,
        time: 'Agora mesmo',
        iconType: 'file',
      };
      setActivities((prev) => [newAct, ...prev.slice(0, 9)]);
    }

    try {
      await apiClient.deleteWorkOrder(id);
    } catch {
      // API offline, mantendo registro local
    }
  }

  // Unit Actions integradas com API NestJS
  async function addUnit(unit: UnidadeItem) {
    setUnits((prev) => [unit, ...prev]);

    const newAct: ActivityEvent = {
      id: `act-${Date.now()}`,
      title: `Nova unidade municipal "${unit.nome}" cadastrada`,
      time: 'Agora mesmo',
      iconType: 'file',
    };
    setActivities((prev) => [newAct, ...prev.slice(0, 9)]);

    try {
      await apiClient.createFacility(unit);
    } catch {
      // API offline, mantendo registro local
    }
  }

  // Agenda Actions integradas com API
  async function addAgendaEvent(event: AgendaEvent) {
    setAgenda((prev) => [...prev, event]);
    const newAct: ActivityEvent = {
      id: `act-${Date.now()}`,
      title: `Nova vistoria agendada: "${event.title}" (${event.subtitle})`,
      time: 'Agora mesmo',
      iconType: 'wrench',
    };
    setActivities((prev) => [newAct, ...prev.slice(0, 9)]);

    try {
      await apiClient.createAgendaEvent(event);
    } catch {
      // API offline, mantendo registro local
    }
  }

  async function toggleAgendaItem(id: string) {
    setAgenda((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );

    try {
      await apiClient.toggleAgendaItem(id);
    } catch {
      // API offline, mantendo registro local
    }
  }

  function markNotificationAsRead(id: string) {
    setReadNotificationIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  function markAllNotificationsAsRead() {
    const allIds = notifications.map((n) => n.id);
    setReadNotificationIds(new Set(allIds));
  }

  // Sidebar Retrátil Actions
  function toggleSidebar() {
    setIsSidebarCollapsed((prev) => !prev);
  }

  function setSidebarCollapsed(collapsed: boolean) {
    setIsSidebarCollapsed(collapsed);
  }

  // Settings Actions integradas com API
  async function updateSettings(newSettings: Partial<SystemSettings>) {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    try {
      await apiClient.updateSettings(newSettings);
    } catch {
      // API offline, mantendo registro local
    }
  }

  function resetSettings() {
    setSettings(DEFAULT_SETTINGS);
  }

  // Backup & Restore
  function exportBackupData(): string {
    const backup = {
      version: 'zelo-backup-v1',
      exportedAt: new Date().toISOString(),
      orders,
      units,
      agenda,
      activities,
      settings,
    };
    return JSON.stringify(backup, null, 2);
  }

  function importBackupData(jsonData: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, message: 'Arquivo JSON inválido.' };
      }
      if (Array.isArray(parsed.orders)) setOrders(parsed.orders);
      if (Array.isArray(parsed.units)) setUnits(parsed.units);
      if (Array.isArray(parsed.agenda)) setAgenda(parsed.agenda);
      if (Array.isArray(parsed.activities)) setActivities(parsed.activities);
      if (parsed.settings && typeof parsed.settings === 'object') {
        setSettings((prev) => ({ ...prev, ...parsed.settings }));
      }
      return { success: true, message: 'Backup restaurado com sucesso!' };
    } catch (err: any) {
      return { success: false, message: `Erro ao importar: ${err?.message || 'Formato inválido'}` };
    }
  }

  async function resetAllData() {
    try {
      localStorage.removeItem(STORAGE_KEY_ORDERS);
      localStorage.removeItem(STORAGE_KEY_UNITS);
      localStorage.removeItem(STORAGE_KEY_AGENDA);
      localStorage.removeItem(STORAGE_KEY_ACTIVITIES);
      localStorage.removeItem(STORAGE_KEY_SETTINGS);
    } catch {
      // Ignorar falha no localStorage
    }
    await refreshData();
  }

  // Computed Stats
  const stats = useMemo(() => {
    const nonConcluded = orders.filter((o) => o.status !== 'CONCLUIDO');
    const triagem = orders.filter((o) => o.status === 'TRIAGEM').length;
    const emExecucao = orders.filter((o) => o.status === 'EM_EXECUCAO').length;
    const aguardando = orders.filter((o) => o.status === 'AGUARDANDO').length;
    const concluidos = orders.filter((o) => o.status === 'CONCLUIDO').length;
    const urgentes = orders.filter((o) => o.status !== 'CONCLUIDO' && o.prioridade === 'URGENTE').length;

    return {
      totalOpen: nonConcluded.length,
      triagem,
      emExecucao,
      aguardando,
      concluidos,
      urgentes,
    };
  }, [orders]);

  // Computed Notifications (urgent / pending triage)
  const notifications = useMemo(() => {
    const items: NotificationItem[] = [];
    orders.forEach((o) => {
      if (o.status !== 'CONCLUIDO' && (o.prioridade === 'URGENTE' || o.prioridade === 'ALTA')) {
        items.push({
          id: `notif-${o.id}`,
          orderId: o.id,
          title: `Chamado ${o.prioridade.toLowerCase()}: ${o.titulo}`,
          message: `${o.predio} • Status: ${o.status}`,
          time: o.dataAbertura,
          unread: !readNotificationIds.has(`notif-${o.id}`),
          priority: o.prioridade,
        });
      }
    });
    return items;
  }, [orders, readNotificationIds]);

  // Units with detailed stats
  const unitsWithStats = useMemo<UnitWithStats[]>(() => {
    return units.map((u) => {
      const unitOrders = orders.filter((o) => o.predio.toLowerCase() === u.nome.toLowerCase());
      const openCount = unitOrders.filter((o) => o.status !== 'CONCLUIDO').length;
      const urgentCount = unitOrders.filter((o) => o.status !== 'CONCLUIDO' && o.prioridade === 'URGENTE').length;
      const completedCount = unitOrders.filter((o) => o.status === 'CONCLUIDO').length;
      
      let statusHealth: 'CRITICO' | 'ATENCAO' | 'REGULAR' = 'REGULAR';
      if (urgentCount > 0) {
        statusHealth = 'CRITICO';
      } else if (openCount > 0) {
        statusHealth = 'ATENCAO';
      }

      return {
        ...u,
        openCount,
        urgentCount,
        completedCount,
        totalCount: unitOrders.length,
        statusHealth,
      };
    }).sort((a, b) => {
      if (a.urgentCount !== b.urgentCount) return b.urgentCount - a.urgentCount;
      return b.openCount - a.openCount;
    });
  }, [units, orders]);

  // Units in Attention (top 4 with open tickets sorted desc)
  const unitsAttention = useMemo(() => {
    return unitsWithStats
      .filter((u) => u.openCount > 0)
      .slice(0, 4)
      .map((u) => ({
        name: u.nome,
        openCount: u.openCount,
        urgentCount: u.urgentCount,
      }));
  }, [unitsWithStats]);

  // All Units summary
  const allUnits = useMemo(() => {
    return unitsWithStats.map((u) => ({
      name: u.nome,
      openCount: u.openCount,
      totalCount: u.totalCount,
    }));
  }, [unitsWithStats]);

  return (
    <OrdersContext.Provider
      value={{
        orders,
        units,
        agenda,
        activities,
        notifications,
        isLoadingData,
        refreshData,
        addOrder,
        updateOrder,
        deleteOrder,
        setOrders,
        addUnit,
        addAgendaEvent,
        toggleAgendaItem,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        stats,
        unitsWithStats,
        unitsAttention,
        allUnits,
        allUnitsSummary: allUnits,
        settings,
        updateSettings,
        resetSettings,
        isSidebarCollapsed,
        toggleSidebar,
        setSidebarCollapsed,
        isCopilotOpen,
        openCopilot,
        closeCopilot,
        toggleCopilot,
        exportBackupData,
        importBackupData,
        resetAllData,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}
