"use client";
/* eslint-disable @typescript-eslint/no-use-before-define */

import { useCallback, useEffect, useState } from "react";

// Shipping configuration for different countries

export interface CountryConfig {
  value: string;
  label: string;
  flag: string;
  currency: string;
  shippingCost: number;
  taxRate: number; // Tax rate as percentage (e.g., 10 for 10%)
  freeShippingThreshold?: number; // Free shipping if order total exceeds this amount
}

interface CountryApiCountry {
  country_code: string;
  label: string;
  currency: string;
  shippingCost: number | string;
  taxRate: number | string;
  freeShippingThres?: number | string | null;
}

interface CountryApiResponse {
  success: boolean;
  message?: string;
  data?: {
    total?: number;
    countries?: CountryApiCountry[];
  };
}

const COUNTRY_FLAGS: Record<string, string> = {
  AE: "🇦🇪",
  AR: "🇦🇷",
  AU: "🇦🇺",
  BE: "🇧🇪",
  BR: "🇧🇷",
  CA: "🇨🇦",
  CH: "🇨🇭",
  CN: "🇨🇳",
  DE: "🇩🇪",
  DK: "🇩🇰",
  ES: "🇪🇸",
  FR: "🇫🇷",
  GB: "🇬🇧",
  ID: "🇮🇩",
  IN: "🇮🇳",
  IT: "🇮🇹",
  JP: "🇯🇵",
  KR: "🇰🇷",
  MX: "🇲🇽",
  MY: "🇲🇾",
  NL: "🇳🇱",
  NO: "🇳🇴",
  NZ: "🇳🇿",
  PH: "🇵🇭",
  SA: "🇸🇦",
  SE: "🇸🇪",
  SG: "🇸🇬",
  TH: "🇹🇭",
  US: "🇺🇸",
  VN: "🇻🇳",
};

const createCountry = (config: Omit<CountryConfig, "flag"> & { flag?: string }): CountryConfig => ({
  ...config,
  flag: config.flag ?? COUNTRY_FLAGS[config.value] ?? "",
});

const FALLBACK_COUNTRIES: CountryConfig[] = [
  // Asia
  createCountry({
    value: "VN",
    label: "Vietnam",
    currency: "VND",
    shippingCost: 0,
    taxRate: 0,
    freeShippingThreshold: 0,
  }),
  createCountry({
    value: "TH",
    label: "Thailand",
    currency: "THB",
    shippingCost: 6,
    taxRate: 7,
    freeShippingThreshold: 100,
  }),
  createCountry({
    value: "SG",
    label: "Singapore",
    currency: "SGD",
    shippingCost: 5,
    taxRate: 7,
    freeShippingThreshold: 80,
  }),
  createCountry({
    value: "MY",
    label: "Malaysia",
    currency: "MYR",
    shippingCost: 6,
    taxRate: 6,
    freeShippingThreshold: 100,
  }),
  createCountry({
    value: "ID",
    label: "Indonesia",
    currency: "IDR",
    shippingCost: 7,
    taxRate: 10,
    freeShippingThreshold: 100,
  }),
  createCountry({
    value: "PH",
    label: "Philippines",
    currency: "PHP",
    shippingCost: 6,
    taxRate: 12,
    freeShippingThreshold: 100,
  }),
  createCountry({
    value: "JP",
    label: "Japan",
    currency: "JPY",
    shippingCost: 8,
    taxRate: 10,
    freeShippingThreshold: 120,
  }),
  createCountry({
    value: "KR",
    label: "South Korea",
    currency: "KRW",
    shippingCost: 8,
    taxRate: 10,
    freeShippingThreshold: 120,
  }),
  createCountry({
    value: "CN",
    label: "China",
    currency: "CNY",
    shippingCost: 7,
    taxRate: 13,
    freeShippingThreshold: 100,
  }),
  createCountry({
    value: "IN",
    label: "India",
    currency: "INR",
    shippingCost: 6,
    taxRate: 18,
    freeShippingThreshold: 100,
  }),

  // North America
  createCountry({
    value: "US",
    label: "United States",
    currency: "USD",
    shippingCost: 8,
    taxRate: 8,
    freeShippingThreshold: 100,
  }),
  createCountry({
    value: "CA",
    label: "Canada",
    currency: "CAD",
    shippingCost: 10,
    taxRate: 13,
    freeShippingThreshold: 120,
  }),
  createCountry({
    value: "MX",
    label: "Mexico",
    currency: "MXN",
    shippingCost: 8,
    taxRate: 16,
    freeShippingThreshold: 100,
  }),

  // Europe
  createCountry({
    value: "GB",
    label: "United Kingdom",
    currency: "GBP",
    shippingCost: 9,
    taxRate: 20,
    freeShippingThreshold: 120,
  }),
  createCountry({
    value: "DE",
    label: "Germany",
    currency: "EUR",
    shippingCost: 8,
    taxRate: 19,
    freeShippingThreshold: 100,
  }),
  createCountry({
    value: "FR",
    label: "France",
    currency: "EUR",
    shippingCost: 8,
    taxRate: 20,
    freeShippingThreshold: 100,
  }),
  createCountry({
    value: "IT",
    label: "Italy",
    currency: "EUR",
    shippingCost: 8,
    taxRate: 22,
    freeShippingThreshold: 100,
  }),
  createCountry({
    value: "ES",
    label: "Spain",
    currency: "EUR",
    shippingCost: 8,
    taxRate: 21,
    freeShippingThreshold: 100,
  }),
  createCountry({
    value: "NL",
    label: "Netherlands",
    currency: "EUR",
    shippingCost: 7,
    taxRate: 21,
    freeShippingThreshold: 100,
  }),
  createCountry({
    value: "BE",
    label: "Belgium",
    currency: "EUR",
    shippingCost: 7,
    taxRate: 21,
    freeShippingThreshold: 100,
  }),
  createCountry({
    value: "SE",
    label: "Sweden",
    currency: "SEK",
    shippingCost: 9,
    taxRate: 25,
    freeShippingThreshold: 120,
  }),
  createCountry({
    value: "NO",
    label: "Norway",
    currency: "NOK",
    shippingCost: 10,
    taxRate: 25,
    freeShippingThreshold: 120,
  }),
  createCountry({
    value: "DK",
    label: "Denmark",
    currency: "DKK",
    shippingCost: 8,
    taxRate: 25,
    freeShippingThreshold: 100,
  }),
  createCountry({
    value: "CH",
    label: "Switzerland",
    currency: "CHF",
    shippingCost: 10,
    taxRate: 7.7,
    freeShippingThreshold: 120,
  }),

  // Oceania
  createCountry({
    value: "AU",
    label: "Australia",
    currency: "AUD",
    shippingCost: 12,
    taxRate: 10,
    freeShippingThreshold: 150,
  }),
  createCountry({
    value: "NZ",
    label: "New Zealand",
    currency: "NZD",
    shippingCost: 13,
    taxRate: 15,
    freeShippingThreshold: 150,
  }),

  // Middle East
  createCountry({
    value: "AE",
    label: "United Arab Emirates",
    currency: "AED",
    shippingCost: 10,
    taxRate: 5,
    freeShippingThreshold: 150,
  }),
  createCountry({
    value: "SA",
    label: "Saudi Arabia",
    currency: "SAR",
    shippingCost: 12,
    taxRate: 15,
    freeShippingThreshold: 150,
  }),

  // South America
  createCountry({
    value: "BR",
    label: "Brazil",
    currency: "BRL",
    shippingCost: 15,
    taxRate: 17,
    freeShippingThreshold: 150,
  }),
  createCountry({
    value: "AR",
    label: "Argentina",
    currency: "ARS",
    shippingCost: 15,
    taxRate: 21,
    freeShippingThreshold: 150,
  }),
];

let countryCache: CountryConfig[] = [...FALLBACK_COUNTRIES];
let hydratedFromApi = false;
let pendingRequest: Promise<CountryConfig[]> | null = null;

// This mirrors the backend curl the team shared:
// curl -X GET "$NEXT_PUBLIC_API_URL/countries"
const COUNTRIES_ENDPOINT = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/shipping/countries`
  : null;

const hydrateCountries = (countries: CountryConfig[], fromApi: boolean) => {
  countryCache = countries.length ? [...countries] : [...FALLBACK_COUNTRIES];
  hydratedFromApi = fromApi && countries.length > 0;
  return countryCache;
};

const normalizeCountry = (country: CountryApiCountry): CountryConfig =>
  createCountry({
    value: country.country_code,
    label: country.label,
    currency: country.currency,
    shippingCost: Number(country.shippingCost) || 0,
    taxRate: Number(country.taxRate) || 0,
    freeShippingThreshold:
      country.freeShippingThres === undefined || country.freeShippingThres === null
        ? undefined
        : Number(country.freeShippingThres),
  });

const fetchCountriesFromApi = async (signal?: AbortSignal) => {
  if (!COUNTRIES_ENDPOINT) {
    console.warn("[shipping] NEXT_PUBLIC_API_URL is missing; falling back to static countries.");
    return hydrateCountries(countryCache, false);
  }

  const response = await fetch(COUNTRIES_ENDPOINT, { signal });

  if (!response.ok) {
    throw new Error(`Countries request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as CountryApiResponse;
  const apiCountries = payload?.data?.countries ?? [];

  return hydrateCountries(apiCountries.map(normalizeCountry), true);
};

export const loadCountries = async (options?: {
  force?: boolean;
  signal?: AbortSignal;
}): Promise<CountryConfig[]> => {
  const force = options?.force ?? false;
  const signal = options?.signal;

  if (pendingRequest) {
    return pendingRequest;
  }

  if (!force && hydratedFromApi) {
    return countryCache;
  }

  pendingRequest = fetchCountriesFromApi(signal)
    .catch((error) => {
      hydratedFromApi = false;
      throw error;
    })
    .finally(() => {
      pendingRequest = null;
    });

  return pendingRequest;
};

export const getCachedCountries = () => countryCache;

export const useShippingCountries = (options?: { skip?: boolean }) => {
  const skip = options?.skip ?? false;
  const [countries, setCountries] = useState<CountryConfig[]>(countryCache);
  const [loading, setLoading] = useState(!hydratedFromApi);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(
    async (force?: boolean) => {
      if (skip) {
        return countryCache;
      }

      setLoading(true);

      try {
        const next = await loadCountries({ force, signal: undefined });
        setCountries(next);
        setError(null);
        return next;
      } catch (err) {
        setError(err as Error);
        return countryCache;
      } finally {
        setLoading(false);
      }
    },
    [skip],
  );

  useEffect(() => {
    if (skip || hydratedFromApi) {
      return;
    }

    refresh();
  }, [refresh, skip]);

  return {
    countries,
    loading,
    error,
    refresh,
  };
};

// Helper function to get country config by code
export function getCountryConfig(
  countryCode: string,
  countries: CountryConfig[] = countryCache,
): CountryConfig | undefined {
  return countries.find((country) => country.value === countryCode);
}

// Helper function to calculate shipping cost
export function calculateShipping(
  countryCode: string,
  subtotal: number,
  countries: CountryConfig[] = countryCache,
): {
  cost: number;
  isFree: boolean;
  currency: string;
} {
  const country = getCountryConfig(countryCode, countries);

  if (!country) {
    return {
      cost: 0,
      isFree: false,
      currency: "USD",
    };
  }

  const isFree = country.freeShippingThreshold
    ? subtotal >= country.freeShippingThreshold
    : false;

  return {
    cost: isFree ? 0 : country.shippingCost,
    isFree,
    currency: country.currency,
  };
}

// Helper function to calculate tax
export function calculateTax(
  countryCode: string,
  subtotal: number,
  countries: CountryConfig[] = countryCache,
): number {
  const country = getCountryConfig(countryCode, countries);
  if (!country) return 0;

  return (subtotal * country.taxRate) / 100;
}

