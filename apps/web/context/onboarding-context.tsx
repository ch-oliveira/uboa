'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './auth-context';
import { type TourStep, type ChecklistMission } from '@/types/onboarding';
import { ROLE_TOUR_STEPS, ROLE_CHECKLIST_MISSIONS, MODULE_TOUR_STEPS } from '@/lib/onboarding-data';

interface OnboardingContextType {
  isActive: boolean;
  currentStepIndex: number;
  currentStep: TourStep | null;
  totalSteps: number;
  showWelcomeModal: boolean;
  setShowWelcomeModal: (show: boolean) => void;
  isChecklistVisible: boolean;
  setIsChecklistVisible: (visible: boolean) => void;
  isChecklistMinimized: boolean;
  setIsChecklistMinimized: (min: boolean | ((prev: boolean) => boolean)) => void;
  isFamiliarized: boolean;
  dismissChecklist: () => void;
  resetAllOnboarding: () => void;
  missions: ChecklistMission[];
  completedMissionIds: string[];
  progressPercentage: number;
  startTour: () => void;
  startModuleTour: (moduleId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  skipTour: () => void;
  resetTour: () => void;
  toggleMission: (missionId: string) => void;
  markMissionCompleted: (missionId: string) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, isAuthenticated, isLoading } = useAuth();

  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);
  const [isChecklistVisible, setIsChecklistVisible] = useState<boolean>(false);
  const [isChecklistMinimized, setIsChecklistMinimized] = useState<boolean>(true);
  const [isFamiliarized, setIsFamiliarized] = useState<boolean>(false);
  const [completedMissionIds, setCompletedMissionIds] = useState<string[]>([]);
  const [customSteps, setCustomSteps] = useState<TourStep[] | null>(null);

  const defaultRoleSteps = useMemo<TourStep[]>(() => {
    return ROLE_TOUR_STEPS[role] || ROLE_TOUR_STEPS.GESTOR;
  }, [role]);

  const activeSteps = useMemo<TourStep[]>(() => {
    if (customSteps && customSteps.length > 0) return customSteps;
    return defaultRoleSteps;
  }, [customSteps, defaultRoleSteps]);

  const rawMissions = useMemo<ChecklistMission[]>(() => {
    return ROLE_CHECKLIST_MISSIONS[role] || ROLE_CHECKLIST_MISSIONS.GESTOR;
  }, [role]);

  const storageKeyPrefix = useMemo(() => `urboa_onboarding_${role}`, [role]);
  const storagePromptKey = `${storageKeyPrefix}_prompt_seen_v2`;
  const storageTourKey = `${storageKeyPrefix}_tour_done_v2`;
  const storageMissionsKey = `${storageKeyPrefix}_missions_v2`;
  const storageFamiliarizedKey = `${storageKeyPrefix}_familiarized_v2`;

  // Carrega estado do localStorage na montagem ou quando trocar de perfil/usuário
  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      setIsActive(false);
      setShowWelcomeModal(false);
      setIsChecklistVisible(false);
      return;
    }

    try {
      // Limpa chaves antigas de módulos para garantir que novos tours sejam exibidos na primeira visualização
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.includes('_module_seen_') && !k.endsWith('_v5')) {
          localStorage.removeItem(k);
        }
      }

      const promptSeen = localStorage.getItem(storagePromptKey);
      const tourDone = localStorage.getItem(storageTourKey);
      const savedMissions = localStorage.getItem(storageMissionsKey);
      const familiarized = localStorage.getItem(storageFamiliarizedKey) === 'true';

      setIsFamiliarized(familiarized);

      if (savedMissions) {
        setCompletedMissionIds(JSON.parse(savedMissions));
      } else {
        setCompletedMissionIds([]);
      }

      // Se o usuário já se familiarizou com o primeiro uso, NUNCA exibe o checklist
      if (familiarized) {
        setIsChecklistVisible(false);
        return;
      }

      // Se é a primeira vez que o usuário loga neste perfil
      if (!promptSeen && !tourDone) {
        // Pequeno atraso para dar tempo da tela renderizar
        const timer = setTimeout(() => {
          setShowWelcomeModal(true);
        }, 800);
        return () => clearTimeout(timer);
      } else {
        // Se ainda não se familiarizou, mantém disponível minimizado
        setIsChecklistVisible(true);
        setIsChecklistMinimized(true);
      }
    } catch {
      // Ignora erro de localStorage
    }
  }, [role, isAuthenticated, isLoading, storagePromptKey, storageTourKey, storageMissionsKey, storageFamiliarizedKey]);

  // Persiste missões sempre que houver alteração
  const saveMissions = useCallback(
    (newCompleted: string[]) => {
      setCompletedMissionIds(newCompleted);
      try {
        localStorage.setItem(storageMissionsKey, JSON.stringify(newCompleted));
      } catch {
        // localStorage error handling
      }
    },
    [storageMissionsKey]
  );

  const markMissionCompleted = useCallback(
    (missionId: string) => {
      setCompletedMissionIds((prev) => {
        if (prev.includes(missionId)) return prev;
        const next = [...prev, missionId];
        try {
          localStorage.setItem(storageMissionsKey, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [storageMissionsKey]
  );

  // Rastreia rotas acessadas e conclui automaticamente as missões correspondentes
  useEffect(() => {
    if (!pathname || !isAuthenticated) return;
    if (pathname === '/') {
      markMissionCompleted('mission-kpi');
    } else if (pathname === '/chamados' || pathname === '/kanban') {
      markMissionCompleted('mission-triagem');
      markMissionCompleted('mission-os');
      markMissionCompleted('mission-audit-trail');
    } else if (pathname === '/unidades') {
      markMissionCompleted('mission-unidades');
    } else if (pathname === '/agenda') {
      markMissionCompleted('mission-agenda');
      markMissionCompleted('mission-tecnico-agenda');
    } else if (pathname === '/configuracoes') {
      markMissionCompleted('mission-auditoria');
      markMissionCompleted('mission-sla-params');
    } else if (pathname === '/abrir-chamado') {
      markMissionCompleted('mission-primeiro-chamado');
    }
  }, [pathname, isAuthenticated, markMissionCompleted]);

  // Dispara o onboarding de cada módulo a partir da primeira visualização do usuário
  useEffect(() => {
    if (!pathname || !isAuthenticated || isLoading) return;

    const currentModule = pathname === '/' ? 'home' : pathname.split('/')[1];

    // Se estiver na Home ou rota sem segmento
    if (!currentModule || currentModule === 'home') {
      if (customSteps) {
        setCustomSteps(null);
        setIsActive(false);
        setCurrentStepIndex(0);
      }
      return;
    }

    // Se a rota não tem módulo de tour definido
    const moduleSteps = MODULE_TOUR_STEPS[currentModule];
    if (!moduleSteps || moduleSteps.length === 0) {
      if (customSteps) {
        setCustomSteps(null);
        setIsActive(false);
        setCurrentStepIndex(0);
      }
      return;
    }

    // Se o tour DESTE módulo já estiver ativo, não reinicia
    if (isActive && customSteps === moduleSteps) {
      return;
    }

    // Se havia um tour ativo de outro módulo ou da Home, reseta para dar espaço ao novo
    if (isActive) {
      setIsActive(false);
      setCustomSteps(null);
      setCurrentStepIndex(0);
    }

    const moduleSeenKey = `${storageKeyPrefix}_module_seen_${currentModule}_v5`;

    try {
      const alreadySeen = localStorage.getItem(moduleSeenKey);
      if (!alreadySeen) {
        // Aguarda 200ms para que o DOM do módulo monte os elementos alvos
        const timer = setTimeout(() => {
          setCustomSteps(moduleSteps);
          setCurrentStepIndex(0);
          setIsActive(true);

          // IMPORTANTE: Marca como visto APENAS quando o tour realmente inicia,
          // nunca antes de forma síncrona!
          try {
            localStorage.setItem(moduleSeenKey, 'true');
          } catch {
            // ignore
          }
        }, 200);

        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, [pathname, isAuthenticated, isLoading, storageKeyPrefix, isActive, customSteps]);

  const toggleMission = useCallback(
    (missionId: string) => {
      setCompletedMissionIds((prev) => {
        const next = prev.includes(missionId) ? prev.filter((id) => id !== missionId) : [...prev, missionId];
        try {
          localStorage.setItem(storageMissionsKey, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [storageMissionsKey]
  );

  const startTour = useCallback(() => {
    if (pathname !== '/') {
      router.push('/');
    }
    setCustomSteps(null);
    setShowWelcomeModal(false);
    setCurrentStepIndex(0);
    setIsActive(true);
    try {
      localStorage.setItem(storagePromptKey, 'true');
    } catch {
      // ignore
    }
  }, [router, pathname, storagePromptKey]);

  const startModuleTour = useCallback((moduleId: string) => {
    const steps = MODULE_TOUR_STEPS[moduleId];
    if (steps && steps.length > 0) {
      setCustomSteps(steps);
      setCurrentStepIndex(0);
      setIsActive(true);
    }
  }, []);

  const finishTour = useCallback(() => {
    setIsActive(false);
    setCurrentStepIndex(0);
    setCustomSteps(null);

    // Conclui missões vinculadas ao tour
    markMissionCompleted('mission-tour');
    markMissionCompleted('mission-tecnico-tour');

    try {
      localStorage.setItem(storageTourKey, 'true');
      localStorage.setItem(storagePromptKey, 'true');
    } catch {
      // ignore
    }

    // Não expande forçadamente o checklist para não atrapalhar o fluxo de trabalho
    if (!isFamiliarized) {
      setIsChecklistVisible(true);
      setIsChecklistMinimized(true);
    }
  }, [markMissionCompleted, storageTourKey, storagePromptKey, isFamiliarized]);

  const nextStep = useCallback(() => {
    if (currentStepIndex < activeSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      finishTour();
    }
  }, [currentStepIndex, activeSteps.length, finishTour]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const goToStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < activeSteps.length) {
        setCurrentStepIndex(index);
      }
    },
    [activeSteps.length]
  );

  const skipTour = useCallback(() => {
    setIsActive(false);
    setCurrentStepIndex(0);
    setCustomSteps(null);

    try {
      localStorage.setItem(storagePromptKey, 'true');
      localStorage.setItem(storageTourKey, 'true');
    } catch {
      // ignore
    }
  }, [storagePromptKey, storageTourKey]);

  const resetTour = useCallback(() => {
    // Se o usuário estiver dentro de um módulo específico, reinicia o tour daquele módulo
    const currentModule = pathname ? pathname.split('/')[1] : null;
    if (currentModule && MODULE_TOUR_STEPS[currentModule]) {
      startModuleTour(currentModule);
      return;
    }

    if (pathname !== '/') {
      router.push('/');
    }
    setCustomSteps(null);
    setCurrentStepIndex(0);
    setIsActive(true);
    setShowWelcomeModal(false);
  }, [router, pathname, startModuleTour]);

  const dismissChecklist = useCallback(() => {
    setIsChecklistVisible(false);
    setIsFamiliarized(true);
    try {
      localStorage.setItem(storageFamiliarizedKey, 'true');
    } catch {
      // ignore
    }
  }, [storageFamiliarizedKey]);

  const resetAllOnboarding = useCallback(() => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('urboa_onboarding_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore
    }
    setIsFamiliarized(false);
    setCompletedMissionIds([]);
    setIsActive(false);
    setCustomSteps(null);
    setCurrentStepIndex(0);
    setIsChecklistVisible(true);
    setIsChecklistMinimized(true);
    setShowWelcomeModal(true);
  }, []);

  const missions = useMemo(() => {
    return rawMissions.map((m) => ({
      ...m,
      isCompleted: completedMissionIds.includes(m.id),
    }));
  }, [rawMissions, completedMissionIds]);

  const progressPercentage = useMemo(() => {
    if (!missions.length) return 0;
    const completedCount = missions.filter((m) => m.isCompleted).length;
    return Math.round((completedCount / missions.length) * 100);
  }, [missions]);

  const currentStep = useMemo(() => {
    if (!isActive) return null;
    return activeSteps[currentStepIndex] || null;
  }, [isActive, activeSteps, currentStepIndex]);

  return (
    <OnboardingContext.Provider
      value={{
        isActive,
        currentStepIndex,
        currentStep,
        totalSteps: activeSteps.length,
        showWelcomeModal,
        setShowWelcomeModal,
        isChecklistVisible,
        setIsChecklistVisible,
        isChecklistMinimized,
        setIsChecklistMinimized,
        isFamiliarized,
        dismissChecklist,
        resetAllOnboarding,
        missions,
        completedMissionIds,
        progressPercentage,
        startTour,
        startModuleTour,
        nextStep,
        prevStep,
        goToStep,
        skipTour,
        resetTour,
        toggleMission,
        markMissionCompleted,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding deve ser utilizado dentro de um OnboardingProvider');
  }
  return context;
}
