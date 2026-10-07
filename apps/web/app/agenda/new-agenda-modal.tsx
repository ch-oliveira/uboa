'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrders, type AgendaEvent } from '@/context/orders-context';
import { PREDIOS, TECNICOS } from '../kanban/data';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (event: AgendaEvent) => void;
}

export function NewAgendaModal({ isOpen, onClose, onCreate }: Props) {
  const { units } = useOrders();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState(units[0]?.nome || PREDIOS[0] || 'EMEF Paulo Freire');
  const [time, setTime] = useState('10:00');
  const [type, setType] = useState<'eletrica' | 'hidraulica' | 'acessibilidade' | 'geral'>('geral');
  const [tecnico, setTecnico] = useState(TECNICOS[0] || 'Carlos T.');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor, informe o título da vistoria ou intervenção.');
      return;
    }

    const newEvent: AgendaEvent = {
      id: `ag-${Date.now()}`,
      time,
      title: title.trim(),
      subtitle,
      completed: false,
      type,
    };

    onCreate(newEvent);
    setTitle('');
    setError('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-blue-900/10 text-blue-900 flex items-center justify-center">
              <Calendar size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Agendar Vistoria / Intervenção</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Programe manutenções preventivas e inspeções técnicas.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Título da Atividade *
            </label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Vistoria preventiva do telhado, Revisão de extintores"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/15 focus:border-blue-900 transition-all font-medium text-slate-800"
            />
          </div>

          {/* Unidade */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Unidade Predial *
            </label>
            <select
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/15 focus:border-blue-900 transition-all font-medium text-slate-800"
            >
              {units.map((u) => (
                <option key={u.id} value={u.nome}>{u.nome} ({u.tipo})</option>
              ))}
            </select>
          </div>

          {/* Grid: Horário & Tipo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Horário Programado *
              </label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/15 focus:border-blue-900 transition-all font-medium text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Tipo de Serviço *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/15 focus:border-blue-900 transition-all font-medium text-slate-800"
              >
                <option value="geral">Geral / Preventiva</option>
                <option value="eletrica">Elétrica</option>
                <option value="hidraulica">Hidráulica</option>
                <option value="acessibilidade">Acessibilidade / Obras</option>
              </select>
            </div>
          </div>

          {/* Técnico */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Técnico / Equipe Designada
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                value={tecnico}
                onChange={(e) => setTecnico(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/15 focus:border-blue-900 transition-all font-medium text-slate-800"
              >
                {TECNICOS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2 sm:gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto rounded-lg">
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto bg-blue-900 hover:bg-blue-950 text-white rounded-lg font-semibold">
              Salvar Agendamento
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
