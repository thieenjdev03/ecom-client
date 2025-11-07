import useSWR from "swr";
import { useMemo } from "react";

import axios, { endpoints, fetcher } from "src/utils/axios";

// ----------------------------------------------------------------------

export type OrderItem = {
  productId: number;
  productName: string;
  productSlug: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: string; // formatted "xx.xx"
  totalPrice: string; // formatted "xx.xx"
  sku?: string;
};

export type OrderSummary = {
  subtotal: string; // formatted "xx.xx"
  shipping: string; // formatted "xx.xx"
  tax: string; // formatted "xx.xx"
  discount: string; // formatted "xx.xx"
  total: string; // formatted "xx.xx"
  currency: string;
};

export type CreateOrderRequest = {
  userId: string;
  items: OrderItem[];
  summary: OrderSummary;
  shippingAddressId?: string;
  billingAddressId?: string;
  notes?: string;
  paymentMethod?: "PAYPAL" | "STRIPE" | "COD";
};

export type Order = {
  id: string;
  orderNumber: string;
  userId: string;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'FAILED' | 'REFUNDED';
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
  createdAt: string;
  updatedAt: string;
  // Additional fields for UI
  user?: {
    id: string;
    name: string;
    email: string;
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
  paypalTransactionId: string;
  paidAmount: string;
  currency: string;
  paidAt: string;
};

// ----------------------------------------------------------------------

const base = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/orders`;

export const orderApi = {
  // Create a new order
  async create(data: CreateOrderRequest) {
    const res = await axios.post(`${base}`, data);
    return res.data;
  },

  // Get all orders (Admin only)
  async getAll(params?: { userId?: string; status?: string; page?: number; limit?: number }) {
    const res = await axios.get(`${base}`, { params });
    return res.data;
  },

  // Get my orders (authenticated user)
  async getMyOrders(params?: { status?: string; page?: number; limit?: number }) {
    const res = await axios.get(`${base}/my-orders`, { params });
    return res.data;
  },

  // Get order by ID
  async getById(id: string) {
    const res = await axios.get(`${base}/${id}`);
    return res.data;
  },

  // Get order by order number
  async getByOrderNumber(orderNumber: string) {
    const res = await axios.get(`${base}/number/${orderNumber}`);
    return res.data;
  },

  // Get order history for user (legacy, use getMyOrders instead)
  async getHistory(params?: Record<string, any>) {
    const res = await axios.get(`${base}/history`, { params });
    return res.data;
  },

  // Update order (Admin only)
  async update(id: string, data: { status?: Order['status']; trackingNumber?: string; carrier?: string; internalNotes?: string }) {
    const res = await axios.patch(`${base}/${id}`, data);
    return res.data;
  },

  // Update order status (legacy)
  async updateStatus(id: string, status: Order['status']) {
    const res = await axios.patch(`${base}/${id}/status`, { status });
    return res.data;
  },

  // Cancel order
  async cancel(id: string, reason?: string) {
    const res = await axios.patch(`${base}/${id}/cancel`, { reason });
    return res.data;
  },

  // Delete order (Admin only)
  async delete(id: string) {
    const res = await axios.delete(`${base}/${id}`);
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
  
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      order: (data?.data as Order | undefined) ?? (data as Order | undefined),
      orderLoading: isLoading,
      orderError: error,
      orderValidating: isValidating,
    }),
    [data, error, isLoading, isValidating],
  );

  return memoizedValue;
}
