"use client";

import uniq from "lodash/uniq";
import { useMemo, useEffect, useCallback } from "react";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { getStorage, useLocalStorage } from "src/hooks/use-local-storage";

import { PRODUCT_CHECKOUT_STEPS } from "src/_mock/_product";

import { getProductById } from "src/api/product";
import { useAuthContext } from "src/auth/hooks/use-auth-context";
import { useSnackbar } from "src/components/snackbar";

import { IAddressItem } from "src/types/address";
import { ICheckoutItem, CartValidationResult } from "src/types/checkout";

import { CheckoutContext } from "./checkout-context";

// ----------------------------------------------------------------------

const STORAGE_KEY = "checkout";

const initialState = {
  activeStep: 0,
  items: [],
  subTotal: 0,
  total: 0,
  discount: 0,
  shipping: 0,
  billing: null,
  totalItems: 0,
  orderId: null,
  // Cart preview state
  cartPreviewOpen: false,
};

type Props = {
  children: React.ReactNode;
};

export function CheckoutProvider({ children }: Props) {
  const router = useRouter();
  const { authenticated } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const { state, update, reset } = useLocalStorage(STORAGE_KEY, initialState);

  const onGetCart = useCallback(() => {
    const totalItems: number = state.items.reduce(
      (total: number, item: ICheckoutItem) => total + item.quantity,
      0,
    );

    const subTotal: number = state.items.reduce(
      (total: number, item: ICheckoutItem) =>
        total + item.quantity * item.price,
      0,
    );

    update("subTotal", subTotal);
    update("totalItems", totalItems);
    update("billing", state.activeStep === 1 ? null : state.billing);
    update("discount", state.items.length ? state.discount : 0);
    update("shipping", state.items.length ? state.shipping : 0);
    update("total", state.subTotal - state.discount + state.shipping);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.items,
    state.activeStep,
    state.billing,
    state.discount,
    state.shipping,
    state.subTotal,
  ]);

  useEffect(() => {
    const restored = getStorage(STORAGE_KEY);

    if (restored) {
      onGetCart();
    }
  }, [onGetCart]);

  const onAddToCart = useCallback(
    (newItem: ICheckoutItem) => {
      // Ensure productId and variantId are set
      const productId = newItem.productId || newItem.id;
      const variantId = newItem.variantId;
      
      // Generate unique cart item ID
      const cartItemId = variantId 
        ? `${productId}-${variantId}` 
        : `${productId}-${Date.now()}`;
      
      // Check if item with same productId + variantId already exists
      // IMPORTANT: Must check both productId AND variantId to distinguish variants
      const existingItemIndex = state.items.findIndex(
        (item: ICheckoutItem) => {
          const itemProductId = item.productId || item.id;
          const itemVariantId = item.variantId;
          
          // Both must have same productId
          if (itemProductId !== productId) return false;
          
          // If both have variantId, they must match
          if (itemVariantId && variantId) {
            return itemVariantId === variantId;
          }
          
          // If one has variantId and the other doesn't, they are different
          if (itemVariantId || variantId) {
            return false;
          }
          
          // If neither has variantId, treat as same (backward compatibility for products without variants)
          return true;
        },
      );

      let updatedItems: ICheckoutItem[];

      if (existingItemIndex >= 0) {
        // Item exists - increase quantity
        updatedItems = state.items.map((item: ICheckoutItem, index: number) => {
          if (index === existingItemIndex) {
            return {
              ...item,
              quantity: item.quantity + (newItem.quantity || 1),
              subTotal: item.price * (item.quantity + (newItem.quantity || 1)),
            };
          }
          return item;
        });
      } else {
        // New item - add to cart
        const itemToAdd: ICheckoutItem = {
          ...newItem,
          id: cartItemId,
          productId: productId,
          variantId: variantId || cartItemId, // Use cartItemId as fallback for backward compatibility
          subTotal: (newItem.price || 0) * (newItem.quantity || 1),
        };
        updatedItems = [...state.items, itemToAdd];
      }

      update("items", updatedItems);
    },
    [update, state.items],
  );

  const onDeleteCart = useCallback(
    (itemId: string) => {
      const updatedItems = state.items.filter(
        (item: ICheckoutItem) => item.id !== itemId,
      );

      update("items", updatedItems);
    },
    [update, state.items],
  );

  const onBackStep = useCallback(() => {
    update("activeStep", state.activeStep - 1);
  }, [update, state.activeStep]);

  const onNextStep = useCallback(() => {
    update("activeStep", state.activeStep + 1);
  }, [update, state.activeStep]);

  const onGotoStep = useCallback(
    (step: number) => {
      update("activeStep", step);
    },
    [update],
  );

  const onIncreaseQuantity = useCallback(
    (itemId: string) => {
      const updatedItems = state.items.map((item: ICheckoutItem) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity: item.quantity + 1,
          };
        }
        return item;
      });

      update("items", updatedItems);
    },
    [update, state.items],
  );

  const onDecreaseQuantity = useCallback(
    (itemId: string) => {
      const updatedItems = state.items.map((item: ICheckoutItem) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity: item.quantity - 1,
          };
        }
        return item;
      });

      update("items", updatedItems);
    },
    [update, state.items],
  );

  const onCreateBilling = useCallback(
    (address: IAddressItem) => {
      update("billing", address);

      onNextStep();
    },
    [onNextStep, update],
  );

  const onApplyDiscount = useCallback(
    (discount: number) => {
      update("discount", discount);
    },
    [update],
  );

  const onApplyShipping = useCallback(
    (shipping: number) => {
      update("shipping", shipping);
    },
    [update],
  );

  const completed = state.activeStep === PRODUCT_CHECKOUT_STEPS.length;

  // Reset
  const onReset = useCallback(() => {
    if (completed) {
      reset();
      // Clear pending order from localStorage
      localStorage.removeItem('pending_order');
      router.replace(paths.product.root);
    }
  }, [completed, reset, router]);

  // Cart preview functions
  const onOpenCartPreview = useCallback(() => {
    // Check authentication before opening cart preview
    if (!authenticated) {
      enqueueSnackbar("Vui lòng đăng nhập để xem giỏ hàng", {
        variant: "warning",
      });
      
      // Redirect to login with returnTo parameter to come back to checkout after login
      const returnTo = paths.product.checkout;
      const searchParams = new URLSearchParams({
        returnTo: returnTo,
      }).toString();
      
      const loginPath = `${paths.auth.jwt.login}?${searchParams}`;
      router.push(loginPath);
      return;
    }
    
    update("cartPreviewOpen", true);
  }, [update, authenticated, router, enqueueSnackbar]);

  const onCloseCartPreview = useCallback(() => {
    update("cartPreviewOpen", false);
  }, [update]);

  // Set order ID after order creation (Step 1)
  const onSetOrderId = useCallback(
    (orderId: string) => {
      update("orderId", orderId);
    },
    [update],
  );

  // Clear order ID (e.g., on reset)
  const onClearOrderId = useCallback(() => {
    update("orderId", null);
  }, [update]);

  // Validate and refresh cart items before checkout
  // This fetches latest product data from API to check stock, price, availability
  const onValidateAndRefreshCart = useCallback(async (): Promise<CartValidationResult> => {
    const errors: CartValidationResult["errors"] = [];
    const updatedItems: ICheckoutItem[] = [];

    try {
      // Fetch latest product data for all items in cart
      const validationPromises = state.items.map(async (item: ICheckoutItem) => {
        try {
          const productId = item.productId || item.id;
          const latestProduct = await getProductById(productId);

          if (!latestProduct) {
            errors.push({
              itemId: item.id,
              productName: item.name,
              reason: "Sản phẩm không còn tồn tại",
            });
            return null; // Remove item
          }

          // If item has variant, check variant stock
          if (item.variantId && item.variants && item.variants.length > 0) {
            // Extract color_id and size_id from variantId
            const variantParts = item.variantId.split("-");
            const colorId = variantParts[1];
            const sizeId = variantParts[2];

            // Find matching variant in latest product
            const matchingVariant = latestProduct.variants?.find(
              (v: any) => v.color_id === colorId && v.size_id === sizeId
            );

            if (!matchingVariant) {
              errors.push({
                itemId: item.id,
                productName: item.name,
                reason: "Variant không còn tồn tại",
              });
              return null; // Remove item
            }

            // Check variant stock
            if (matchingVariant.stock < item.quantity) {
              errors.push({
                itemId: item.id,
                productName: item.name,
                reason: `Số lượng yêu cầu (${item.quantity}) vượt quá số lượng tồn kho (${matchingVariant.stock})`,
              });
              // Update quantity to available stock
              const updatedItem: ICheckoutItem = {
                ...item,
                quantity: matchingVariant.stock,
                price: matchingVariant.price,
                available: matchingVariant.stock,
                subTotal: matchingVariant.price * matchingVariant.stock,
              };
              return updatedItem;
            }

            // Check price change
            if (matchingVariant.price !== item.price) {
              // Price changed - update item
              const updatedItem: ICheckoutItem = {
                ...item,
                price: matchingVariant.price,
                subTotal: matchingVariant.price * item.quantity,
              };
              return updatedItem;
            }
          } else {
            // Product without variant - check stock and price
            const availableStock = latestProduct.available || 0;
            if (availableStock < item.quantity) {
              errors.push({
                itemId: item.id,
                productName: item.name,
                reason: `Số lượng yêu cầu (${item.quantity}) vượt quá số lượng tồn kho (${availableStock})`,
              });
              // Update quantity to available stock
              const productPrice = latestProduct.priceSale || latestProduct.productPrice || item.price;
              const updatedItem: ICheckoutItem = {
                ...item,
                quantity: availableStock,
                price: productPrice,
                available: availableStock,
                subTotal: productPrice * availableStock,
              };
              return updatedItem;
            }

            // Check price change
            const productPrice = latestProduct.priceSale || latestProduct.productPrice || item.price;
            if (productPrice !== item.price) {
              // Price changed - update item
              const updatedItem: ICheckoutItem = {
                ...item,
                price: productPrice,
                subTotal: productPrice * item.quantity,
              };
              return updatedItem;
            }
          }

          // Item is valid - keep as is
          return item;
        } catch (error) {
          console.error(`Error validating item ${item.id}:`, error);
          errors.push({
            itemId: item.id,
            productName: item.name,
            reason: "Lỗi khi kiểm tra sản phẩm",
          });
          return null; // Remove item on error
        }
      });

      const validatedItems = await Promise.all(validationPromises);
      const validItems = validatedItems.filter((item): item is ICheckoutItem => item !== null);

      // Update cart with validated items
      if (validItems.length !== state.items.length || errors.length > 0) {
        update("items", validItems);
      }

      return {
        isValid: errors.length === 0,
        errors,
        updatedItems: validItems,
      };
    } catch (error) {
      console.error("Error validating cart:", error);
      return {
        isValid: false,
        errors: [
          {
            itemId: "",
            productName: "",
            reason: "Lỗi khi kiểm tra giỏ hàng",
          },
        ],
      };
    }
  }, [state.items, update]);

  const memoizedValue = useMemo(
    () => ({
      ...state,
      completed,
      //
      onAddToCart,
      onDeleteCart,
      //
      onIncreaseQuantity,
      onDecreaseQuantity,
      //
      onCreateBilling,
      onApplyDiscount,
      onApplyShipping,
      //
      onBackStep,
      onNextStep,
      onGotoStep,
      //
      onReset,
      // Order ID management
      onSetOrderId,
      onClearOrderId,
      // Cart preview functions
      onOpenCartPreview,
      onCloseCartPreview,
      // Validate and refresh cart
      onValidateAndRefreshCart,
    }),
    [
      completed,
      onAddToCart,
      onApplyDiscount,
      onApplyShipping,
      onBackStep,
      onCreateBilling,
      onDecreaseQuantity,
      onDeleteCart,
      onGotoStep,
      onIncreaseQuantity,
      onNextStep,
      onReset,
      onSetOrderId,
      onClearOrderId,
      onOpenCartPreview,
      onCloseCartPreview,
      onValidateAndRefreshCart,
      state,
    ],
  );

  return (
    <CheckoutContext.Provider value={memoizedValue}>
      {children}
    </CheckoutContext.Provider>
  );
}
