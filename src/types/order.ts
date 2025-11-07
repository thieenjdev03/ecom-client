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
  orderTime: Date;
  paymentTime: Date;
  deliveryTime: Date;
  completionTime: Date;
  timeline: {
    title: string;
    time: Date;
  }[];
};

export type IOrderShippingAddress = {
  fullAddress: string;
  phoneNumber: string;
};

export type IOrderPayment = {
  cardType: string;
  cardNumber: string;
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
  name: string;
  price: number;
  coverUrl: string;
  quantity: number;
  variantName?: string;
  productSlug?: string;
  productId?: number;
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
};
