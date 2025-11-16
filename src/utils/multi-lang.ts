/**
 * Utility functions for handling multi-language fields
 * Supports fallback logic when locale is missing
 */

import { MultiLangField } from "src/types/product-dto";

/**
 * Get translated value from multi-language field with fallback
 * @param fieldObj - The multi-language field (string or object)
 * @param locale - Current locale (e.g., 'en', 'vi')
 * @returns The translated string value
 */
export function t(fieldObj: MultiLangField | null | undefined, locale: string): string {
  if (!fieldObj) return "";
  
  // If it's already a string (API returned with locale), return as is
  if (typeof fieldObj === "string") {
    return fieldObj;
  }
  
  // If it's an object, get the locale value with fallback to 'en'
  if (typeof fieldObj === "object") {
    return fieldObj[locale] ?? fieldObj["en"] ?? "";
  }
  
  return "";
}

/**
 * Check if a field is a multi-language object
 */
export function isMultiLangObject(field: MultiLangField | null | undefined): field is Record<string, string> {
  return typeof field === "object" && field !== null && !Array.isArray(field);
}

/**
 * Convert string to multi-language object format
 */
export function toMultiLangObject(value: string, locale: string = "en"): Record<string, string> {
  return { [locale]: value };
}

/**
 * Get all available locales from a multi-language object
 */
export function getAvailableLocales(field: MultiLangField | null | undefined): string[] {
  if (!field || typeof field !== "object" || Array.isArray(field)) {
    return [];
  }
  return Object.keys(field);
}

