'use client';

import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ArrowUpRight,
  Info,
  Loader2,
  Zap,
  BrainCircuit,
  Camera,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Prioridade, OrdemServico } from '@/app/kanban/data';
import { getPriorityBadge } from '@/lib/badges';
import { analyzeTriageUrbi } from '@/lib/triage-engine';
import { useUrbiSemanticTriage } from './use-urbi-semantic-triage';
import { UrbiTriageModalCriteria } from './urbi-triage-modal-criteria';
import { UrbiDowngradeDialog } from './urbi-downgrade-dialog';
import { ImageLightboxModal } from '@/components/ui/image-lightbox';

interface Props {
  order: OrdemServico;
  currentPriority: Prioridade;
  isSolicitante?: boolean;
  onChangePriority: (pri: Prioridade, justification?: string) => void;
}

export function UrbiTriageCard({
  order,
  currentPriority,
  isSolicitante = false,
  onChangePriority,
}: Props) {
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [pendingPriority, setPendingPriority] = useState<Prioridade | null>(null);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Hook de triagem de dois estágios: local imediato → semântico via Gemini
  const { triage, source, confidence, isAnalyzing } = useUrbiSemanticTriage(order);

  const isApplied = currentPriority === triage.suggestedPriority;

  function handleSelect(pri: Prioridade) {
    const isAiHighRisk = triage.suggestedPriority === 'URGENTE' || triage.suggestedPriority === 'ALTA';
    const isDowngrade = pri === 'MEDIA' || pri === 'BAIXA';

    if (isAiHighRisk && isDowngrade && pri !== currentPriority) {
      setPendingPriority(pri);
      setShowDowngradeModal(true);
    } else {
      onChangePriority(pri);
    }
  }

  function handleConfirmDowngrade(justification: string) {
    if (pendingPriority) {
      onChangePriority(pendingPriority, justification);
      setPendingPriority(null);
    }
    setShowDowngradeModal(false);
  }

  const shortImpact = useMemo(() => {
    const text = triage.possivelImpacto;
    if (!text) return 'Analisando impacto...';
    if (text.length <= 65) return text;
    return text.slice(0, 62) + '...';
  }, [triage.possivelImpacto]);

  if (isSolicitante) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Nível de Gravidade / Prioridade
          </label>
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getPriorityBadge(currentPriority)}`}>
            {currentPriority}
          </span>
        </div>
        <div className="text-xs font-bold text-slate-800">{currentPriority}</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">

      {/* Barra de Triagem Urbi — adapta visualmente ao estado atual */}
      <div className={`p-2.5 rounded-xl border transition-all ${
        isAnalyzing
          ? 'bg-indigo-50/40 border-indigo-200/60 animate-pulse'
          : source === 'gemini'
          ? isApplied
            ? 'bg-blue-50/50 border-blue-200/70'
            : 'bg-gradient-to-r from-indigo-50/80 via-sky-50/60 to-white border-indigo-200/80 shadow-xs'
          : 'bg-slate-50/80 border-slate-200/70'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {/* Ícone: animado durante análise, cérebro quando Gemini, raio para local */}
            <div className={`w-5.5 h-5.5 rounded-lg flex items-center justify-center shrink-0 shadow-xs transition-all ${
              isAnalyzing ? 'bg-indigo-500' : source === 'gemini' ? 'bg-blue-900' : 'bg-slate-500'
            }`}>
              {isAnalyzing ? (
                <Loader2 size={11} className="text-white animate-spin" />
              ) : source === 'gemini' ? (
                <BrainCircuit size={11} className="text-sky-300" />
              ) : (
                <Zap size={11} className="text-slate-200" />
              )}
            </div>

            <div className="min-w-0 text-xs flex items-center gap-1.5 flex-wrap">
              {isAnalyzing ? (
                <span className="font-semibold text-indigo-700 text-[11px]">
                  Urbi analisando com IA...
                </span>
              ) : (
                <>
                  <span className="font-extrabold text-blue-950 text-[11px]">Urbi sugere:</span>
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-md border ${
                    triage.suggestedPriority === 'URGENTE'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : triage.suggestedPriority === 'ALTA'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : triage.suggestedPriority === 'MEDIA'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}>
                    {triage.suggestedPriority}
                  </span>
                  <span className="text-[11px] text-slate-500 truncate hidden sm:inline" title={triage.possivelImpacto}>
                    · {shortImpact}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Lado direito: badge de provedor + botão Aplicar */}
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">

            {/* Badge de confiança (só quando Gemini respondeu) */}
            {source === 'gemini' && confidence && (
              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                confidence === 'ALTA'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : confidence === 'MEDIA'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}>
                {confidence === 'ALTA' ? '● Alta Conf.' : confidence === 'MEDIA' ? '● Média Conf.' : '● Baixa Conf.'}
              </span>
            )}


          </div>
        </div>

        {/* Gatilho para detalhes — só mostra quando não está carregando */}
        {!isAnalyzing && (
          <div className="mt-1.5 pt-1.5 border-t border-slate-200/50 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
              className="text-slate-600 hover:text-blue-900 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>{isDetailsExpanded ? 'Recolher checagem' : '3 perguntas de checagem'}</span>
              {isDetailsExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            <button
              type="button"
              onClick={() => setShowCriteriaModal(true)}
              className="text-slate-400 hover:text-blue-900 text-[10px] font-semibold flex items-center gap-0.5 transition-colors"
            >
              <span>Critérios</span>
              <ArrowUpRight size={11} />
            </button>
          </div>
        )}

        {/* Detalhes epistêmicos expandidos */}
        {isDetailsExpanded && !isAnalyzing && (
          <div className="mt-2.5 pt-2 border-t border-slate-200/70 space-y-2 text-xs animate-in fade-in duration-150">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                Dados do chamado:
              </span>
              <p className="text-slate-700 font-medium leading-relaxed">
                {triage.dadosInformados}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block mb-0.5">
                Possível impacto:
              </span>
              <p className="text-slate-600 leading-relaxed">
                {triage.possivelImpacto}
              </p>
            </div>

            <div className="bg-amber-50/60 p-2 rounded-lg border border-amber-200/60">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block mb-1">
                Confirmar antes de decidir:
              </span>
              <ul className="text-[11px] text-amber-950 space-y-0.5 pl-1">
                {triage.perguntasEmAberto.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Fundamentação técnica — destaque quando veio do Gemini */}
            {triage.fundamentacaoTecnica && (
              <div className={`p-2 rounded-lg border ${
                source === 'gemini'
                  ? 'bg-indigo-50/50 border-indigo-200/60'
                  : 'bg-slate-50 border-slate-200/60'
              }`}>
                <span className={`text-[10px] font-black uppercase tracking-wider block mb-0.5 ${
                  source === 'gemini' ? 'text-indigo-700' : 'text-slate-400'
                }`}>
                  {source === 'gemini' ? '✦ Fundamentação técnica (Gemini):' : 'Fundamentação:'}
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed italic">
                  {triage.fundamentacaoTecnica}
                </p>
              </div>
            )}

            {/* Matriz de critérios (quando semântica) */}
            {source === 'gemini' && triage.criteriosMatriz && triage.criteriosMatriz.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Matriz de Risco Urboa:
                </span>
                {triage.criteriosMatriz.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-[10px]">
                    <span className={`shrink-0 font-black mt-0.5 ${
                      c.status === 'ATENDIDO'   ? 'text-red-600'     :
                      c.status === 'PARCIAL'    ? 'text-amber-600'   :
                      c.status === 'A_CONFIRMAR'? 'text-blue-600'    :
                                                  'text-slate-400'
                    }`}>
                      {c.status === 'ATENDIDO'    ? '●' :
                       c.status === 'PARCIAL'     ? '◐' :
                       c.status === 'A_CONFIRMAR' ? '?' :
                                                    '○'}
                    </span>
                    <span className="text-slate-600">
                      <span className="font-semibold text-slate-800">{c.criterio}:</span>{' '}
                      {c.observacao}
                    </span>
                  </div>
                ))}
                <p className="text-[9px] text-slate-400 mt-1">
                  ● Confirmado  ◐ Parcial  ? A confirmar  ○ Não se aplica
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bloco de Evidências Fotográficas — Apoio Direto à Decisão de Triagem */}
      {order.fotos && order.fotos.length > 0 ? (
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Camera size={13} className="text-blue-900" />
              Evidências Fotográficas ({order.fotos.length})
            </span>
            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
              <Eye size={11} />
              Toque para ampliar
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {order.fotos.map((imgSrc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setLightboxIndex(idx);
                  setLightboxOpen(true);
                }}
                className="group relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100 hover:border-blue-900 hover:ring-2 hover:ring-blue-900/20 transition-all cursor-pointer shadow-2xs"
                title={`Ver foto ${idx + 1} em alta resolução`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgSrc}
                  alt={`Evidência ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <Eye size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-sm" />
                </div>
                <span className="absolute bottom-1 left-1 px-1 py-0.2 rounded text-[9px] font-bold bg-black/60 text-white backdrop-blur-xs">
                  #{idx + 1}
                </span>
              </button>
            ))}
          </div>

          <p className="text-[10px] text-slate-500 leading-tight">
            Inspeção visual enviada pelo solicitante para embasar a criticidade antes de confirmar a prioridade.
          </p>
        </div>
      ) : (
        <div className="px-2.5 py-1.5 rounded-lg bg-slate-50/60 border border-dashed border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <Camera size={12} className="text-slate-400" />
            Nenhuma foto anexada no momento da abertura
          </span>
          <span className="text-slate-400 font-normal">Triagem baseada no relato escrito</span>
        </div>
      )}

      {/* Grid de 4 Botões de Prioridade */}
      <div className="grid grid-cols-4 gap-1.5">
        {(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE'] as Prioridade[]).map((pri) => {
          const isSelected = currentPriority === pri;
          const isSuggested = triage.suggestedPriority === pri;

          return (
            <button
              key={pri}
              type="button"
              onClick={() => handleSelect(pri)}
              className={`relative py-1.5 px-1 rounded-xl text-[10px] font-black tracking-wide border transition-all flex flex-col items-center justify-center gap-0.5 ${
                isSelected
                  ? pri === 'URGENTE'
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : pri === 'ALTA'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : pri === 'MEDIA'
                    ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                    : 'bg-slate-700 text-white border-slate-700 shadow-xs'
                  : isSuggested
                  ? 'bg-blue-50/70 text-blue-950 border-blue-300 hover:bg-blue-100/70'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{pri}</span>
              {isSuggested && !isAnalyzing && (
                <span className={`text-[8px] font-extrabold uppercase tracking-tight px-1 rounded ${
                  isSelected ? 'bg-white/20 text-white' : 'text-blue-900 bg-blue-100/80'
                }`}>
                  {source === 'gemini' ? '✦ Urbi' : 'Urbi'}
                </span>
              )}
              {isSuggested && isAnalyzing && (
                <Loader2 size={8} className="animate-spin text-indigo-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explicação da Regra / SLA */}
      <p className="text-[10px] text-slate-500 flex items-start gap-1">
        <Info size={12} className="text-slate-400 shrink-0 mt-0.5" />
        <span>
          {currentPriority === 'URGENTE' && 'Risco iminente à vida, risco de choque elétrico ou alagamento de áreas críticas.'}
          {currentPriority === 'ALTA' && 'Compromete aulas, atendimento médico ou instalações públicas essenciais.'}
          {currentPriority === 'MEDIA' && 'Falha funcional contida que necessita de intervenção programada.'}
          {currentPriority === 'BAIXA' && 'Manutenção estética ou melhoria preventiva sem interrupção de atividades.'}
        </span>
      </p>

      {/* Modais */}
      <UrbiTriageModalCriteria
        isOpen={showCriteriaModal}
        onClose={() => setShowCriteriaModal(false)}
      />

      <UrbiDowngradeDialog
        isOpen={showDowngradeModal}
        suggestedPriority={triage.suggestedPriority}
        targetPriority={pendingPriority || 'MEDIA'}
        onConfirm={handleConfirmDowngrade}
        onCancel={() => {
          setShowDowngradeModal(false);
          setPendingPriority(null);
        }}
      />

      <ImageLightboxModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={order.fotos || []}
        initialIndex={lightboxIndex}
        title="Evidência Fotográfica do Chamado"
        subtitle={`Chamado ${order.id} • ${order.predio}`}
      />
    </div>
  );
}
