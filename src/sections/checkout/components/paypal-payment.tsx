import { useState, useEffect } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axios from "axios";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

import { useRouter } from "next/navigation";
import { PAYPAL_CONFIG } from "src/config/paypal";
import { paypalApiService } from "src/services/paypal-api";
import { orderApi, type CreateOrderRequest, type OrderItem, type OrderSummary } from "src/api/order";

// ----------------------------------------------------------------------

interface PayPalPaymentProps {
  paypalEmail: string;
  onEmailChange: (email: string) => void;
  totalAmount: number;
  onPaymentSuccess: (details: any) => void;
  onPaymentError: (error: any) => void;
  error?: boolean;
  helperText?: string;
  orderItems?: any[];
  customerName?: string;
  // New props for the updated flow
  userId?: string;
  items?: OrderItem[];
  summary?: OrderSummary;
  shippingAddressId?: string;
  billingAddressId?: string;
  notes?: string;
}

export default function PayPalPayment({
  paypalEmail,
  onEmailChange,
  totalAmount,
  onPaymentSuccess,
  onPaymentError,
  error = false,
  helperText,
  orderItems = [],
  customerName = "",
  // New props
  userId,
  items,
  summary,
  shippingAddressId,
  billingAddressId,
  notes,
}: PayPalPaymentProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'creating' | 'approving' | 'capturing'>('idle');
  // Determine which flow to use (new flow if new props are provided)
  const useNewFlow = !!(userId && items && summary);

  // New flow: Create order first, then PayPal order
  const handleNewPayPalFlow = async () => {
    try {
      setIsLoading(true);
      setPaymentStatus('creating');

      // Step 1: Create order first
      const orderData: CreateOrderRequest = {
        userId: userId!,
        items: items!,
        summary: summary!,
        shippingAddressId,
        billingAddressId,
        notes,
        paymentMethod: "PAYPAL",
      };

      const order = await orderApi.create(orderData);
      console.log('Order created:', order);

      if (!order || !order.id) {
        throw new Error('Failed to create order');
      }

      // Step 2: Create PayPal order
      const paypalOrder = await paypalApiService.createPayPalOrder({
        value: summary!.total.toString(),
        currency: summary!.currency,
        description: `Order #${order.id}`,
      });

      if (!paypalOrder.success || !paypalOrder.data) {
        throw new Error(paypalOrder.error || 'Failed to create PayPal order');
      }

      // Step 3: Store order IDs and redirect
      localStorage.setItem('pendingOrderId', order.id);
      localStorage.setItem('paypalOrderId', paypalOrder.data.orderId);

      // Redirect to PayPal
      window.location.href = paypalOrder.data.approveUrl;

    } catch (error) {
      console.error('New PayPal flow error:', error);
      // const paymentError = parsePaymentError(error);
      // errorHandler.handleError(paymentError);
      onPaymentError(error);
    } finally {
      setIsLoading(false);
      setPaymentStatus('idle');
    }
  };

  // Handle PayPal order creation - calls backend API proxy
  const handlePayPalCreateOrder = async () => {
    try {
      setPaymentStatus('creating');
      setIsLoading(true);

      console.log('Creating PayPal order with data:', {
        amount: totalAmount,
        currency: PAYPAL_CONFIG.currency,
        description: 'E-commerce order',
        items: orderItems,
        customerEmail: paypalEmail,
        customerName,
      });
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await axios.post(`${baseUrl}/paypal/create-order`, {
        value: totalAmount.toString(),
        currency: PAYPAL_CONFIG.currency,
        description: 'E-commerce order',
      });

      console.log('PayPal order creation result:', res.data);

      if (!res.data.orderId) {
        throw new Error('Failed to create PayPal order');
      }

      setIsLoading(false);
      setPaymentStatus('idle');
      
      console.log('Returning PayPal order ID:', res.data.orderId);
      
      return res.data.orderId; // Return PayPal order ID
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      setIsLoading(false);
      setPaymentStatus('idle');
      onPaymentError(error);
      throw error;
    }
  };

  // Handle PayPal order approval and capture
  const handlePayPalApprove = async (data: any, actions: any) => {
    try {
      setPaymentStatus('capturing');
      setIsLoading(true);

      // Try to capture via backend API first
      let captureData;
      try {
        const captureResult = await paypalApiService.captureOrder(data.orderID);
        
        if (captureResult.success && captureResult.data) {
          captureData = captureResult.data;
        } else {
          console.warn('Backend capture failed, using PayPal client-side capture');
          // Fallback to PayPal client-side capture
          captureData = await actions.order.capture();
        }
      } catch (backendError) {
        console.warn('Backend capture error, using PayPal client-side capture:', backendError);
        // Fallback to PayPal client-side capture
        captureData = await actions.order.capture();
      }
      
      if (captureData.status === 'COMPLETED') {
        // Try to send email confirmation (don't fail if this fails)
        try {
          await paypalApiService.sendOrderConfirmation({
            customerEmail: paypalEmail,
            customerName,
            orderId: data.orderID,
            orderTotal: totalAmount,
            items: orderItems,
            paymentDetails: captureData,
          });
        } catch (emailError) {
          console.warn('Email confirmation failed:', emailError);
        }
        
        // Store payment details in localStorage for success page
        localStorage.setItem('paymentDetails', JSON.stringify({
          orderId: data.orderID,
          status: captureData.status,
          amount: totalAmount,
          customerEmail: paypalEmail,
          customerName,
          items: orderItems,
          timestamp: new Date().toISOString(),
        }));

        setIsLoading(false);
        setPaymentStatus('idle');
        
        // Redirect to success page
        router.push('/checkout/success');
        onPaymentSuccess(captureData);
      } else {
        throw new Error('Payment was not completed successfully');
      }
    } catch (error) {
      console.error('Error capturing PayPal order:', error);
      setIsLoading(false);
      setPaymentStatus('idle');
      onPaymentError(error);
      router.push('/checkout/error');
    }
  };

  const handlePayPalError = (err: any) => {
    console.error('PayPal error:', err);
    setIsLoading(false);
    setPaymentStatus('idle');
    onPaymentError(err);
  };

  const handlePayPalCancel = (data: any) => {
    console.log('Payment cancelled:', data);
    setIsLoading(false);
    setPaymentStatus('idle');
  };

  return (
    <Box sx={{ mb: 3 }}>
      <TextField
        fullWidth
        label="PayPal Email"
        type="email"
        value={paypalEmail}
        onChange={(e) => onEmailChange(e.target.value)}
        placeholder="your@email.com"
        error={error}
        helperText={helperText}
        required
        sx={{ mb: 2 }}
        disabled={isLoading}
      />

      <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
        You'll be redirected to PayPal to complete your payment securely.
      </Typography>

      {/* Error Display */}

      {isLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {paymentStatus === 'creating' && 'Creating order...'}
            {paymentStatus === 'capturing' && 'Processing payment...'}
          </Typography>
        </Box>
      )}

      {/* Use new flow if new props are provided */}
      {useNewFlow ? (
        <Box sx={{ textAlign: 'center' }}>
          <button
            onClick={handleNewPayPalFlow}
            disabled={isLoading || !paypalEmail}
            style={{
              backgroundColor: '#0070ba',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isLoading || !paypalEmail ? 'not-allowed' : 'pointer',
              opacity: isLoading || !paypalEmail ? 0.6 : 1,
              width: '100%',
              height: '50px',
            }}
          >
            {isLoading ? 'Processing...' : 'Pay with PayPal'}
          </button>
          <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
            Total: {summary?.currency} {10000}
          </Typography>
        </Box>
      ) : (
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
            disabled={isLoading || !paypalEmail}
          />
        </PayPalScriptProvider>
      )}
    </Box>
  );
}
