import useSWR from "swr";
import { useMemo } from "react";

import axios, { fetcher } from "src/utils/axios";

// ----------------------------------------------------------------------

export type OrderItem = {
  productId: string;
  productName: string;
  productSlug: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: string; // formatted "xx.xx"
  totalPrice: string; // formatted "xx.xx"
  sku?: string;
  productThumbnailUrl?: string;
};

export type OrderSummary = {
  subtotal: string; // formatted "xx.xx"
  shipping: string; // formatted "xx.xx"
  tax: string; // formatted "xx.xx"
  discount: string; // formatted "xx.xx"
  total: string; // formatted "xx.xx"
  currency: string;
};

export type ShippingAddress = {
  full_name: string;
  phone: string;
  countryCode: string;
  province: string;
  district: string;
  ward: string;
  address_line: string;
  address_line2?: string;
  city: string;
  country?: string;
  postalCode?: string;
  label?: string;
  note?: string;
  isBilling?: boolean;
  isDefault?: boolean;
  isShipping?: boolean;
};

export type CreateOrderRequest = {
  userId: string;
  items: OrderItem[];
  summary: OrderSummary;
  shipping_address?: ShippingAddress;
  shippingAddressId?: string; // Legacy support
  billingAddressId?: string;
  notes?: string;
  paymentMethod?: "PAYPAL" | "STRIPE" | "COD";
};

export type Order = {
  id: string;
  orderNumber: string;
  userId: string;
  status:
    | 'PENDING_PAYMENT'
    | 'PAID'
    | 'PROCESSING'
    | 'PACKED'
    | 'READY_TO_GO'
    | 'AT_CARRIER_FACILITY'
    | 'IN_TRANSIT'
    | 'ARRIVED_IN_COUNTRY'
    | 'AT_LOCAL_FACILITY'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'FAILED'
    | 'REFUNDED';
  paymentMethod?: "PAYPAL" | "STRIPE" | "COD";
  paypalOrderId?: string;
  paypalTransactionId?: string;
  paidAmount?: string;
  paidCurrency?: string;
  paidAt?: string;
  items: OrderItem[];
  summary: OrderSummary;
  shippingAddressId?: string;
  billingAddressId?: string;
  shippingAddress?: any;
  billingAddress?: any;
  notes?: string;
  internalNotes?: string | null;
  carrier?: string | null;
  trackingNumber?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  updatedAt: string;
  // Additional fields for UI
  user?: {
    id: string;
    name?: string;
    email: string;
    firstName?: string;
    lastName?: string;
    country?: string;
    phoneNumber?: string;
    avatarUrl?: string;
  };
};

export type OrderListResponse = {
  data: Order[];
  total: number;
  page: number;
  limit: number;
};

export type CaptureOrderRequest = {
  paypalOrderId: string;
  orderId: string;
};

export type CaptureOrderResponse = {
  success: boolean;
  status: string;
  orderId?: string; // Order ID - required for frontend redirect
  orderNumber?: string; // Order number for display
  paypalOrderId?: string; // PayPal order ID
  paypalTransactionId: string;
  paidAmount: string;
  currency: string;
  paidAt: string;
  payer?: {
    email: string;
    name: {
      given_name: string;
      surname: string;
    };
  };
};

export type UpdateOrderPayload = Partial<{
  status: Order['status'];
  trackingNumber: string | null;
  carrier: string | null;
  internalNotes: string | null;
  notes: string | null;
  shippingAddressId: string | null;
  billingAddressId: string | null;
  paypalOrderId: string | null;
  paypalTransactionId: string | null;
  paidAmount: string | number | null;
  paidCurrency: string | null;
  paidAt: string | null;
}>;

// ----------------------------------------------------------------------

// Helper function to get token from session (sessionStorage first, then localStorage)
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
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
    ...(token && { "Authorization": `Bearer ${token}` }),
  };
};

const base = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/orders`;

export const orderApi = {
  // Create a new order
  async create(data: CreateOrderRequest) {
    const res = await axios.post(`${base}`, data, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  // Get all orders (Admin only)
  async getAll(params?: { userId?: string; status?: string; page?: number; limit?: number }) {
    const res = await axios.get(`${base}`, {
      params,
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  // Get my orders (authenticated user)
  async getMyOrders(params?: { status?: string; page?: number; limit?: number }) {
    const res = await axios.get(`${base}/my-orders`, {
      params,
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  // Get order by ID
  async getById(id: string) {
    const res = await axios.get(`${base}/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  // Get order by order number
  async getByOrderNumber(orderNumber: string) {
    const res = await axios.get(`${base}/number/${orderNumber}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  // Get order history for user (legacy, use getMyOrders instead)
  async getHistory(params?: Record<string, any>) {
    const res = await axios.get(`${base}/history`, {
      params,
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  // Update order (Admin only)
  async update(id: string, data: UpdateOrderPayload) {
    const res = await axios.patch(`${base}/${id}`, data, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  // Update order status (legacy)
  async updateStatus(id: string, status: Order['status']) {
    const res = await axios.patch(`${base}/${id}/status`, { status }, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  // Cancel order
  async cancel(id: string, reason?: string) {
    const res = await axios.patch(`${base}/${id}/cancel`, { reason }, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  // Delete order (Admin only)
  async delete(id: string) {
    const res = await axios.delete(`${base}/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },
};

// ----------------------------------------------------------------------

// Hooks for React components

export function useGetOrders(params?: { userId?: string; status?: string; page?: number; limit?: number }) {
  const URL = params ? [`${base}`, { params }] : `${base}`;
  
  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      orders: Array.isArray(data) 
        ? (data as Order[])
        : (data?.data as Order[] | undefined) || [],
      ordersLoading: isLoading,
      ordersError: error,
      ordersValidating: isValidating,
      ordersEmpty: !isLoading && (!data || (Array.isArray(data) && data.length === 0)),
      mutateOrders: mutate,
    }),
    [data, error, isLoading, isValidating, mutate],
  );

  return memoizedValue;
}

export function useGetMyOrders(params?: { status?: string; page?: number; limit?: number }) {
  const URL = params ? [`${base}/my-orders`, { params }] : `${base}/my-orders`;
  
  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      orders: Array.isArray(data) 
        ? (data as Order[])
        : (data?.data as Order[] | undefined) || [],
      ordersLoading: isLoading,
      ordersError: error,
      ordersValidating: isValidating,
      ordersEmpty: !isLoading && (!data || (Array.isArray(data) && data.length === 0)),
      mutateOrders: mutate,
    }),
    [data, error, isLoading, isValidating, mutate],
  );

  return memoizedValue;
}

export function useGetOrder(orderId: string | null) {
  const URL = orderId ? `${base}/${orderId}` : null;
  
  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      order: (data?.data as Order | undefined) ?? (data as Order | undefined),
      orderLoading: isLoading,
      orderError: error,
      orderValidating: isValidating,
      mutateOrder: mutate,
    }),
    [data, error, isLoading, isValidating, mutate],
  );

  return memoizedValue;
}
