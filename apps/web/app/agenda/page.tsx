'use client';

import React, { useState, useMemo } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/toast';
import { Sidebar } from '@/components/sidebar';
import { useOrders, type AgendaEvent } from '@/context/orders-context';
import { type OrdemServico } from '../kanban/data';
import { OrderDetailModal } from '../kanban/order-detail-modal';
import { NewAgendaModal } from './new-agenda-modal';
import { AgendaModal } from '../agenda-modal';
import { TopHeader } from '@/components/top-header';

export default function AgendaPage() {
  const { 
    agenda, 
    orders,
    updateOrder,
    toggleAgendaItem, 
    addAgendaEvent 
  } = useOrders();

  // State
  const [teamFilter, setTeamFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'semana' | 'lista'>('semana');
  const [searchQuery, setSearchQuery] = useState('');
  const [weekOffset, setWeekOffset] = useState(0); // 0 = Semana Atual (Hoje)

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

      return true;
    }).sort((a, b) => a.time.localeCompare(b.time));
  }, [agenda, searchQuery, teamFilter]);

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
      if (t.includes('seg')) {
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
          titleOverride="Agenda e Planejamento"
          breadcrumbs={[
            { label: 'Gestão municipal', href: '/' },
            { label: 'Agenda e Planejamento' },
          ]}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectOrder={setSelectedOrderForModal}
        />

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">

          {/* CABEÇALHO DA PÁGINA (Padrão Ouro UI/UX) */}
          <div className="bg-muted/50 rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Agenda e Planejamento
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Programe as visitas técnicas e otimize o trabalho em campo.
              </p>
            </div>
            <div className="flex items-center shrink-0">
              <Button 
                onClick={() => setIsNewModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4 py-2 font-semibold text-sm shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Agendar visita
              </Button>
            </div>
          </div>

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
            <div className="flex items-center gap-3">
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

          {/* Filter Bar: Equipe */}
          <div className="bg-card border border-border rounded-xl p-4 mb-4 max-w-sm shadow-sm">
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Filtrar por equipe
            </label>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer shadow-sm"
            >
              <option value="ALL">Todas as equipes</option>
              <option value="Carlos Silva">Manutenção elétrica (Carlos)</option>
              <option value="Roberto Santos">Manutenção hidráulica (Roberto)</option>
              <option value="Lucas Pereira">Engenharia predial (Lucas)</option>
              <option value="Marcos Oliveira">Zeladoria geral (Marcos)</option>
            </select>
          </div>

          {/* WEEK GRID VIEW (5 DIAS: SEG A SEX) */}
          {viewMode === 'semana' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start pt-2">
              {weekDays.map((day) => (
                <div 
                  key={day.key}
                  className={`bg-card rounded-lg p-4 min-h-[420px] flex flex-col justify-between transition-all border shadow-sm ${
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
                        day.events.map((ev) => (
                          <div
                            key={ev.id}
                            onClick={() => setSelectedEvent(ev)}
                            className="bg-background hover:bg-muted/50 rounded-md p-3.5 transition-all cursor-pointer border border-border hover:border-primary/40 flex flex-col justify-between shadow-sm"
                          >
                            <div>
                              <div className="flex items-center justify-between text-xs font-bold text-primary">
                                <div className="flex items-center gap-1.5">
                                  <Clock size={12} className="text-muted-foreground/80" />
                                  <span>{ev.time}</span>
                                </div>
                                {ev.completed ? (
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

                            {/* Vínculo com chamado */}
                            {ev.orderId && (
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
                            )}
                          </div>
                        ))
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
                {filteredEvents.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedEvent(item)}
                    className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between cursor-pointer group"
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
                        {item.completed ? 'Concluída' : 'Pendente'}
                      </span>
                      <ChevronRight size={15} className="text-muted-foreground/50" />
                    </div>
                  </div>
                ))}
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
