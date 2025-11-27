import { Order } from "src/api/order";

import {
  IOrderCustomer,
  IOrderDelivery,
  IOrderHistory,
  IOrderPayment,
  IOrderProductItem,
  IOrderShippingAddress,
} from "src/types/order";

// ----------------------------------------------------------------------

export type OrderDetailViewModel = {
  customer: IOrderCustomer;
  delivery: IOrderDelivery;
  payment: IOrderPayment;
  shippingAddress: IOrderShippingAddress;
  history: IOrderHistory;
  items: IOrderProductItem[];
  taxes: number;
  shipping: number;
  discount: number;
  subTotal: number;
  totalAmount: number;
  orderNumber: string;
  createdAt: Date;
  status: string;
  currency: string;
  notes?: string | null;
  internalNotes?: string | null;
};

// ----------------------------------------------------------------------

const toNumber = (value?: string | number | null) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const normalizeName = (first?: string | null, last?: string | null, fallback?: string) => {
  const fullName = `${first || ""} ${last || ""}`.trim();
  return fullName || fallback || "Unknown";
};

const buildAddressFromStructured = (address: Record<string, any> | null | undefined): IOrderShippingAddress => {
  if (!address) {
    return { fullAddress: "", phoneNumber: "" };
  }

  const fullAddress = [
    address.recipientName || address.full_name,
    address.streetLine1 || address.address_line,
    address.streetLine2,
    address.ward,
    address.district,
    address.province || address.city || address.state,
    address.country,
    address.postalCode || address.postal_code,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    fullAddress: fullAddress || "",
    phoneNumber: address.recipientPhone || address.phone || "",
    recipientName: address.recipientName || address.full_name,
    label: address.label,
  };
};

const parseShippingFromNotes = (notes?: string | null): IOrderShippingAddress => {
  if (!notes) {
    return { fullAddress: "", phoneNumber: "" };
  }

  const prefix = "Shipping Address:";
  const raw = notes.includes(prefix) ? notes.slice(notes.indexOf(prefix) + prefix.length).trim() : notes.trim();
  if (!raw) {
    return { fullAddress: "", phoneNumber: "" };
  }

  const tokens = raw.split(",").map((token) => token.trim()).filter(Boolean);
  if (tokens.length === 0) {
    return { fullAddress: raw, phoneNumber: "" };
  }

  // Assume format: Name, Phone, Address...
  const [maybeName, maybePhone, ...rest] = tokens;
  const phonePattern = /^(\+?\d[\d\s-]{5,})$/;
  const isPhoneSecond = phonePattern.test(maybePhone || "");

  return {
    fullAddress: rest.length ? rest.join(", ") : raw,
    phoneNumber: isPhoneSecond ? maybePhone : "",
    recipientName: maybeName,
  };
};

const buildTimeline = (order: Order) => {
  const timeline = [
    { title: "Order placed", time: new Date(order.createdAt) },
    order.paidAt && { title: "Payment completed", time: new Date(order.paidAt) },
    order.shippedAt && { title: "Shipped", time: new Date(order.shippedAt) },
    order.deliveredAt && { title: "Delivered", time: new Date(order.deliveredAt) },
    { title: "Last updated", time: new Date(order.updatedAt) },
  ].filter(Boolean) as { title: string; time: Date }[];

  return {
    orderTime: new Date(order.createdAt),
    paymentTime: order.paidAt ? new Date(order.paidAt) : null,
    deliveryTime: order.shippedAt ? new Date(order.shippedAt) : null,
    completionTime: order.deliveredAt ? new Date(order.deliveredAt) : new Date(order.updatedAt),
    timeline,
  };
};

const buildPayment = (order: Order, currency: string): IOrderPayment => {
  const methodLabel =
    order.paymentMethod === "PAYPAL"
      ? "PayPal"
      : order.paymentMethod === "STRIPE"
        ? "Stripe"
        : order.paymentMethod === "COD"
          ? "Cash on Delivery"
          : "Manual";

  const details =
    order.paymentMethod === "PAYPAL"
      ? order.paypalOrderId
        ? `Order #${order.paypalOrderId}`
        : "PayPal Account"
      : order.paymentMethod === "STRIPE"
        ? "**** **** **** 4242"
        : "Recipient to pay";

  return {
    cardType: methodLabel,
    cardNumber: details,
    paidAt: order.paidAt ? new Date(order.paidAt) : null,
    paidAmount: order.paidAmount ? toNumber(order.paidAmount) : null,
    paidCurrency: order.paidCurrency || currency,
    transactionId: order.paypalTransactionId || null,
    orderId: order.paypalOrderId || null,
    status: order.status,
  };
};

export function transformOrderForDetailView(order: Order): OrderDetailViewModel {
  const currency = order.summary.currency || order.paidCurrency || "USD";

  const customer: IOrderCustomer = order.user
    ? {
        id: order.user.id,
        name: normalizeName((order.user as any).firstName, (order.user as any).lastName, order.user.name),
        email: order.user.email,
        avatarUrl: order.user.avatarUrl || "",
        ipAddress: "",
        country: (order.user as any).country || "",
        firstName: (order.user as any).firstName,
        lastName: (order.user as any).lastName,
      }
    : {
        id: order.userId,
        name: "Unknown Customer",
        email: "unknown@example.com",
        avatarUrl: "",
        ipAddress: "",
      };

  const items: IOrderProductItem[] = order.items.map((item, index) => ({
    id: item.variantId || item.productId?.toString() || String(index),
    sku: item.sku || `${item.productId}-${item.variantId || "default"}`,
    name: item.productName,
    price: toNumber(item.unitPrice),
    coverUrl: (item as any).productThumbnailUrl || "",
    quantity: item.quantity,
    variantName: item.variantName,
    productSlug: item.productSlug,
    productId: item.productId,
    variantId: item.variantId,
  }));

  const history = buildTimeline(order);

  const delivery: IOrderDelivery = {
    shipBy: (order as any).carrier || "Not assigned",
    speedy: order.summary.shipping === "0.00" ? "Standard" : "Custom",
    trackingNumber: (order as any).trackingNumber || "",
  };

  const shippingAddress = order.shippingAddress
    ? buildAddressFromStructured(order.shippingAddress as any)
    : parseShippingFromNotes(order.notes);

  const payment = buildPayment(order, currency);

  return {
    customer,
    delivery,
    payment,
    shippingAddress,
    history,
    items,
    taxes: toNumber(order.summary.tax),
    shipping: toNumber(order.summary.shipping),
    discount: toNumber(order.summary.discount),
    subTotal: toNumber(order.summary.subtotal || order.summary.total),
    totalAmount: toNumber(order.summary.total),
    orderNumber: order.orderNumber,
    createdAt: new Date(order.createdAt),
    status: order.status.toLowerCase(),
    currency,
    notes: order.notes,
    internalNotes: order.internalNotes,
  };
}

