import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalletModalState {
  showSimpleModal: boolean;
  lastConnectedWallet: string | null;
  autoConnectAttempted: boolean;
  openWalletModal: () => void;
  closeSimpleModal: () => void;
  setLastConnectedWallet: (wallet: string) => void;
  setAutoConnectAttempted: (attempted: boolean) => void;
}

const useWalletModalStore = create<WalletModalState>()(
  persist(
    (set) => ({
      showSimpleModal: false,
      lastConnectedWallet: null,
      autoConnectAttempted: false,
      openWalletModal: () => set({ showSimpleModal: true }),
      closeSimpleModal: () => set({ showSimpleModal: false }),
      setLastConnectedWallet: (wallet: string) => set({ lastConnectedWallet: wallet }),
      setAutoConnectAttempted: (attempted: boolean) => set({ autoConnectAttempted: attempted }),
    }),
    {
      name: 'wallet-modal-storage',
      partialize: (state) => ({
        lastConnectedWallet: state.lastConnectedWallet,
        autoConnectAttempted: state.autoConnectAttempted,
      }),
    }
  )
);

export const useWalletModal = () => {
  const { 
    showSimpleModal, 
    openWalletModal, 
    closeSimpleModal,
    lastConnectedWallet,
    autoConnectAttempted,
    setLastConnectedWallet,
    setAutoConnectAttempted
  } = useWalletModalStore();

  return {
    openWalletModal,
    showSimpleModal,
    closeSimpleModal,
    lastConnectedWallet,
    autoConnectAttempted,
    setLastConnectedWallet,
    setAutoConnectAttempted,
  };
};