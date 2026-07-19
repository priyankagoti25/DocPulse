import { create } from 'zustand';

interface RepoUIState {
  isConnectModalOpen: boolean;
  openConnectModal: () => void;
  closeConnectModal: () => void;
}

export const useRepoStore = create<RepoUIState>((set) => ({
  isConnectModalOpen: false,
  openConnectModal: () => set({ isConnectModalOpen: true }),
  closeConnectModal: () => set({ isConnectModalOpen: false }),
}));
