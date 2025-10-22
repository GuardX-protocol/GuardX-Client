import React from 'react';
import SimpleWalletModal from './SimpleWalletModal';
import { useWalletModal } from '@/hooks/useWalletModal';

const GlobalWalletModal: React.FC = () => {
  const { showSimpleModal, closeSimpleModal } = useWalletModal();

  return (
    <SimpleWalletModal
      isOpen={showSimpleModal}
      onClose={closeSimpleModal}
    />
  );
};

export default GlobalWalletModal;