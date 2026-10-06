'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './auth-context';
import { type TourStep, type ChecklistMission } from '@/types/onboarding';
import { ROLE_TOUR_STEPS, ROLE_CHECKLIST_MISSIONS } from '@/lib/onboarding-data';

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
  missions: ChecklistMission[];
  completedMissionIds: string[];
  progressPercentage: number;
  startTour: () => void;
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
  const { user, role, isAuthenticated, isLoading } = useAuth();

  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);
  const [isChecklistVisible, setIsChecklistVisible] = useState<boolean>(false);
  const [isChecklistMinimized, setIsChecklistMinimized] = useState<boolean>(true);
  const [completedMissionIds, setCompletedMissionIds] = useState<string[]>([]);

  const activeSteps = useMemo<TourStep[]>(() => {
    return ROLE_TOUR_STEPS[role] || ROLE_TOUR_STEPS.GESTOR;
  }, [role]);

  const rawMissions = useMemo<ChecklistMission[]>(() => {
    return ROLE_CHECKLIST_MISSIONS[role] || ROLE_CHECKLIST_MISSIONS.GESTOR;
  }, [role]);

  const storageKeyPrefix = useMemo(() => `urboa_onboarding_${role}`, [role]);
  const storagePromptKey = `${storageKeyPrefix}_prompt_seen_v1`;
  const storageTourKey = `${storageKeyPrefix}_tour_done_v1`;
  const storageMissionsKey = `${storageKeyPrefix}_missions_v1`;

  // Carrega estado do localStorage na montagem ou quando trocar de perfil/usuário
  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      setIsActive(false);
      setShowWelcomeModal(false);
      setIsChecklistVisible(false);
      return;
    }

    try {
      const promptSeen = localStorage.getItem(storagePromptKey);
      const tourDone = localStorage.getItem(storageTourKey);
      const savedMissions = localStorage.getItem(storageMissionsKey);

      if (savedMissions) {
        setCompletedMissionIds(JSON.parse(savedMissions));
      } else {
        setCompletedMissionIds([]);
      }

      // Se é a primeira vez que o usuário loga neste perfil
      if (!promptSeen && !tourDone) {
        // Pequeno atraso para dar tempo da tela renderizar
        const timer = setTimeout(() => {
          setShowWelcomeModal(true);
        }, 800);
        return () => clearTimeout(timer);
      } else {
        // Se já viu o prompt mas ainda não completou tudo, mantém checklist minimizado disponível
        setIsChecklistVisible(true);
        setIsChecklistMinimized(true);
      }
    } catch {
      // Ignora erro de localStorage
    }
  }, [role, isAuthenticated, isLoading, storagePromptKey, storageTourKey, storageMissionsKey]);

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
    setShowWelcomeModal(false);
    setCurrentStepIndex(0);
    setIsActive(true);
    setIsChecklistVisible(true);
    setIsChecklistMinimized(true);
    try {
      localStorage.setItem(storagePromptKey, 'true');
    } catch {
      // ignore
    }
  }, [storagePromptKey]);

  const finishTour = useCallback(() => {
    setIsActive(false);
    setCurrentStepIndex(0);
    markMissionCompleted('mission-tour');
    try {
      localStorage.setItem(storageTourKey, 'true');
      localStorage.setItem(storagePromptKey, 'true');
    } catch {
      // ignore
    }
    // Expande checklist para mostrar progresso
    setIsChecklistVisible(true);
    setIsChecklistMinimized(false);
  }, [markMissionCompleted, storageTourKey, storagePromptKey]);

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
    try {
      localStorage.setItem(storagePromptKey, 'true');
    } catch {
      // ignore
    }
    setIsChecklistVisible(true);
    setIsChecklistMinimized(true);
  }, [storagePromptKey]);

  const resetTour = useCallback(() => {
    setCurrentStepIndex(0);
    setIsActive(true);
    setShowWelcomeModal(false);
    setIsChecklistVisible(true);
    setIsChecklistMinimized(true);
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
        missions,
        completedMissionIds,
        progressPercentage,
        startTour,
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
