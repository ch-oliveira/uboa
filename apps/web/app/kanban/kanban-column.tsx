'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { KanbanColumn } from './data';

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
      className={`w-[320px] flex flex-col h-full rounded-2xl transition-colors ${
        isOver ? 'bg-blue-50/60' : 'bg-transparent'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${column.dotColor}`} />
          <h3 className="font-bold text-slate-800 text-sm">{column.title}</h3>
        </div>
        <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] bg-slate-200 text-slate-600 text-xs font-bold rounded-full px-1.5">
          {count}
        </span>
      </div>

      {/* Cards Container */}
      <div className="flex-1 overflow-y-auto px-1 pb-4 space-y-3 scrollbar-thin">
        {children}
        {count === 0 && (
          <div className="flex items-center justify-center h-24 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-sm font-medium">
            Arraste um chamado aqui
          </div>
        )}
      </div>
    </div>
  );
}
