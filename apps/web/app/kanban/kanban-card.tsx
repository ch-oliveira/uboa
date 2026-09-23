'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { COLUMNS, type OrdemServico, type StatusOS } from './data';
import { MapPin, MoreVertical, GripVertical, ArrowRight, Trash2, Eye } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getPriorityBadge } from '@/lib/badges';

interface Props {
  order: OrdemServico;
  isDragging?: boolean;
  onSelect?: (order: OrdemServico) => void;
  onMove?: (orderId: string, targetStatus: StatusOS) => void;
  onDelete?: (orderId: string) => void;
}

export function KanbanCard({ 
  order, 
  isDragging = false, 
  onSelect, 
  onMove, 
  onDelete 
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: order.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };


  if (isSortableDragging && !isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-[140px] rounded-xl border-2 border-dashed border-[#1D6FEB]/30 bg-blue-50/40"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect?.(order)}
      className={`relative bg-white rounded-xl border border-slate-200 shadow-xs p-4 cursor-grab active:cursor-grabbing group transition-all select-none hover:border-slate-300 hover:shadow-md touch-none ${
        isDragging ? 'shadow-xl ring-2 ring-[#1D6FEB]/20 rotate-2 scale-105 z-50' : ''
      }`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 p-1 -m-1 rounded">
          <GripVertical size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
          <span className="text-xs font-bold text-slate-400">{order.id}</span>
        </div>

        {/* 3-dots menu button */}
        <div 
          className="relative" 
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-slate-300 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors -mr-1"
          >
            <MoreVertical size={16} />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <>
              <div 
                className="fixed inset-0 z-20" 
                onClick={() => setMenuOpen(false)} 
              />
              <div className="absolute right-0 top-7 z-30 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 text-xs animate-in fade-in duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onSelect?.(order);
                  }}
                  className="w-full px-3 py-2 text-left font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Eye size={14} className="text-slate-400" />
                  Ver detalhes
                </button>

                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100 mt-1">
                  Mover para
                </div>
                {COLUMNS.filter((c) => c.id !== order.status).map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onMove?.(order.id, col.id);
                    }}
                    className="w-full px-3 py-1.5 text-left font-medium text-slate-600 hover:bg-blue-50 hover:text-[#1D6FEB] flex items-center gap-2"
                  >
                    <ArrowRight size={12} className="text-slate-400" />
                    {col.title}
                  </button>
                ))}

                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      if (confirm(`Excluir ${order.id}?`)) {
                        onDelete?.(order.id);
                      }
                    }}
                    className="w-full px-3 py-2 text-left font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    Excluir chamado
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Title */}
      <h4 className="font-bold text-slate-800 text-sm leading-snug mb-2 group-hover:text-[#1D6FEB] transition-colors">
        {order.titulo}
      </h4>

      {/* Location */}
      <div className="flex items-center text-xs text-slate-500 mb-3">
        <MapPin size={12} className="mr-1.5 text-slate-400 shrink-0" />
        <span className="truncate">{order.predio}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${getPriorityBadge(order.prioridade)}`}>
          {order.prioridade}
        </span>
        
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium">{order.dataAbertura}</span>
          <div className="flex -space-x-2">
            <Avatar className="h-6 w-6 border-2 border-white">
              <AvatarFallback className="bg-slate-200 text-[10px] font-bold text-slate-600">
                {order.solicitante.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {order.tecnico && (
              <Avatar className="h-6 w-6 border-2 border-white">
                <AvatarFallback className="bg-[#1D6FEB] text-[10px] font-bold text-white">
                  {order.tecnico.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
