// =====================
// Status flow definition
// =====================
export const ORDER_STATUS_FLOW = [
  "pending_payment",
  "paid",
  "processing",
  "packed",
  "ready_to_go",
  "at_carrier_facility",
  "in_transit",
  "arrived_in_country",
  "at_local_facility",
  "out_for_delivery",
  "delivered",
] as const;

const ORDER_STATUS_ADDITIONAL = ["cancelled", "failed", "refunded"] as const;

export type OrderWorkflowStatus = typeof ORDER_STATUS_FLOW[number];
export type OrderAdditionalStatus = typeof ORDER_STATUS_ADDITIONAL[number];
export type OrderStatusValue = OrderWorkflowStatus | OrderAdditionalStatus;

// =====================
// Status meta definition
// =====================
type OrderStatusMeta = {
  label: string;
  color: "default" | "primary" | "info" | "success" | "warning" | "error";
};

export const ORDER_STATUS_META: Record<OrderStatusValue, OrderStatusMeta> = {
  // ───── Payment ─────
  pending_payment: {
    label: "Pending payment",
    color: "warning", // cần user action
  },
  paid: {
    label: "Paid",
    color: "info", // tiền đã ok, chưa xong
  },

  // ───── Internal processing ─────
  processing: {
    label: "Processing",
    color: "info",
  },
  packed: {
    label: "Packed",
    color: "info",
  },
  ready_to_go: {
    label: "Ready to go",
    color: "info",
  },

  // ───── Shipping ─────
  at_carrier_facility: {
    label: "At carrier facility",
    color: "info",
  },
  in_transit: {
    label: "In transit",
    color: "info",
  },
  arrived_in_country: {
    label: "Arrived in country",
    color: "info",
  },
  at_local_facility: {
    label: "At local facility",
    color: "info",
  },
  out_for_delivery: {
    label: "Out for delivery",
    color: "warning", // highlight vì sắp hoàn tất
  },

  // ───── Terminal states ─────
  delivered: {
    label: "Delivered",
    color: "success",
  },
  cancelled: {
    label: "Cancelled",
    color: "error",
  },
  failed: {
    label: "Failed",
    color: "error",
  },
  refunded: {
    label: "Refunded",
    color: "error",
  },
};

// =====================
// Status descriptions (UX / tooltip)
// =====================
const ORDER_STATUS_DESCRIPTIONS: Partial<Record<OrderStatusValue, string>> = {
  pending_payment: "Chờ khách hoàn tất thanh toán.",
  paid: "Đã nhận tiền thành công.",
  processing: "Lên đơn, tạo bill, kiểm tra tồn kho.",
  packed: "Đã đóng gói hoàn chỉnh, sẵn sàng xuất kho.",
  ready_to_go: "Đang ở kho nội bộ, chờ bàn giao đơn vị vận chuyển.",
  at_carrier_facility: "Đã vào kho của đơn vị vận chuyển.",
  in_transit: "Đang vận chuyển giữa các kho / giữa quốc gia.",
  arrived_in_country: "Đã đến quốc gia nhận hàng.",
  at_local_facility: "Đang ở kho giao hàng cuối (gần địa chỉ khách).",
  out_for_delivery: "Shipper địa phương đang giao đến khách.",
  delivered: "Đã giao hàng thành công.",
  cancelled: "Đơn hàng đã bị hủy.",
  failed: "Thanh toán thất bại hoặc đơn xảy ra lỗi.",
  refunded: "Đơn hàng đã được hoàn tiền.",
};

// =====================
// Helpers
// =====================
const ORDER_STATUS_META_MAP: Record<OrderStatusValue, OrderStatusMeta> = ORDER_STATUS_META;

export const ORDER_STATUS_OPTIONS = ORDER_STATUS_FLOW.map((value) => ({
  value,
  label: ORDER_STATUS_META[value].label,
}));

export const ORDER_STATUS_ALL_OPTIONS = [
  ...ORDER_STATUS_OPTIONS,
  ...ORDER_STATUS_ADDITIONAL.map((value) => ({
    value,
    label: ORDER_STATUS_META[value].label,
  })),
];

export const normalizeOrderStatus = (
  status?: string | null,
): OrderStatusValue | "" =>
  status ? (status.toLowerCase() as OrderStatusValue) : "";

export const getOrderStatusMeta = (
  status?: string | null,
): OrderStatusMeta | undefined =>
  ORDER_STATUS_META_MAP[normalizeOrderStatus(status)];

export const getOrderStatusLabel = (status?: string | null): string => {
  const meta = getOrderStatusMeta(status);
  if (meta) return meta.label;

  const normalized = normalizeOrderStatus(status);
  if (!normalized) return "Unknown status";

  return normalized
    .split("_")
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
};

export const getOrderStatusColor = (
  status?: string | null,
): OrderStatusMeta["color"] => {
  const meta = getOrderStatusMeta(status);
  return meta?.color || "default";
};

export const getOrderStatusDescription = (
  status?: string | null,
): string | undefined => {
  const normalized = normalizeOrderStatus(status);
  return normalized ? ORDER_STATUS_DESCRIPTIONS[normalized] : undefined;
};

// =====================
// Next status logic (Admin actions)
// =====================
const ORDER_STATUS_OVERRIDES: Partial<
  Record<OrderStatusValue, OrderStatusValue[]>
> = {
  pending_payment: ["cancelled"],
  paid: ["cancelled", "refunded"],
  processing: ["cancelled"],
  failed: ["pending_payment"],
  delivered: ["refunded"],
};

export const getNextOrderStatuses = (
  status?: string | null,
): OrderStatusValue[] => {
  const normalized = normalizeOrderStatus(status);
  if (!normalized) {
    return ORDER_STATUS_FLOW.length ? [ORDER_STATUS_FLOW[0]] : [];
  }

  const result: OrderStatusValue[] = [];
  const currentIndex = ORDER_STATUS_FLOW.indexOf(
    normalized as OrderWorkflowStatus,
  );

  // Happy-path next status
  if (currentIndex >= 0 && currentIndex < ORDER_STATUS_FLOW.length - 1) {
    result.push(ORDER_STATUS_FLOW[currentIndex + 1]);
  }

  // Override / exceptional transitions
  const overrides = ORDER_STATUS_OVERRIDES[normalized];
  if (overrides?.length) {
    result.push(...overrides);
  }

  return Array.from(new Set(result));
};