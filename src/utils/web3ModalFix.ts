// Utility to fix Web3Modal visibility issues
export const fixWeb3ModalHeader = () => {
  // Wait for the modal to be rendered
  setTimeout(() => {
    const modal = document.querySelector('w3m-modal');
    if (modal) {
      // Force modal visibility
      (modal as HTMLElement).style.display = 'block';
      (modal as HTMLElement).style.visibility = 'visible';
      (modal as HTMLElement).style.opacity = '1';

      // Force header visibility
      const header = modal.querySelector('w3m-modal-header');
      if (header) {
        (header as HTMLElement).style.display = 'flex';
        (header as HTMLElement).style.visibility = 'visible';
        (header as HTMLElement).style.opacity = '1';
        (header as HTMLElement).style.zIndex = '100000';
        (header as HTMLElement).style.position = 'relative';
        (header as HTMLElement).style.minHeight = '70px';
        (header as HTMLElement).style.padding = '20px 24px';
        (header as HTMLElement).style.background = 'linear-gradient(135deg, #1a1f2e 0%, #252a3a 100%)';
        (header as HTMLElement).style.borderBottom = '1px solid rgba(99, 102, 241, 0.3)';
        (header as HTMLElement).style.borderRadius = '24px 24px 0 0';
      }

      // Force content area visibility
      const content = modal.querySelector('w3m-modal-content, w3m-modal-router');
      if (content) {
        (content as HTMLElement).style.display = 'block';
        (content as HTMLElement).style.visibility = 'visible';
        (content as HTMLElement).style.opacity = '1';
        (content as HTMLElement).style.minHeight = '300px';
        (content as HTMLElement).style.padding = '20px';
        (content as HTMLElement).style.position = 'relative';
        (content as HTMLElement).style.zIndex = '1';
      }

      // Force all child elements to be visible
      const allElements = modal.querySelectorAll('*');
      allElements.forEach((element) => {
        const el = element as HTMLElement;
        if (el.style.display === 'none') {
          el.style.display = 'block';
        }
        if (el.style.visibility === 'hidden') {
          el.style.visibility = 'visible';
        }
        if (el.style.opacity === '0') {
          el.style.opacity = '1';
        }
      });

      // Fix title visibility
      const title = modal.querySelector('w3m-modal-header h2, w3m-modal-header .w3m-modal-title, w3m-text[variant="big-bold"]');
      if (title) {
        (title as HTMLElement).style.color = '#ffffff';
        (title as HTMLElement).style.fontSize = '24px';
        (title as HTMLElement).style.fontWeight = '700';
        (title as HTMLElement).style.display = 'block';
        (title as HTMLElement).style.visibility = 'visible';
        (title as HTMLElement).style.opacity = '1';
      }

      // Fix close button
      const closeButton = modal.querySelector('w3m-modal-close-button, w3m-modal-header button');
      if (closeButton) {
        (closeButton as HTMLElement).style.display = 'flex';
        (closeButton as HTMLElement).style.visibility = 'visible';
        (closeButton as HTMLElement).style.opacity = '1';
        (closeButton as HTMLElement).style.background = 'rgba(255, 255, 255, 0.1)';
        (closeButton as HTMLElement).style.borderRadius = '12px';
        (closeButton as HTMLElement).style.color = '#ffffff';
        (closeButton as HTMLElement).style.border = '1px solid rgba(255, 255, 255, 0.2)';
        (closeButton as HTMLElement).style.padding = '8px';
        (closeButton as HTMLElement).style.cursor = 'pointer';
      }

      // Force wallet buttons to be visible
      const walletButtons = modal.querySelectorAll('w3m-wallet-button');
      walletButtons.forEach((button) => {
        (button as HTMLElement).style.display = 'block';
        (button as HTMLElement).style.visibility = 'visible';
        (button as HTMLElement).style.opacity = '1';
      });
    }
  }, 100);
};

// Auto-fix when modal opens
export const initWeb3ModalFix = () => {
  // Add error handling for Web3Modal
  const originalError = console.error;
  console.error = (...args) => {
    // Suppress specific Web3Modal errors that don't affect functionality
    const errorMessage = args.join(' ');
    if (errorMessage.includes('Cannot read properties of null') && 
        errorMessage.includes('installedInjectedWallets')) {
      // Silently handle this error and try to fix the modal
      setTimeout(() => {
        fixWeb3ModalHeader();
      }, 200);
      return;
    }
    originalError.apply(console, args);
  };

  // Listen for modal open events
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        const modal = document.querySelector('w3m-modal[open]');
        if (modal) {
          fixWeb3ModalHeader();
          // Try multiple times to ensure content loads
          setTimeout(() => fixWeb3ModalHeader(), 500);
          setTimeout(() => fixWeb3ModalHeader(), 1000);
        }
      }
    });
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Also listen for Web3Modal specific events
  window.addEventListener('w3m-modal-open', () => {
    setTimeout(() => fixWeb3ModalHeader(), 100);
  });

  return observer;
};