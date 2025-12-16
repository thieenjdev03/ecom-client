import React, { useState } from "react";

import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Unstable_Grid2";
import Alert from "@mui/material/Alert";
import LoadingButton from "@mui/lab/LoadingButton";
import Typography from "@mui/material/Typography";
import EmptyContent from "src/components/empty-content";
import { useSnackbar } from "src/components/snackbar";
import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { useCheckoutContext } from "./context";
import CheckoutSummary from "./checkout-summary";
import CheckoutShippingForm, { CheckoutShippingData } from "./checkout-shipping-form";
import SavedOrderBanner from "./components/saved-order-banner";
import { PAYPAL_CONFIG } from "src/config/paypal";
import { useGetProducts } from "src/api/product";
import { useAuthContext } from "src/auth/hooks/use-auth-context";
import { orderApi, type OrderItem, type OrderSummary, type ShippingAddress } from "src/api/order";
import { calculateShipping, calculateTax } from "src/config/shipping";
import { useTranslate } from "src/locales";

const translations = {
  en: {
    checkoutTitle: "Lume Store - Checkout Cart",
    emptyTitle: "Cart is empty",
    emptyDescription: "Looks like you have no items in your shopping cart.",
    loginWarning: "Please sign in to continue checkout",
    missingShippingFields: "Please fill in all required shipping info (name, phone, street, province, district, ward).",
    orderCreatedSuccess: "Order created successfully!",
    orderCreationFailed: "Failed to create order. Please try again.",
    validatingCart: "Validating cart...",
    creatingOrder: "Creating order...",
    continueToPayment: "Continue to Payment",
  },
  vi: {
    checkoutTitle: "Lume Store - Giỏ hàng thanh toán",
    emptyTitle: "Giỏ hàng trống",
    emptyDescription: "Có vẻ như bạn chưa có sản phẩm nào trong giỏ hàng.",
    loginWarning: "Vui lòng đăng nhập để tiếp tục thanh toán",
    missingShippingFields: "Vui lòng nhập đủ họ tên, số điện thoại, địa chỉ, tỉnh/thành, quận/huyện, phường/xã.",
    orderCreatedSuccess: "Đơn hàng đã được tạo thành công!",
    orderCreationFailed: "Tạo đơn hàng thất bại. Vui lòng thử lại.",
    validatingCart: "Đang kiểm tra giỏ hàng...",
    creatingOrder: "Đang tạo đơn hàng...",
    continueToPayment: "Tiếp tục thanh toán",
  },
} as const;

type Language = keyof typeof translations;

// ----------------------------------------------------------------------

export default function CheckoutCart() {
  const router = useRouter();
  const checkout = useCheckoutContext();
  const { enqueueSnackbar } = useSnackbar();
  const { products } = useGetProducts({ page: 1, limit: 1 });
  const { user, authenticated } = useAuthContext();
  const { i18n } = useTranslate();

  const empty = !checkout.items.length;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedOrderInfo, setSavedOrderInfo] = useState<any>(null);
  const [shippingFormData, setShippingFormData] = useState<CheckoutShippingData | null>(null);

  const currentLanguage = (i18n.language as Language) || "en";
  const t = translations[currentLanguage] || translations.en;

  const sanitize = (value: string) => value.trim();
  const isShippingDataComplete = (data: CheckoutShippingData) => {
    const requiredFields = [
      data.firstName,
      data.lastName,
      data.phone,
      data.addressLine1,
      data.province,
      data.district,
      data.ward,
      data.city,
      data.countryCode,
    ];

    return requiredFields.every((field) => Boolean(field && field.trim()));
  };

  // Load saved order info from localStorage on mount
  React.useEffect(() => {
    try {
      const savedOrder = localStorage.getItem('pending_order');
      if (savedOrder) {
        const orderInfo = JSON.parse(savedOrder);
        
        // Check if order was created within last 24 hours
        const createdAt = new Date(orderInfo.createdAt);
        const now = new Date();
        const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 24 && orderInfo.orderId) {
          // Restore order ID to context
          checkout.onSetOrderId(orderInfo.orderId);
          setSavedOrderInfo(orderInfo);
          console.log('Restored order ID from localStorage:', orderInfo.orderId);
        } else {
          // Order too old, remove it
          localStorage.removeItem('pending_order');
        }
      }
    } catch (error) {
      console.error('Error loading saved order:', error);
      localStorage.removeItem('pending_order');
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle continuing with saved order
  const handleContinueSavedOrder = () => {
    // Move to payment step
    checkout.onNextStep();
  };

  // Handle dismissing saved order banner
  const handleDismissSavedOrder = () => {
    setSavedOrderInfo(null);
    localStorage.removeItem('pending_order');
    checkout.onClearOrderId();
  };

  // Add sample product to cart if empty (for demo purposes)
  React.useEffect(() => {
    if (empty && products.length > 0) {
      const sampleProduct = products[0];
      checkout.onAddToCart({
        id: sampleProduct.id,
        productId: sampleProduct.id,
        variantId: `${sampleProduct.id}-default`,
        name: sampleProduct.name,
        variants: sampleProduct.variants || [],
        category: sampleProduct.category || "",
        coverUrl: sampleProduct.coverUrl || "",
        available: sampleProduct.available || 0,
        price: sampleProduct.price || 0,
        colors: sampleProduct.colors?.length > 0 ? [sampleProduct.colors[0]] : ['#000000'],
        size: sampleProduct.sizes?.length > 0 ? sampleProduct.sizes[0] : 'M',
        quantity: 1,
      });
    }
  }, [empty, checkout, products]);

  // Helper function to format number to string with 2 decimal places
  const formatCurrency = (value: number): string => {
    return value.toFixed(2);
  };

  // Handle shipping form submission and create order
  const handleCreateOrder = async () => {
    // Step 0: Check authentication - redirect to login if not authenticated
    if (!authenticated) {
      enqueueSnackbar(t.loginWarning, {
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

    if (!shippingFormData || !isShippingDataComplete(shippingFormData)) {
      setError(t.missingShippingFields);
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      // Step 1: Validate and refresh cart items before checkout
      // const validationResult = await checkout.onValidateAndRefreshCart();

      // if (!validationResult.isValid) {
      //   // Show validation errors
      //   validationResult.errors.forEach((err) => {
      //     enqueueSnackbar(`${err.productName}: ${err.reason}`, {
      //       variant: "error",
      //     });
      //   });

      //   // If cart is empty after validation, show error
      //   if (checkout.items.length === 0) {
      //     setError("Giỏ hàng của bạn đã trống sau khi kiểm tra. Vui lòng thêm sản phẩm lại.");
      //     setIsValidating(false);
      //     return;
      //   }

      //   // If there are errors but cart still has items, show warning but continue
      //   enqueueSnackbar("Một số sản phẩm đã được cập nhật. Vui lòng kiểm tra lại giỏ hàng.", {
      //     variant: "warning",
      //   });
      // }

      setIsValidating(false);
      setIsSubmitting(true);

      // Step 2: Prepare order items with validated cart data
      // This will use the latest validated items from cart
      const orderItems: OrderItem[] = checkout.items.map((item, index) => {
        // Use new color and size objects for better variant name display
        const colorName = item.color?.name || (item.colors?.length > 0 ? item.colors[0] : '');
        const sizeName = item.sizeObj?.name || item.size || '';
        const variantName = item.variantName || 
          (colorName && sizeName ? `${colorName} / ${sizeName}` : 
           colorName || sizeName || 'Standard');

        return {
          productId: item.productId || item.id,
          productName: item.name,
          productSlug: item.name.toLowerCase().replace(/\s+/g, '-'),
          variantId: item.variantId || `${item.id}-variant-${index}`,
          variantName: variantName,
          quantity: item.quantity,
          unitPrice: formatCurrency(item.price),
          totalPrice: formatCurrency(item.price * item.quantity),
          sku: item.sku || `${item.id}-${item.size || 'default'}`,
        };
      });

      // Calculate summary with string values for API (using updated cart totals)
      // Calculate shipping based on selected country
      const shippingInfo = calculateShipping(shippingFormData.countryCode, checkout.subTotal);
      const shipping = shippingInfo.cost;
      
      // Calculate tax based on selected country
      const tax = calculateTax(shippingFormData.countryCode, checkout.subTotal);
      
      const orderSummary: OrderSummary = {
        subtotal: formatCurrency(checkout.subTotal),
        shipping: formatCurrency(shipping),
        tax: formatCurrency(tax),
        discount: formatCurrency(checkout.discount),
        total: formatCurrency(checkout.subTotal - checkout.discount + shipping + tax),
        currency: PAYPAL_CONFIG.currency,
      };

      // Step 3: Create order with validated items
      // Prepare shipping address that matches backend contract
      const shippingAddress: ShippingAddress = {
        full_name: `${sanitize(shippingFormData.firstName)} ${sanitize(shippingFormData.lastName)}`.trim(),
        phone: sanitize(shippingFormData.phone),
        countryCode: shippingFormData.countryCode,
        province: sanitize(shippingFormData.province),
        district: sanitize(shippingFormData.district),
        ward: sanitize(shippingFormData.ward),
        address_line: sanitize(shippingFormData.addressLine1),
        city: sanitize(shippingFormData.city),
        country: shippingFormData.countryCode,
        isBilling: shippingFormData.isBilling,
        isDefault: shippingFormData.isDefault,
        isShipping: true,
        ...(shippingFormData.addressLine2 ? { address_line2: sanitize(shippingFormData.addressLine2) } : {}),
        ...(shippingFormData.postalCode ? { postalCode: sanitize(shippingFormData.postalCode) } : {}),
        ...(shippingFormData.label ? { label: sanitize(shippingFormData.label) } : {}),
        ...(shippingFormData.note ? { note: sanitize(shippingFormData.note) } : {}),
      };

      // Create order with shipping address
      const payload = {
        userId: user?.id || "local-dev",
        items: orderItems,
        summary: orderSummary,
        shipping_address: shippingAddress,
        paymentMethod: "PAYPAL" as const,
        notes: "",
      };

      const response = await orderApi.create(payload);
      console.log("Order creation response:", response);
      
      // Handle response structure: { data: { id: ... }, success: true } or direct { id: ... }
      const order = response?.data || response;
      console.log("Extracted order:", order);
      
      if (!order?.id) {
        console.error("Order creation response:", response);
        throw new Error("Failed to create order: Order ID not found in response");
      }

      // Store order ID in context
      console.log("Setting order ID:", order.id);
      checkout.onSetOrderId(order.id);

      // Store order info in localStorage for recovery
      const orderInfo = {
        orderId: order.id,
        shippingAddress: shippingFormData,
        orderSummary: orderSummary,
        items: orderItems,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('pending_order', JSON.stringify(orderInfo));
      
      // Show success message
      enqueueSnackbar(t.orderCreatedSuccess, {
        variant: "success",
      });

      // Move to Step 2 (Payment)
      console.log("Moving to Step 2 (Payment)");
      checkout.onNextStep();
    } catch (err: any) {
      console.error("Error creating order:", err);
      const fallbackMessage = t.orderCreationFailed;
      const errorMessage = err?.message || fallbackMessage;
      setError(errorMessage);
      enqueueSnackbar(errorMessage, {
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
      setIsValidating(false);
    }
  };

  if (empty) {
    return (
      <EmptyContent title={t.emptyTitle} description={t.emptyDescription} />
    );
  }

  return (
    <Box
      sx={{
        mx: "auto",
        mt: 4,
      }}
    >
      <Grid container spacing={4} sx={{
        justifyContent: "center",
      }}>
        <Grid xs={12} md={6}>
          <Typography variant="h4" align="left" sx={{ mb: 5 }}>
            {t.checkoutTitle}
          </Typography>
          <Stack spacing={3}>
            {/* Saved Order Banner */}
            {savedOrderInfo && (
              <SavedOrderBanner
                orderInfo={savedOrderInfo}
                onContinue={handleContinueSavedOrder}
                onDismiss={handleDismissSavedOrder}
              />
            )}

            {/* Only show form if no saved order */}
            {!savedOrderInfo && (
              <Card sx={{ p: 3 }}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <CheckoutShippingForm 
                  onShippingDataChange={setShippingFormData}
                  onSubmit={handleCreateOrder}
                />

                <LoadingButton
                  fullWidth
                  size="large"
                  variant="contained"
                  loading={isSubmitting || isValidating}
                  disabled={!shippingFormData || isSubmitting || isValidating}
                  onClick={handleCreateOrder}
                  sx={{
                    mt: 3,
                    backgroundColor: "#8B4513",
                    "&:hover": {
                      backgroundColor: "#A0522D",
                    },
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  {isValidating
                    ? t.validatingCart
                    : isSubmitting
                    ? t.creatingOrder
                    : t.continueToPayment}
                </LoadingButton>
              </Card>
            )}
          </Stack>
        </Grid>
        <Grid xs={12} md={5}>
          <CheckoutSummary
            total={checkout.total}
            discount={checkout.discount}
            subTotal={checkout.subTotal}
            items={checkout.items}
            onApplyDiscount={checkout.onApplyDiscount}
            countryCode={shippingFormData?.countryCode}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
