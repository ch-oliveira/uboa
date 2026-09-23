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
  Zap, 
  Activity, 
  X, 
  AlertTriangle, 
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/sidebar';
import { Toast } from '@/components/ui/toast';
import { useOrders, type AgendaEvent } from '@/context/orders-context';
import { useAuth } from '@/context/auth-context';
import { type OrdemServico } from './kanban/data';
import { NewOrderModal } from './kanban/new-order-modal';
import { OrderDetailModal } from './kanban/order-detail-modal';
import { UnitModal } from './unit-modal';
import { AllUnitsModal } from './all-units-modal';
import { AgendaModal } from './agenda-modal';
import { ActivitiesModal } from './activities-modal';
import { SolicitanteDashboard } from './solicitante-dashboard';
import { GestorDashboardSkeleton, SolicitanteDashboardSkeleton } from '@/components/skeletons';
import { getPriorityBadge, getStatusBadge } from '@/lib/badges';

type FilterTab = 'TODOS' | 'PRIORIDADES' | 'TRIAGEM' | 'EM_EXECUCAO' | 'AGUARDANDO';

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
  const [activeTab, setActiveTab] = useState<FilterTab>('PRIORIDADES');

  // Modals & Popovers State
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrdemServico | null>(null);
  const [selectedUnitName, setSelectedUnitName] = useState<string | null>(null);
  const [isAllUnitsOpen, setIsAllUnitsOpen] = useState(false);
  const [selectedAgendaEvent, setSelectedAgendaEvent] = useState<AgendaEvent | null>(null);
  const [isActivitiesModalOpen, setIsActivitiesModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
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

  // Filtered orders for the table
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
        case 'PRIORIDADES':
          // Shows urgent or alta, or pending triage/execution
          return order.status !== 'CONCLUIDO' && (order.prioridade === 'URGENTE' || order.prioridade === 'ALTA');
        case 'TRIAGEM':
          return order.status === 'TRIAGEM';
        case 'EM_EXECUCAO':
          return order.status === 'EM_EXECUCAO';
        case 'AGUARDANDO':
          return order.status === 'AGUARDANDO';
        case 'TODOS':
        default:
          return order.status !== 'CONCLUIDO';
      }
    });
  }, [orders, searchQuery, activeTab]);

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
    setActiveTab((prev) => (prev === tab ? 'PRIORIDADES' : tab));
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      
      {/* TOAST FEEDBACK */}
      <Toast message={toastMessage} />

      {/* SIDEBAR */}
      <Sidebar currentRoute="/" />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-white/70 backdrop-blur-md border-b border-slate-100 shrink-0 relative z-30">
          <div className="text-sm text-slate-500 font-medium">
            {isSolicitante ? (
              <>
                <span>{user?.predio || 'Painel da Unidade'}</span>
                <span className="mx-2">/</span>
                <span className="text-slate-800 font-bold">Acompanhamento</span>
              </>
            ) : (
              <>
                Gestão municipal <span className="mx-2">/</span> <span className="text-slate-800 font-bold">Visão geral</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            
            {/* Search Bar with live filter and dropdown */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar chamado ou unidade..." 
                className="w-72 pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6FEB]/20 focus:border-[#1D6FEB] transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}

              {/* Quick search popup */}
              {searchQuery.trim() && searchQuickResults.length > 0 && (
                <div className="absolute top-full mt-2 left-0 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-40 animate-in fade-in slide-in-from-top-2">
                  <div className="text-[11px] font-bold uppercase text-slate-400 px-3 py-1">
                    Resultados instantâneos ({searchQuickResults.length})
                  </div>
                  {searchQuickResults.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => {
                        setSelectedOrder(r);
                        setSearchQuery('');
                      }}
                      className="px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-slate-800 truncate">{r.titulo}</p>
                        <p className="text-[11px] text-slate-500 truncate">{r.predio} • {r.id}</p>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell with interactive popover */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                title="Notificações"
              >
                <Bell size={20} />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white ring-1 ring-red-400 animate-pulse"></span>
                )}
              </button>

              {/* Notifications Popover */}
              {isNotificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-84 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">Alertas e Notificações</span>
                      {unreadNotifsCount > 0 && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          {unreadNotifsCount} novo(s)
                        </span>
                      )}
                    </div>
                    {unreadNotifsCount > 0 && (
                      <button 
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-[#1D6FEB] hover:underline font-semibold"
                      >
                        Ler todas
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        Nenhuma notificação no momento.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id}
                          onClick={() => {
                            markNotificationAsRead(n.id);
                            if (n.orderId) {
                              const found = orders.find((o) => o.id === n.orderId);
                              if (found) setSelectedOrder(found);
                            }
                            setIsNotificationsOpen(false);
                          }}
                          className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 ${
                            n.unread ? 'bg-blue-50/30' : ''
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            n.unread ? 'bg-[#1D6FEB]' : 'bg-transparent'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800">{n.title}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">{n.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

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
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Page Title & Actions */}
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Cuidar da cidade começa aqui.</h1>
              <p className="text-slate-500 mt-2 font-medium">Acompanhe as manutenções de escolas e unidades de saúde.</p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => setIsNewOrderModalOpen(true)}
                className="bg-[#1D6FEB] hover:bg-[#1557BA] text-white rounded-lg px-6 font-semibold shadow-sm h-11 transition-all hover:shadow cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo chamado
              </Button>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 shadow-sm select-none">
                <Calendar className="h-4 w-4 text-slate-400" />
                23 set 2026
              </div>
            </div>
          </div>

          {/* Stat Cards Grid - Interactive click-to-filter */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard 
              icon={<FileText className="text-[#1D6FEB]" size={24} />} 
              title="Chamados abertos" 
              value={String(stats.totalOpen)} 
              subtitle="Em acompanhamento"
              bgColor="bg-blue-50"
              active={activeTab === 'TODOS'}
              onClick={() => handleStatCardClick('TODOS')}
              badgeHint="Clique para listar todos"
            />
            <StatCard 
              icon={<Clock className="text-amber-600" size={24} />} 
              title="Precisam de triagem" 
              value={String(stats.triagem)} 
              subtitle="Aguardando avaliação"
              bgColor="bg-amber-50"
              active={activeTab === 'TRIAGEM'}
              onClick={() => handleStatCardClick('TRIAGEM')}
              badgeHint="Filtrar por triagem"
            />
            <StatCard 
              icon={<Wrench className="text-emerald-600" size={24} />} 
              title="Em execução" 
              value={String(stats.emExecucao)} 
              subtitle="Equipes em campo"
              bgColor="bg-emerald-50/50"
              active={activeTab === 'EM_EXECUCAO'}
              onClick={() => handleStatCardClick('EM_EXECUCAO')}
              badgeHint="Filtrar em execução"
            />
            <StatCard 
              icon={<CheckCircle2 className="text-purple-600" size={24} />} 
              title="Aguardam confirmação" 
              value={String(stats.aguardando)} 
              subtitle="Validação pelas unidades"
              bgColor="bg-purple-50"
              active={activeTab === 'AGUARDANDO'}
              onClick={() => handleStatCardClick('AGUARDANDO')}
              badgeHint="Filtrar aguardando"
            />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-3 gap-6">
            
            {/* Left Column (2 spans) */}
            <div className="col-span-2 space-y-6">
              
              {/* Prioridades de hoje - Interactive Table with Tabs & Modals */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-slate-900">
                      {activeTab === 'PRIORIDADES' ? 'Prioridades de hoje' : 
                       activeTab === 'TRIAGEM' ? 'Chamados em Triagem' :
                       activeTab === 'EM_EXECUCAO' ? 'Chamados em Execução' :
                       activeTab === 'AGUARDANDO' ? 'Aguardando Confirmação' : 'Todos os Chamados'}
                    </h2>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {displayedOrders.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Quick filter pill toggles */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                      <button
                        onClick={() => setActiveTab('PRIORIDADES')}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          activeTab === 'PRIORIDADES' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Prioridades
                      </button>
                      <button
                        onClick={() => setActiveTab('TODOS')}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          activeTab === 'TODOS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Todos
                      </button>
                    </div>

                    <Link href="/kanban" className="text-sm font-semibold text-[#1D6FEB] hover:underline flex items-center ml-2">
                      Ver no Kanban <ChevronRight size={16} className="ml-1" />
                    </Link>
                  </div>
                </div>
                
                <div className="w-full">
                  <div className="grid grid-cols-12 text-xs font-bold text-slate-400 uppercase tracking-wider px-6 py-3 bg-slate-50 border-b border-slate-100">
                    <div className="col-span-4">Chamado</div>
                    <div className="col-span-3">Unidade</div>
                    <div className="col-span-2">Prioridade</div>
                    <div className="col-span-3">Status</div>
                  </div>
                  
                  <div className="divide-y divide-slate-100">
                    {displayedOrders.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-sm">
                        Nenhum chamado encontrado para o filtro selecionado.
                      </div>
                    ) : (
                      displayedOrders.map((order) => (
                        <PriorityRow 
                          key={order.id}
                          order={order}
                          onClick={() => setSelectedOrder(order)}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Unidades em atenção - Dynamic & Clickable */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 flex items-center justify-between border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Unidades em atenção</h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Locais com maior volume de ocorrências ativas
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsAllUnitsOpen(true)}
                    className="text-sm font-semibold text-[#1D6FEB] hover:underline flex items-center"
                  >
                    Ver todas <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  {unitsAttention.length === 0 ? (
                    <p className="text-sm text-slate-400 p-4 text-center">Nenhuma unidade com pendências.</p>
                  ) : (
                    unitsAttention.map((unit) => (
                      <UnitCard 
                        key={unit.name}
                        name={unit.name} 
                        count={`${unit.openCount} chamado(s) aberto(s)`} 
                        urgent={unit.urgentCount > 0}
                        icon={
                          unit.name.startsWith('UBS') ? (
                            <Activity className="text-[#1D6FEB]" size={20} />
                          ) : (
                            <Building2 className="text-[#1D6FEB]" size={20} />
                          )
                        } 
                        onClick={() => setSelectedUnitName(unit.name)}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column (1 span) */}
            <div className="space-y-6">
              
              {/* Agenda de hoje - Interactive checklist & detail modal */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Agenda de hoje</h2>
                    <p className="text-xs text-slate-400 font-medium">Vistorias e intervenções</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {agenda.filter(a => a.completed).length}/{agenda.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {agenda.map((item, idx) => (
                    <React.Fragment key={item.id}>
                      <AgendaItem 
                        item={item}
                        onToggleComplete={() => toggleAgendaItem(item.id)}
                        onClickDetail={() => setSelectedAgendaEvent(item)}
                      />
                      {idx < agenda.length - 1 && <div className="w-full h-px bg-slate-100"></div>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Atividade recente - Connected with live activity events */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 flex items-center justify-between border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900">Atividade recente</h2>
                  <button 
                    onClick={() => setIsActivitiesModalOpen(true)}
                    className="text-sm font-semibold text-[#1D6FEB] hover:underline flex items-center"
                  >
                    Ver todas <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  {activities.slice(0, 3).map((act) => (
                    <ActivityItem 
                      key={act.id}
                      title={act.title} 
                      time={act.time} 
                      icon={
                        act.iconType === 'check' ? (
                          <CheckCircle2 className="text-emerald-600" size={18} />
                        ) : act.iconType === 'alert' ? (
                          <AlertTriangle className="text-red-600" size={18} />
                        ) : (
                          <FileText className="text-slate-500" size={18} />
                        )
                      } 
                      bg={
                        act.iconType === 'check' ? 'bg-emerald-50' :
                        act.iconType === 'alert' ? 'bg-red-50' : 'bg-slate-100'
                      } 
                      onClick={() => setIsActivitiesModalOpen(true)}
                    />
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
        )}
      </main>

      {/* MODALS */}

      {/* 1. New Order Modal */}
      <NewOrderModal 
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        onCreate={handleCreateOrder}
        defaultPredio={user?.predio}
        defaultSolicitante={user?.nome}
      />

      {/* 2. Order Detail / Edit Modal */}
      <OrderDetailModal 
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdate={handleUpdateOrder}
        onDelete={handleDeleteOrder}
      />

      {/* 3. Unit Detail Modal */}
      <UnitModal 
        unitName={selectedUnitName}
        isOpen={!!selectedUnitName}
        onClose={() => setSelectedUnitName(null)}
        orders={orders}
        onSelectOrder={(ord) => setSelectedOrder(ord)}
      />

      {/* 4. All Units Modal */}
      <AllUnitsModal 
        isOpen={isAllUnitsOpen}
        onClose={() => setIsAllUnitsOpen(false)}
        units={allUnits}
        onSelectUnit={(unit) => setSelectedUnitName(unit)}
      />

      {/* 5. Agenda Detail Modal */}
      <AgendaModal 
        event={selectedAgendaEvent}
        isOpen={!!selectedAgendaEvent}
        onClose={() => setSelectedAgendaEvent(null)}
        onToggleComplete={toggleAgendaItem}
      />

      {/* 6. Activities Modal */}
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
  badgeHint 
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: string; 
  subtitle: string; 
  bgColor: string; 
  active?: boolean; 
  onClick?: () => void;
  badgeHint?: string;
}) {
  return (
    <div 
      onClick={onClick}
      title={badgeHint}
      className={`bg-white rounded-2xl p-6 border shadow-sm flex items-start gap-4 cursor-pointer transition-all duration-200 select-none ${
        active 
          ? 'border-[#1D6FEB] ring-2 ring-[#1D6FEB]/30 shadow-md bg-blue-50/10' 
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bgColor}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-slate-700">{title}</h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900">{value}</span>
        </div>
        <p className="text-xs font-medium text-slate-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

function PriorityRow({ order, onClick }: { order: OrdemServico; onClick: () => void }) {
  const statusInfo = getStatusBadge(order.status);

  return (
    <div 
      onClick={onClick}
      className="grid grid-cols-12 items-center px-6 py-4 hover:bg-blue-50/30 transition-colors group cursor-pointer"
    >
      <div className="col-span-4 font-bold text-slate-800 group-hover:text-[#1D6FEB] transition-colors truncate pr-2">
        {order.titulo}
      </div>
      <div className="col-span-3 text-sm font-medium text-slate-500 truncate pr-2">{order.predio}</div>
      <div className="col-span-2 flex items-center">
        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getPriorityBadge(order.prioridade)}`}>
          {order.prioridade}
        </span>
      </div>
      <div className="col-span-3 flex items-center justify-between">
        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${statusInfo.style}`}>
          {statusInfo.label}
        </span>
        <ChevronRight size={16} className="text-slate-300 group-hover:text-[#1D6FEB] group-hover:translate-x-0.5 transition-all" />
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
        return <Zap className="text-[#1D6FEB]" size={20} />;
      case 'hidraulica':
        return <Wrench className="text-[#1D6FEB]" size={20} />;
      default:
        return <CheckCircle2 className="text-[#1D6FEB]" size={20} />;
    }
  };

  return (
    <div className="flex items-center gap-4 group">
      <div 
        onClick={onClickDetail}
        className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 cursor-pointer hover:bg-blue-100 transition-colors"
      >
        {getIcon()}
      </div>
      <div 
        onClick={onClickDetail}
        className="flex-1 cursor-pointer min-w-0"
      >
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-sm font-extrabold ${item.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
            {item.time}
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span className={`text-sm font-bold truncate ${item.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
            {item.title}
          </span>
        </div>
        <p className="text-xs font-medium text-slate-500 truncate">{item.subtitle}</p>
      </div>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete();
        }}
        title={item.completed ? 'Marcar como pendente' : 'Marcar como concluída'}
        className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
          item.completed 
            ? 'bg-emerald-500 border-emerald-500 text-white' 
            : 'border-slate-300 hover:border-[#1D6FEB] hover:bg-blue-50 text-transparent hover:text-[#1D6FEB]'
        }`}
      >
        <Check size={14} className={item.completed ? 'opacity-100' : 'opacity-0 hover:opacity-100'} />
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
      className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 cursor-pointer transition-all group select-none"
    >
      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-slate-800 text-sm truncate">{name}</h4>
          {urgent && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-700">
              Urgente
            </span>
          )}
        </div>
        <p className="text-xs font-medium text-slate-500 mt-0.5">{count}</p>
      </div>
      <ChevronRight size={16} className="text-slate-300 group-hover:text-[#1D6FEB] group-hover:translate-x-0.5 transition-all" />
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
      className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 cursor-pointer transition-all group select-none"
    >
      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-slate-800 text-sm truncate">{title}</h4>
        <p className="text-xs font-medium text-slate-500 mt-0.5">{time}</p>
      </div>
      <ChevronRight size={16} className="text-slate-300 group-hover:text-[#1D6FEB] group-hover:translate-x-0.5 transition-all" />
    </div>
  );
}
