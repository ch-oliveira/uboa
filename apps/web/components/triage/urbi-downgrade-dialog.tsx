'use client';

import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Prioridade } from '@/app/kanban/data';

interface Props {
  isOpen: boolean;
  suggestedPriority: Prioridade;
  targetPriority: Prioridade;
  onConfirm: (justification: string) => void;
  onCancel: () => void;
}

const COMMON_JUSTIFICATIONS = [
  'Existe equipamento alternativo ou reserva em operação na unidade',
  'O atendimento público e os procedimentos não foram suspensos',
  'Contenção provisória de segurança já foi realizada pela equipe local',
  'Dano pontual/estético sem risco iminente à saúde ou integridade física',
];

export function UrbiDowngradeDialog({
  isOpen,
  suggestedPriority,
  targetPriority,
  onConfirm,
  onCancel,
}: Props) {
  const [selectedJustification, setSelectedJustification] = useState(COMMON_JUSTIFICATIONS[0]);
  const [customText, setCustomText] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalReason = (useCustom && customText.trim()) ? customText.trim() : (selectedJustification || 'Reclassificação fundamentada pelo operador');
    onConfirm(finalReason);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-amber-200 w-full max-w-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-amber-100 flex items-center justify-between bg-amber-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-amber-950">
                Justificativa de Reclassificação
              </h3>
              <p className="text-[11px] text-amber-800/80">
                Rastreabilidade de decisão pública (Controle Interno)
              </p>
            </div>
          </div>

          <button 
            onClick={onCancel}
            className="text-amber-800 hover:text-amber-950 rounded-lg p-1.5 hover:bg-amber-100/50 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            O Urbi sugeriu prioridade <strong className="text-rose-700 font-black">{suggestedPriority}</strong> com base nos indícios de risco. Você está definindo a prioridade como <strong className="text-slate-900 font-black">{targetPriority}</strong>.
          </p>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Selecione o motivo da reclassificação:
            </label>
            <div className="space-y-1.5">
              {COMMON_JUSTIFICATIONS.map((item) => (
                <label 
                  key={item}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    !useCustom && selectedJustification === item
                      ? 'border-blue-900 bg-blue-50/50 text-blue-950 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="justification"
                    checked={!useCustom && selectedJustification === item}
                    onChange={() => {
                      setSelectedJustification(item);
                      setUseCustom(false);
                    }}
                    className="mt-0.5 accent-blue-900"
                  />
                  <span>{item}</span>
                </label>
              ))}

              <label 
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  useCustom
                    ? 'border-blue-900 bg-blue-50/50 text-blue-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="justification"
                  checked={useCustom}
                  onChange={() => setUseCustom(true)}
                  className="mt-0.5 accent-blue-900"
                />
                <span>Outra justificativa técnica fundamentada</span>
              </label>
            </div>

            {useCustom && (
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Descreva a razão técnica pela qual o chamado não requer atendimento de alto risco..."
                required
                rows={3}
                className="w-full mt-2 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 text-slate-800"
              />
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="rounded-xl border-slate-200 text-slate-700 text-xs font-bold h-9 px-4"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold h-9 px-4"
            >
              Salvar e Registrar Decisão
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
