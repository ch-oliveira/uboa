'use client';

import React from 'react';
import { WelcomeModal } from './welcome-modal';
import { SpotlightOverlay } from './spotlight-overlay';
import { ChecklistWidget } from './checklist-widget';
import { useAuth } from '@/context/auth-context';

export function OnboardingGlobal() {
  const { isAuthenticated, isLoading } = useAuth();

  // Só renderiza para usuários autenticados
  if (isLoading || !isAuthenticated) return null;

  return (
    <>
      <WelcomeModal />
      <SpotlightOverlay />
      <ChecklistWidget />
    </>
  );
}
