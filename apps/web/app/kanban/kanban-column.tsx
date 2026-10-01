'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { KanbanColumn } from './data';
import { MoreHorizontal, Check } from 'lucide-react';

interface Props {
  column: KanbanColumn;
  count: number;
  children: React.ReactNode;
}

export function KanbanColumnComponent({ column, count, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[260px] flex flex-col h-full rounded-2xl transition-colors shrink-0 ${
        isOver ? 'bg-primary/5' : 'bg-transparent'
      }`}
    >
      {/* Column Header */}
      <div className="px-1 py-1 mb-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${column.dotColor}`} />
            <h3 className="font-bold text-foreground text-xs tracking-tight">{column.title}</h3>
            <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] bg-muted text-muted-foreground text-[11px] font-semibold rounded-full px-1.5">
              {count}
            </span>
          </div>

          <button
            type="button"
            className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors cursor-pointer"
            title="Mais opções da coluna"
          >
            <MoreHorizontal size={15} />
          </button>
        </div>

        {column.subtitle && (
          <p className="text-[11px] text-muted-foreground mt-0.5 font-normal">
            {column.subtitle}
          </p>
        )}
      </div>

      {/* Cards Container */}
      <div className="flex-1 overflow-y-auto px-0.5 pb-4 space-y-2.5 scrollbar-thin">
        {children}
        {count === 0 && (
          <div className="rounded-2xl border border-border bg-card/50 p-6 flex flex-col items-center justify-center text-center mt-1 min-h-[380px]">
            <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground mb-3 shadow-2xs">
              <Check size={20} strokeWidth={2.2} />
            </div>
            <h4 className="font-bold text-xs text-foreground">Nenhuma confirmação pendente</h4>
            <p className="text-[11px] text-muted-foreground max-w-[200px] mt-1.5 leading-relaxed">
              Os serviços finalizados pela equipe aparecem aqui para validação da unidade.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
