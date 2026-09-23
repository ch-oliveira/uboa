'use client';

import React from 'react';
import { X, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type OrdemServico } from './kanban/data';
import { getPriorityBadge, getStatusBadge } from '@/lib/badges';

interface Props {
  unitName: string | null;
  isOpen: boolean;
  onClose: () => void;
  orders: OrdemServico[];
  onSelectOrder: (order: OrdemServico) => void;
}

export function UnitModal({ unitName, isOpen, onClose, orders, onSelectOrder }: Props) {
  if (!isOpen || !unitName) return null;

  const unitOrders = orders.filter((o) => o.predio === unitName);
  const openOrders = unitOrders.filter((o) => o.status !== 'CONCLUIDO');
  const completedOrders = unitOrders.filter((o) => o.status === 'CONCLUIDO');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1D6FEB] flex items-center justify-center">
              <Building2 size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{unitName}</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {openOrders.length} chamados em aberto • {completedOrders.length} concluídos
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Chamados vinculados ({unitOrders.length})
          </h3>

          {unitOrders.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100 text-slate-500">
              Nenhum chamado registrado para esta unidade.
            </div>
          ) : (
            <div className="space-y-2.5">
              {unitOrders.map((order) => {
                const statusInfo = getStatusBadge(order.status);
                return (
                  <div
                    key={order.id}
                    onClick={() => {
                      onClose();
                      onSelectOrder(order);
                    }}
                    className="p-4 rounded-xl border border-slate-200 hover:border-[#1D6FEB]/40 hover:bg-blue-50/30 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-slate-400">{order.id}</span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getPriorityBadge(order.prioridade)}`}>
                          {order.prioridade}
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${statusInfo.style}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#1D6FEB] transition-colors">
                        {order.titulo}
                      </h4>
                      {order.descricao && (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-normal">
                          {order.descricao}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#1D6FEB] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Ver detalhes</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <Button variant="outline" onClick={onClose} className="rounded-lg">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
