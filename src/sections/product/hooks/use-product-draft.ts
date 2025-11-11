import { useCallback } from 'react';

/**
 * Custom hook for managing product form draft in localStorage
 * Helps prevent data loss during navigation or page refresh
 */
export function useProductDraft(productId?: string | number) {
  /**
   * Generate storage key for form draft
   */
  const getDraftStorageKey = useCallback(() => {
    // Use productId if editing, otherwise use a generic "new-product" key
    const key = productId ? `product_draft_${productId}` : 'product_draft_new';
    return key;
  }, [productId]);

  /**
   * Save form draft to localStorage
   */
  const saveDraftToLocalStorage = useCallback(
    (formData: any) => {
      try {
        const storageKey = getDraftStorageKey();
        const draft = {
          data: formData,
          timestamp: Date.now(),
          productId: productId || null,
        };
        localStorage.setItem(storageKey, JSON.stringify(draft));
        console.log('✅ Form draft saved to localStorage:', storageKey);
      } catch (error) {
        console.warn('Failed to save form draft to localStorage:', error);
      }
    },
    [getDraftStorageKey, productId]
  );

  /**
   * Load form draft from localStorage
   * Returns null if no draft found or if draft is too old (>24 hours)
   */
  const loadDraftFromLocalStorage = useCallback((): any | null => {
    try {
      const storageKey = getDraftStorageKey();
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;

      const draft = JSON.parse(stored);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      // Check if draft is too old
      if (now - draft.timestamp > maxAge) {
        console.log('⚠️ Draft is too old, clearing...');
        localStorage.removeItem(storageKey);
        return null;
      }

      console.log('✅ Loaded form draft from localStorage:', storageKey);
      return draft.data;
    } catch (error) {
      console.warn('Failed to load form draft from localStorage:', error);
      return null;
    }
  }, [getDraftStorageKey]);

  /**
   * Clear form draft from localStorage
   */
  const clearDraftFromLocalStorage = useCallback(() => {
    try {
      const storageKey = getDraftStorageKey();
      localStorage.removeItem(storageKey);
      console.log('✅ Cleared form draft from localStorage:', storageKey);
    } catch (error) {
      console.warn('Failed to clear form draft from localStorage:', error);
    }
  }, [getDraftStorageKey]);

  return {
    saveDraftToLocalStorage,
    loadDraftFromLocalStorage,
    clearDraftFromLocalStorage,
    getDraftStorageKey,
  };
}

