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
import { paypalApiService } from "src/services/paypal-api";

// ----------------------------------------------------------------------

interface PaymentDetails {
  orderId: string;
  status: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  items: any[];
  timestamp: string;
}

export default function PaymentSuccessView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get payment details from localStorage or URL params
    const token = searchParams.get('token');
    
    if (token) {
      // If we have a token from PayPal redirect, fetch order details
      fetchOrderDetails(token);
    } else {
      // Try to get from localStorage
      const storedDetails = localStorage.getItem('paymentDetails');
      if (storedDetails) {
        try {
          setPaymentDetails(JSON.parse(storedDetails));
          setIsLoading(false);
        } catch (err) {
          setError('Invalid payment details');
          setIsLoading(false);
        }
      } else {
        setError('No payment details found');
        setIsLoading(false);
      }
    }
  }, [searchParams]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const result = await paypalApiService.getOrderDetails(orderId);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch order details');
      }

      const orderData = result.data!;
      setPaymentDetails({
        orderId,
        status: orderData.status,
        amount: parseFloat(orderData.purchase_units?.[0]?.amount?.value || '0'),
        customerEmail: orderData.payer?.email_address || '',
        customerName: `${orderData.payer?.name?.given_name || ''} ${orderData.payer?.name?.surname || ''}`.trim(),
        items: orderData.purchase_units?.[0]?.items || [],
        timestamp: new Date().toISOString(),
      });
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details');
      setIsLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!paymentDetails) return;
    
    // Create a simple receipt text
    const receipt = `
ORDER RECEIPT
=============
Order ID: ${paymentDetails.orderId}
Date: ${new Date(paymentDetails.timestamp).toLocaleDateString()}
Status: ${paymentDetails.status}

Customer: ${paymentDetails.customerName}
Email: ${paymentDetails.customerEmail}

Items:
${paymentDetails.items.map(item => `- ${item.name} x${item.quantity} - ${fCurrency(parseFloat(item.unit_amount?.value || '0'))}`).join('\n')}

Total: ${fCurrency(paymentDetails.amount)}
    `;

    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${paymentDetails.orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleContinueShopping = () => {
    // Clear payment details from localStorage
    localStorage.removeItem('paymentDetails');
    router.push(paths.product.root);
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={40} />
          <Typography variant="body1">Loading payment details...</Typography>
        </Box>
      </Container>
    );
  }

  if (error || !paymentDetails) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Payment details not found'}
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
            bgcolor: 'success.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Iconify icon="eva:checkmark-fill" sx={{ color: 'white', fontSize: 40 }} />
        </Box>

        {/* Success Message */}
        <Stack spacing={1} alignItems="center">
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
            Payment Successful!
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center' }}>
            Thank you for your order. A confirmation email has been sent to {paymentDetails.customerEmail}
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
                  {paymentDetails.orderId}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Date:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {new Date(paymentDetails.timestamp).toLocaleDateString()}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Status:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'success.main' }}>
                  {paymentDetails.status}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Total Amount:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {fCurrency(paymentDetails.amount)}
                </Typography>
              </Stack>
            </Stack>

            <Divider />

            {/* Order Items */}
            {paymentDetails.items.length > 0 && (
              <Stack spacing={2}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Items Ordered:
                </Typography>
                {paymentDetails.items.map((item, index) => (
                  <Stack key={index} direction="row" justifyContent="space-between">
                    <Typography variant="body2">
                      {item.name} x{item.quantity}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {fCurrency(parseFloat(item.unit_amount?.value || '0') * item.quantity)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            )}
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
        <Alert severity="info" sx={{ width: '100%', maxWidth: 500 }}>
          <Typography variant="body2">
            You will receive a detailed confirmation email shortly. If you have any questions about your order, 
            please contact our customer service team.
          </Typography>
        </Alert>
      </Stack>
    </Container>
  );
}
