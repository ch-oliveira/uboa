import { type UserRole } from './auth';

export type TourPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface TourStep {
  id: string;
  targetSelector?: string; // CSS selector, e.g. '[data-tour="kpi-cards"]'
  title: string;
  description: string;
  role: UserRole | 'ALL';
  position?: TourPosition;
  badge?: string;
  actionTip?: string;
}

export interface ChecklistMission {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  actionRoute?: string;
  actionLabel?: string;
}

export interface OnboardingState {
  isActive: boolean;
  currentStepIndex: number;
  hasCompletedWelcomeModal: boolean;
  isChecklistVisible: boolean;
  completedMissions: string[];
}
