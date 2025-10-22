import React from 'react';
import WalletModal from './WalletModal';
import { useWalletStore } from '@/store/walletStore';

const GlobalWalletModal: React.FC = () => {
  const { isWalletModalOpen, closeWalletModal } = useWalletStore();

  return (
    <WalletModal
      isOpen={isWalletModalOpen}
      onClose={closeWalletModal}
    />
  );
};

export default GlobalWalletModal;