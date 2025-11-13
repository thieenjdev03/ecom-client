import { useCallback, useRef } from 'react';
import { useSnackbar } from 'src/components/snackbar';
import axios, { endpoints } from 'src/utils/axios';

/**
 * Custom hook for managing product image uploads and deletions
 * Handles Cloudinary integration, public ID extraction, and localStorage mapping
 */
export function useProductImages() {
  const { enqueueSnackbar } = useSnackbar();
  const imagePublicIdMapRef = useRef<Map<string, string>>(new Map());

  /**
   * Extract Cloudinary public_id from URL
   * Example: https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg
   * Returns: sample or sample.jpg (depending on URL format)
   */
  const extractPublicIdFromUrl = useCallback((url: string): string | null => {
    try {
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
      if (match && match[1]) {
        return match[1];
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  /**
   * Initialize image mapping from existing product images
   * Extracts public IDs and stores them for future deletion
   */
  const initializeImageMapping = useCallback((images: string[]) => {
    images.forEach((url) => {
      const publicId = extractPublicIdFromUrl(url);
      if (publicId && !imagePublicIdMapRef.current.has(url)) {
        imagePublicIdMapRef.current.set(url, publicId);
      }
    });
  }, [extractPublicIdFromUrl]);

  /**
   * Load image mapping from localStorage
   */
  const loadImageMapping = useCallback((productId: string | number | undefined) => {
    if (!productId) return;
    try {
      const storageKey = `product_image_map_${productId}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const mapping = JSON.parse(stored) as Record<string, string>;
        imagePublicIdMapRef.current = new Map(Object.entries(mapping));
      }
    } catch (error) {
      console.warn('Failed to load image mapping from localStorage:', error);
    }
  }, []);

  /**
   * Save image mapping to localStorage
   */
  const saveImageMapping = useCallback((productId: string | number | undefined) => {
    if (!productId) return;
    try {
      const storageKey = `product_image_map_${productId}`;
      const mapping: Record<string, string> = {};
      imagePublicIdMapRef.current.forEach((publicId, url) => {
        mapping[url] = publicId;
      });
      localStorage.setItem(storageKey, JSON.stringify(mapping));
    } catch (error) {
      console.warn('Failed to save image mapping to localStorage:', error);
    }
  }, []);

  /**
   * Upload multiple images to Cloudinary
   * Returns array of uploaded image URLs
   */
  const uploadImages = useCallback(
    async (files: File[]): Promise<string[]> => {
      const validFiles = files.filter((file) => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
          enqueueSnackbar(`File ${file.name} is not a valid image type (JPG, PNG, WEBP)`, {
            variant: 'error',
          });
          return false;
        }
        if (file.size > maxSize) {
          enqueueSnackbar(`File ${file.name} exceeds 5MB limit`, { variant: 'error' });
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) {
        return [];
      }

      try {
        const formData = new FormData();
        validFiles.forEach((file) => {
          formData.append('images', file);
        });

        const response = await axios.post(endpoints.files.uploadMultiple, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const uploadedUrls = response.data?.urls || [];

        // Store public IDs for future deletion
        uploadedUrls.forEach((url: string) => {
          const publicId = extractPublicIdFromUrl(url);
          if (publicId) {
            imagePublicIdMapRef.current.set(url, publicId);
          }
        });

        return uploadedUrls;
      } catch (error) {
        console.error('Image upload error:', error);
        enqueueSnackbar('Failed to upload images', { variant: 'error' });
        return [];
      }
    },
    [enqueueSnackbar, extractPublicIdFromUrl]
  );

  /**
   * Delete image from Cloudinary server
   */
  const deleteImage = useCallback(
    async (imageUrl: string, productId?: string | number) => {
      try {
        const publicId = imagePublicIdMapRef.current.get(imageUrl);
        if (publicId) {
          await axios.delete(endpoints.files.delete(publicId), {
            data: { publicId },
          });
        }

        // Remove from map
        imagePublicIdMapRef.current.delete(imageUrl);

        // Update localStorage
        if (productId) {
          saveImageMapping(productId);
        }
      } catch (error) {
        // Silent fail - image already removed from form, server cleanup is optional
        console.warn('Failed to delete image from server:', error);
      }
    },
    [saveImageMapping]
  );

  return {
    imagePublicIdMapRef,
    uploadImages,
    deleteImage,
    extractPublicIdFromUrl,
    initializeImageMapping,
    loadImageMapping,
    saveImageMapping,
  };
}

