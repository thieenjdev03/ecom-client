// ----------------------------------------------------------------------

export type IOrderTableFilterValue = string | Date | string[] | null;

export type IOrderTableFilters = {
  name: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  paymentMethod: string[];
  country: string;
};

// ----------------------------------------------------------------------

export type IOrderHistory = {
  orderTime: Date | null;
  paymentTime: Date | null;
  deliveryTime: Date | null;
  completionTime: Date | null;
  timeline: {
    id: string;
    title: string;
    time: Date;
    note?: string | null;
    changedBy?: string | null;
    fromStatus?: string;
    toStatus?: string;
  }[];
};

export type IOrderShippingAddress = {
  fullAddress: string;
  phoneNumber: string;
  recipientName?: string;
  label?: string;
};

export type IOrderPayment = {
  cardType: string;
  cardNumber: string;
  paidAt?: Date | null;
  paidAmount?: number | null;
  paidCurrency?: string | null;
  transactionId?: string | null;
  orderId?: string | null;
  status?: string;
};

export type IOrderDelivery = {
  shipBy: string;
  speedy: string;
  trackingNumber: string;
};

export type IOrderCustomer = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  ipAddress: string;
  country?: string;
  firstName?: string;
  lastName?: string;
};

export type IOrderProductItem = {
  id: string;
  sku: string;
  productId: string;
  name: string;
  price: number;
  coverUrl: string;
  quantity: number;
  variantName?: string;
  productSlug?: string;
  variantId?: string;
};

export type IOrderItem = {
  id: string;
  taxes: number;
  status: string;
  shipping: number;
  discount: number;
  subTotal: number;
  orderNumber: string;
  totalAmount: number;
  totalQuantity: number;
  history: IOrderHistory;
  customer: IOrderCustomer;
  delivery: IOrderDelivery;
  items: IOrderProductItem[];
  createdAt: Date;
  updatedAt: Date;
  // New fields
  paymentMethod?: "PAYPAL" | "STRIPE" | "COD";
  paidAt?: Date | null;
  currency?: string;
  carrier?: string | null;
  trackingNumber?: string | null;
  notes?: string | null;
  internalNotes?: string | null;
  shippingAddress?: any;
  billingAddress?: any;
  paypalOrderId?: string | null;
  paypalTransactionId?: string | null;
  paidAmount?: number | null;
  paidCurrency?: string | null;
  summaryTotals?: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
    currency: string;
  };
};
