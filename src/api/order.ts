import axios, { endpoints } from "src/utils/axios";

// ----------------------------------------------------------------------

export type OrderItem = {
  productId: number;
  productName: string;
  productSlug: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sku?: string;
};

export type OrderSummary = {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
};

export type CreateOrderRequest = {
  userId: string;
  items: OrderItem[];
  summary: OrderSummary;
  shippingAddressId?: string;
  billingAddressId?: string;
  notes?: string;
};

export type Order = {
  id: string;
  userId: string;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'FAILED' | 'REFUNDED';
  items: OrderItem[];
  summary: OrderSummary;
  shippingAddressId?: string;
  billingAddressId?: string;
  notes?: string;
  paypalOrderId?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type OrderListResponse = {
  data: Order[];
  total: number;
  page: number;
  limit: number;
};

// ----------------------------------------------------------------------

const base = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/orders`;

export const orderApi = {
  // Create a new order
  async create(data: CreateOrderRequest) {
    const res = await axios.post(`${base}`, data);
    return res.data;
  },

  // Get order by ID
  async getById(id: string) {
    const res = await axios.get(`${base}/${id}`);
    return res.data;
  },

  // Get order history for user
  async getHistory(params?: Record<string, any>) {
    const res = await axios.get(`${base}/history`, { params });
    return res.data;
  },

  // Update order status
  async updateStatus(id: string, status: Order['status']) {
    const res = await axios.patch(`${base}/${id}/status`, { status });
    return res.data;
  },

  // Cancel order
  async cancel(id: string, reason?: string) {
    const res = await axios.patch(`${base}/${id}/cancel`, { reason });
    return res.data;
  },
};
