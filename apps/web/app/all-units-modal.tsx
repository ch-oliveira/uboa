'use client';

import React from 'react';
import { X, Building2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  units: { name: string; openCount: number; totalCount: number }[];
  onSelectUnit: (unitName: string) => void;
}

export function AllUnitsModal({ isOpen, onClose, units, onSelectUnit }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-blue-900/10 text-blue-900 flex items-center justify-center">
              <Building2 size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Unidades Municipais</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {units.length} prédios públicos monitorados
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
        <div className="p-6 overflow-y-auto space-y-2.5 flex-1">
          {units.map((unit) => (
            <div
              key={unit.name}
              onClick={() => {
                onClose();
                onSelectUnit(unit.name);
              }}
              className="p-3.5 rounded-md border border-slate-200 hover:border-blue-900/30 hover:bg-slate-50 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-blue-900/10 group-hover:text-blue-900 text-slate-600 flex items-center justify-center transition-colors">
                  <Building2 size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-900 transition-colors">
                    {unit.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {unit.openCount > 0 ? (
                      <span className="text-amber-600 font-semibold">{unit.openCount} chamado(s) aberto(s)</span>
                    ) : (
                      <span className="text-emerald-600 font-semibold">Sem pendências</span>
                    )}
                    {' • '}{unit.totalCount} no histórico
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-900 group-hover:translate-x-0.5 transition-all" />
            </div>
          ))}
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
