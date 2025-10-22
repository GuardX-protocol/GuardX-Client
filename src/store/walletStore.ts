import { create } from 'zustand';

interface WalletState {
  isWalletModalOpen: boolean;
  openWalletModal: () => void;
  closeWalletModal: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  isWalletModalOpen: false,
  openWalletModal: () => set({ isWalletModalOpen: true }),
  closeWalletModal: () => set({ isWalletModalOpen: false }),
}));