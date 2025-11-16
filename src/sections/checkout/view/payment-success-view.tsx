"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

import Iconify from "src/components/iconify";
import { RouterLink } from "src/routes/components";
import { paths } from "src/routes/paths";

import { fCurrency } from "src/utils/format-number";
import { orderApi, type Order } from "src/api/order";
import { checkPendingOrderStatus, pollOrderStatusWithRetry } from "src/hooks/use-order-status";

// ----------------------------------------------------------------------

export default function PaymentSuccessView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    handlePaymentReturn();
  }, []);

  const handlePaymentReturn = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First, check URL params for orderId (from checkout-payment redirect)
      const orderId = searchParams?.get('orderId') || '';
      
      if (orderId) {
        // Fetch order details directly from orderId
        await fetchOrderDetails(orderId);
        return;
      }

      // Fallback: Check for pending order from localStorage
      const result = await checkPendingOrderStatus();
      
      if (result.success && result.order) {
        // Payment was successful
        setOrder(result.order);
        setIsLoading(false);
      } else if (result.orderId) {
        // Order exists but payment is still pending, start polling
        setIsPolling(true);
        await pollOrderStatus(result.orderId);
      } else {
        // No pending order found, check URL params for token
        const token = searchParams?.get('token') || '';
        if (token) {
          await fetchOrderDetails(token);
        } else {
          setError('No payment information found');
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.error('Error handling payment return:', err);
      setError('Failed to process payment return');
      setIsLoading(false);
    }
  };

  const pollOrderStatus = async (orderId: string) => {
    try {
      const result = await pollOrderStatusWithRetry(orderId, 30, 10000);
      
      if (result.success && result.order) {
        setOrder(result.order);
        setIsPolling(false);
        setIsLoading(false);
      } else {
        setError('Payment is taking longer than expected. Please contact support.');
        setIsPolling(false);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error polling order status:', err);
      setError('Failed to check payment status');
      setIsPolling(false);
      setIsLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await orderApi.getById(orderId);
      // Handle response structure: { data: { id: ... }, success: true } or direct { id: ... }
      const orderData = response?.data || response;
      setOrder(orderData);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details');
      setIsLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!order) return;
    
    // Create a simple receipt text
    const receipt = `
ORDER RECEIPT
=============
Order ID: ${order.id}
Date: ${new Date(order.createdAt).toLocaleDateString()}
Status: ${order.status}

Items:
${order.items.map(item => `- ${item.productName} x${item.quantity} - ${fCurrency(item.totalPrice)}`).join('\n')}

Subtotal: ${fCurrency(order.summary.subtotal)}
Shipping: ${fCurrency(order.summary.shipping)}
Tax: ${fCurrency(order.summary.tax)}
Discount: ${fCurrency(order.summary.discount)}
Total: ${fCurrency(order.summary.total)}
    `;

    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${order.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleContinueShopping = () => {
    // Clear payment details from localStorage
    localStorage.removeItem('pendingOrderId');
    localStorage.removeItem('paypalOrderId');
    router.push(paths.product.root);
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={40} />
          <Typography variant="body1">
            {isPolling ? 'Checking payment status...' : 'Loading payment details...'}
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Order details not found'}
        </Alert>
        <Button
          variant="contained"
          component={RouterLink}
          href={paths.product.root}
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
        >
          Back to Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Stack spacing={4} alignItems="center">
        {/* Success Icon */}
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: order.status === 'PAID' ? 'success.main' : 'warning.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Iconify 
            icon={order.status === 'PAID' ? "eva:checkmark-fill" : "eva:clock-fill"} 
            sx={{ color: 'white', fontSize: 40 }} 
          />
        </Box>

        {/* Success Message */}
        <Stack spacing={1} alignItems="center">
          <Typography variant="h4" sx={{ fontWeight: 600, color: order.status === 'PAID' ? 'success.main' : 'warning.main' }}>
            {order.status === 'PAID' ? 'Payment Successful!' : 'Payment Processing...'}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center' }}>
            {order.status === 'PAID' 
              ? 'Thank you for your order. A confirmation email has been sent.'
              : 'Your payment is being processed. You will receive a confirmation email once completed.'
            }
          </Typography>
        </Stack>

        {/* Order Details Card */}
        <Card sx={{ p: 3, width: '100%', maxWidth: 500 }}>
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Order Details
            </Typography>

            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Order ID:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {order.id}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Date:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Status:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: order.status === 'PAID' ? 'success.main' : 'warning.main' }}>
                  {order.status}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Order Number:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {order.orderNumber || order.id}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Payment Method:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {order.paymentMethod || 'PayPal'}
                </Typography>
              </Stack>
            </Stack>

            <Divider />

            {/* Payment Information */}
            {(order.paypalTransactionId || order.paidAmount) && (
              <Stack spacing={2}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Payment Information:
                </Typography>
                {order.paypalTransactionId && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Transaction ID:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                      {order.paypalTransactionId}
                    </Typography>
                  </Stack>
                )}
                {order.paidAmount && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Paid Amount:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                      {fCurrency(order.paidAmount)} {order.paidCurrency || order.summary.currency}
                    </Typography>
                  </Stack>
                )}
                {order.paidAt && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Paid At:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {new Date(order.paidAt).toLocaleString()}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            )}

            <Divider />

            {/* Shipping Address */}
            {order.shippingAddress && (
              <Stack spacing={2}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Shipping Address:
                </Typography>
                <Typography variant="body2">
                  {order.shippingAddress.full_name}
                </Typography>
                {order.shippingAddress.phone && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Phone: {order.shippingAddress.phone}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {order.shippingAddress.address_line}
                  {order.shippingAddress.ward && `, ${order.shippingAddress.ward}`}
                  {order.shippingAddress.district && `, ${order.shippingAddress.district}`}
                  {order.shippingAddress.city && `, ${order.shippingAddress.city}`}
                </Typography>
              </Stack>
            )}

            {order.shippingAddress && <Divider />}

            {/* Order Items */}
            {order.items.length > 0 && (
              <Stack spacing={2}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Items Ordered:
                </Typography>
                {order.items.map((item, index) => (
                  <Stack key={index} direction="row" justifyContent="space-between">
                    <Typography variant="body2">
                      {item.productName} x{item.quantity}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {fCurrency(item.totalPrice)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            )}

            {/* Order Summary */}
            <Stack spacing={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Order Summary:
              </Typography>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Subtotal:
                </Typography>
                <Typography variant="body2">
                  {fCurrency(order.summary.subtotal)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Shipping:
                </Typography>
                <Typography variant="body2">
                  {fCurrency(order.summary.shipping)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Tax:
                </Typography>
                <Typography variant="body2">
                  {fCurrency(order.summary.tax)}
                </Typography>
              </Stack>
              {parseFloat(order.summary.discount) > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Discount:
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'success.main' }}>
                    -{fCurrency(order.summary.discount)}
                  </Typography>
                </Stack>
              )}
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Total:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                  {fCurrency(order.summary.total)} {order.summary.currency}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Card>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} sx={{ width: '100%', maxWidth: 500 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleDownloadReceipt}
            startIcon={<Iconify icon="eva:download-fill" />}
          >
            Download Receipt
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={handleContinueShopping}
            startIcon={<Iconify icon="eva:shopping-bag-fill" />}
          >
            Continue Shopping
          </Button>
        </Stack>

        {/* Additional Info */}
        <Alert severity={order.status === 'PAID' ? 'success' : 'info'} sx={{ width: '100%', maxWidth: 500 }}>
          <Typography variant="body2">
            {order.status === 'PAID' 
              ? 'You will receive a detailed confirmation email shortly. If you have any questions about your order, please contact our customer service team.'
              : 'Your payment is being processed. This may take a few minutes. You will receive an email confirmation once the payment is completed.'
            }
          </Typography>
        </Alert>
      </Stack>
    </Container>
  );
}
