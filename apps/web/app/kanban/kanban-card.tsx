'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { COLUMNS, type OrdemServico, type StatusOS } from './data';
import { MapPin, MoreVertical, GripVertical, ArrowRight, Trash2, Eye } from 'lucide-react';

interface Props {
  order: OrdemServico;
  isDragging?: boolean;
  isSelected?: boolean;
  onSelect?: (order: OrdemServico) => void;
  onMove?: (orderId: string, targetStatus: StatusOS) => void;
  onDelete?: (orderId: string) => void;
}

export function KanbanCard({ 
  order, 
  isDragging = false, 
  isSelected = false,
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
        className="h-[125px] rounded-xl border-2 border-dashed border-primary/20 bg-muted"
      />
    );
  }

  const cleanTitle = order.titulo.replace('Ilimunição', 'Iluminação');
  const isUrgente = order.prioridade === 'URGENTE';
  const isAlta = order.prioridade === 'ALTA';
  const isMedia = order.prioridade === 'MEDIA';

  const osCode = order.id.startsWith('os-') 
    ? `OS-10492${order.id.replace('os-', '')}` 
    : order.id.toUpperCase().startsWith('OS-') 
      ? order.id.toUpperCase() 
      : `OS-${order.id}`;

  const isCard104924 = osCode === 'OS-104924';
  const solicitanteInitial = order.solicitante ? order.solicitante.charAt(0).toUpperCase() : 'P';
  const tecnicoInitial = order.tecnico ? order.tecnico.charAt(0).toUpperCase() : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect?.(order)}
      className={`relative bg-card rounded-xl p-3.5 cursor-grab active:cursor-grabbing group transition-all duration-200 select-none touch-none flex flex-col gap-3 ${
        isSelected 
          ? 'ring-2 ring-primary shadow-sm' 
          : 'border border-border shadow-sm hover:border-foreground/20 hover:shadow-md'
      } ${
        isDragging ? 'shadow-2xl ring-1 ring-primary/20 rotate-2 scale-[1.02] z-50' : ''
      }`}
    >
      {/* Header: OS ID + Menu */}
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-mono font-medium text-muted-foreground tracking-wide">
          {osCode}
        </span>

        {/* 3-dots menu button */}
        <div 
          className="relative -mt-1 -mr-1" 
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-muted-foreground/40 hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors outline-none"
          >
            <MoreVertical size={14} />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <>
              <div 
                className="fixed inset-0 z-20" 
                onClick={() => setMenuOpen(false)} 
              />
              <div className="absolute right-0 top-6 z-30 w-44 bg-popover rounded-lg shadow-lg border border-border py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onSelect?.(order);
                  }}
                  className="w-full px-3 py-1.5 text-left font-medium text-popover-foreground hover:bg-muted flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Eye size={13} className="text-muted-foreground" />
                  Ver detalhes
                </button>

                <div className="h-px bg-border my-1" />

                <div className="px-3 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Mover para:
                </div>
                {COLUMNS.filter((c) => c.id !== order.status).map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onMove?.(order.id, col.id);
                    }}
                    className="w-full px-3 py-1.5 text-left text-muted-foreground hover:bg-muted hover:text-popover-foreground flex items-center justify-between text-[11px] font-medium cursor-pointer transition-colors"
                  >
                    <span>{col.title}</span>
                    <ArrowRight size={11} className="text-muted-foreground/50" />
                  </button>
                ))}

                <div className="h-px bg-border my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    if (confirm(`Deseja realmente excluir o chamado "${cleanTitle}"?`)) {
                      onDelete?.(order.id);
                    }
                  }}
                  className="w-full px-3 py-1.5 text-left font-medium text-destructive hover:bg-destructive/10 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Trash2 size={13} />
                  Excluir chamado
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Body: Title & Location */}
      <div className="flex flex-col gap-1.5">
        <h4 className="font-medium text-foreground text-[13px] leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {cleanTitle}
        </h4>
        <div className="flex items-center text-[11px] text-muted-foreground">
          <MapPin size={11} className="mr-1.5 text-muted-foreground/60 shrink-0" />
          <span className="truncate">{order.predio}</span>
        </div>
      </div>

      {/* Footer: Priority + Avatars */}
      <div className="flex items-center justify-between mt-1">
        {/* Priority */}
        <div className="flex items-center">
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
          ) : isMedia ? (
            <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Média
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-muted-foreground/80 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full border border-muted-foreground/40" />
              Baixa
            </div>
          )}
        </div>
        
        {/* Avatars */}
        {isCard104924 ? (
          <div 
            title="Responsável: Dr. Marcelo Ramos"
            className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[9px] font-semibold flex items-center justify-center ring-2 ring-card shadow-sm select-none"
          >
            D
          </div>
        ) : (
          <div className="flex items-center -space-x-1">
            <div 
              title={`Solicitante: ${order.solicitante || 'Gestão'}`}
              className="w-5 h-5 rounded-full bg-muted border border-border text-muted-foreground text-[9px] font-semibold flex items-center justify-center ring-2 ring-card shadow-sm select-none z-10"
            >
              {solicitanteInitial}
            </div>

            {tecnicoInitial && (
              <div 
                title={`Técnico: ${order.tecnico}`}
                className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[9px] font-semibold flex items-center justify-center ring-2 ring-card shadow-sm select-none z-20"
              >
                {tecnicoInitial}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
