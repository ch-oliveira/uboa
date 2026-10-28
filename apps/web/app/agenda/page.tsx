'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Check, 
  Search,
  LayoutList,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  User,
  Users,
  MapPin,
  Link2,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  CloudRain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/toast';
import { Sidebar } from '@/components/sidebar';
import { useOrders, type AgendaEvent } from '@/context/orders-context';
import { useAuth } from '@/context/auth-context';
import { type OrdemServico } from '../kanban/data';
import { OrderDetailModal } from '../kanban/order-detail-modal';
import { NewAgendaModal } from './new-agenda-modal';
import { AgendaModal } from '../agenda-modal';
import { TopHeader } from '@/components/top-header';
import { TriggerContingencyModal } from '@/components/contingency/trigger-contingency-modal';
import { apiClient } from '@/lib/api-client';

export default function AgendaPage() {
  const { user, role } = useAuth();
  const isTecnico = role === 'TECNICO';

  const { 
    agenda, 
    orders,
    updateOrder,
    toggleAgendaItem, 
    addAgendaEvent,
    refreshData,
  } = useOrders();

  // State: default to technician's schedule if logged in as TECNICO
  const [teamFilter, setTeamFilter] = useState(isTecnico ? (user?.nome || 'Carlos Silva') : 'ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'ROTINA' | 'CONTINGENCIA_CLIMA'>('ALL');
  const [viewMode, setViewMode] = useState<'semana' | 'lista'>('semana');
  const [searchQuery, setSearchQuery] = useState('');
  const [weekOffset, setWeekOffset] = useState(0); // 0 = Semana Atual (Hoje)

  // Defesa Civil Contingency State
  const [isContingencyModalOpen, setIsContingencyModalOpen] = useState(false);
  const [contingencyAlerts, setContingencyAlerts] = useState<any[]>([]);

  const loadAlerts = useCallback(async () => {
    try {
      const res = await apiClient.getContingencyAlerts();
      if (res.success && Array.isArray(res.data)) {
        setContingencyAlerts(res.data);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<OrdemServico | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }

  // Linked order for selected agenda event
  const linkedOrder = useMemo(() => {
    if (!selectedEvent) return null;
    return orders.find(o => 
      (selectedEvent.orderId && o.id === selectedEvent.orderId) ||
      o.predio.toLowerCase().includes(selectedEvent.subtitle.toLowerCase()) ||
      selectedEvent.subtitle.toLowerCase().includes(o.predio.toLowerCase())
    ) || null;
  }, [selectedEvent, orders]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return agenda.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = 
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.time.includes(q);
        if (!matches) return false;
      }

      if (teamFilter !== 'ALL' && item.tecnico && item.tecnico !== teamFilter) {
        return false;
      }

      if (categoryFilter === 'CONTINGENCIA_CLIMA' && item.categoriaVistoria !== 'CONTINGENCIA_CLIMA') {
        return false;
      }
      if (categoryFilter === 'ROTINA' && item.categoriaVistoria === 'CONTINGENCIA_CLIMA') {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (a.categoriaVistoria === 'CONTINGENCIA_CLIMA' && b.categoriaVistoria !== 'CONTINGENCIA_CLIMA') return -1;
      if (b.categoriaVistoria === 'CONTINGENCIA_CLIMA' && a.categoriaVistoria !== 'CONTINGENCIA_CLIMA') return 1;
      return a.time.localeCompare(b.time);
    });
  }, [agenda, searchQuery, teamFilter, categoryFilter]);

  // Dynamic Week Days (Segunda a Sexta - 5 dias)
  const weekDays = useMemo(() => {
    const baseSegunda = 21 + (weekOffset * 7);
    
    // Distribuição precisa baseada no scheduledTime/time de cada evento real da API
    const segundaEvents: AgendaEvent[] = [];
    const tercaEvents: AgendaEvent[] = [];
    const quartaEvents: AgendaEvent[] = []; // Hoje
    const quintaEvents: AgendaEvent[] = []; // Amanhã
    const sextaEvents: AgendaEvent[] = [];

    filteredEvents.forEach((event) => {
      const t = (event.time || '').toLowerCase();
      if (event.categoriaVistoria === 'CONTINGENCIA_CLIMA') {
        quartaEvents.push(event); // Vistorias de emergência sempre visíveis no dia de Hoje
      } else if (t.includes('seg')) {
        segundaEvents.push(event);
      } else if (t.includes('ter')) {
        tercaEvents.push(event);
      } else if (t.includes('hoje') || t.includes('qua')) {
        quartaEvents.push(event);
      } else if (t.includes('amanhã') || t.includes('amanha') || t.includes('qui')) {
        quintaEvents.push(event);
      } else if (t.includes('sex')) {
        sextaEvents.push(event);
      } else {
        quartaEvents.push(event);
      }
    });

    return [
      {
        key: 'seg',
        dayLabel: 'SEG',
        dayNumber: String(baseSegunda),
        isToday: false,
        events: [] as AgendaEvent[],
      },
      {
        key: 'ter',
        dayLabel: 'TER',
        dayNumber: String(baseSegunda + 1),
        isToday: false,
        events: tercaEvents,
      },
      {
        key: 'qua',
        dayLabel: 'QUA',
        dayNumber: String(baseSegunda + 2),
        isToday: weekOffset === 0,
        events: quartaEvents,
      },
      {
        key: 'qui',
        dayLabel: 'QUI',
        dayNumber: String(baseSegunda + 3),
        isToday: false,
        events: quintaEvents,
      },
      {
        key: 'sex',
        dayLabel: 'SEX',
        dayNumber: String(baseSegunda + 4),
        isToday: false,
        events: sextaEvents,
      },
    ];
  }, [weekOffset, filteredEvents]);

  // Contagem para o cabeçalho
  const completedTodayCount = agenda.filter(a => a.completed).length;
  const totalTodayCount = agenda.length;

  const contingencyInspections = useMemo(() => {
    return agenda.filter(a => a.categoriaVistoria === 'CONTINGENCIA_CLIMA');
  }, [agenda]);

  const contingencyMitigated = useMemo(() => {
    return contingencyInspections.filter(a => a.riscoMitigado).length;
  }, [contingencyInspections]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      
      {/* Toast */}
      <Toast message={toastMessage} />

      {/* Sidebar */}
      <Sidebar currentRoute="/agenda" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header Global */}
        <TopHeader 
          titleOverride={isTecnico ? 'Minha Agenda Técnica' : 'Agenda e Planejamento'}
          breadcrumbs={[
            { label: isTecnico ? 'Operação de campo' : 'Gestão municipal', href: '/' },
            { label: isTecnico ? 'Minha Agenda Técnica' : 'Agenda e Planejamento' },
          ]}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectOrder={setSelectedOrderForModal}
        />

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">

          {/* CABEÇALHO DA PÁGINA (Padrão Ouro UI/UX) */}
          <div data-tour="agenda-header" className="bg-muted/50 rounded-2xl p-4 sm:p-6 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {isTecnico ? 'Minha Agenda & Rota Técnica' : 'Agenda e Planejamento'}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {isTecnico 
                  ? 'Consulte seus horários de vistoria, locais de atendimento e rota diária.'
                  : 'Programe as visitas técnicas e otimize o trabalho em campo.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Button 
                onClick={() => setIsContingencyModalOpen(true)}
                variant="outline"
                className="w-full sm:w-auto justify-center border-rose-300 dark:border-rose-900 bg-rose-50/80 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 text-rose-700 dark:text-rose-300 rounded-xl px-4 py-2 font-semibold text-xs shadow-2xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <ShieldAlert className="h-4 w-4 text-rose-600" />
                <span>Plano de Contingência (Defesa Civil)</span>
              </Button>

              <Button 
                onClick={() => setIsNewModalOpen(true)}
                className="w-full sm:w-auto justify-center bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4 py-2 font-semibold text-sm shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {isTecnico ? 'Apontar vistoria avulsa' : 'Agendar visita'}
              </Button>
            </div>
          </div>

          {/* BANNER DE MONITORAMENTO DEFESA CIVIL & CLIMA */}
          {(contingencyAlerts.length > 0 || contingencyInspections.length > 0) && (
            <div className="p-4 rounded-2xl bg-linear-to-r from-rose-50 via-orange-50 to-amber-50 dark:from-rose-950/40 dark:via-orange-950/30 dark:to-amber-950/20 border border-rose-200/80 dark:border-rose-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-rose-900 dark:text-rose-300">
                      Defesa Civil Municipal · Alerta Climático Ativo
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200/80 text-rose-900 dark:bg-rose-900 dark:text-rose-200 uppercase tracking-wider">
                      {contingencyAlerts[0]?.nivel || 'PERIGO'}
                    </span>
                    {contingencyInspections.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {contingencyMitigated} de {contingencyInspections.length} riscos mitigados ({Math.round((contingencyMitigated / (contingencyInspections.length || 1)) * 100)}%)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-rose-800/90 dark:text-rose-400 mt-0.5">
                    {contingencyAlerts[0]?.titulo 
                      ? `${contingencyAlerts[0].titulo}: ${contingencyAlerts[0].descricao}`
                      : 'Previsão de tempestade severa e ventos fortes. Equipes técnicas em alerta para desobstrução de calhas, geradores e contenção predial.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  onClick={() => setIsContingencyModalOpen(true)}
                  className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-3.5 py-2 shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CloudRain size={14} />
                  <span>Disparar vistorias preventivas</span>
                </Button>
              </div>
            </div>
          )}

          {/* Subtitle Stats & Controls: Week Navigator + View Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-extrabold text-foreground">
                  {weekOffset === 0 ? '21–25 de setembro' : `Semana de ${21 + weekOffset * 7} a ${25 + weekOffset * 7}`}
                </h2>
                {weekOffset === 0 && (
                  <span className="text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Semana atual
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 font-medium">
                {weekOffset === 0 
                  ? `${completedTodayCount} de ${totalTodayCount} visitas realizadas (sincronizado com Hoje)`
                  : 'Planejamento de visitas e manutenções preventivas'}
              </p>
            </div>

            {/* Controles de Semana e Visualização */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Controles de navegação de semana */}
              <div className="flex items-center bg-input border border-border rounded-xl shadow-2xs p-1">
                <button
                  type="button"
                  onClick={() => setWeekOffset(prev => prev - 1)}
                  title="Semana anterior"
                  className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setWeekOffset(0)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    weekOffset === 0 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={() => setWeekOffset(prev => prev + 1)}
                  title="Próxima semana"
                  className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Segmented View Switcher: Semana / Lista */}
              <div className="bg-muted p-1 rounded-xl flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode('semana')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'semana'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <CalendarDays size={15} />
                  <span>Semana</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('lista')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'lista'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <LayoutList size={15} />
                  <span>Lista</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filter Bar: Equipe & Categoria */}
          <div data-tour="agenda-filters" className="flex flex-wrap items-center gap-3">
            <div className="bg-card border border-border rounded-xl p-3 shadow-2xs">
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Filtrar por equipe
              </label>
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="bg-background border border-border rounded-md px-3 py-1.5 text-xs font-medium text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer shadow-2xs"
              >
                {isTecnico && (
                  <option value={user?.nome || 'Carlos Silva'}>
                    Minha agenda ({user?.nome || 'Carlos Silva'})
                  </option>
                )}
                <option value="ALL">Todas as equipes da base</option>
                {!isTecnico && <option value="Carlos Silva">Manutenção elétrica (Carlos)</option>}
                <option value="Roberto Santos">Manutenção hidráulica (Roberto)</option>
                <option value="Lucas Pereira">Engenharia predial (Lucas)</option>
                <option value="Marcos Oliveira">Zeladoria geral (Marcos)</option>
              </select>
            </div>

            {/* Filtro de Categoria: Todas / Rotina / Defesa Civil */}
            <div className="bg-card border border-border rounded-xl p-3 shadow-2xs flex flex-col justify-between">
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Tipo de Vistoria
              </label>
              <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('ALL')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    categoryFilter === 'ALL'
                      ? 'bg-background text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Todas ({agenda.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('ROTINA')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    categoryFilter === 'ROTINA'
                      ? 'bg-background text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Rotina ({agenda.filter(a => a.categoriaVistoria !== 'CONTINGENCIA_CLIMA').length})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('CONTINGENCIA_CLIMA')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    categoryFilter === 'CONTINGENCIA_CLIMA'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'text-rose-700 dark:text-rose-400 hover:text-rose-800'
                  }`}
                >
                  <ShieldAlert size={12} />
                  <span>Defesa Civil ({contingencyInspections.length})</span>
                </button>
              </div>
            </div>
          </div>
          {/* WEEK GRID VIEW (5 DIAS: SEG A SEX) */}
          {viewMode === 'semana' ? (
            <div data-tour="agenda-calendar" className="flex overflow-x-auto pb-4 snap-x snap-mandatory lg:grid lg:grid-cols-5 lg:overflow-x-visible lg:pb-0 gap-4 items-start pt-2">
              {weekDays.map((day) => (
                <div 
                  key={day.key}
                  className={`bg-card rounded-lg p-4 min-h-[420px] flex flex-col justify-between transition-all border shadow-sm min-w-[260px] xs:min-w-[280px] w-[82vw] max-w-[320px] snap-center shrink-0 lg:min-w-0 lg:w-auto lg:shrink lg:max-w-none ${
                    day.isToday 
                      ? 'border-primary ring-1 ring-primary' 
                      : 'border-border'
                  }`}
                >
                  <div>
                    {/* Day Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          {day.dayLabel}
                        </span>
                        {day.isToday && (
                          <span className="text-[10px] font-bold text-primary bg-muted px-1.5 py-0.5 rounded">
                            Hoje
                          </span>
                        )}
                      </div>
                      {day.isToday ? (
                        <span className="w-8 h-8 rounded-lg bg-primary text-primary-foreground font-extrabold text-sm flex items-center justify-center shadow-2xs">
                          {day.dayNumber}
                        </span>
                      ) : (
                        <span className="text-lg font-bold text-foreground">
                          {day.dayNumber}
                        </span>
                      )}
                    </div>

                    {/* Events List */}
                    <div className="mt-4 space-y-3">
                      {day.events.length === 0 ? (
                        <p className="text-xs text-muted-foreground/80 font-medium pt-3 text-center">
                          Sem visitas agendadas
                        </p>
                      ) : (
                        day.events.map((ev) => {
                          const isContingency = ev.categoriaVistoria === 'CONTINGENCIA_CLIMA';
                          return (
                            <div
                              key={ev.id}
                              onClick={() => setSelectedEvent(ev)}
                              className={`rounded-xl p-3.5 transition-all cursor-pointer border flex flex-col justify-between shadow-2xs ${
                                isContingency
                                  ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 hover:border-rose-400'
                                  : 'bg-background hover:bg-muted/50 border-border hover:border-primary/40'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between text-xs font-bold">
                                  <div className="flex items-center gap-1.5 text-primary">
                                    <Clock size={12} className="text-muted-foreground/80" />
                                    <span>{ev.time}</span>
                                  </div>
                                  {isContingency ? (
                                    ev.riscoMitigado ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded">
                                        <ShieldCheck size={11} className="stroke-[2.5]" /> Mitigado
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[10px] text-rose-700 font-bold bg-rose-100 border border-rose-300 px-1.5 py-0.5 rounded">
                                        <ShieldAlert size={11} className="stroke-[2.5]" /> Alerta Clima
                                      </span>
                                    )
                                  ) : ev.completed ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                                      <Check size={11} className="stroke-[3]" /> Realizada
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                                      Agendada
                                    </span>
                                  )}
                                </div>
                                
                                <h3 className="text-xs font-bold text-foreground mt-1.5 leading-snug">
                                  {ev.title}
                                </h3>
                                
                                {/* Local */}
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                                  <MapPin size={12} className="text-muted-foreground/80 shrink-0" />
                                  <span className="truncate font-medium">{ev.subtitle}</span>
                                </div>

                                {/* Equipe Responsável */}
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                  <Users size={12} className="text-muted-foreground/80 shrink-0" />
                                  <span className="truncate">{ev.tecnico || 'Equipe Operacional Civil'}</span>
                                </div>
                              </div>

                              {/* Vínculo com Defesa Civil ou chamado */}
                              {isContingency ? (
                                <div className="mt-3 pt-2 border-t border-rose-200/60 dark:border-rose-900/60 flex items-center justify-between text-[10px] text-rose-700 dark:text-rose-400 font-semibold">
                                  <span className="flex items-center gap-1">
                                    <ShieldAlert size={11} />
                                    <span>Plano Contingência</span>
                                  </span>
                                  <span>{ev.riscoMitigado ? 'Concluído' : 'Ação Preventiva'}</span>
                                </div>
                              ) : ev.orderId ? (
                                <div className="mt-3 pt-2 border-t border-border flex items-center justify-between">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const ord = orders.find(o => o.id === ev.orderId);
                                      if (ord) setSelectedOrderForModal(ord);
                                    }}
                                    title="Abrir chamado vinculado"
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/80 hover:underline"
                                  >
                                    <Link2 size={11} className="text-primary" />
                                    <span>#{ev.orderId.replace(/^(os-|OS-)/i, '')}</span>
                                  </button>
                                  <span className="text-[10px] text-muted-foreground font-medium">OS vinculada</span>
                                </div>
                              ) : null}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* LIST VIEW */
            <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden">
              <div className="divide-y divide-border">
                {filteredEvents.map((item) => {
                  const isContingency = item.categoriaVistoria === 'CONTINGENCIA_CLIMA';
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedEvent(item)}
                      className={`p-4 hover:bg-muted/50 transition-colors flex items-center justify-between cursor-pointer group ${
                        isContingency ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAgendaItem(item.id);
                            showToast(`Status da vistoria atualizado.`);
                          }}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                            item.completed 
                              ? 'bg-primary text-primary-foreground' 
                              : isContingency
                                ? 'border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700'
                                : 'border border-border bg-background hover:border-primary'
                          }`}
                        >
                          {item.completed && <Check size={14} className="stroke-[3]" />}
                        </button>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-primary">{item.time}</span>
                            <span className="text-xs text-muted-foreground/30">·</span>
                            <h3 className={`text-sm font-bold ${item.completed ? 'text-muted-foreground/60 line-through' : 'text-foreground'}`}>
                              {item.title}
                            </h3>
                            {isContingency && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                                <ShieldAlert size={10} />
                                Defesa Civil
                              </span>
                            )}
                            {isContingency && item.riscoMitigado && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                <ShieldCheck size={10} />
                                Risco Mitigado ✓
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                            <span className="flex items-center gap-1">
                              <MapPin size={11} className="text-muted-foreground/80" />
                              {item.subtitle}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Users size={11} className="text-muted-foreground/80" />
                              {item.tecnico || 'Equipe Operacional Civil'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {item.orderId && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const ord = orders.find(o => o.id === item.orderId);
                              if (ord) setSelectedOrderForModal(ord);
                            }}
                            className="text-[11px] font-bold text-primary bg-muted hover:bg-muted/80 px-2.5 py-1 rounded-md hidden sm:inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Link2 size={11} />
                            <span>#{item.orderId.replace(/^(os-|OS-)/i, '')}</span>
                          </button>
                        )}
                        <span className="text-xs font-semibold text-muted-foreground">
                          {item.riscoMitigado ? 'Risco Mitigado' : item.completed ? 'Concluída' : 'Pendente'}
                        </span>
                        <ChevronRight size={15} className="text-muted-foreground/50" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* MODALS */}
      <NewAgendaModal 
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreate={(newEvent) => {
          addAgendaEvent(newEvent);
          showToast(`Vistoria agendada para ${newEvent.time}!`);
        }}
      />

      <AgendaModal 
        isOpen={!!selectedEvent}
        event={selectedEvent}
        linkedOrder={linkedOrder}
        onClose={() => setSelectedEvent(null)}
        onToggleComplete={(eventId: string) => {
          toggleAgendaItem(eventId);
          setSelectedEvent(null);
          showToast('Status da visita técnica registrado com sucesso.');
        }}
        onCompleteOrder={(orderId: string) => {
          const ord = orders.find(o => o.id === orderId);
          if (ord) {
            updateOrder({ ...ord, status: 'CONCLUIDO' });
            setSelectedEvent(null);
            showToast(`Chamado #${orderId.replace('os-', '')} concluído formalmente no sistema!`);
          }
        }}
        onOpenOrderDetail={(ord) => {
          setSelectedOrderForModal(ord);
        }}
        onSuccessContingency={(msg) => {
          refreshData();
          loadAlerts();
          showToast(msg);
        }}
      />

      <TriggerContingencyModal
        isOpen={isContingencyModalOpen}
        onClose={() => setIsContingencyModalOpen(false)}
        onSuccess={(summary) => {
          refreshData();
          loadAlerts();
          showToast(summary);
        }}
      />

      <OrderDetailModal 
        order={selectedOrderForModal}
        onClose={() => setSelectedOrderForModal(null)}
        onUpdate={(updated) => {
          updateOrder(updated);
          showToast(`Chamado ${updated.id} atualizado.`);
        }}
        onDelete={() => {}}
      />

    </div>
  );
}
