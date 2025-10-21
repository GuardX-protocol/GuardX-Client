/**
 * Custom storage implementation that prevents QuotaExceededError
 * by silently failing when storage is full
 */

export const createSafeStorage = () => {
    return {
        getItem: (key: string) => {
            try {
                return localStorage.getItem(key);
            } catch (error) {
                console.warn('Failed to read from localStorage:', error);
                return null;
            }
        },
        setItem: (key: string, value: string) => {
            try {
                // Don't store if value is too large (>100KB)
                if (value.length > 100000) {
                    console.warn('Skipping large cache write:', key, value.length);
                    return;
                }
                localStorage.setItem(key, value);
            } catch (error) {
                // Silently fail if storage is full
                if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                    console.warn('Storage quota exceeded, clearing old data...');
                    try {
                        // Try to clear wagmi cache and retry
                        localStorage.removeItem('wagmi.cache');
                        localStorage.removeItem('wagmi.store');
                        localStorage.setItem(key, value);
                    } catch (retryError) {
                        // Still failed, just skip
                        console.warn('Could not save to storage');
                    }
                }
            }
        },
        removeItem: (key: string) => {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.warn('Failed to remove from localStorage:', error);
            }
        },
    };
};

export const safeStorage = createSafeStorage();
