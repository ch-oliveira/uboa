'use client';

import React from 'react';
import { useOrders } from '@/context/orders-context';
import { useAuth } from '@/context/auth-context';
import { CopilotDrawer } from './copilot-drawer';

export function CopilotGlobal() {
  const { isCopilotOpen, closeCopilot } = useOrders();
  const { user } = useAuth();

  // O Copilot fica disponível para os usuários autenticados da gestão via Sidebar (ou Ctrl+J)
  if (!user) return null;

  return (
    <CopilotDrawer isOpen={isCopilotOpen} onClose={closeCopilot} />
  );
}
