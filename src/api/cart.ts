import useSWR from "swr";
import { useMemo } from "react";

import axios, { fetcher } from "src/utils/axios";

// ----------------------------------------------------------------------

export type CartItem = {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  unitPrice: string; // formatted "xx.xx"
  quantity: number;
  totalPrice: string; // formatted "xx.xx"
  thumbnailUrl?: string;
};

export type CartResponse = {
  items: CartItem[];
  subtotal: string;
  totalItems: number;
};

export type AddToCartRequest = {
  productId: string;
  variantId: string;
  quantity: number;
};

export type UpdateCartItemRequest = {
  quantity: number;
};

// ----------------------------------------------------------------------

// Helper function to get token from session (sessionStorage first, then localStorage)
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;

  // Try sessionStorage first (preferred for security)
  const sessionToken = sessionStorage.getItem("accessToken");
  if (sessionToken) return sessionToken;

  // Fallback to localStorage
  const localToken = localStorage.getItem("accessToken");
  if (localToken) return localToken;

  return null;
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const base = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/cart`;

export const cartApi = {
  // Add item to cart
  async add(data: AddToCartRequest) {
    const res = await axios.post(`${base}`, data, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  // Get cart
  async get() {
    const res = await axios.get(`${base}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  // Update cart item quantity
  async update(itemId: string, data: UpdateCartItemRequest) {
    const res = await axios.patch(`${base}/${itemId}`, data, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  // Delete cart item
  async delete(itemId: string) {
    const res = await axios.delete(`${base}/${itemId}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },
};

// ----------------------------------------------------------------------

// Hooks for React components

export function useGetCart() {
  const URL = base;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      cart:
        (data?.data as CartResponse | undefined) ||
        ({
          items: [],
          subtotal: "0.00",
          totalItems: 0,
        } as CartResponse),
      cartLoading: isLoading,
      cartError: error,
      cartValidating: isValidating,
      cartEmpty: !isLoading && (!data || (data?.data?.items?.length || 0) === 0),
      mutateCart: mutate,
    }),
    [data, error, isLoading, isValidating, mutate],
  );

  return memoizedValue;
}

