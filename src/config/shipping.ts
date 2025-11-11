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

export const COUNTRIES: CountryConfig[] = [
  // Asia
  {
    value: "VN",
    label: "Vietnam",
    flag: "🇻🇳",
    currency: "VND",
    shippingCost: 5, // $5 USD
    taxRate: 10,
    freeShippingThreshold: 100, // Free shipping over $100 USD
  },
  {
    value: "TH",
    label: "Thailand",
    flag: "🇹🇭",
    currency: "THB",
    shippingCost: 6,
    taxRate: 7,
    freeShippingThreshold: 100,
  },
  {
    value: "SG",
    label: "Singapore",
    flag: "🇸🇬",
    currency: "SGD",
    shippingCost: 5,
    taxRate: 7,
    freeShippingThreshold: 80,
  },
  {
    value: "MY",
    label: "Malaysia",
    flag: "🇲🇾",
    currency: "MYR",
    shippingCost: 6,
    taxRate: 6,
    freeShippingThreshold: 100,
  },
  {
    value: "ID",
    label: "Indonesia",
    flag: "🇮🇩",
    currency: "IDR",
    shippingCost: 7,
    taxRate: 10,
    freeShippingThreshold: 100,
  },
  {
    value: "PH",
    label: "Philippines",
    flag: "🇵🇭",
    currency: "PHP",
    shippingCost: 6,
    taxRate: 12,
    freeShippingThreshold: 100,
  },
  {
    value: "JP",
    label: "Japan",
    flag: "🇯🇵",
    currency: "JPY",
    shippingCost: 8,
    taxRate: 10,
    freeShippingThreshold: 120,
  },
  {
    value: "KR",
    label: "South Korea",
    flag: "🇰🇷",
    currency: "KRW",
    shippingCost: 8,
    taxRate: 10,
    freeShippingThreshold: 120,
  },
  {
    value: "CN",
    label: "China",
    flag: "🇨🇳",
    currency: "CNY",
    shippingCost: 7,
    taxRate: 13,
    freeShippingThreshold: 100,
  },
  {
    value: "IN",
    label: "India",
    flag: "🇮🇳",
    currency: "INR",
    shippingCost: 6,
    taxRate: 18,
    freeShippingThreshold: 100,
  },

  // North America
  {
    value: "US",
    label: "United States",
    flag: "🇺🇸",
    currency: "USD",
    shippingCost: 8,
    taxRate: 8,
    freeShippingThreshold: 100,
  },
  {
    value: "CA",
    label: "Canada",
    flag: "🇨🇦",
    currency: "CAD",
    shippingCost: 10,
    taxRate: 13,
    freeShippingThreshold: 120,
  },
  {
    value: "MX",
    label: "Mexico",
    flag: "🇲🇽",
    currency: "MXN",
    shippingCost: 8,
    taxRate: 16,
    freeShippingThreshold: 100,
  },

  // Europe
  {
    value: "GB",
    label: "United Kingdom",
    flag: "🇬🇧",
    currency: "GBP",
    shippingCost: 9,
    taxRate: 20,
    freeShippingThreshold: 120,
  },
  {
    value: "DE",
    label: "Germany",
    flag: "🇩🇪",
    currency: "EUR",
    shippingCost: 8,
    taxRate: 19,
    freeShippingThreshold: 100,
  },
  {
    value: "FR",
    label: "France",
    flag: "🇫🇷",
    currency: "EUR",
    shippingCost: 8,
    taxRate: 20,
    freeShippingThreshold: 100,
  },
  {
    value: "IT",
    label: "Italy",
    flag: "🇮🇹",
    currency: "EUR",
    shippingCost: 8,
    taxRate: 22,
    freeShippingThreshold: 100,
  },
  {
    value: "ES",
    label: "Spain",
    flag: "🇪🇸",
    currency: "EUR",
    shippingCost: 8,
    taxRate: 21,
    freeShippingThreshold: 100,
  },
  {
    value: "NL",
    label: "Netherlands",
    flag: "🇳🇱",
    currency: "EUR",
    shippingCost: 7,
    taxRate: 21,
    freeShippingThreshold: 100,
  },
  {
    value: "BE",
    label: "Belgium",
    flag: "🇧🇪",
    currency: "EUR",
    shippingCost: 7,
    taxRate: 21,
    freeShippingThreshold: 100,
  },
  {
    value: "SE",
    label: "Sweden",
    flag: "🇸🇪",
    currency: "SEK",
    shippingCost: 9,
    taxRate: 25,
    freeShippingThreshold: 120,
  },
  {
    value: "NO",
    label: "Norway",
    flag: "🇳🇴",
    currency: "NOK",
    shippingCost: 10,
    taxRate: 25,
    freeShippingThreshold: 120,
  },
  {
    value: "DK",
    label: "Denmark",
    flag: "🇩🇰",
    currency: "DKK",
    shippingCost: 8,
    taxRate: 25,
    freeShippingThreshold: 100,
  },
  {
    value: "CH",
    label: "Switzerland",
    flag: "🇨🇭",
    currency: "CHF",
    shippingCost: 10,
    taxRate: 7.7,
    freeShippingThreshold: 120,
  },

  // Oceania
  {
    value: "AU",
    label: "Australia",
    flag: "🇦🇺",
    currency: "AUD",
    shippingCost: 12,
    taxRate: 10,
    freeShippingThreshold: 150,
  },
  {
    value: "NZ",
    label: "New Zealand",
    flag: "🇳🇿",
    currency: "NZD",
    shippingCost: 13,
    taxRate: 15,
    freeShippingThreshold: 150,
  },

  // Middle East
  {
    value: "AE",
    label: "United Arab Emirates",
    flag: "🇦🇪",
    currency: "AED",
    shippingCost: 10,
    taxRate: 5,
    freeShippingThreshold: 150,
  },
  {
    value: "SA",
    label: "Saudi Arabia",
    flag: "🇸🇦",
    currency: "SAR",
    shippingCost: 12,
    taxRate: 15,
    freeShippingThreshold: 150,
  },

  // South America
  {
    value: "BR",
    label: "Brazil",
    flag: "🇧🇷",
    currency: "BRL",
    shippingCost: 15,
    taxRate: 17,
    freeShippingThreshold: 150,
  },
  {
    value: "AR",
    label: "Argentina",
    flag: "🇦🇷",
    currency: "ARS",
    shippingCost: 15,
    taxRate: 21,
    freeShippingThreshold: 150,
  },
];

// Helper function to get country config by code
export function getCountryConfig(countryCode: string): CountryConfig | undefined {
  return COUNTRIES.find((country) => country.value === countryCode);
}

// Helper function to calculate shipping cost
export function calculateShipping(
  countryCode: string,
  subtotal: number
): {
  cost: number;
  isFree: boolean;
  currency: string;
} {
  const country = getCountryConfig(countryCode);
  
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
export function calculateTax(countryCode: string, subtotal: number): number {
  const country = getCountryConfig(countryCode);
  if (!country) return 0;
  
  return (subtotal * country.taxRate) / 100;
}

