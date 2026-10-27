'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Check, 
  Sparkles, 
  Lightbulb, 
  Compass,
  ShieldCheck,
  ExternalLink,
  ArrowUpRight
} from 'lucide-react';
import { useOnboarding } from '@/context/onboarding-context';
import { useOrders } from '@/context/orders-context';
import { useAuth } from '@/context/auth-context';

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
  const router = useRouter();
  const { role } = useAuth();
  const { openCopilot } = useOrders();
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
  const [actualPlacement, setActualPlacement] = useState<'top' | 'bottom' | 'left' | 'right' | 'center'>('bottom');
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });
  const [cardHeight, setCardHeight] = useState(380);
  const cardRef = useRef<HTMLDivElement>(null);

  // Mede altura real renderizada do card para prevenir qualquer corte de tela
  useEffect(() => {
    if (cardRef.current) {
      const h = cardRef.current.offsetHeight;
      if (h && Math.abs(h - cardHeight) > 4) {
        setCardHeight(h);
      }
    }
  }, [currentStep, windowDimensions.height, cardHeight]);

  // Atualiza dimensões da janela e bounding rect do elemento alvo
  const updateTargetPosition = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    setWindowDimensions({ width, height });

    if (!currentStep || !currentStep.targetSelector) {
      setRect(null);
      setActualPlacement('center');
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
        setActualPlacement('center');
      }
    } catch {
      setRect(null);
      setActualPlacement('center');
    }
  }, [currentStep]);

  useEffect(() => {
    if (!isActive) return;

    updateTargetPosition();

    // Re-calcula em scroll e resize
    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition, true);

    // Intervalos para acomodar animações ou renderizações assíncronas do DOM
    const t1 = setTimeout(updateTargetPosition, 80);
    const t2 = setTimeout(updateTargetPosition, 250);
    const t3 = setTimeout(updateTargetPosition, 500);

    return () => {
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition, true);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
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
  const isAdmin = role === 'ADMIN';

  let cardStyle: React.CSSProperties = {};
  let placement: 'top' | 'bottom' | 'left' | 'right' | 'center' = 'bottom';
  let caretStyle: React.CSSProperties = {};

  if (isMobile || !rect) {
    // No mobile ou se o elemento não for encontrado no DOM, centraliza como modal elevado
    placement = 'center';
    cardStyle = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 'calc(100% - 32px)',
      maxWidth: '440px',
      maxHeight: 'calc(100vh - 32px)',
    };
  } else {
    // No Desktop, calcula a melhor ancoragem com padding e clamp rígido contra overflow
    const cardWidth = Math.min(390, windowDimensions.width - 32);
    const actualHeight = cardHeight || 380;
    const cardMargin = 16;
    const desiredPos = currentStep.position || 'bottom';

    const targetCenterX = rect.left + rect.width / 2;
    const targetCenterY = rect.top + rect.height / 2;

    let left = 16;
    let top = 16;

    if (desiredPos === 'right' && rect.right + cardWidth + cardMargin <= windowDimensions.width - 16) {
      placement = 'right';
      left = rect.right + cardMargin;
      const idealTop = targetCenterY - Math.min(100, actualHeight / 3);
      top = Math.max(16, Math.min(windowDimensions.height - actualHeight - 16, idealTop));
    } else if (desiredPos === 'left' && rect.left - cardWidth - cardMargin >= 16) {
      placement = 'left';
      left = rect.left - cardWidth - cardMargin;
      const idealTop = targetCenterY - Math.min(100, actualHeight / 3);
      top = Math.max(16, Math.min(windowDimensions.height - actualHeight - 16, idealTop));
    } else if (
      desiredPos === 'top' || 
      (desiredPos === 'bottom' && rect.bottom + actualHeight + cardMargin > windowDimensions.height - 16 && rect.top > actualHeight + cardMargin)
    ) {
      placement = 'top';
      left = Math.max(16, Math.min(windowDimensions.width - cardWidth - 16, targetCenterX - cardWidth / 2));
      top = Math.max(16, rect.top - actualHeight - cardMargin);
    } else {
      placement = 'bottom';
      left = Math.max(16, Math.min(windowDimensions.width - cardWidth - 16, targetCenterX - cardWidth / 2));
      top = Math.max(16, Math.min(windowDimensions.height - actualHeight - 16, rect.bottom + cardMargin));
    }

    // Trava de segurança absoluta para garantir que NENHUM card saia do viewport
    left = Math.max(16, Math.min(windowDimensions.width - cardWidth - 16, left));
    top = Math.max(16, Math.min(windowDimensions.height - actualHeight - 16, top));

    cardStyle = {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${cardWidth}px`,
      maxHeight: 'calc(100vh - 32px)',
    };

    // Alinhamento dinâmico do ponteiro direcionador (Caret) com o centro do elemento alvo
    if (placement === 'right' || placement === 'left') {
      const relativeY = targetCenterY - top;
      const caretY = Math.max(24, Math.min(actualHeight - 32, relativeY - 8));
      caretStyle = { top: `${caretY}px` };
    } else if (placement === 'top' || placement === 'bottom') {
      const relativeX = targetCenterX - left;
      const caretX = Math.max(24, Math.min(cardWidth - 32, relativeX - 8));
      caretStyle = { left: `${caretX}px` };
    }
  }

  function handleDirectAction() {
    if (currentStep?.actionRoute) {
      router.push(currentStep.actionRoute);
      skipTour();
    } else if (currentStep?.actionEvent === 'open-copilot') {
      skipTour();
      openCopilot();
    }
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
            fill="rgba(15, 23, 42, 0.76)"
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
            className="rounded-2xl border-2 border-[#2563EB] shadow-[0_0_28px_rgba(37,99,235,0.45)] ring-4 ring-[#2563EB]/25 z-[125]"
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
          className="z-[130] bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-[0_25px_50px_rgba(15,23,42,0.25),0_4px_12px_rgba(15,23,42,0.08)] text-left select-none relative flex flex-col justify-between overflow-hidden"
          role="dialog"
          aria-labelledby="tour-step-title"
        >
          {/* Seta Indicadora Dinâmica (Caret) com alinhamento preciso */}
          {rect && placement === 'right' && (
            <div style={caretStyle} className="absolute -left-2 w-4 h-4 bg-white border-l border-b border-slate-200/90 rotate-45 pointer-events-none z-20" />
          )}
          {rect && placement === 'left' && (
            <div style={caretStyle} className="absolute -right-2 w-4 h-4 bg-white border-r border-t border-slate-200/90 rotate-45 pointer-events-none z-20" />
          )}
          {rect && placement === 'bottom' && (
            <div style={caretStyle} className="absolute -top-2 w-4 h-4 bg-white border-l border-t border-slate-200/90 rotate-45 pointer-events-none z-20" />
          )}
          {rect && placement === 'top' && (
            <div style={caretStyle} className="absolute -bottom-2 w-4 h-4 bg-white border-r border-b border-slate-200/90 rotate-45 pointer-events-none z-20" />
          )}

          {/* Header do Card (shrink-0) */}
          <div className="flex items-center justify-between gap-2 mb-2 relative z-10 shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0A2540] text-white">
                {isAdmin ? (
                  <ShieldCheck size={12} strokeWidth={2.2} className="text-blue-300" />
                ) : (
                  <Compass size={12} strokeWidth={2} />
                )}
                Passo {currentStepIndex + 1} de {totalSteps}
              </span>
              {currentStep.badge && (
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
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

          {/* Corpo com Scroll Interno Protegido (overflow-y-auto) */}
          <div className="overflow-y-auto flex-1 min-h-0 pr-1 -mr-1 my-2 space-y-3 relative z-10">
            {/* Título e Descrição */}
            <div className="space-y-1">
              <h3 id="tour-step-title" className="text-base font-black text-slate-900 leading-snug tracking-tight">
                {currentStep.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {currentStep.description}
              </p>
            </div>

            {/* Dica Operacional (Action Tip) */}
            {currentStep.actionTip && (
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/70 text-[11px] text-amber-900 font-medium">
                <Lightbulb size={14} strokeWidth={2} className="text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-tight">{currentStep.actionTip}</span>
              </div>
            )}

            {/* Direct Interactive Action Button */}
            {currentStep.actionLabel && (
              <button
                type="button"
                onClick={handleDirectAction}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50/70 hover:from-blue-100/90 hover:to-indigo-100/90 border border-blue-200/80 text-[#2563EB] text-xs font-bold transition-all flex items-center justify-between group cursor-pointer shadow-2xs active:scale-[0.99]"
              >
                <span className="flex items-center gap-2">
                  {currentStep.actionEvent === 'open-copilot' ? (
                    <Sparkles size={14} className="text-[#2563EB]" />
                  ) : (
                    <ExternalLink size={14} className="text-[#2563EB]" />
                  )}
                  <span>{currentStep.actionLabel}</span>
                </span>
                <ArrowUpRight size={14} className="text-[#2563EB] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            )}
          </div>

          {/* Barra de Progresso + Rodapé com Navegação (shrink-0) */}
          <div className="shrink-0 pt-2 relative z-10 border-t border-slate-100/80">
            <div className="w-full bg-slate-100 h-1.5 rounded-full mb-3 overflow-hidden">
              <div 
                className="bg-[#2563EB] h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
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
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
