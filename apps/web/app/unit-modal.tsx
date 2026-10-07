'use client';

import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Flag,
  Wrench,
  ShieldCheck,
  GraduationCap,
  Activity,
  Trees,
  Landmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type OrdemServico } from './kanban/data';
import { useOrders, type TipoUnidade } from '@/context/orders-context';

interface Props {
  unitName: string | null;
  isOpen: boolean;
  onClose: () => void;
  orders: OrdemServico[];
  onSelectOrder: (order: OrdemServico) => void;
  onNewOrder?: (unitName: string) => void;
}

export function UnitModal({ unitName, isOpen, onClose, orders, onSelectOrder, onNewOrder }: Props) {
  const { unitsWithStats } = useOrders();
  const [historyTab, setHistoryTab] = useState<'ALL' | 'OPEN' | 'COMPLETED'>('ALL');

  if (!isOpen || !unitName) return null;

  const unitInfo = unitsWithStats.find((u) => u.nome === unitName);
  const unitOrders = orders.filter((o) => o.predio === unitName);
  const openOrders = unitOrders.filter((o) => o.status !== 'CONCLUIDO');
  const urgentOrders = unitOrders.filter((o) => o.status !== 'CONCLUIDO' && o.prioridade === 'URGENTE');
  const completedOrders = unitOrders.filter((o) => o.status === 'CONCLUIDO');

  const filteredHistory = historyTab === 'OPEN' 
    ? openOrders 
    : historyTab === 'COMPLETED' 
    ? completedOrders 
    : unitOrders;

  const getCategoryIcon = (tipo?: TipoUnidade) => {
    switch (tipo) {
      case 'ESCOLA':
        return <GraduationCap size={16} className="text-[#0A2540]" />;
      case 'UBS':
      case 'HOSPITAL':
        return <Activity size={16} className="text-[#0A2540]" />;
      case 'PRACA':
        return <Trees size={16} className="text-[#0A2540]" />;
      default:
        return <Landmark size={16} className="text-[#0A2540]" />;
    }
  };

  const getCategoryLabel = (tipo?: TipoUnidade) => {
    switch (tipo) {
      case 'ESCOLA': return 'Educação';
      case 'UBS': return 'Saúde';
      case 'HOSPITAL': return 'Saúde Especializada';
      case 'PRACA': return 'Praças e Parques';
      default: return 'Gestão Administrativa';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-lg shadow-2xl border border-[#E2E8F0] w-full max-w-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-[#F1F5F9] flex items-start justify-between bg-[#F8FAFC]">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-lg bg-[#E1E7EF] flex items-center justify-center shrink-0 mt-0.5">
              {getCategoryIcon(unitInfo?.tipo)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#475569] tracking-wider uppercase">
                  {getCategoryLabel(unitInfo?.tipo)}
                </span>
                <span className="text-xs text-[#CBD5E1]">·</span>
                <span className="text-xs font-semibold text-[#0A2540]">
                  {unitOrders.length} chamados registrados
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] mt-0.5">
                {unitName}
              </h2>
              
              {/* Highlight for Pendências & Urgências */}
              <div className="flex items-center gap-2.5 mt-2">
                <span className="text-xs font-bold text-[#0F172A] bg-[#E1E7EF] px-2.5 py-1 rounded-lg">
                  {openOrders.length} pendências ativas
                </span>
                {urgentOrders.length > 0 && (
                  <span className="text-xs font-bold text-[#DC2626] bg-[#FEECEB] px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <AlertTriangle size={13} />
                    {urgentOrders.length} urgente{urgentOrders.length > 1 ? 's' : ''}
                  </span>
                )}
                <span className="text-xs text-[#475569] font-medium">
                  {completedOrders.length} concluídos
                </span>
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

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1">
          
          {/* Section: Informações de Endereço & Responsável */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Endereço */}
            <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#475569] uppercase tracking-wider">
                <MapPin size={14} className="text-[#0A2540]" />
                <span>Endereço Completo</span>
              </div>
              <p className="text-sm font-bold text-[#0F172A] pt-1">
                {unitInfo?.endereco || 'Rua Central, 100 — Região Central'}
              </p>
              <p className="text-xs text-[#475569]">
                Ponto de referência: Próximo à praça principal
              </p>
            </div>

            {/* Responsável da Unidade */}
            <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#475569] uppercase tracking-wider">
                <User size={14} className="text-[#0A2540]" />
                <span>Responsável da Unidade</span>
              </div>
              <p className="text-sm font-bold text-[#0F172A] pt-1">
                {unitInfo?.gestor || 'Gestão da Unidade Municipal'}
              </p>
              <div className="flex items-center gap-3 text-xs text-[#475569] pt-0.5">
                <span className="flex items-center gap-1">
                  <Phone size={12} className="text-[#94A3B8]" />
                  {unitInfo?.telefone || '(11) 3241-8900'}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Mail size={12} className="text-[#94A3B8]" />
                  {unitInfo?.email || 'contato@urboa.gov.br'}
                </span>
              </div>
            </div>
          </div>

          {/* Section: Histórico Completo de Chamados */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                  Histórico de Chamados & Manutenção
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Registro completo de ocorrências preventivas e corretivas
                </p>
              </div>

              {/* Segmented Filter */}
              <div className="bg-[#E1E7EF] p-1 rounded-md flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setHistoryTab('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    historyTab === 'ALL'
                      ? 'bg-white text-[#0F172A] shadow-xs'
                      : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  Todos ({unitOrders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryTab('OPEN')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    historyTab === 'OPEN'
                      ? 'bg-white text-[#0F172A] shadow-xs'
                      : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  Ativos ({openOrders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryTab('COMPLETED')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    historyTab === 'COMPLETED'
                      ? 'bg-white text-[#0F172A] shadow-xs'
                      : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  Concluídos ({completedOrders.length})
                </button>
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="text-center py-10 bg-[#F8FAFC] rounded-lg border border-dashed border-[#CBD5E1] text-xs text-[#475569]">
                Nenhum chamado encontrado com o filtro selecionado.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((order) => {
                  const isUrgente = order.prioridade === 'URGENTE';
                  const isAlta = order.prioridade === 'ALTA';
                  const isCompleted = order.status === 'CONCLUIDO';

                  return (
                    <div
                      key={order.id}
                      onClick={() => {
                        onClose();
                        onSelectOrder(order);
                      }}
                      className="p-4 rounded-lg border border-[#E2E8F0] hover:border-[#0A2540] bg-white hover:bg-slate-50/50 cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
                    >
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-mono font-bold text-[#475569]">
                            #{order.id.replace('os-', '')}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                            isUrgente 
                              ? 'bg-[#FEECEB] text-[#DC2626]' 
                              : isAlta 
                              ? 'bg-[#FEF6E8] text-[#D97706]' 
                              : 'bg-[#F1F5F9] text-[#475569]'
                          }`}>
                            {order.prioridade}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                            isCompleted 
                              ? 'bg-[#E1E7EF] text-[#0A2540]' 
                              : 'bg-[#F1F5F9] text-[#0F172A]'
                          }`}>
                            {order.status === 'TRIAGEM' ? 'Triagem' : order.status === 'AGENDADO' ? 'Planejamento' : order.status === 'EM_EXECUCAO' ? 'Em execução' : 'Concluído'}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-[#0A2540] transition-colors">
                          {order.titulo}
                        </h4>

                        <div className="flex items-center gap-3 text-xs text-[#475569] mt-2">
                          <span className="flex items-center gap-1">
                            <User size={12} className="text-[#94A3B8]" />
                            {order.tecnico || 'Equipe a definir'}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="text-[#94A3B8]" />
                            {order.dataAbertura} · 18h
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-[#0A2540] shrink-0 opacity-80 group-hover:opacity-100 group-hover:underline">
                        <span>Ver detalhes</span>
                        <ArrowUpRight size={14} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-[#F1F5F9] bg-[#F8FAFC] flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-2 sm:gap-3">
          {onNewOrder ? (
            <Button
              onClick={() => {
                onClose();
                onNewOrder(unitName);
              }}
              className="w-full sm:w-auto justify-center bg-[#0A2540] hover:bg-[#081C32] text-white rounded-md px-4 py-2 font-semibold text-xs cursor-pointer"
            >
              + Novo chamado nesta unidade
            </Button>
          ) : (
            <div />
          )}

          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="w-full sm:w-auto justify-center rounded-md text-xs font-bold text-[#475569] hover:text-[#0F172A] cursor-pointer"
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
