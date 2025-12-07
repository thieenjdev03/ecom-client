"use client";

import { useMemo, useEffect, useCallback } from "react";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { getStorage, useLocalStorage } from "src/hooks/use-local-storage";

import { PRODUCT_CHECKOUT_STEPS } from "src/_mock/_product";

import { getProductById } from "src/api/product";
import { useAuthContext } from "src/auth/hooks";
import { useSnackbar } from "src/components/snackbar";
import { useTranslate } from "src/locales";

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
  const userProfile = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslate();

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
      
      // Validate quantity
      const quantityToAdd = newItem.quantity || 1;
      if (quantityToAdd <= 0) {
        enqueueSnackbar(t("checkout.quantityMustBeGreaterThanZero"), { variant: "error" });
        return;
      }

      // Validate available stock
      const availableStock = newItem.available || 0;
      if (availableStock <= 0) {
        enqueueSnackbar(t("checkout.productOutOfStock"), { variant: "error" });
        return;
      }

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
        const existingItem = state.items[existingItemIndex];
        const newQuantity = existingItem.quantity + quantityToAdd;
        
        // Check if new quantity exceeds available stock
        if (newQuantity > availableStock) {
          enqueueSnackbar(
            t("checkout.maxQuantityInCart", { max: availableStock, current: existingItem.quantity }),
            { variant: "warning" }
          );
          // Update to max available stock
          updatedItems = state.items.map((item: ICheckoutItem, index: number) => {
            if (index === existingItemIndex) {
              return {
                ...item,
                quantity: availableStock,
                subTotal: item.price * availableStock,
                available: availableStock,
              };
            }
            return item;
          });
        } else {
          updatedItems = state.items.map((item: ICheckoutItem, index: number) => {
            if (index === existingItemIndex) {
              return {
                ...item,
                quantity: newQuantity,
                subTotal: item.price * newQuantity,
                available: availableStock, // Update available stock
              };
            }
            return item;
          });
        }
      } else {
        // New item - validate quantity doesn't exceed stock
        if (quantityToAdd > availableStock) {
          enqueueSnackbar(
            t("checkout.quantityExceedsStock", { quantity: quantityToAdd, stock: availableStock }),
            { variant: "warning" }
          );
          // Add with available stock instead
          const itemToAdd: ICheckoutItem = {
            ...newItem,
            id: cartItemId,
            productId: productId,
            variantId: variantId || cartItemId,
            quantity: availableStock,
            subTotal: (newItem.price || 0) * availableStock,
          };
          updatedItems = [...state.items, itemToAdd];
        } else {
          // New item - add to cart
          const itemToAdd: ICheckoutItem = {
            ...newItem,
            id: cartItemId,
            productId: productId,
            variantId: variantId || cartItemId, // Use cartItemId as fallback for backward compatibility
            subTotal: (newItem.price || 0) * quantityToAdd,
          };
          updatedItems = [...state.items, itemToAdd];
        }
      }

      update("items", updatedItems);
    },
    [update, state.items, enqueueSnackbar, t],
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
    async (itemId: string) => {
      const item = state.items.find((i: ICheckoutItem) => i.id === itemId);
      if (!item) return;

      // Check available stock before increasing
      const availableStock = item.available || 0;
      if (item.quantity >= availableStock) {
        enqueueSnackbar(
          t("checkout.maxQuantityReached", { max: availableStock }),
          { variant: "warning" }
        );
        return;
      }

      const updatedItems = state.items.map((i: ICheckoutItem) => {
        if (i.id === itemId) {
          const newQuantity = i.quantity + 1;
          return {
            ...i,
            quantity: newQuantity,
            subTotal: i.price * newQuantity,
          };
        }
        return i;
      });

      update("items", updatedItems);
    },
    [update, state.items, enqueueSnackbar, t],
  );

  const onDecreaseQuantity = useCallback(
    (itemId: string) => {
      const updatedItems = state.items.map((item: ICheckoutItem) => {
        if (item.id === itemId) {
          const newQuantity = Math.max(1, item.quantity - 1);
          return {
            ...item,
            quantity: newQuantity,
            subTotal: item.price * newQuantity,
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
    if (!userProfile?.authenticated) {
      enqueueSnackbar(t("checkout.pleaseLoginToViewCart"), {
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
  }, [update, userProfile?.authenticated, router, enqueueSnackbar, t]);

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

    try {
      // Fetch latest product data for all items in cart
      const validationPromises = state.items.map(async (item: ICheckoutItem) => {
        try {
          const productId = item.productId || item.id;
          const latestProduct = await getProductById(productId);

          // Check if product exists
          if (!latestProduct) {
            errors.push({
              itemId: item.id,
              productName: item.name,
              reason: t("checkout.validation.productNotExist"),
            });
            return null; // Remove item
          }

          // Check product status
          if (latestProduct.publish !== "published" && latestProduct.publish !== "active") {
            errors.push({
              itemId: item.id,
              productName: item.name,
              reason: t("checkout.validation.productNotForSale"),
            });
            return null; // Remove item
          }

          // Check if product has variants
          const hasVariants = Array.isArray(latestProduct.variants) && latestProduct.variants.length > 0;
          const variantId = item.variantId || "";

          // Parse variantId: format is `${productId}-${color_id}-${size_id}` or `${productId}-default`
          // Note: productId might contain dashes, so we need to be careful when parsing
          let colorId: string | null = null;
          let sizeId: string | null = null;
          
          if (variantId && variantId !== `${productId}-default`) {
            // Try to extract color_id and size_id from variantId
            // Format: `${productId}-${color_id}-${size_id}`
            // We need to remove the productId prefix first
            const variantIdWithoutProduct = variantId.replace(`${productId}-`, "");
            const variantParts = variantIdWithoutProduct.split("-");
            
            // If we have at least 2 parts, assume first is color_id, second is size_id
            if (variantParts.length >= 2) {
              colorId = variantParts[0] !== "no-color" ? variantParts[0] : null;
              sizeId = variantParts[1] !== "no-size" ? variantParts[1] : null;
            }
          }

          if (hasVariants) {
            // Product with variants - must find matching variant
            if (!colorId && !sizeId && variantId !== `${productId}-default`) {
              errors.push({
                itemId: item.id,
                productName: item.name,
                reason: t("checkout.validation.invalidVariant"),
              });
              return null; // Remove item
            }

            // Find matching variant in latest product
            const matchingVariant = latestProduct.variants?.find(
              (v: any) => {
                const vColorId = v.color_id || null;
                const vSizeId = v.size_id || null;
                return vColorId === colorId && vSizeId === sizeId;
              }
            );

            if (!matchingVariant) {
              errors.push({
                itemId: item.id,
                productName: item.name,
                reason: t("checkout.validation.variantNotExist"),
              });
              return null; // Remove item
            }

            // Check variant stock
            const variantStock = typeof matchingVariant.stock === "number" 
              ? matchingVariant.stock 
              : Number(matchingVariant.stock) || 0;

            if (variantStock <= 0) {
              errors.push({
                itemId: item.id,
                productName: item.name,
                reason: t("checkout.validation.variantOutOfStock"),
              });
              return null; // Remove item
            }

            if (variantStock < item.quantity) {
              errors.push({
                itemId: item.id,
                productName: item.name,
                reason: t("checkout.validation.quantityExceedsStock", { quantity: item.quantity, stock: variantStock }),
              });
              // Update quantity to available stock
              const variantPrice = typeof matchingVariant.price === "number"
                ? matchingVariant.price
                : Number(matchingVariant.price) || 0;
              
              const updatedItem: ICheckoutItem = {
                ...item,
                quantity: variantStock,
                price: variantPrice,
                available: variantStock,
                subTotal: variantPrice * variantStock,
              };
              return updatedItem;
            }

            // Check price change
            const variantPrice = typeof matchingVariant.price === "number"
              ? matchingVariant.price
              : Number(matchingVariant.price) || 0;

            if (variantPrice !== item.price) {
              // Price changed - update item
              const updatedItem: ICheckoutItem = {
                ...item,
                price: variantPrice,
                available: variantStock,
                subTotal: variantPrice * item.quantity,
              };
              return updatedItem;
            }

            // Update available stock in case it changed
            const updatedItem: ICheckoutItem = {
              ...item,
              available: variantStock,
            };
            return updatedItem;
          } else {
            // Product without variants - check stock_quantity and price
            const availableStock = typeof latestProduct.available === "number"
              ? latestProduct.available
              : typeof latestProduct.quantity === "number"
              ? latestProduct.quantity
              : Number(latestProduct.available) || Number(latestProduct.quantity) || 0;

            if (availableStock <= 0) {
              errors.push({
                itemId: item.id,
                productName: item.name,
                reason: t("checkout.validation.productOutOfStock"),
              });
              return null; // Remove item
            }

            if (availableStock < item.quantity) {
              errors.push({
                itemId: item.id,
                productName: item.name,
                reason: t("checkout.validation.quantityExceedsStock", { quantity: item.quantity, stock: availableStock }),
              });
              // Update quantity to available stock
              const productPrice = latestProduct.priceSale 
                ? Number(latestProduct.priceSale)
                : latestProduct.productPrice 
                ? Number(latestProduct.productPrice)
                : latestProduct.price
                ? Number(latestProduct.price)
                : item.price;

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
            const productPrice = latestProduct.priceSale 
              ? Number(latestProduct.priceSale)
              : latestProduct.productPrice 
              ? Number(latestProduct.productPrice)
              : latestProduct.price
              ? Number(latestProduct.price)
              : item.price;

            if (productPrice !== item.price) {
              // Price changed - update item
              const updatedItem: ICheckoutItem = {
                ...item,
                price: productPrice,
                available: availableStock,
                subTotal: productPrice * item.quantity,
              };
              return updatedItem;
            }

            // Update available stock in case it changed
            const updatedItem: ICheckoutItem = {
              ...item,
              available: availableStock,
            };
            return updatedItem;
          }
        } catch (error) {
          console.error(`Error validating item ${item.id}:`, error);
          errors.push({
            itemId: item.id,
            productName: item.name,
            reason: t("checkout.validation.errorCheckingProduct"),
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
            reason: t("checkout.validation.errorCheckingCart"),
          },
        ],
      };
    }
  }, [state.items, update, t]);

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
