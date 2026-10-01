'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Calendar, 
  Search, 
  Bell, 
  Plus, 
  FileText, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  ChevronRight, 
  ChevronDown,
  Zap, 
  Activity, 
  X, 
  AlertTriangle, 
  Flag,
  Check,
  User,
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/sidebar';
import { Toast } from '@/components/ui/toast';
import { useOrders, type AgendaEvent } from '@/context/orders-context';
import { useAuth } from '@/context/auth-context';
import { type OrdemServico, type Prioridade } from './kanban/data';
import { NewOrderModal } from './kanban/new-order-modal';
import { OrderDetailModal } from './kanban/order-detail-modal';
import { UnitModal } from './unit-modal';
import { AllUnitsModal } from './all-units-modal';
import { AgendaModal } from './agenda-modal';
import { ActivitiesModal } from './activities-modal';
import { SolicitanteDashboard } from './solicitante-dashboard';
import { TopHeader } from '@/components/top-header';
import { GestorDashboardSkeleton, SolicitanteDashboardSkeleton } from '@/components/skeletons';
type FilterTab = 'DECISOES' | 'TRIAGEM' | 'EM_EXECUCAO' | 'VALIDACAO' | 'TODOS';

export default function DashboardPage() {
  const { user, role } = useAuth();
  const isSolicitante = role === 'SOLICITANTE';

  const { 
    orders, 
    agenda, 
    activities, 
    notifications,
    isLoadingData, 
    addOrder, 
    updateOrder, 
    deleteOrder,
    toggleAgendaItem,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    stats,
    unitsAttention,
    allUnits
  } = useOrders();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('DECISOES');

  // Modals & Panels State
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrdemServico | null>(null);
  const [selectedUnitName, setSelectedUnitName] = useState<string | null>(null);
  const [isAllUnitsOpen, setIsAllUnitsOpen] = useState(false);
  const [selectedAgendaEvent, setSelectedAgendaEvent] = useState<AgendaEvent | null>(null);
  const [isActivitiesModalOpen, setIsActivitiesModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCompletedAgendaOpen, setIsCompletedAgendaOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }

  // Triage Queue: pending triage orders
  const pendingTriageOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'TRIAGEM');
  }, [orders]);

  const pendingTriageCount = pendingTriageOrders.length;
  const nextTriageOrder = pendingTriageOrders[0] || null;

  function handleOpenTriageNext() {
    if (nextTriageOrder) {
      setSelectedOrder(nextTriageOrder);
    } else {
      showToast('Nenhum chamado pendente de triagem no momento!');
    }
  }

  function handleTriageNextSequence() {
    const remaining = orders.filter((o) => o.status === 'TRIAGEM' && o.id !== selectedOrder?.id);
    if (remaining.length > 0 && remaining[0]) {
      setSelectedOrder(remaining[0]);
    } else {
      setSelectedOrder(null);
      showToast('Todas as triagens pendentes foram concluídas!');
    }
  }

  // Filtered orders for the table with explicit tabs
  const displayedOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = 
          order.titulo.toLowerCase().includes(q) ||
          order.predio.toLowerCase().includes(q) ||
          order.id.toLowerCase().includes(q) ||
          (order.tecnico && order.tecnico.toLowerCase().includes(q)) ||
          (order.solicitante && order.solicitante.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Tab filter
      switch (activeTab) {
        case 'DECISOES':
          // Fila de decisões de hoje: exibe todos que exigem ação da gestora:
          // 1) Triagem pendente (aparece com Triar)
          // 2) Aguardando validação (aparece com Validar)
          // 3) Urgências e altas ativas
          return order.status !== 'CONCLUIDO' && (
            order.status === 'TRIAGEM' || 
            order.status === 'AGUARDANDO' || 
            order.prioridade === 'URGENTE' || 
            order.prioridade === 'ALTA'
          );
        case 'TRIAGEM':
          return order.status === 'TRIAGEM';
        case 'EM_EXECUCAO':
          return order.status === 'EM_EXECUCAO';
        case 'VALIDACAO':
          return order.status === 'AGUARDANDO';
        case 'TODOS':
        default:
          return order.status !== 'CONCLUIDO';
      }
    });
  }, [orders, searchQuery, activeTab]);;

  // Search quick matching items (for autocomplete dropdown)
  const searchQuickResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return orders.filter(
      (o) =>
        o.titulo.toLowerCase().includes(q) ||
        o.predio.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
    ).slice(0, 4);
  }, [orders, searchQuery]);

  const unreadNotifsCount = useMemo(() => {
    return notifications.filter((n) => n.unread).length;
  }, [notifications]);

  // Agenda separation: Next commitment vs completed
  const upcomingAgenda = useMemo(() => {
    return agenda.filter((item) => !item.completed);
  }, [agenda]);

  const completedAgenda = useMemo(() => {
    return agenda.filter((item) => item.completed);
  }, [agenda]);

  const nextCommitment = upcomingAgenda[0] || null;

  // Deduplicação inteligente de atividades recentes para eliminar poluição visual
  const cleanActivities = useMemo(() => {
    const list: typeof activities = [];
    const seen = new Set<string>();
    for (const act of activities) {
      if (!seen.has(act.title)) {
        seen.add(act.title);
        list.push(act);
      }
    }
    return list.slice(0, 3);
  }, [activities]);

  // Handlers
  function handleCreateOrder(newOrder: OrdemServico) {
    addOrder(newOrder);
    showToast(`Chamado ${newOrder.id} criado com sucesso!`);
  }

  function handleUpdateOrder(updated: OrdemServico) {
    updateOrder(updated);
    showToast(`Chamado ${updated.id} atualizado.`);
  }

  function handleDeleteOrder(orderId: string) {
    deleteOrder(orderId);
    showToast(`Chamado ${orderId} removido.`);
  }

  function handleStatCardClick(tab: FilterTab) {
    setActiveTab((prev) => (prev === tab ? 'DECISOES' : tab));
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      
      {/* TOAST FEEDBACK */}
      <Toast message={toastMessage} />

      {/* SIDEBAR */}
      <Sidebar currentRoute="/" />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
        <TopHeader 
          titleOverride="Hoje"
          breadcrumbs={[
            { label: 'Gestão municipal', href: '/' },
            { label: 'Hoje' },
          ]}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectOrder={setSelectedOrder}
        />

        {/* Scrollable Content Area */}
        {isLoadingData ? (
          isSolicitante ? (
            <SolicitanteDashboardSkeleton />
          ) : (
            <GestorDashboardSkeleton />
          )
        ) : isSolicitante ? (
          <SolicitanteDashboard 
            onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
            onSelectOrder={(ord) => setSelectedOrder(ord)}
            showToast={showToast}
          />
        ) : (
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {/* CABEÇALHO DA PÁGINA (Padrão Ouro UI/UX) */}
          <div className="bg-muted/50 rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {pendingTriageCount > 0 
                  ? 'Decisões da Zeladoria' 
                  : 'Visão Geral'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {pendingTriageCount > 0 
                  ? `Você tem ${pendingTriageCount} chamado(s) aguardando triagem. Priorize com apoio inteligente.`
                  : 'Acompanhe o deslocamento das equipes e o volume operacional.'}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {pendingTriageCount > 0 && (
                <Button
                  onClick={handleOpenTriageNext}
                  className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Sparkles size={14} />
                  <span>Triar próximo</span>
                  <ArrowRight size={14} />
                </Button>
              )}
              <Button
                onClick={() => setIsNewOrderModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus size={14} />
                <span>Novo chamado</span>
              </Button>
            </div>
          </div>

          {/* SEÇÃO 2: STAT CARDS COM PERGUNTAS EXPLÍCITAS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            {/* Bloco 1: O que temos hoje? */}
            <div>
              <h3 className="flex items-center gap-4 mb-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
                  Volume Operacional
                </span>
                <div className="h-px flex-1 bg-border/40"></div>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard 
                  icon={<Wrench className="text-primary" size={20} />} 
                  title="Em execução" 
                  value={String(stats.emExecucao)} 
                  subtitle="Equipes técnicas ativas no local"
                  bgColor="bg-primary/10"
                  active={activeTab === 'EM_EXECUCAO'}
                  onClick={() => handleStatCardClick('EM_EXECUCAO')}
                  badgeHint="Filtrar chamados em execução"
                  tag="Em campo"
                  tagColor="bg-muted text-muted-foreground"
                />
                <StatCard 
                  icon={<CheckCircle2 className="text-purple-700" size={20} />} 
                  title="Precisam de validação" 
                  value={String(orders.filter(o => o.status === 'AGUARDANDO').length)} 
                  subtitle="Aguardando confirmação da unidade"
                  bgColor="bg-purple-50"
                  active={activeTab === 'VALIDACAO'}
                  onClick={() => handleStatCardClick('VALIDACAO')}
                  badgeHint="Filtrar chamados aguardando validação"
                  tag={orders.filter(o => o.status === 'AGUARDANDO').length > 0 ? "Pendente aceite" : "Em dia"}
                  tagColor="bg-purple-100 text-purple-800"
                />
              </div>
            </div>

            {/* Bloco 2: Tomadas de decisão */}
            <div>
              <h3 className="flex items-center gap-4 mb-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
                  Requer Atenção
                </span>
                <div className="h-px flex-1 bg-border/40"></div>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard 
                  icon={stats.urgentes > 0 ? <AlertTriangle className="text-red-600" size={20} /> : <CheckCircle2 className="text-emerald-600" size={20} />} 
                  title="Urgências ativas" 
                  value={String(stats.urgentes)} 
                  subtitle={stats.urgentes > 0 ? "SLA crítico de 4 horas" : "Nenhuma ocorrência crítica ativa"}
                  bgColor={stats.urgentes > 0 ? "bg-red-50" : "bg-emerald-50/60"}
                  active={activeTab === 'DECISOES'}
                  onClick={() => handleStatCardClick('DECISOES')}
                  badgeHint="Filtrar fila de decisões"
                  tag={stats.urgentes > 0 ? "SLA 4h" : "0 críticas"}
                  tagColor={stats.urgentes > 0 ? "bg-red-100 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}
                />
                <StatCard 
                  icon={<Clock className="text-primary" size={20} />} 
                  title="Aguardam triagem" 
                  value={String(stats.triagem)} 
                  subtitle="Novas ocorrências sem triagem técnica"
                  bgColor="bg-primary/10"
                  active={activeTab === 'TRIAGEM'}
                  onClick={() => handleStatCardClick('TRIAGEM')}
                  badgeHint="Filtrar chamados em triagem"
                  tag={stats.triagem > 0 ? "Ação imediata" : "Em dia"}
                  tagColor={stats.triagem > 0 ? "bg-amber-100 text-amber-900 border border-amber-300" : "bg-emerald-50 text-emerald-700"}
                />
              </div>
            </div>

          </div>

          {/* SEÇÃO 3: GRID PRINCIPAL (TABELA DE CHAMADOS + AGENDA & UNIDADES) */}
          <div>
            <h3 className="flex items-center gap-4 mb-6 pt-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
                Acompanhamento e Próximos Passos
              </span>
              <div className="h-px flex-1 bg-border/40"></div>
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Coluna Esquerda: Tabela de Prioridades com Contexto Completo para Agir (2 colunas) */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="border border-border bg-card rounded-xl overflow-hidden flex flex-col shadow-sm">
                
                {/* Header da Tabela */}
                <div className="flex flex-col sm:flex-row gap-4 p-5 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-sm font-semibold text-foreground">
                      {activeTab === 'DECISOES' ? (
                        pendingTriageCount > 0 || orders.filter(o => o.status === 'AGUARDANDO').length > 0
                          ? 'Fila de Decisões'
                          : 'Operações em Andamento'
                       ) : 
                       activeTab === 'TRIAGEM' ? 'Aguardam Triagem' :
                       activeTab === 'EM_EXECUCAO' ? 'Em Execução' :
                       activeTab === 'VALIDACAO' ? 'Precisam de Validação' : 'Todos os Chamados'}
                    </h2>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                      {displayedOrders.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto sm:ml-auto pb-1 sm:pb-0">
                    {/* Abas de filtro rápido com contadores claros */}
                    <div className="flex items-center bg-muted/50 p-1 rounded-lg text-[11px] font-medium gap-0.5 shrink-0">
                      <button
                        onClick={() => setActiveTab('DECISOES')}
                        className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                          activeTab === 'DECISOES' ? 'bg-background text-primary font-semibold shadow-sm ring-1 ring-primary/10' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Prioridades
                      </button>
                      <button
                        onClick={() => setActiveTab('TRIAGEM')}
                        className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                          activeTab === 'TRIAGEM' ? 'bg-background text-primary font-semibold shadow-sm ring-1 ring-primary/10' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Triagem
                      </button>
                      <button
                        onClick={() => setActiveTab('VALIDACAO')}
                        className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                          activeTab === 'VALIDACAO' ? 'bg-background text-primary font-semibold shadow-sm ring-1 ring-primary/10' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Validação
                      </button>
                      <button
                        onClick={() => setActiveTab('TODOS')}
                        className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                          activeTab === 'TODOS' ? 'bg-background text-primary font-semibold shadow-sm ring-1 ring-primary/10' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Todos
                      </button>
                    </div>

                    <Link 
                      href="/chamados" 
                      className="text-[11px] font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 shrink-0 ml-2"
                    >
                      <span>Kanban</span>
                      <ChevronRight size={11} />
                    </Link>
                  </div>
                </div>
                
                {/* Linhas da Tabela com Responsável, Prazo e Próximo Passo */}
                <div className="w-full">
                  <div className="grid grid-cols-12 text-[10px] font-bold text-foreground/80 uppercase tracking-wider px-6 py-3 border-b border-border bg-muted">
                    <div className="col-span-5">Chamado & Unidade</div>
                    <div className="col-span-2">Prioridade</div>
                    <div className="col-span-3">Responsável & Prazo</div>
                    <div className="col-span-2 text-right">Ação imediata</div>
                  </div>
                  
                  <div className="divide-y divide-[#E2E8F0]">
                    {displayedOrders.length === 0 ? (
                      <div className="p-8 text-center text-[#475569] text-sm">
                        Nenhum chamado encontrado para o filtro selecionado.
                      </div>
                    ) : (
                      displayedOrders.map((order) => (
                        <PriorityRow 
                          key={order.id}
                          order={order}
                          onOpenDetail={() => setSelectedOrder(order)}
                        />
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Unidades em atenção - Destaque para Pendências e Urgências */}
              <div className="ds-card overflow-hidden">
                <div className="ds-card-header">
                  <div>
                    <h2 className="ds-section-title">Unidades em atenção</h2>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                      Locais com maior volume de ocorrências e urgências ativas
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsAllUnitsOpen(true)}
                    className="text-xs font-bold text-[#0A2540] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver todas ({allUnits.length})</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="p-4 space-y-2.5">
                  {unitsAttention.length === 0 ? (
                    <p className="text-xs text-[#475569] p-4 text-center">Nenhuma unidade com pendências críticas.</p>
                  ) : (
                    unitsAttention.map((unit) => (
                      <UnitCard 
                        key={unit.name}
                        name={unit.name} 
                        count={`${unit.openCount} chamado(s) pendente(s)`} 
                        urgent={unit.urgentCount > 0}
                        icon={
                          unit.name.startsWith('UBS') ? (
                            <Activity className="text-[#0A2540]" size={18} />
                          ) : (
                            <Building2 className="text-[#0A2540]" size={18} />
                          )
                        } 
                        onClick={() => setSelectedUnitName(unit.name)}
                      />
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Coluna Direita: Agenda Inteligente (Próximo Compromisso + Concluídos Recolhidos) e Atividades */}
            <div className="space-y-6">
              
              {/* Agenda de hoje */}
              <div className="border border-border bg-card rounded-xl p-5 space-y-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Agenda de hoje</h2>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Vistorias programadas</p>
                  </div>
                  <span className="text-[11px] font-medium px-2 py-1 rounded-md bg-muted text-muted-foreground">
                    {completedAgenda.length}/{agenda.length} concluídas
                  </span>
                </div>

                {/* PRÓXIMO COMPROMISSO (EM DESTAQUE) */}
                {nextCommitment ? (
                  <div className="rounded-lg p-4 border border-border bg-muted/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px] font-medium text-primary">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Próximo compromisso
                      </span>
                      <span className="text-[11px] font-medium text-foreground">{nextCommitment.time}</span>
                    </div>

                    <div>
                      <h4 className="text-[13px] font-medium text-foreground">{nextCommitment.title}</h4>
                      <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5">
                        <Building2 size={11} className="shrink-0 opacity-70" />
                        <span>{nextCommitment.subtitle}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border mt-3 text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                        <User size={11} className="opacity-70" />
                        <span>{nextCommitment.tecnico || 'Equipe técnica'}</span>
                      </div>

                      <button
                        onClick={() => toggleAgendaItem(nextCommitment.id)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-md text-[11px] font-medium flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                      >
                        <Check size={11} />
                        <span>Concluir</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg p-4 border border-border flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-emerald-500 mt-0.5" />
                    <div>
                      <h4 className="text-[13px] font-medium text-foreground">Vistorias concluídas!</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Todas as {agenda.length} programadas foram finalizadas.</p>
                    </div>
                  </div>
                )}

                {/* DEMAIS COMPROMISSOS PENDENTES (se houver mais de 1) */}
                {upcomingAgenda.length > 1 && (
                  <div className="space-y-3 pt-1">
                    <p className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                      Compromissos seguintes ({upcomingAgenda.length - 1})
                    </p>
                    {upcomingAgenda.slice(1).map((item) => (
                      <AgendaItem 
                        key={item.id}
                        item={item}
                        onToggleComplete={() => toggleAgendaItem(item.id)}
                        onClickDetail={() => setSelectedAgendaEvent(item)}
                      />
                    ))}
                  </div>
                )}

                {/* VISITAS CONCLUÍDAS HOJE (RECOLHIDAS POR PADRÃO) */}
                {completedAgenda.length > 0 && (
                  <div className="pt-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setIsCompletedAgendaOpen(!isCompletedAgendaOpen)}
                      className="w-full flex items-center justify-between text-xs font-bold text-muted-foreground hover:text-foreground py-2 cursor-pointer transition-colors select-none"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-primary" />
                        <span>Visitas concluídas hoje ({completedAgenda.length})</span>
                      </div>
                      <ChevronDown 
                        size={15} 
                        className={`transition-transform duration-200 ${isCompletedAgendaOpen ? 'rotate-180' : ''}`} 
                      />
                    </button>

                    {isCompletedAgendaOpen && (
                      <div className="space-y-3 pt-2">
                        {completedAgenda.map((item) => (
                          <AgendaItem 
                            key={item.id}
                            item={item}
                            onToggleComplete={() => toggleAgendaItem(item.id)}
                            onClickDetail={() => setSelectedAgendaEvent(item)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Atividade recente */}
              <div className="ds-card overflow-hidden">
                <div className="ds-card-header">
                  <h2 className="ds-section-title">Atividade recente</h2>
                  <button 
                    onClick={() => setIsActivitiesModalOpen(true)}
                    className="text-xs font-bold text-[#0A2540] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver todas</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
                <div className="p-4 space-y-2.5">
                  {cleanActivities.map((act) => (
                    <ActivityItem 
                      key={act.id}
                      title={act.title} 
                      time={act.time} 
                      icon={
                        act.iconType === 'check' ? (
                          <CheckCircle2 className="text-[#0A2540]" size={16} />
                        ) : act.iconType === 'alert' ? (
                          <AlertTriangle className="text-[#DC2626]" size={16} />
                        ) : (
                          <FileText className="text-[#475569]" size={16} />
                        )
                      } 
                      bg={
                        act.iconType === 'check' ? 'bg-[#F1F5F9]' :
                        act.iconType === 'alert' ? 'bg-[#FEECEB]' : 'bg-[#F8FAFC]'
                      } 
                      onClick={() => setIsActivitiesModalOpen(true)}
                    />
                  ))}
                </div>
              </div>

            </div>
            </div>
          </div>

        </div>
        )}
      </main>

      {/* MODALS AUXILIARES */}

      {/* 1. Novo Chamado */}
      <NewOrderModal 
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        onCreate={handleCreateOrder}
        defaultPredio={user?.predio}
        defaultSolicitante={user?.nome}
        onOpenOrder={(ord) => {
          setIsNewOrderModalOpen(false);
          setSelectedOrder(ord);
        }}
        onStartTriage={(ord) => {
          setIsNewOrderModalOpen(false);
          setSelectedOrder(ord);
        }}
      />

      {/* 2. Detalhes Completos da OS & Triagem Fluida */}
      <OrderDetailModal 
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdate={handleUpdateOrder}
        onDelete={handleDeleteOrder}
        onNextOrder={handleTriageNextSequence}
        hasNextOrder={pendingTriageCount > 1 || (selectedOrder?.status === 'TRIAGEM' && pendingTriageOrders.some(o => o.id !== selectedOrder.id))}
      />

      {/* 3. Modal da Unidade */}
      <UnitModal 
        unitName={selectedUnitName}
        isOpen={!!selectedUnitName}
        onClose={() => setSelectedUnitName(null)}
        orders={orders}
        onSelectOrder={(ord) => setSelectedOrder(ord)}
      />

      {/* 4. Todas as Unidades */}
      <AllUnitsModal 
        isOpen={isAllUnitsOpen}
        onClose={() => setIsAllUnitsOpen(false)}
        units={allUnits}
        onSelectUnit={(unit) => setSelectedUnitName(unit)}
      />

      {/* 5. Modal da Agenda */}
      <AgendaModal 
        event={selectedAgendaEvent}
        isOpen={!!selectedAgendaEvent}
        onClose={() => setSelectedAgendaEvent(null)}
        onToggleComplete={toggleAgendaItem}
      />

      {/* 6. Modal de Atividades */}
      <ActivitiesModal 
        isOpen={isActivitiesModalOpen}
        onClose={() => setIsActivitiesModalOpen(false)}
        activities={activities}
      />

    </div>
  );
}

// Subcomponents

function StatCard({ 
  icon, 
  title, 
  value, 
  subtitle, 
  bgColor, 
  active = false, 
  onClick, 
  badgeHint,
  tag,
  tagColor 
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: string; 
  subtitle: string; 
  bgColor: string; 
  active?: boolean; 
  onClick?: () => void; 
  badgeHint?: string; 
  tag?: string; 
  tagColor?: string; 
}) {
  return (
    <div 
      onClick={onClick}
      title={badgeHint}
      className={`relative p-4.5 flex flex-col justify-between cursor-pointer transition-all duration-200 select-none group border rounded-xl ${
        active 
          ? 'bg-card border-primary ring-1 ring-primary shadow-sm' 
          : 'bg-card border-border hover:border-foreground/20 shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`text-muted-foreground group-hover:text-foreground transition-colors`}>
          {icon}
        </div>
        {tag && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
            active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          }`}>
            {tag}
          </span>
        )}
      </div>

      <div>
        <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-semibold text-foreground tracking-tight">{value}</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{subtitle}</p>
      </div>
    </div>
  );
}

function PriorityRow({ 
  order, 
  onOpenDetail 
}: { 
  order: OrdemServico; 
  onOpenDetail: () => void; 
}) {
  const isUrgente = order.prioridade === 'URGENTE';
  const isAlta = order.prioridade === 'ALTA';
  const cleanId = order.id.replace(/^(os-|OS-)/i, '');

  return (
    <div 
      onClick={onOpenDetail}
      className="grid grid-cols-12 items-center px-6 py-3 hover:bg-muted/50 transition-colors group cursor-pointer border-b border-border last:border-0"
    >
      {/* 1. Chamado & Unidade */}
      <div className="col-span-5 pr-3 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-medium text-muted-foreground uppercase">
            #{cleanId}
          </span>
          <h4 className="text-[13px] font-medium text-foreground truncate">
            {order.titulo}
          </h4>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5 truncate flex items-center gap-1.5">
          <Building2 size={11} className="shrink-0 opacity-70" />
          <span>{order.predio}</span>
        </p>
      </div>

      {/* 2. Prioridade */}
      <div className="col-span-2 flex items-center">
          {isUrgente ? (
            <div className="flex items-center gap-1.5 text-foreground text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
              Urgente
            </div>
          ) : isAlta ? (
            <div className="flex items-center gap-1.5 text-foreground text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              Alta
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Média
            </div>
          )}
      </div>

      {/* 3. Quem cuida disso & Prazo */}
      <div className="col-span-3 pr-2 min-w-0">
        {order.tecnico ? (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground truncate">
            <User size={11} className="text-muted-foreground shrink-0" />
            <span className="truncate">{order.tecnico}</span>
          </div>
        ) : order.status === 'EM_EXECUCAO' ? (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground truncate">
            <User size={11} className="text-muted-foreground shrink-0" />
            <span className="truncate">Equipe Operacional</span>
          </div>
        ) : (
          <span className="text-[11px] font-medium text-muted-foreground">
            {order.status === 'TRIAGEM' ? 'Definir na triagem' : 'Definir no planejamento'}
          </span>
        )}
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
          <Clock size={10} className="opacity-70 shrink-0" />
          <span>SLA: Hoje 18:00</span>
        </div>
      </div>

      {/* 4. Próximo passo / Ação rápida */}
      <div className="col-span-2 flex items-center justify-end">
        {order.status === 'TRIAGEM' ? (
          <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors shadow-sm">
            <span>Triar chamado</span>
            <ArrowRight size={11} />
          </span>
        ) : order.status === 'AGENDADO' ? (
          <span className="inline-flex items-center gap-1.5 hover:bg-muted text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer">
            <span>Escalar equipe</span>
            <ArrowRight size={11} />
          </span>
        ) : order.status === 'EM_EXECUCAO' ? (
          <span className="inline-flex items-center gap-1.5 hover:bg-muted text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer">
            <span>Acompanhar</span>
            <ArrowRight size={11} />
          </span>
        ) : order.status === 'AGUARDANDO' ? (
          <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors shadow-sm">
            <CheckCircle2 size={11} />
            <span>Validar</span>
            <ArrowRight size={11} />
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-muted-foreground text-[11px] font-medium">
            <span>Finalizado</span>
            <Check size={11} />
          </span>
        )}
      </div>
    </div>
  );
}

function AgendaItem({ 
  item, 
  onToggleComplete, 
  onClickDetail 
}: { 
  item: AgendaEvent; 
  onToggleComplete: () => void; 
  onClickDetail: () => void; 
}) {
  const getIcon = () => {
    switch (item.type) {
      case 'eletrica':
        return <Zap className="text-muted-foreground" size={14} />;
      case 'hidraulica':
        return <Wrench className="text-muted-foreground" size={14} />;
      default:
        return <CheckCircle2 className="text-muted-foreground" size={14} />;
    }
  };

  return (
    <div className="flex items-center gap-3 group">
      <div 
        onClick={onClickDetail}
        className="w-8 h-8 rounded-lg border border-border bg-card flex items-center justify-center shrink-0 cursor-pointer hover:bg-muted/50 transition-colors"
      >
        {getIcon()}
      </div>
      <div 
        onClick={onClickDetail}
        className="flex-1 cursor-pointer min-w-0"
      >
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-semibold ${item.completed ? 'line-through text-muted-foreground opacity-50' : 'text-foreground'}`}>
            {item.time}
          </span>
          <span className="w-1 h-1 rounded-full bg-border"></span>
          <span className={`text-[11px] font-medium truncate ${item.completed ? 'line-through text-muted-foreground opacity-50' : 'text-foreground'}`}>
            {item.title}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground truncate">{item.subtitle}</p>
      </div>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete();
        }}
        title={item.completed ? 'Marcar como pendente' : 'Marcar como concluída'}
        className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all cursor-pointer ${
          item.completed 
            ? 'bg-primary border-primary text-primary-foreground' 
            : 'border-border hover:border-primary hover:text-primary text-transparent'
        }`}
      >
        <Check size={12} className={item.completed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
      </button>
    </div>
  );
}

function UnitCard({ 
  name, 
  count, 
  urgent, 
  icon, 
  onClick 
}: { 
  name: string; 
  count: string; 
  urgent?: boolean; 
  icon: React.ReactNode; 
  onClick: () => void; 
}) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/30 cursor-pointer transition-all group select-none shadow-sm"
    >
      <div className="w-9 h-9 rounded-lg border border-border bg-background flex items-center justify-center shrink-0 text-muted-foreground">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-[13px] text-foreground truncate">{name}</h4>
          {urgent && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-red-500">
              <span className="w-1 h-1 rounded-full bg-red-500" />
              Urgente
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">{count}</p>
      </div>
      <ChevronRight size={14} className="text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
    </div>
  );
}

function ActivityItem({ 
  title, 
  time, 
  icon, 
  bg, 
  onClick 
}: { 
  title: string; 
  time: string; 
  icon: React.ReactNode; 
  bg: string; 
  onClick: () => void; 
}) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card hover:bg-muted/30 cursor-pointer transition-all group select-none shadow-sm"
    >
      <div className={`w-8 h-8 rounded-md ${bg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-[13px] text-foreground truncate">{title}</h4>
        <p className="text-[11px] text-muted-foreground mt-0.5">{time}</p>
      </div>
      <ChevronRight size={12} className="text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
    </div>
  );
}
