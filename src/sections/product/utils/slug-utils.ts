/**
 * Utility functions for handling product slugs
 */

/**
 * Generate a URL-friendly slug from a product name
 * Converts to lowercase, removes special characters, replaces spaces with hyphens
 * 
 * @param name - Product name to convert
 * @returns URL-friendly slug
 * 
 * @example
 * generateSlugFromName("Premium T-Shirt 2024!") // "premium-t-shirt-2024"
 */
export function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/-+/g, '-')           // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '');        // Remove leading/trailing hyphens
}

/**
 * Check if a slug is valid
 * Valid slugs contain only lowercase letters, numbers, and hyphens
 * 
 * @param slug - Slug to validate
 * @returns true if slug is valid
 */
export function isValidSlug(slug: string): boolean {
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugPattern.test(slug);
}

/**
 * Sanitize a slug to ensure it's URL-friendly
 * Removes invalid characters and formats correctly
 * 
 * @param slug - Slug to sanitize
 * @returns Sanitized slug
 */
export function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '')  // Remove invalid characters
    .replace(/-+/g, '-')         // Replace multiple hyphens
    .replace(/^-|-$/g, '');      // Remove leading/trailing hyphens
}

