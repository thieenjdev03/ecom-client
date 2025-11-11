import { useRef, useCallback } from "react";

// ----------------------------------------------------------------------

/**
 * Custom hook to manage image URL to publicId mapping
 * This is used for tracking Cloudinary publicIds for deletion
 */
export function useImageMapping(productId?: string | number) {
  const imagePublicIdMapRef = useRef<Map<string, string>>(new Map());

  // Helper function to extract publicId from Cloudinary URL
  const extractPublicIdFromUrl = useCallback((url: string): string | null => {
    if (!url) return null;
    try {
      // Try to extract from Cloudinary URL pattern
      const cloudinaryPattern = /\/image\/upload\/v\d+\/(.+?)(?:\.[^.]+)?$/;
      const match = url.match(cloudinaryPattern);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
      // Alternative pattern: /image/upload/{publicId}
      const altPattern = /\/image\/upload\/(.+?)(?:\.[^.]+)?$/;
      const altMatch = url.match(altPattern);
      if (altMatch && altMatch[1]) {
        return decodeURIComponent(altMatch[1]);
      }
      return null;
    } catch (error) {
      console.warn("Failed to extract publicId from URL:", url, error);
      return null;
    }
  }, []);

  // Load image publicId mapping from localStorage
  const loadImageMapping = useCallback(
    (pid: string | number | undefined) => {
      if (!pid) return;
      try {
        const storageKey = `product_image_map_${pid}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const mapping = JSON.parse(stored) as Record<string, string>;
          Object.entries(mapping).forEach(([url, publicId]) => {
            imagePublicIdMapRef.current.set(url, publicId);
          });
        }
      } catch (error) {
        console.warn("Failed to load image mapping from localStorage:", error);
      }
    },
    []
  );

  // Save image publicId mapping to localStorage
  const saveImageMapping = useCallback(
    (pid: string | number | undefined) => {
      if (!pid) return;
      try {
        const storageKey = `product_image_map_${pid}`;
        const mapping: Record<string, string> = {};
        imagePublicIdMapRef.current.forEach((publicId, url) => {
          mapping[url] = publicId;
        });
        localStorage.setItem(storageKey, JSON.stringify(mapping));
      } catch (error) {
        console.warn("Failed to save image mapping to localStorage:", error);
      }
    },
    []
  );

  // Initialize mapping for existing images (extract publicId from URLs)
  const initializeImageMapping = useCallback(
    (images: string[]) => {
      images.forEach((url) => {
        // Only add if not already in map
        if (!imagePublicIdMapRef.current.has(url)) {
          const publicId = extractPublicIdFromUrl(url);
          if (publicId) {
            imagePublicIdMapRef.current.set(url, publicId);
          }
        }
      });
    },
    [extractPublicIdFromUrl]
  );

  // Add a single image mapping
  const addImageMapping = useCallback((url: string, publicId: string) => {
    imagePublicIdMapRef.current.set(url, publicId);
  }, []);

  // Remove a single image mapping
  const removeImageMapping = useCallback((url: string) => {
    imagePublicIdMapRef.current.delete(url);
  }, []);

  // Get publicId for a URL
  const getPublicId = useCallback((url: string): string | null => {
    return imagePublicIdMapRef.current.get(url) || extractPublicIdFromUrl(url);
  }, [extractPublicIdFromUrl]);

  // Clear all mappings
  const clearMappings = useCallback(() => {
    imagePublicIdMapRef.current.clear();
  }, []);

  return {
    imagePublicIdMapRef,
    loadImageMapping,
    saveImageMapping,
    initializeImageMapping,
    addImageMapping,
    removeImageMapping,
    getPublicId,
    clearMappings,
    extractPublicIdFromUrl,
  };
}

