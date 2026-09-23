'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  CheckCircle2, 
  Wrench, 
  Zap, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Check, 
  Search,
  LayoutList,
  CalendarDays
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/toast';
import { Sidebar } from '@/components/sidebar';
import { useOrders, type AgendaEvent } from '@/context/orders-context';
import { NewAgendaModal } from './new-agenda-modal';
import { AgendaModal } from '../agenda-modal';

type FilterType = 'all' | 'eletrica' | 'hidraulica' | 'acessibilidade' | 'geral';

export default function AgendaPage() {
  const { 
    agenda, 
    toggleAgendaItem, 
    addAgendaEvent 
  } = useOrders();

  // State
  const [selectedDate, setSelectedDate] = useState('23 de Setembro de 2026');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }

  // Filtered events
  const filteredEvents = useMemo(() => {
    return agenda.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = 
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.time.includes(q);
        if (!matches) return false;
      }

      // Type
      if (typeFilter !== 'all' && item.type !== typeFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => a.time.localeCompare(b.time));
  }, [agenda, searchQuery, typeFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const total = agenda.length;
    const completed = agenda.filter((a) => a.completed).length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [agenda]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'eletrica':
        return <Zap size={20} className="text-amber-500" />;
      case 'hidraulica':
        return <Wrench size={20} className="text-[#1D6FEB]" />;
      case 'acessibilidade':
        return <CheckCircle2 size={20} className="text-purple-600" />;
      default:
        return <CalendarIcon size={20} className="text-emerald-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'eletrica':
        return { label: 'Elétrica', style: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'hidraulica':
        return { label: 'Hidráulica', style: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'acessibilidade':
        return { label: 'Acessibilidade / Obras', style: 'bg-purple-100 text-purple-800 border-purple-200' };
      default:
        return { label: 'Preventiva Geral', style: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      
      {/* Toast */}
      <Toast message={toastMessage} />

      {/* Sidebar */}
      <Sidebar currentRoute="/agenda" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-white/70 backdrop-blur-md border-b border-slate-100 shrink-0">
          <div className="text-sm text-slate-500 font-medium">
            Gestão municipal <span className="mx-2">/</span> <span className="text-slate-800 font-bold">Agenda de Vistorias</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar vistoria, unidade..." 
                className="w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6FEB]/20 focus:border-[#1D6FEB] transition-all"
              />
            </div>

            <Button 
              onClick={() => setIsNewModalOpen(true)}
              className="bg-[#1D6FEB] hover:bg-[#1557BA] text-white rounded-lg px-5 font-semibold shadow-sm h-10 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Agendar Vistoria
            </Button>
          </div>
        </header>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {/* Title & Date navigator */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Cronograma de Vistorias e Manutenções
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Acompanhe as visitas técnicas programadas em escolas, postos de saúde e secretarias.
              </p>
            </div>

            {/* Date Navigator Bar */}
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs">
              <button 
                onClick={() => setSelectedDate('22 de Setembro de 2026')}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="flex items-center gap-2 px-3 text-xs font-bold text-slate-800">
                <CalendarIcon size={14} className="text-[#1D6FEB]" />
                <span>{selectedDate}</span>
              </div>

              <button 
                onClick={() => setSelectedDate('24 de Setembro de 2026')}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ChevronRight size={16} />
              </button>

              <button 
                onClick={() => setSelectedDate('23 de Setembro de 2026')}
                className="text-xs font-bold px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
              >
                Hoje
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Vistorias Programadas</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.total}</div>
                <p className="text-xs text-slate-500 mt-0.5">Para a data selecionada</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1D6FEB] flex items-center justify-center">
                <CalendarIcon size={24} />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase">Realizadas com Sucesso</span>
                <div className="text-2xl font-extrabold text-emerald-700 mt-1">{metrics.completed}</div>
                <p className="text-xs text-slate-500 mt-0.5">Laudos e inspeções validadas</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase">Pendentes de Visita</span>
                <div className="text-2xl font-extrabold text-amber-700 mt-1">{metrics.pending}</div>
                <p className="text-xs text-slate-500 mt-0.5">Equipes a caminho ou em campo</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock size={24} />
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            
            {/* Filter chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'Todos os Serviços' },
                { id: 'eletrica', label: 'Elétrica' },
                { id: 'hidraulica', label: 'Hidráulica' },
                { id: 'acessibilidade', label: 'Acessibilidade' },
                { id: 'geral', label: 'Preventiva Geral' },
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setTypeFilter(chip.id as FilterType)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    typeFilter === chip.id
                      ? 'bg-[#1D6FEB] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('day')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'day' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutList size={14} />
                <span>Dia</span>
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarDays size={14} />
                <span>Semana</span>
              </button>
            </div>

          </div>

          {/* MAIN SCHEDULE VIEW */}
          {viewMode === 'day' ? (
            /* DAY TIMELINE VIEW */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase text-slate-400">
                  Horário e Atividade ({filteredEvents.length})
                </span>
                <span className="text-xs font-medium text-slate-400">
                  Clique na caixa de seleção para alternar status
                </span>
              </div>

              {filteredEvents.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <p className="text-sm font-semibold text-slate-700">Nenhuma vistoria programada</p>
                  <p className="text-xs text-slate-400 mt-1">Clique em "Agendar Vistoria" para programar uma nova visita.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredEvents.map((item) => {
                    const badge = getTypeBadge(item.type);
                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 group ${
                          item.completed 
                            ? 'bg-slate-50/70 border-slate-200' 
                            : 'bg-white border-slate-200 hover:border-[#1D6FEB]/40 hover:shadow-xs'
                        }`}
                      >
                        {/* Left: Checkbox + Icon + Time + Info */}
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          
                          {/* Toggle Checkbox */}
                          <button
                            onClick={() => {
                              toggleAgendaItem(item.id);
                              showToast(item.completed ? 'Vistoria reaberta.' : 'Vistoria marcada como concluída!');
                            }}
                            title={item.completed ? 'Reabrir vistoria' : 'Marcar como concluída'}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all shrink-0 cursor-pointer ${
                              item.completed 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : 'border-slate-300 hover:border-[#1D6FEB] hover:bg-blue-50 text-transparent hover:text-[#1D6FEB]'
                            }`}
                          >
                            <Check size={14} className={item.completed ? 'opacity-100' : 'opacity-0 hover:opacity-100'} />
                          </button>

                          {/* Service Icon */}
                          <div 
                            onClick={() => setSelectedEvent(item)}
                            className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 cursor-pointer hover:bg-blue-100 transition-colors"
                          >
                            {getEventIcon(item.type)}
                          </div>

                          {/* Time */}
                          <div className="w-16 shrink-0">
                            <span className={`text-sm font-extrabold ${item.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {item.time}
                            </span>
                          </div>

                          {/* Info */}
                          <div 
                            onClick={() => setSelectedEvent(item)}
                            className="min-w-0 flex-1 cursor-pointer"
                          >
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className={`text-sm font-bold truncate group-hover:text-[#1D6FEB] transition-colors ${
                                item.completed ? 'line-through text-slate-400' : 'text-slate-900'
                              }`}>
                                {item.title}
                              </h3>
                              <span className={`text-[10px] font-bold px-2 py-0.2 rounded-md border shrink-0 ${badge.style}`}>
                                {badge.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <MapPin size={12} className="text-slate-400 shrink-0" />
                              <span className="truncate">{item.subtitle}</span>
                            </div>
                          </div>

                        </div>

                        {/* Right: Status badge & Detail action */}
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                            item.completed 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.completed ? 'Concluída' : 'Agendada'}
                          </span>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEvent(item)}
                            className="text-xs text-slate-500 hover:text-[#1D6FEB] rounded-lg"
                          >
                            Ver detalhes
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* WEEK VIEW */
            <div className="grid grid-cols-5 gap-4">
              {[
                { day: 'Segunda-feira', date: '21 Set', events: [] },
                { day: 'Terça-feira', date: '22 Set', events: [
                  { time: '14:30', title: 'Troca de lâmpadas', unit: 'UBS Vila Nova', type: 'eletrica' }
                ]},
                { day: 'Quarta-feira (Hoje)', date: '23 Set', events: filteredEvents },
                { day: 'Quinta-feira', date: '24 Set', events: [
                  { time: '10:00', title: 'Revisão hidráulica geral', unit: 'EMEF Paulo Freire', type: 'hidraulica' }
                ]},
                { day: 'Sexta-feira', date: '25 Set', events: [
                  { time: '09:00', title: 'Laudo de acessibilidade', unit: 'Praça da Matriz', type: 'acessibilidade' }
                ]},
              ].map((col) => (
                <div key={col.day} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col min-h-[380px]">
                  <div className="pb-3 mb-3 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-900">{col.day}</h4>
                    <p className="text-[11px] text-slate-400 font-semibold">{col.date}</p>
                  </div>

                  <div className="space-y-2.5 flex-1">
                    {col.events.length === 0 ? (
                      <p className="text-[11px] text-slate-300 py-6 text-center italic">Sem vistorias</p>
                    ) : (
                      col.events.map((ev: any, idx) => (
                        <div
                          key={ev.id || idx}
                          onClick={() => {
                            if (ev.subtitle) setSelectedEvent(ev);
                          }}
                          className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:border-[#1D6FEB]/40 hover:bg-blue-50/30 cursor-pointer transition-all"
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold text-[#1D6FEB] mb-1">
                            <span>{ev.time}</span>
                            {ev.completed && <Check size={12} className="text-emerald-600" />}
                          </div>
                          <p className="text-xs font-bold text-slate-800 line-clamp-1">{ev.title}</p>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{ev.subtitle || ev.unit}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
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
          showToast(`Vistoria "${newEvent.title}" agendada com sucesso!`);
        }}
      />

      <AgendaModal 
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onToggleComplete={(id) => {
          toggleAgendaItem(id);
          showToast('Status do agendamento atualizado.');
        }}
      />

    </div>
  );
}
