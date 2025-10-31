import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axios from "axios";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

import { orderApi, type CreateOrderRequest, type OrderItem, type OrderSummary } from "src/api/order";
import { paypalApiService } from "src/services/paypal-api";
import { PAYPAL_CONFIG } from "src/config/paypal";
import { checkPaymentStatus } from "src/hooks/use-payment-status";

// ----------------------------------------------------------------------

interface PayPalPaymentFlowProps {
  userId: string;
  items: OrderItem[];
  summary: OrderSummary;
  shippingAddressId?: string;
  billingAddressId?: string;
  notes?: string;
  customerEmail: string;
  customerName: string;
  onPaymentSuccess?: (orderId: string) => void;
  onPaymentError?: (error: any) => void;
}

export default function PayPalPaymentFlow({
  userId,
  items,
  summary,
  shippingAddressId,
  billingAddressId,
  notes,
  customerEmail,
  customerName,
  onPaymentSuccess,
  onPaymentError,
}: PayPalPaymentFlowProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'creating_order' | 'creating_paypal' | 'redirecting' | 'capturing'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Handle PayPal order creation - calls backend API
  const handleCreateOrder = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setPaymentStatus('creating_order');

      // Step 1: Create order first
      console.log('Step 1: Creating order...');
      const orderData: CreateOrderRequest = {
        userId,
        items,
        summary,
        shippingAddressId,
        billingAddressId,
        notes,
      };

      const order = await orderApi.create(orderData);
      console.log('Order created:', order);

      if (!order || !order.id) {
        throw new Error('Failed to create order');
      }

      setPaymentStatus('creating_paypal');

      // Step 2: Create PayPal order via API proxy
      console.log('Step 2: Creating PayPal order...');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await axios.post(`${baseUrl}/paypal/create-order`, {
        value: summary.total.toString(),
        currency: summary.currency,
        description: `Order #${order.id}`,
      });

      console.log('PayPal order created:', res.data);

      if (!res.data.orderId) {
        throw new Error('Failed to create PayPal order');
      }

      // Step 3: Store order IDs for later reference
      localStorage.setItem('pendingOrderId', order.id);
      localStorage.setItem('paypalOrderId', res.data.orderId);

      setIsLoading(false);
      setPaymentStatus('idle');
      
      return res.data.orderId;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      setError(error instanceof Error ? error.message : 'Failed to create PayPal order');
      setIsLoading(false);
      setPaymentStatus('idle');
      onPaymentError?.(error);
      throw error;
    }
  };

  // Handle PayPal order approval
  const handleApprove = async (data: any) => {
    try {
      setIsLoading(true);
      setPaymentStatus('capturing');

      console.log('Payment approved:', data);
      
      // Check payment status after a short delay to allow webhook processing
      setTimeout(async () => {
        const pendingOrderId = localStorage.getItem('pendingOrderId');
        if (pendingOrderId) {
          const status = await checkPaymentStatus(pendingOrderId);
          if (status?.status === 'PAID') {
            localStorage.removeItem('pendingOrderId');
            localStorage.removeItem('paypalOrderId');
            onPaymentSuccess?.(pendingOrderId);
          }
        }
      }, 3000);

      setIsLoading(false);
      setPaymentStatus('idle');
      
    } catch (error) {
      console.error('Error processing payment approval:', error);
      setIsLoading(false);
      setPaymentStatus('idle');
      onPaymentError?.(error);
    }
  };

  // Handle PayPal errors
  const handleError = (err: any) => {
    console.error('PayPal error:', err);
    setIsLoading(false);
    setPaymentStatus('idle');
    onPaymentError?.(err);
  };

  // Handle PayPal cancellation
  const handleCancel = (data: any) => {
    console.log('Payment cancelled:', data);
    setIsLoading(false);
    setPaymentStatus('idle');
  };

  // Handle PayPal return (called from success/cancel pages)
  const handlePayPalReturn = async () => {
    const pendingOrderId = localStorage.getItem('pendingOrderId');
    const paypalOrderId = localStorage.getItem('paypalOrderId');
    
    if (pendingOrderId) {
      try {
        // Check order status
        const order = await orderApi.getById(pendingOrderId);
        
        if (order.status === 'PAID') {
          // Payment successful
          localStorage.removeItem('pendingOrderId');
          localStorage.removeItem('paypalOrderId');
          onPaymentSuccess?.(pendingOrderId);
          return { success: true, orderId: pendingOrderId };
        } else {
          // Payment pending or failed
          return { success: false, status: order.status };
        }
      } catch (error) {
        console.error('Error checking order status:', error);
        return { success: false, error };
      }
    }
    
    return { success: false, error: 'No pending order found' };
  };

  // Poll order status (for success/cancel pages)
  const pollOrderStatus = async (orderId: string, maxAttempts: number = 30) => {
    let attempts = 0;
    
    const poll = async (): Promise<{ success: boolean; orderId?: string; status?: string }> => {
      try {
        const order = await orderApi.getById(orderId);
        
        if (order.status === 'PAID') {
          localStorage.removeItem('pendingOrderId');
          localStorage.removeItem('paypalOrderId');
          return { success: true, orderId };
        }
        
        if (order.status === 'FAILED') {
          return { success: false, status: order.status };
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          // Poll every 10 seconds
          await new Promise(resolve => setTimeout(resolve, 10000));
          return poll();
        } else {
          return { success: false, status: 'TIMEOUT' };
        }
      } catch (error) {
        console.error('Error polling order status:', error);
        return { success: false, status: 'ERROR' };
      }
    };
    
    return poll();
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'creating_order':
        return 'Creating order...';
      case 'creating_paypal':
        return 'Setting up PayPal payment...';
      case 'redirecting':
        return 'Redirecting to PayPal...';
      default:
        return 'Ready to pay';
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          PayPal Payment
        </Typography>

        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
          You'll be redirected to PayPal to complete your payment securely.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {getStatusMessage()}
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
            createOrder={handleCreateOrder}
            onApprove={handleApprove}
            onError={handleError}
            onCancel={handleCancel}
            disabled={isLoading}
          />
        </PayPalScriptProvider>

        <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
          Total: {PAYPAL_CONFIG.currency} {summary.total.toFixed(2)}
        </Typography>
      </CardContent>
    </Card>
  );
}

// Export utility functions for use in success/cancel pages
export { PayPalPaymentFlow };
export const usePayPalReturn = () => {
  const handleReturn = async () => {
    const pendingOrderId = localStorage.getItem('pendingOrderId');
    const paypalOrderId = localStorage.getItem('paypalOrderId');
    
    if (pendingOrderId) {
      try {
        const order = await orderApi.getById(pendingOrderId);
        
        if (order.status === 'PAID') {
          localStorage.removeItem('pendingOrderId');
          localStorage.removeItem('paypalOrderId');
          return { success: true, orderId: pendingOrderId };
        } else {
          return { success: false, status: order.status };
        }
      } catch (error) {
        console.error('Error checking order status:', error);
        return { success: false, status: 'ERROR' };
      }
    }
    
    return { success: false, status: 'NO_PENDING_ORDER' };
  };

  return { handleReturn };
};
