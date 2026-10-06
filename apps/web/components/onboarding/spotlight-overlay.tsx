'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Check, 
  Sparkles, 
  Lightbulb, 
  Compass
} from 'lucide-react';
import { useOnboarding } from '@/context/onboarding-context';

const cubicSpring = [0.16, 1, 0.3, 1] as const;

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

export function SpotlightOverlay() {
  const { 
    isActive, 
    currentStep, 
    currentStepIndex, 
    totalSteps, 
    nextStep, 
    prevStep, 
    skipTour 
  } = useOnboarding();

  const [rect, setRect] = useState<TargetRect | null>(null);
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Atualiza dimensões da janela e bounding rect do elemento alvo
  const updateTargetPosition = useCallback(() => {
    if (typeof window === 'undefined') return;

    setWindowDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    if (!currentStep || !currentStep.targetSelector) {
      setRect(null);
      return;
    }

    try {
      const element = document.querySelector(currentStep.targetSelector);
      if (element) {
        // Traz o elemento para a visualização caso esteja fora do viewport
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });

        const r = element.getBoundingClientRect();
        // Adiciona padding de conforto visual
        const padding = 8;
        setRect({
          top: Math.max(0, r.top - padding),
          left: Math.max(0, r.left - padding),
          width: r.width + padding * 2,
          height: r.height + padding * 2,
          bottom: r.bottom + padding,
          right: r.right + padding,
        });
      } else {
        setRect(null);
      }
    } catch {
      setRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!isActive) return;

    updateTargetPosition();

    // Re-calcula em scroll e resize
    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition, true);

    // Pequeno intervalo para acomodar animações ou renderizações assíncronas do DOM
    const t1 = setTimeout(updateTargetPosition, 100);
    const t2 = setTimeout(updateTargetPosition, 300);

    return () => {
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition, true);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isActive, updateTargetPosition]);

  // Navegação por teclado: Escape para sair, Seta Direita para avançar, Seta Esquerda para voltar
  useEffect(() => {
    if (!isActive) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        skipTour();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, nextStep, prevStep, skipTour]);

  if (!isActive || !currentStep) return null;

  // Cálculo da posição do card flutuante em relação ao elemento alvo
  const isMobile = windowDimensions.width < 640;
  const isLastStep = currentStepIndex === totalSteps - 1;

  let cardStyle: React.CSSProperties = {};

  if (isMobile || !rect) {
    // No mobile ou se o elemento não for encontrado no DOM, centraliza ou fixa na base
    cardStyle = {
      position: 'fixed',
      bottom: '24px',
      left: '16px',
      right: '16px',
      maxWidth: '480px',
      margin: '0 auto',
    };
  } else {
    // No Desktop, calcula a melhor ancoragem com padding de segurança
    const cardWidth = 380;
    const cardMargin = 16;
    const desiredPos = currentStep.position || 'bottom';

    let left = 16;
    let top = 16;

    if (desiredPos === 'right' && rect.right + cardWidth + cardMargin <= windowDimensions.width) {
      left = rect.right + cardMargin;
      top = Math.max(16, Math.min(windowDimensions.height - 280, rect.top - 20));
    } else if (desiredPos === 'left' && rect.left - cardWidth - cardMargin >= 0) {
      left = rect.left - cardWidth - cardMargin;
      top = Math.max(16, Math.min(windowDimensions.height - 280, rect.top - 20));
    } else if (desiredPos === 'top' || (desiredPos === 'bottom' && rect.bottom + 280 > windowDimensions.height && rect.top > 280)) {
      left = Math.max(16, Math.min(windowDimensions.width - cardWidth - 16, rect.left + rect.width / 2 - cardWidth / 2));
      top = Math.max(16, rect.top - 280);
    } else {
      left = Math.max(16, Math.min(windowDimensions.width - cardWidth - 16, rect.left + rect.width / 2 - cardWidth / 2));
      top = Math.min(windowDimensions.height - 280, rect.bottom + cardMargin);
    }

    cardStyle = {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${cardWidth}px`,
    };
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] pointer-events-auto">
        
        {/* ─── SVG SPOTLIGHT CUTOUT OVERLAY ─── */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-auto transition-opacity duration-300"
          style={{ width: '100vw', height: '100vh' }}
        >
          <defs>
            <mask id="tour-spotlight-mask">
              {/* Máscara base preta = esconde tudo (revela cor do fundo) */}
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {/* Recorte transparente onde o elemento alvo está localizado */}
              {rect && (
                <rect
                  x={rect.left}
                  y={rect.top}
                  width={rect.width}
                  height={rect.height}
                  rx="14"
                  ry="14"
                  fill="black"
                />
              )}
            </mask>
          </defs>

          {/* Fundo escurecido semi-transparente recortado pela máscara */}
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(15, 23, 42, 0.72)"
            mask="url(#tour-spotlight-mask)"
            className="cursor-default"
            onClick={skipTour}
          />
        </svg>

        {/* ─── PULSING GLOW AROUND TARGET ELEMENT ─── */}
        {rect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: `${rect.top}px`,
              left: `${rect.left}px`,
              width: `${rect.width}px`,
              height: `${rect.height}px`,
              pointerEvents: 'none',
            }}
            className="rounded-2xl border-2 border-[#2563EB] shadow-[0_0_24px_rgba(37,99,235,0.45)] ring-4 ring-[#2563EB]/20 z-[125]"
          />
        )}

        {/* ─── TETHERED TOUR CARD (Refactoring UI Principles) ─── */}
        <motion.div
          ref={cardRef}
          key={currentStep.id}
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.97 }}
          transition={{ duration: 0.28, ease: cubicSpring }}
          style={cardStyle}
          className="z-[130] bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-[0_20px_45px_rgba(15,23,42,0.22),0_4px_10px_rgba(15,23,42,0.06)] text-left select-none"
          role="dialog"
          aria-labelledby="tour-step-title"
        >
          {/* Header do Card: Badge + Passo X de Y + Botão Fechar */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0A2540] text-white">
                <Compass size={11} strokeWidth={2} />
                Passo {currentStepIndex + 1} de {totalSteps}
              </span>
              {currentStep.badge && (
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/50">
                  {currentStep.badge}
                </span>
              )}
            </div>

            <button
              onClick={skipTour}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Pular tour"
              title="Pular tour (Esc)"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>

          {/* Título e Descrição */}
          <div className="space-y-1.5 mb-4">
            <h3 id="tour-step-title" className="text-base font-extrabold text-slate-900 leading-snug">
              {currentStep.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {currentStep.description}
            </p>
          </div>

          {/* Dica Operacional (Action Tip) */}
          {currentStep.actionTip && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-[11px] text-amber-900 font-medium mb-5">
              <Lightbulb size={14} strokeWidth={2} className="text-amber-600 shrink-0 mt-0.5" />
              <span>{currentStep.actionTip}</span>
            </div>
          )}

          {/* Barra de Progresso em Linha */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full mb-4 overflow-hidden">
            <div 
              className="bg-[#2563EB] h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
            />
          </div>

          {/* Rodapé com Navegação */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={skipTour}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              Pular Tour
            </button>

            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <button
                  onClick={prevStep}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Voltar (Seta esquerda)"
                >
                  <ArrowLeft size={13} strokeWidth={2} />
                  <span>Anterior</span>
                </button>
              )}

              <button
                onClick={nextStep}
                className="px-4 py-1.5 rounded-full bg-[#0A2540] hover:bg-[#07192C] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                title="Avançar (Seta direita)"
              >
                {isLastStep ? (
                  <>
                    <span>Concluir</span>
                    <Check size={14} strokeWidth={2.5} className="text-emerald-400" />
                  </>
                ) : (
                  <>
                    <span>Próximo</span>
                    <ArrowRight size={13} strokeWidth={2} />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
