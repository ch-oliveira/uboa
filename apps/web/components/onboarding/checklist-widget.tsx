'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  RotateCcw, 
  X, 
  Compass, 
  ArrowUpRight,
  Target,
  Trophy
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useOnboarding } from '@/context/onboarding-context';

const cubicSpring = [0.16, 1, 0.3, 1] as const;

export function ChecklistWidget() {
  const router = useRouter();
  const { user, role } = useAuth();
  const { 
    isChecklistVisible, 
    setIsChecklistVisible, 
    isChecklistMinimized, 
    setIsChecklistMinimized, 
    missions, 
    progressPercentage, 
    toggleMission, 
    resetTour,
    isActive
  } = useOnboarding();

  // Não exibe se o spotlight tour estiver ativo na tela ou se o usuário fechou explicitamente
  if (!isChecklistVisible || isActive) return null;

  const completedCount = missions.filter((m) => m.isCompleted).length;
  const isAllDone = completedCount === missions.length && missions.length > 0;

  return (
    <div className="fixed bottom-5 right-5 z-40 select-none">
      <AnimatePresence mode="wait">
        {isChecklistMinimized ? (
          // ─── PILL MINIMIZADO (Refactoring UI: Floating Compact Capsule) ───
          <motion.button
            key="minimized-pill"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.25, ease: cubicSpring }}
            onClick={() => setIsChecklistMinimized(false)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#0A2540] hover:bg-[#07192C] text-white shadow-[0_8px_20px_rgba(10,37,64,0.25),inset_0_1px_0_rgba(255,255,255,0.2)] border border-slate-700/50 cursor-pointer transition-all active:scale-95 group"
            aria-label="Abrir checklist de primeiros passos"
          >
            {isAllDone ? (
              <Trophy size={15} strokeWidth={2} className="text-amber-400 shrink-0" />
            ) : (
              <Target size={15} strokeWidth={2} className="text-blue-400 shrink-0 group-hover:rotate-12 transition-transform" />
            )}

            <span className="text-xs font-bold tracking-tight">
              {isAllDone ? 'Missões Concluídas!' : 'Primeiros Passos'}
            </span>

            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              {completedCount}/{missions.length}
            </span>

            <ChevronUp size={14} strokeWidth={2} className="text-slate-400 group-hover:text-white transition-colors" />
          </motion.button>
        ) : (
          // ─── CARD EXPANDIDO (Refactoring UI: Elevation, Structured Hierarchy) ───
          <motion.div
            key="expanded-card"
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 14 }}
            transition={{ duration: 0.3, ease: cubicSpring }}
            className="w-80 sm:w-88 bg-white rounded-2xl border border-slate-200/90 shadow-[0_20px_45px_rgba(15,23,42,0.16),0_2px_4px_rgba(15,23,42,0.04)] overflow-hidden text-left"
          >
            {/* Header com Gradiente Sutil */}
            <div className="bg-[#0A2540] text-white p-4 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-200">
                  <Compass size={14} strokeWidth={2} />
                  <span>Guia de Início • {role}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsChecklistMinimized(true)}
                    className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Minimizar checklist"
                    title="Minimizar"
                  >
                    <ChevronDown size={15} strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => setIsChecklistVisible(false)}
                    className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Ocultar checklist"
                    title="Fechar guia"
                  >
                    <X size={15} strokeWidth={2} />
                  </button>
                </div>
              </div>

              <h4 className="text-sm font-black tracking-tight leading-snug">
                Primeiros Passos da Zeladoria
              </h4>

              {/* Barra de Progresso com Porcentagem */}
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                  <span>Progresso das missões</span>
                  <span className="text-white font-bold">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Lista de Missões Interativas */}
            <div className="p-3.5 space-y-2 max-h-72 overflow-y-auto">
              {missions.map((mission) => (
                <div
                  key={mission.id}
                  className={`p-2.5 rounded-xl border transition-all text-xs flex items-start gap-2.5 ${
                    mission.isCompleted
                      ? 'bg-slate-50/70 border-slate-200/60 opacity-80'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <button
                    onClick={() => toggleMission(mission.id)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer shrink-0"
                    aria-label={mission.isCompleted ? 'Desmarcar missão' : 'Marcar missão como concluída'}
                  >
                    {mission.isCompleted ? (
                      <CheckCircle2 size={16} strokeWidth={2.5} className="text-emerald-600" />
                    ) : (
                      <Circle size={16} strokeWidth={2} className="text-slate-300 hover:text-slate-500" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`font-bold leading-tight ${
                          mission.isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'
                        }`}
                      >
                        {mission.title}
                      </p>

                      {mission.actionRoute && !mission.isCompleted && (
                        <button
                          onClick={() => {
                            if (mission.actionRoute) router.push(mission.actionRoute);
                          }}
                          className="shrink-0 text-[10px] font-bold text-[#2563EB] hover:text-[#1d4ed8] hover:underline flex items-center gap-0.5 cursor-pointer ml-1"
                        >
                          <span>{mission.actionLabel || 'Ir'}</span>
                          <ArrowUpRight size={10} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal leading-relaxed mt-0.5">
                      {mission.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Rodapé de Ações */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={resetTour}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:text-[#1d4ed8] transition-colors cursor-pointer"
              >
                <RotateCcw size={13} strokeWidth={2} />
                <span>Reiniciar Tour Guiado</span>
              </button>

              <button
                onClick={() => setIsChecklistMinimized(true)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Minimizar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
