import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Button from "@mui/material/Button";
import Grid from "@mui/material/Unstable_Grid2";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

import Iconify from "src/components/iconify";

import { useCheckoutContext } from "./context";
import CheckoutSummary from "./checkout-summary";
import { PAYPAL_CONFIG } from "src/config/paypal";
import { paypalApiService } from "src/services/paypal-api";
import { orderApi } from "src/api/order";

// ----------------------------------------------------------------------

const PAYPAL_ISSUE_MESSAGES: Record<string, string> = {
  INSTRUMENT_DECLINED:
    "Your bank declined the card. Choose a different payment method or contact your bank.",
  PAYMENT_DENIED:
    "PayPal could not process this payment. Please try again or use another payment method.",
  PAYER_CANNOT_PAY:
    "This PayPal account cannot complete the payment. Try another PayPal account or card.",
  AUTH_CAPTURE_OPEN:
    "The payment authorization is still pending. Please wait a moment and try again.",
};

interface PayPalErrorPayload {
  name?: string;
  message?: string;
  details?: Array<{
    issue?: string;
    description?: string;
  }>;
}

const extractPayPalErrorPayload = (error: unknown): PayPalErrorPayload | null => {
  if (!error) return null;

  const possiblePayload = (() => {
    if (typeof error === "string") {
      return error;
    }
    if (error instanceof Error && error.message) {
      return error.message;
    }
    if (typeof error === "object") {
      return JSON.stringify(error);
    }
    return null;
  })();

  if (!possiblePayload) {
    return null;
  }

  const firstCurlyIndex = possiblePayload.indexOf("{");
  if (firstCurlyIndex === -1) {
    return null;
  }

  const jsonCandidate = possiblePayload.slice(firstCurlyIndex);

  try {
    const parsed = JSON.parse(jsonCandidate);
    if (parsed?.error) {
      if (typeof parsed.error === "string") {
        try {
          return JSON.parse(parsed.error);
        } catch (nestedErr) {
          console.error("Failed to parse nested PayPal error:", nestedErr);
          return { message: parsed.error };
        }
      }
      return parsed.error;
    }
    return parsed;
  } catch (err) {
    console.error("Failed to parse PayPal error payload:", err);
    return null;
  }
};

const getFriendlyPayPalErrorMessage = (error: unknown): string => {
  const fallback = "Payment could not be completed. Please try again.";
  const payload = extractPayPalErrorPayload(error);

  if (payload) {
    const issue = payload.details?.[0]?.issue || payload.name;
    const description = payload.details?.[0]?.description || payload.message;

    if (issue && PAYPAL_ISSUE_MESSAGES[issue]) {
      return PAYPAL_ISSUE_MESSAGES[issue];
    }

    if (description) {
      return description;
    }
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export default function CheckoutPayment() {
  const checkout = useCheckoutContext();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [countryCode, setCountryCode] = useState<string | undefined>(undefined);

  // Load order details if order_id exists
  useEffect(() => {
    const loadOrder = async () => {
      if (checkout.orderId) {
        try {
          const response = await orderApi.getById(checkout.orderId);
          // Handle response structure: { data: { id: ... }, success: true } or direct { id: ... }
          const orderData = response?.data || response;
          setOrder(orderData);
          
          // Extract country code from shipping address or saved order info
          if (orderData?.shippingAddress?.district) {
            // In checkout-cart, district is used to store country code
            setCountryCode(orderData.shippingAddress.district);
          } else {
            // Try to get from localStorage saved order
            try {
              const savedOrder = localStorage.getItem('pending_order');
              if (savedOrder) {
                const orderInfo = JSON.parse(savedOrder);
                if (orderInfo.shippingAddress?.country) {
                  setCountryCode(orderInfo.shippingAddress.country);
                }
              }
            } catch (e) {
              console.error("Error reading saved order:", e);
            }
          }
        } catch (err) {
          console.error("Error loading order:", err);
          setError("Failed to load order details");
        }
      } else {
        // If no order_id, redirect back to Step 1
        checkout.onGotoStep(0);
      }
    };

    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkout.orderId]);

  // Handle PayPal order creation - Step 2
  const handlePayPalCreateOrder = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!checkout.orderId) {
        throw new Error("Order ID is missing");
      }

      // Get order details to get total amount
      let orderData = order;
      if (!orderData) {
        const response = await orderApi.getById(checkout.orderId);
        // Handle response structure: { data: { id: ... }, success: true } or direct { id: ... }
        orderData = response?.data || response;
      }
      
      if (!orderData?.summary) {
        throw new Error("Order data is invalid");
      }
      
      // Create PayPal order with order_id
      const paypalOrder = await paypalApiService.createPayPalOrder({
        order_id: checkout.orderId,
        value: orderData.summary.total,
        currency: orderData.summary.currency,
        description: `Order #${orderData.orderNumber || checkout.orderId}`,
      });

      if (!paypalOrder.success || !paypalOrder.data?.orderId) {
        throw new Error(paypalOrder.error || "Failed to create PayPal order");
      }

      // Store PayPal order ID for capture
      localStorage.setItem("paypalOrderId", paypalOrder.data.orderId);
      
      return paypalOrder.data.orderId;
    } catch (err: any) {
      console.error("Error creating PayPal order:", err);
      setError(err.message || "Failed to create PayPal order");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle PayPal order approval and capture
  const handlePayPalApprove = async (data: any) => {
    try {
      setIsLoading(true);
      setError(null);

      const paypalOrderId = data.orderID;
      
      // Capture PayPal order
      const captureResult = await paypalApiService.captureOrder(paypalOrderId);
      
      if (!captureResult.success || !captureResult.data) {
        throw new Error(captureResult.error || "Failed to capture payment");
      }

      // Get orderId from capture response if available, otherwise use checkout.orderId
      // Type assertion needed because extractData may return any
      const captureData = captureResult.data as any;
      const orderId = captureData.orderId || checkout.orderId;
      
      if (!orderId) {
        throw new Error("Order ID not found in capture response");
      }

      // Clear cart and redirect to success page with order ID
      checkout.onReset();
      router.push(`/checkout/success?orderId=${orderId}`);
    } catch (err: any) {
      console.error("Error capturing PayPal order:", err);
      setError(getFriendlyPayPalErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayPalError = (err: any) => {
    console.error("PayPal error:", err);
    setError(getFriendlyPayPalErrorMessage(err));
    setIsLoading(false);
  };

  const handlePayPalCancel = () => {
    console.log("Payment cancelled");
    setIsLoading(false);
  };

  if (!checkout.orderId) {
    return null; // Will redirect to Step 1
  }

  return (
    <Grid container spacing={3}>
      <Grid xs={12} md={8}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, textTransform: "uppercase" }}>
            Payment Method
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {isLoading && (
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Processing payment...
              </Typography>
            </Box>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              Complete your payment securely with PayPal
            </Typography>

            <PayPalScriptProvider
              options={{
                clientId: PAYPAL_CONFIG.clientId,
                currency: PAYPAL_CONFIG.currency,
                intent: PAYPAL_CONFIG.intent,
              }}
            >
              <PayPalButtons
                style={{
                  layout: "vertical",
                  color: "blue",
                  shape: "rect",
                  height: 45,
                }}
                createOrder={handlePayPalCreateOrder}
                onApprove={handlePayPalApprove}
                onError={handlePayPalError}
                onCancel={handlePayPalCancel}
                disabled={isLoading}
              />
            </PayPalScriptProvider>
          </Box>

          <Button
            size="small"
            color="inherit"
            onClick={checkout.onBackStep}
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          >
            Back
          </Button>
        </Card>
      </Grid>

      <Grid xs={12} md={4}>
        <CheckoutSummary
          items={checkout.items}
          total={order?.summary ? parseFloat(order.summary.total) : checkout.total}
          subTotal={order?.summary ? parseFloat(order.summary.subtotal) : checkout.subTotal}
          discount={order?.summary ? parseFloat(order.summary.discount) : checkout.discount}
          shipping={order?.summary ? parseFloat(order.summary.shipping) : checkout.shipping}
          tax={order?.summary ? parseFloat(order.summary.tax) : undefined}
          countryCode={countryCode}
          onEdit={() => checkout.onGotoStep(0)}
        />
      </Grid>
    </Grid>
  );
}
