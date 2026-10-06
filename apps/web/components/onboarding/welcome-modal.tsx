'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  Building2, 
  Wrench, 
  FileText,
  Compass
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useOnboarding } from '@/context/onboarding-context';
import { type UserRole } from '@/types/auth';

const cubicSpring = [0.16, 1, 0.3, 1] as const;

interface RoleHighlightInfo {
  title: string;
  subtitle: string;
  highlights: string[];
  icon: any;
}

const DEFAULT_HIGHLIGHT: RoleHighlightInfo = {
  title: 'Bem-vindo ao Centro de Gestão Urboa',
  subtitle: 'Controle em tempo real de chamados públicos, métricas de SLA e conformidade da ABNT NBR 5674.',
  highlights: [
    'Triagem de chamados e priorização com 1 clique',
    'Monitoramento de SLAs e alertas de vencimento',
    'Inventário territorial com geolocalização de prédios',
  ],
  icon: Building2,
};

const ROLE_HIGHLIGHTS: Record<UserRole, RoleHighlightInfo> = {
  GESTOR: DEFAULT_HIGHLIGHT,
    SOLICITANTE: {
      title: 'Portal de Manutenção da sua Unidade',
      subtitle: 'Canal direto para resolver problemas prediais da sua escola ou unidade de saúde com rapidez.',
      highlights: [
        'Abertura simplificada de ocorrências com fotos',
        'Acompanhamento do deslocamento do técnico',
        'Avisos instantâneos quando o serviço for concluído',
      ],
      icon: FileText,
    },
    TECNICO: {
      title: 'Painel Operacional do Técnico Urboa',
      subtitle: 'Suas ordens de serviço do dia, itinerários de vistorias e registro de execução.',
      highlights: [
        'Lista de OSs atribuídas com prioridades claras',
        'Endereço, contatos e histórico do edifício',
        'Anexo de fotos do reparo para comprovação',
      ],
      icon: Wrench,
    },
    ADMIN: {
      title: 'Console de Administração Urboa',
      subtitle: 'Governança, gestão de equipes, permissões e parâmetros regulamentares.',
      highlights: [
        'Trilhas imutáveis de auditoria para órgãos de controle',
        'Parametrização de SLAs e metas da prefeitura',
        'Diagnósticos de infraestrutura e saúde da API',
      ],
      icon: ShieldCheck,
    },
  };

export function WelcomeModal() {
  const { user, role } = useAuth();
  const { showWelcomeModal, setShowWelcomeModal, startTour, skipTour } = useOnboarding();

  if (!showWelcomeModal) return null;

  const currentInfo = ROLE_HIGHLIGHTS[role] ?? DEFAULT_HIGHLIGHT;
  const RoleIcon = currentInfo.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.35, ease: cubicSpring }}
          className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_25px_60px_rgba(15,23,42,0.18),0_2px_4px_rgba(15,23,42,0.04)] text-left overflow-hidden"
          role="dialog"
          aria-labelledby="welcome-modal-title"
        >
          {/* Ambient header glow */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#2563EB]/[0.08] via-transparent to-transparent pointer-events-none" />

          {/* Close button */}
          <button
            onClick={skipTour}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Fechar e pular introdução"
          >
            <X size={18} strokeWidth={2} />
          </button>

          {/* Icon Header */}
          <div className="flex items-center gap-3.5 mb-5 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-[#0A2540] text-white flex items-center justify-center shadow-md shadow-slate-900/10">
              <RoleIcon size={22} strokeWidth={2} className="text-white" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#2563EB] border border-blue-200/60">
                <Compass size={12} strokeWidth={2} />
                Primeiro Acesso • {role}
              </span>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Olá, {user?.nome || 'Operador'}
              </p>
            </div>
          </div>

          {/* Title & description */}
          <div className="space-y-2 mb-6 relative z-10">
            <h2 id="welcome-modal-title" className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {currentInfo.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {currentInfo.subtitle}
            </p>
          </div>

          {/* Role highlights bullets */}
          <div className="space-y-2.5 bg-slate-50/90 rounded-2xl p-4 border border-slate-100 mb-6 relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              O que você pode fazer nesta sessão:
            </p>
            {currentInfo.highlights.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium leading-tight">
                <CheckCircle2 size={16} strokeWidth={2} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 relative z-10">
            <button
              onClick={skipTour}
              className="px-4 py-2.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors text-center cursor-pointer"
            >
              Explorar Sozinho
            </button>
            <button
              onClick={startTour}
              className="px-5 py-2.5 rounded-full bg-[#0A2540] hover:bg-[#07192C] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Sparkles size={15} strokeWidth={2} className="text-amber-400" />
              <span>Fazer Tour Rápido (1 min)</span>
              <ArrowRight size={15} strokeWidth={2} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
