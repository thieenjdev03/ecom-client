import { useState, useEffect } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

import { useRouter } from "next/navigation";
import { PAYPAL_CONFIG } from "src/config/paypal";
import { paypalApiService } from "src/services/paypal-api";

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
}: PayPalPaymentProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'creating' | 'approving' | 'capturing'>('idle');

  // Handle PayPal order creation - calls backend API
  const handlePayPalCreateOrder = async (data: any, actions: any) => {
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

      const result = await paypalApiService.createOrder({
        amount: totalAmount,
        currency: PAYPAL_CONFIG.currency,
        description: 'E-commerce order',
        items: orderItems,
        customerEmail: paypalEmail,
        customerName,
      });

      console.log('PayPal order creation result:', result);

      if (!result.success) {
        console.warn('Backend API failed, using PayPal client-side order creation');
        // Fallback to PayPal client-side order creation
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: totalAmount.toString(),
                currency_code: PAYPAL_CONFIG.currency,
              },
              description: 'E-commerce order',
              items: orderItems.map(item => ({
                name: item.name,
                quantity: item.quantity.toString(),
                unit_amount: {
                  value: item.unit_amount.value,
                  currency_code: item.unit_amount.currency_code,
                },
              })),
            },
          ],
        });
      }

      if (!result.data || !result.data.id) {
        console.error('Invalid order response from server:', result);
        throw new Error('Invalid order response from server');
      }

      setIsLoading(false);
      setPaymentStatus('idle');
      
      console.log('Returning PayPal order ID:', result.data.id);
      console.log('Order ID type:', typeof result.data.id);
      console.log('Order ID length:', result.data.id?.length);
      
      return result.data.id; // Return PayPal order ID
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

      {isLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {paymentStatus === 'creating' && 'Creating order...'}
            {paymentStatus === 'capturing' && 'Processing payment...'}
          </Typography>
        </Box>
      )}

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
    </Box>
  );
}
