import { IAddressItem } from "./address";
import { ProductVariantDto } from "./product-dto";

// ----------------------------------------------------------------------

export type ColorType = {
  id: string;
  name: string;
  hexCode: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SizeType = {
  id: string;
  name: string;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
  category?: any;
};

export type ICheckoutItem = {
  id: string; // Cart item ID (for backend API)
  productId: string; // Product ID
  variantId: string; // Variant ID - QUAN TRỌNG để phân biệt variant
  name: string; // Product name
  variantName?: string; // "Red / Size M" - for display
  variants: ProductVariantDto[]; // Keep for backward compatibility
  coverUrl: string;
  available: number;
  price: number;
  sku?: string; // Variant SKU
  colors: string[]; // Keep for backward compatibility - color IDs
  size: string; // Keep for backward compatibility - size ID
  color?: ColorType; // Full color object
  sizeObj?: SizeType; // Full size object
  quantity: number;
  subTotal: number;
  category: string;
};

export type ICheckoutDeliveryOption = {
  value: number;
  label: string;
  description: string;
};

export type ICheckoutPaymentOption = {
  value: string;
  label: string;
  description: string;
};

export type ICheckoutCardOption = {
  value: string;
  label: string;
};

export type ICheckoutValue = {
  total: number;
  subTotal: number;
  discount: number;
  shipping: number;
  activeStep: number;
  totalItems: number;
  items: ICheckoutItem[];
  billing: IAddressItem | null;
  // Order ID for 2-step checkout flow
  orderId: string | null;
  // Cart preview state
  cartPreviewOpen: boolean;
};

export type CartValidationResult = {
  isValid: boolean;
  errors: Array<{
    itemId: string;
    productName: string;
    reason: string;
  }>;
  updatedItems?: ICheckoutItem[];
};

export type CheckoutContextProps = ICheckoutValue & {
  completed: boolean;
  //
  onAddToCart: (newItem: Omit<ICheckoutItem, "subTotal">) => void;
  onDeleteCart: (itemId: string) => void;
  //
  onIncreaseQuantity: (itemId: string) => void;
  onDecreaseQuantity: (itemId: string) => void;
  //
  onBackStep: VoidFunction;
  onNextStep: VoidFunction;
  onGotoStep: (step: number) => void;
  //
  onCreateBilling: (billing: IAddressItem) => void;
  onApplyDiscount: (discount: number) => void;
  onApplyShipping: (discount: number) => void;
  //
  canReset: boolean;
  onReset: VoidFunction;
  // Order ID management
  onSetOrderId: (orderId: string) => void;
  onClearOrderId: VoidFunction;
  // Cart preview functions
  onOpenCartPreview: VoidFunction;
  onCloseCartPreview: VoidFunction;
  // Validate and refresh cart items before checkout
  onValidateAndRefreshCart: () => Promise<CartValidationResult>;
};
