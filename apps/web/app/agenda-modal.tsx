'use client';

import React from 'react';
import { 
  X, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  User, 
  Wrench, 
  Zap, 
  ArrowUpRight, 
  AlertTriangle,
  Flag,
  FileCheck2,
  CalendarCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type AgendaEvent } from '@/context/orders-context';
import { type OrdemServico } from './kanban/data';

interface Props {
  event: AgendaEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleComplete: (id: string) => void;
  linkedOrder?: OrdemServico | null;
  onCompleteOrder?: (orderId: string) => void;
  onOpenOrderDetail?: (order: OrdemServico) => void;
}

export function AgendaModal({ 
  event, 
  isOpen, 
  onClose, 
  onToggleComplete,
  linkedOrder,
  onCompleteOrder,
  onOpenOrderDetail
}: Props) {
  if (!isOpen || !event) return null;

  const getIcon = () => {
    switch (event.type) {
      case 'eletrica':
        return <Zap size={20} className="text-[#0A2540]" />;
      case 'hidraulica':
        return <Wrench size={20} className="text-[#0A2540]" />;
      default:
        return <CheckCircle2 size={20} className="text-[#0A2540]" />;
    }
  };

  const isOrderCompleted = linkedOrder?.status === 'CONCLUIDO';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="ds-card shadow-popover w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#E1E7EF] flex items-center justify-center">
              {getIcon()}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#0F172A]">{event.title}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                  event.completed 
                    ? 'bg-[#E1E7EF] text-[#0A2540]' 
                    : 'bg-[#FEF6E8] text-[#D97706]'
                }`}>
                  {event.completed ? '✓ Visita realizada' : 'Visita agendada'}
                </span>
                <span className="text-xs text-[#475569]">· {event.subtitle}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-[#475569] hover:text-[#0F172A] p-2 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2.5 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
              <Clock size={16} className="text-[#475569] shrink-0" />
              <div>
                <p className="text-[10px] text-[#475569] font-bold uppercase tracking-wider">Horário</p>
                <p className="font-bold text-[#0F172A] mt-0.5">{event.time} — 23 de Setembro</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
              <MapPin size={16} className="text-[#475569] shrink-0" />
              <div>
                <p className="text-[10px] text-[#475569] font-bold uppercase tracking-wider">Unidade</p>
                <p className="font-bold text-[#0F172A] mt-0.5 truncate">{event.subtitle}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs">
            <User size={16} className="text-[#475569] shrink-0" />
            <div>
              <p className="text-[10px] text-[#475569] font-bold uppercase tracking-wider">Equipe Técnica Designada</p>
              <p className="font-bold text-[#0F172A] mt-0.5">{event.tecnico || 'Equipe Municipal de Manutenção Predial'}</p>
            </div>
          </div>

          {/* Chamado Vinculado */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                Chamado Vinculado
              </span>
              {linkedOrder && onOpenOrderDetail && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenOrderDetail(linkedOrder);
                  }}
                  className="text-xs font-semibold text-[#0A2540] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Abrir chamado completo</span>
                  <ArrowUpRight size={13} />
                </button>
              )}
            </div>

            {linkedOrder ? (
              <div className="p-4 ds-card shadow-none hover:border-primary/30 hover:shadow-card-hover transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#475569]">
                      #{linkedOrder.id.replace('os-', '')}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                      linkedOrder.prioridade === 'URGENTE' 
                        ? 'bg-[#FEECEB] text-[#DC2626]' 
                        : 'bg-[#FEF6E8] text-[#D97706]'
                    }`}>
                      {linkedOrder.prioridade}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[#0F172A]">
                    {linkedOrder.status === 'CONCLUIDO' ? 'Concluído' : 'Em andamento'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#0F172A]">
                  {linkedOrder.titulo}
                </h4>
                <p className="text-xs text-[#475569] mt-1 font-normal line-clamp-2">
                  {linkedOrder.descricao || 'Serviço de manutenção preventiva/corretiva vinculado à escala de vistoria municipal.'}
                </p>
              </div>
            ) : (
              <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs text-[#475569]">
                Nenhum chamado pendente vinculado especificamente a esta visita de rotina.
              </div>
            )}
          </div>

          {/* AÇÕES DISTINTAS */}
          <div className="pt-2 border-t border-[#F1F5F9] space-y-3">
            <p className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
              Ações Operacionais
            </p>

            {/* Ação 1: Registrar Visita Técnica */}
            <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A]">
                  <CalendarCheck size={14} className="text-[#0A2540]" />
                  <span>1. Registrar Visita Técnica</span>
                </div>
                <p className="text-[11px] text-[#475569] mt-0.5">
                  Marca o comparecimento da equipe técnica no local. Mantém o chamado em aberto se ainda houver pendências.
                </p>
              </div>

              <Button
                onClick={() => {
                  onToggleComplete(event.id);
                  onClose();
                }}
                className={`text-xs font-bold rounded-md px-3.5 py-2 shrink-0 cursor-pointer ${
                  event.completed
                    ? 'bg-transparent border border-border text-muted-foreground hover:bg-muted/50'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs'
                }`}
              >
                {event.completed ? 'Reabrir visita' : 'Registrar visita ✓'}
              </Button>
            </div>

            {/* Ação 2: Concluir Chamado Vinculado */}
            {linkedOrder && (
              <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A]">
                    <FileCheck2 size={14} className="text-[#0A2540]" />
                    <span>2. Concluir Chamado no Sistema</span>
                  </div>
                  <p className="text-[11px] text-[#475569] mt-0.5">
                    Encerra formalmente a ordem de serviço no sistema após validação definitiva do reparo executado.
                  </p>
                </div>

                <Button
                  disabled={isOrderCompleted}
                  onClick={() => {
                    if (onCompleteOrder && linkedOrder) {
                      onCompleteOrder(linkedOrder.id);
                      onClose();
                    }
                  }}
                  className={`text-xs font-bold rounded-md px-3.5 py-2 shrink-0 cursor-pointer ${
                    isOrderCompleted
                      ? 'bg-[#E1E7EF] text-[#475569] cursor-not-allowed opacity-75'
                      : 'bg-[#0A2540] hover:bg-[#081C32] text-white shadow-xs'
                  }`}
                >
                  {isOrderCompleted ? 'Já concluído ✓' : 'Concluir chamado'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F1F5F9] bg-[#F8FAFC] flex justify-end">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="rounded-md text-xs font-bold text-[#475569] hover:text-[#0F172A] cursor-pointer"
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
