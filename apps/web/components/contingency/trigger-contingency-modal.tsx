'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  CloudRain,
  Wind,
  SunMedium,
  Zap,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Loader2,
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';

export interface TriggerContingencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (summary: string) => void;
}

const EVENT_TYPES = [
  {
    id: 'CHUVA_INTENSA',
    label: 'Chuvas Intensas / Tempestade',
    icon: CloudRain,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
    desc: 'Risco de alagamentos, transbordamento de calhas, goteiras e inundação de subsolos.',
    checklist: [
      'Desobstrução e limpeza imediata de calhas, condutores e ralos pluviais',
      'Inspeção e teste de bombas elétricas de drenagem de subsolo e poços',
      'Verificação de infiltrações em lajes e estanqueidade de esquadrias',
      'Checagem do gerador de emergência e quadro de transferência (QTA)'
    ]
  },
  {
    id: 'VENDAVAL',
    label: 'Vendaval / Rajadas de Vento',
    icon: Wind,
    color: 'text-slate-700 dark:text-slate-300',
    bg: 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800',
    desc: 'Risco de destelhamento, queda de árvores sobre salas/fiação e placas soltas.',
    checklist: [
      'Inspeção de fixação de telhas, cumeeiras e rufos perimetrais',
      'Poda preventiva de galhos com risco de queda sobre fiação e coberturas',
      'Verificação de amarração de caixas d’água superiores e placas solares',
      'Inspeção de travas de janelas e portas externas'
    ]
  },
  {
    id: 'ONDA_DE_CALOR',
    label: 'Onda de Calor Extremo',
    icon: SunMedium,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
    desc: 'Risco de sobrecarga e queima de disjuntores, falha em salas de vacina e desidratação.',
    checklist: [
      'Inspeção de carga e aquecimento termográfico de disjuntores gerais',
      'Monitoramento contínuo de climatização em salas de vacinas e medicamentos',
      'Verificação de reservatórios e pressão de água potável para alunos e pacientes'
    ]
  },
  {
    id: 'DESCARGAS_ELETRICAS',
    label: 'Tempestade com Raios (SPDA)',
    icon: Zap,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900',
    desc: 'Risco de queima de servidores, equipamentos médicos e falha na proteção SPDA.',
    checklist: [
      'Inspeção visual e continuidade da malha de captores e descidas do SPDA',
      'Verificação dos Dispositivos de Proteção contra Surtos (DPS) nos quadros elétricos'
    ]
  }
];

export function TriggerContingencyModal({
  isOpen,
  onClose,
  onSuccess,
}: TriggerContingencyModalProps) {
  const [selectedEventType, setSelectedEventType] = useState('CHUVA_INTENSA');
  const [nivel, setNivel] = useState<'MODERADO' | 'PERIGO' | 'MUITO_PERIGOSO'>('PERIGO');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const currentEvent = EVENT_TYPES.find((e) => e.id === selectedEventType) || EVENT_TYPES[0]!;

  async function handleTrigger() {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await apiClient.triggerContingencyPlan({
        tipoEvento: selectedEventType,
        nivel,
      });

      if (res?.success) {
        onSuccess(
          res.message ||
            `Plano de contingência ativado com sucesso: ${res.data?.vistoriasGeradasCount} vistorias geradas.`
        );
        onClose();
      } else {
        setErrorMessage(res?.message || 'Falha ao acionar plano de contingência.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro de conexão ao disparar contingência.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-foreground/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
              <ShieldAlert size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">
                  Acionamento do Plano de Contingência
                </h2>
                <span className="text-[10px] font-mono font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-300">
                  Defesa Civil
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Disparo emergencial de vistorias preventivas com checklist de risco às unidades municipais.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
              <AlertTriangle size={15} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Seleção do Nível de Severidade */}
          <div className="space-y-1.5">
            <label className="font-bold text-foreground uppercase tracking-wider text-[11px]">
              Nível do Alerta Meteorológico (Defesa Civil / INMET):
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'MODERADO', label: 'Moderado (Amarelo)', desc: 'Atenção preventiva', color: 'border-amber-400 bg-amber-50/50 text-amber-900' },
                { id: 'PERIGO', label: 'Perigo (Laranja)', desc: 'Risco iminente', color: 'border-orange-500 bg-orange-50/50 text-orange-900' },
                { id: 'MUITO_PERIGOSO', label: 'Muito Perigoso (Vermelho)', desc: 'Emergência máxima', color: 'border-rose-500 bg-rose-50/50 text-rose-900' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setNivel(opt.id as any)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    nivel === opt.id
                      ? `${opt.color} ring-2 ring-primary/30 shadow-xs font-bold`
                      : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <p className="text-xs font-bold">{opt.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Seleção do Tipo de Evento Extremo */}
          <div className="space-y-1.5">
            <label className="font-bold text-foreground uppercase tracking-wider text-[11px]">
              Tipo de Evento Climático Extremo:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EVENT_TYPES.map((ev) => {
                const Icon = ev.icon;
                const isSelected = selectedEventType === ev.id;
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => setSelectedEventType(ev.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? `${ev.bg} ring-2 ring-primary/40 shadow-xs`
                        : 'border-border bg-card hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={16} className={ev.color} />
                      <span className="font-bold text-foreground text-xs">{ev.label}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {ev.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Checklist que será despachado para as equipes */}
          <div className="p-3.5 bg-muted/30 border border-border rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Sparkles size={14} className="text-primary" />
              <span>Checklist Oficial de Vistoria que será enviado às equipes:</span>
            </div>
            <ul className="space-y-1.5">
              {currentEvent?.checklist?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-border bg-muted/20 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            Despacha vistorias preventivas com status prioritário de contingência.
          </span>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs font-semibold rounded-xl h-9 px-4 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleTrigger}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl h-9 px-4.5 flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Acionando...</span>
                </>
              ) : (
                <>
                  <ShieldAlert size={15} />
                  <span>Disparar Vistorias Imediatas</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
