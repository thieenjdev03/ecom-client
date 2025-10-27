"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

import Iconify from "src/components/iconify";
import { RouterLink } from "src/routes/components";
import { paths } from "src/routes/paths";

// ----------------------------------------------------------------------

interface ErrorDetails {
  errorCode?: string;
  errorMessage?: string;
  orderId?: string;
  timestamp: string;
}

export default function PaymentErrorView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Get error details from URL params or localStorage
    const errorCode = searchParams.get('error_code');
    const errorMessage = searchParams.get('error_message');
    const orderId = searchParams.get('order_id');
    
    if (errorCode || errorMessage) {
      setErrorDetails({
        errorCode: errorCode || 'UNKNOWN_ERROR',
        errorMessage: errorMessage || 'An unknown error occurred',
        orderId: orderId || undefined,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Try to get from localStorage
      const storedError = localStorage.getItem('paymentError');
      if (storedError) {
        try {
          setErrorDetails(JSON.parse(storedError));
        } catch (err) {
          setErrorDetails({
            errorCode: 'UNKNOWN_ERROR',
            errorMessage: 'An unknown error occurred',
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        setErrorDetails({
          errorCode: 'NO_ERROR_DETAILS',
          errorMessage: 'No error details available',
          timestamp: new Date().toISOString(),
        });
      }
    }
    
    setIsLoading(false);
  }, [searchParams]);

  const handleRetryPayment = () => {
    setRetryCount(prev => prev + 1);
    // Clear any stored error and go back to checkout
    localStorage.removeItem('paymentError');
    router.push(paths.checkout.root);
  };

  const handleContactSupport = () => {
    // Create support email with error details
    const subject = encodeURIComponent(`Payment Error - Order ${errorDetails?.orderId || 'Unknown'}`);
    const body = encodeURIComponent(`
Error Code: ${errorDetails?.errorCode || 'Unknown'}
Error Message: ${errorDetails?.errorMessage || 'Unknown'}
Order ID: ${errorDetails?.orderId || 'N/A'}
Timestamp: ${errorDetails?.timestamp || 'N/A'}
Retry Count: ${retryCount}

Please describe the issue you encountered:
    `);
    
    window.open(`mailto:support@yourstore.com?subject=${subject}&body=${body}`);
  };

  const getErrorMessage = (errorCode?: string) => {
    switch (errorCode) {
      case 'PAYMENT_CANCELLED':
        return 'Payment was cancelled by the user. No charges were made.';
      case 'PAYMENT_FAILED':
        return 'Payment processing failed. Please check your payment method and try again.';
      case 'INSUFFICIENT_FUNDS':
        return 'Insufficient funds in your account. Please use a different payment method.';
      case 'CARD_DECLINED':
        return 'Your card was declined. Please contact your bank or use a different payment method.';
      case 'NETWORK_ERROR':
        return 'Network error occurred. Please check your internet connection and try again.';
      case 'TIMEOUT':
        return 'Payment request timed out. Please try again.';
      case 'AUTHENTICATION_FAILURE':
        return 'Authentication failed. Please log in again and try the payment.';
      case 'NO_ERROR_DETAILS':
        return 'Unable to retrieve error details. Please contact support if the issue persists.';
      default:
        return 'An unexpected error occurred during payment processing.';
    }
  };

  const getErrorSeverity = (errorCode?: string) => {
    switch (errorCode) {
      case 'PAYMENT_CANCELLED':
        return 'warning';
      case 'NO_ERROR_DETAILS':
        return 'info';
      default:
        return 'error';
    }
  };

  const getRetryRecommendation = (errorCode?: string) => {
    switch (errorCode) {
      case 'PAYMENT_CANCELLED':
        return 'You can retry the payment or choose a different payment method.';
      case 'PAYMENT_FAILED':
      case 'CARD_DECLINED':
      case 'INSUFFICIENT_FUNDS':
        return 'Please check your payment method or try a different card.';
      case 'NETWORK_ERROR':
      case 'TIMEOUT':
        return 'Please check your internet connection and try again.';
      case 'AUTHENTICATION_FAILURE':
        return 'Please log in again and retry the payment.';
      default:
        return 'Please try again or contact support if the issue persists.';
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={40} />
          <Typography variant="body1">Loading error details...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Stack spacing={4} alignItems="center">
        {/* Error Icon */}
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'error.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Iconify icon="eva:close-fill" sx={{ color: 'white', fontSize: 40 }} />
        </Box>

        {/* Error Message */}
        <Stack spacing={1} alignItems="center">
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'error.main' }}>
            Payment Failed
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center' }}>
            {getErrorMessage(errorDetails?.errorCode)}
          </Typography>
        </Stack>

        {/* Error Details Card */}
        <Card sx={{ p: 3, width: '100%', maxWidth: 500 }}>
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Error Details
            </Typography>

            <Alert severity={getErrorSeverity(errorDetails?.errorCode)}>
              <Typography variant="body2">
                {errorDetails?.errorMessage || 'No additional error message available'}
              </Typography>
            </Alert>

            <Stack spacing={2}>
              {errorDetails?.orderId && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Order ID:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {errorDetails.orderId}
                  </Typography>
                </Stack>
              )}

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Error Code:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {errorDetails?.errorCode || 'Unknown'}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Time:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {new Date(errorDetails?.timestamp || Date.now()).toLocaleString()}
                </Typography>
              </Stack>

              {retryCount > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Retry Attempts:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {retryCount}
                  </Typography>
                </Stack>
              )}
            </Stack>

            {/* Recommendation */}
            <Alert severity="info">
              <Typography variant="body2">
                {getRetryRecommendation(errorDetails?.errorCode)}
              </Typography>
            </Alert>
          </Stack>
        </Card>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} sx={{ width: '100%', maxWidth: 500 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleContactSupport}
            startIcon={<Iconify icon="eva:email-fill" />}
          >
            Contact Support
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={handleRetryPayment}
            startIcon={<Iconify icon="eva:refresh-fill" />}
            disabled={retryCount >= 3}
          >
            {retryCount >= 3 ? 'Max Retries Reached' : 'Retry Payment'}
          </Button>
        </Stack>

        {/* Additional Actions */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="text"
            component={RouterLink}
            href={paths.product.root}
            startIcon={<Iconify icon="eva:shopping-bag-fill" />}
          >
            Continue Shopping
          </Button>
          <Button
            variant="text"
            component={RouterLink}
            href={paths.checkout.root}
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
          >
            Back to Checkout
          </Button>
        </Stack>

        {/* Help Information */}
        <Alert severity="info" sx={{ width: '100%', maxWidth: 500 }}>
          <Typography variant="body2">
            If you continue to experience issues, please contact our customer service team. 
            We're here to help resolve any payment problems.
          </Typography>
        </Alert>
      </Stack>
    </Container>
  );
}
