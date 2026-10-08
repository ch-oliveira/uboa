import { create } from 'zustand';
import { sqliteService } from '../database/sqlite-service';

interface NetworkState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncAt: string | null;
  setOnline: (status: boolean) => void;
  refreshPendingCount: () => void;
  setSyncing: (status: boolean) => void;
  setLastSyncAt: (date: string) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: true,
  isSyncing: false,
  pendingCount: 0,
  lastSyncAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),

  setOnline: (status: boolean) => set({ isOnline: status }),
  setSyncing: (status: boolean) => set({ isSyncing: status }),
  setLastSyncAt: (date: string) => set({ lastSyncAt: date }),

  refreshPendingCount: () => {
    try {
      const count = sqliteService.obterContagemPendentes();
      set({ pendingCount: count });
    } catch {
      // Falha graciosa se SQLite ainda não abriu
    }
  },
}));
