import { useState } from "react";
import { useRouter } from "next/navigation";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";

import Iconify from "src/components/iconify";
import { RouterLink } from "src/routes/components";
import { paths } from "src/routes/paths";

import { fCurrency } from "src/utils/format-number";
import PayPalCheckoutButton from "src/components/paypal/PayPalCheckoutButton";
import { type OrderItem, type OrderSummary } from "src/api/order";

// ----------------------------------------------------------------------

interface CheckoutExampleProps {
  userId: string;
  onPaymentSuccess?: (orderId: string) => void;
}

export default function CheckoutExample({ userId, onPaymentSuccess }: CheckoutExampleProps) {
  const router = useRouter();
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");
  
  // Example cart items
  const cartItems: OrderItem[] = [
    {
      productId: "1",
      productName: "Premium T-Shirt",
      productSlug: "premium-t-shirt",
      variantId: "variant-123",
      variantName: "Red - Large",
      quantity: 2,
      unitPrice: "29.99",
      totalPrice: "59.98",
      sku: "TSH-001-RED-L",
    },
    {
      productId: "2",
      productName: "Designer Jeans",
      productSlug: "designer-jeans",
      variantId: "variant-456",
      variantName: "Blue - Medium",
      quantity: 1,
      unitPrice: "89.99",
      totalPrice: "89.99",
      sku: "JNS-002-BLU-M",
    },
  ];

  // Example order summary
  const orderSummary: OrderSummary = {
    subtotal: "149.97",
    shipping: "5.99",
    tax: "15.60",
    discount: "10.00",
    total: "161.56",
    currency: "USD",
  };

  const handlePaymentSuccess = (orderId: string) => {
    console.log('Payment successful, order ID:', orderId);
    onPaymentSuccess?.(orderId);
    // Redirect to success page
    router.push('/checkout/success');
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
  };

  const handleContinueShopping = () => {
    router.push(paths.product.root);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Checkout
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Complete your order securely with PayPal
          </Typography>
        </Box>

        {/* Customer Information */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Customer Information
            </Typography>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Full Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Shipping Address"
                multiline
                rows={3}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter your complete shipping address"
              />
              <TextField
                fullWidth
                label="Order Notes (Optional)"
                multiline
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions for your order"
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Order Summary
            </Typography>
            
            {/* Items */}
            <Stack spacing={2} sx={{ mb: 3 }}>
              {cartItems.map((item, index) => (
                <Box key={index}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {item.productName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {item.variantName} - Qty: {item.quantity}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {fCurrency(item.totalPrice)}
                    </Typography>
                  </Stack>
                  {index < cartItems.length - 1 && <Divider sx={{ mt: 2 }} />}
                </Box>
              ))}
            </Stack>

            {/* Summary */}
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Subtotal:
                </Typography>
                <Typography variant="body2">
                  {fCurrency(orderSummary.subtotal)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Shipping:
                </Typography>
                <Typography variant="body2">
                  {fCurrency(orderSummary.shipping)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Tax:
                </Typography>
                <Typography variant="body2">
                  {fCurrency(orderSummary.tax)}
                </Typography>
              </Stack>
              {parseFloat(orderSummary.discount) > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Discount:
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'success.main' }}>
                    -{fCurrency(orderSummary.discount)}
                  </Typography>
                </Stack>
              )}
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Total:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {fCurrency(orderSummary.total)}
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Error Display */}

        {/* PayPal Payment */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              PayPal Payment
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
              You'll be redirected to PayPal to complete your payment securely.
            </Typography>
            
            <PayPalCheckoutButton
              amount={orderSummary.total.toString()}
              currency={orderSummary.currency}
              onPaymentSuccess={(data) => {
                console.log('Payment successful:', data);
                handlePaymentSuccess('order-123'); // In real app, use actual order ID
              }}
              onPaymentError={handlePaymentError}
              onPaymentCancel={(data) => {
                console.log('Payment cancelled:', data);
              }}
            />
            
            <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
              Total: {fCurrency(orderSummary.total)}
            </Typography>
          </CardContent>
        </Card>

        {/* Back to Shopping */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="outlined"
            component={RouterLink}
            href={paths.product.root}
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
          >
            Continue Shopping
          </Button>
        </Box>

        {/* Information Alert */}
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Secure Payment:</strong> Your payment is processed securely through PayPal. 
            You'll be redirected to PayPal's secure checkout page to complete your payment.
          </Typography>
        </Alert>
      </Stack>
    </Container>
  );
}

// Example usage in a page component
export const CheckoutPageExample = () => {
  const router = useRouter();
  
  // In a real app, you'd get this from authentication context
  const userId = "user-123";

  const handlePaymentSuccess = (orderId: string) => {
    console.log('Payment completed successfully:', orderId);
    // You could show a success message or redirect
    router.push(`/checkout/success?orderId=${orderId}`);
  };

  return (
    <CheckoutExample 
      userId={userId}
      onPaymentSuccess={handlePaymentSuccess}
    />
  );
};
