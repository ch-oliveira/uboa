'use client';

import React from 'react';
import { 
  X, 
  ShieldAlert, 
  Flame, 
  Activity, 
  Users, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MATRIZ_CRITERIOS_URBOA } from '@/lib/triage-engine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function UrbiTriageModalCriteria({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs">
              <BookOpen size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded">
                  Governança Urbi IA
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs font-bold text-slate-600">Diretriz Operacional</span>
              </div>
              <h2 className="text-base font-extrabold text-slate-900">
                Matriz de Prioridade Predial da Urboa
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-700">
          {/* Apresentação metodológica */}
          <div className="bg-sky-50/70 border border-sky-200/70 rounded-xl p-4 text-xs text-sky-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sky-900">
              <ShieldAlert size={16} className="text-sky-700 shrink-0" />
              <span>Princípio da Revisão Humana Efetiva (Human-in-the-Loop)</span>
            </div>
            <p className="leading-relaxed text-sky-900/90">
              Em serviços públicos municipais, a inteligência artificial do Urbi atua como <strong>sistema de recomendação técnica</strong>. Conforme as boas práticas internacionais (como o <em>GOV.UK AI Playbook</em>) e diretrizes de auditoria pública, toda sugestão de prioridade deve ser explícita, auditável e submetida à confirmação do agente público responsável.
            </p>
          </div>

          {/* Os 5 Critérios da Matriz */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Os 5 Critérios Objetivos de Classificação
            </h3>

            <div className="space-y-3">
              {MATRIZ_CRITERIOS_URBOA.map((criterio, idx) => (
                <div 
                  key={criterio.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">
                      {criterio.nome}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      criterio.peso === 'CRITICO'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : criterio.peso === 'ALTO'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      Peso {criterio.peso}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {criterio.descricao}
                  </p>

                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Perguntas-Guia de Averiguação:
                    </span>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                      {criterio.perguntasGuia.map((p, i) => (
                        <li key={i} className="leading-snug">{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rastreabilidade e Auditoria */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1 text-slate-600">
            <span className="font-bold text-slate-800 block">Auditoria e Rastreabilidade</span>
            <p>
              Toda confirmação ou alteração de prioridade é registrada na linha do tempo do chamado com data, hora, identificação do agente público e fundamentação técnica perante órgãos de fiscalização (Tribunais de Contas e controladorias).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/80">
          <span className="text-[11px] text-slate-500 font-medium">
            Diretriz Urbi · ABNT NBR 5674 e Governança Pública
          </span>
          <Button
            onClick={onClose}
            className="bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold px-5 h-9"
          >
            Entendido
          </Button>
        </div>
      </div>
    </div>
  );
}
