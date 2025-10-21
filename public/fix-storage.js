// Run this script to fix storage issues
// Add to your index.html before any other scripts

(function() {
  'use strict';
  
  console.log('🔧 Storage Fix Script Running...');
  
  // Override localStorage.setItem to prevent wagmi from filling storage
  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key, value) {
    // Block wagmi cache if it's too large
    if (key === 'wagmi.cache' && value.length > 100000) {
      console.warn('⚠️ Blocked large wagmi cache write:', (value.length / 1024).toFixed(2), 'KB');
      return;
    }
    
    try {
      originalSetItem.call(this, key, value);
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.warn('⚠️ Storage quota exceeded, clearing wagmi cache...');
        try {
          localStorage.removeItem('wagmi.cache');
          localStorage.removeItem('wagmi.store');
          localStorage.removeItem('wagmi.wallet');
          // Try again
          originalSetItem.call(this, key, value);
        } catch (retryError) {
          console.error('❌ Could not save to storage even after clearing');
        }
      } else {
        throw e;
      }
    }
  };
  
  // Clear wagmi cache on load
  try {
    localStorage.removeItem('wagmi.cache');
    localStorage.removeItem('wagmi.store');
    localStorage.removeItem('wagmi.wallet');
    console.log('✅ Cleared wagmi cache');
  } catch (e) {
    console.warn('Could not clear cache:', e);
  }
  
  console.log('✅ Storage Fix Script Complete');
})();
