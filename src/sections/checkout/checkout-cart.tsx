import React, { useState } from "react";

import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Unstable_Grid2";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import Iconify from "src/components/iconify";
import EmptyContent from "src/components/empty-content";

import { useCheckoutContext } from "./context";
import CheckoutSummary from "./checkout-summary";
import CheckoutCartProductList from "./checkout-cart-product-list";
import CheckoutContactForm from "./checkout-contact-form";
import CheckoutShippingForm from "./checkout-shipping-form";
import PayPalPayment from "./components/paypal-payment";
import FileUploadModal from "./components/file-upload-modal";
import { PAYPAL_CONFIG } from "src/config/paypal";
import { useGetProducts } from "src/api/product";

// ----------------------------------------------------------------------

export default function CheckoutCart() {
  const checkout = useCheckoutContext();
  const { products } = useGetProducts({ page: 1, limit: 1 });

  const empty = !checkout.items.length;
  
  // PayPal payment state
  const [paypalEmail, setPaypalEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [emailHelperText, setEmailHelperText] = useState("");
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Add sample product to cart if empty (for demo purposes)
  React.useEffect(() => {
    if (empty && products.length > 0) {
      const sampleProduct = products[0];
      checkout.onAddToCart({
        id: sampleProduct.id,
        name: sampleProduct.name,
        variants: sampleProduct.variants,
        category: sampleProduct.category,
        coverUrl: sampleProduct.coverUrl,
        available: sampleProduct.available,
        price: sampleProduct.price,
        colors: sampleProduct.colors.length > 0 ? [sampleProduct.colors[0]] : ['#000000'],
        size: sampleProduct.sizes.length > 0 ? sampleProduct.sizes[0] : 'M',
        quantity: 1,
      });
    }
  }, [empty, checkout, products]);

  const handleEmailChange = (email: string) => {
    setPaypalEmail(email);
    setEmailError(false);
    setEmailHelperText("");
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      setEmailError(true);
      setEmailHelperText("Please enter a valid email address");
    }
  };

  const handlePaymentSuccess = (details: any) => {
    console.log("Payment successful:", details);
    setPaymentError(null);
    // Payment success is handled in PayPal component with redirect
  };

  const handlePaymentError = (error: any) => {
    console.error("Payment error:", error);
    setPaymentError(error.message || "Payment failed. Please try again.");
  };

  const handleFileUploadSuccess = (fileUrl: string, fileName: string) => {
    console.log("File uploaded successfully:", fileName, fileUrl);
  };

  const handleFileUploadError = (error: string) => {
    console.error("File upload error:", error);
  };

  // Prepare order items for PayPal
  const orderItems = checkout.items.map(item => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    unit_amount: {
      value: item.price.toString(),
      currency_code: PAYPAL_CONFIG.currency
    }
  }));

  return (
    <Grid container spacing={4}>
      <Grid xs={12} md={8}>
        <Stack spacing={3}>
          {/* <CheckoutContactForm /> */}
          <CheckoutShippingForm />
          
          {/* PayPal Payment Section */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Payment Method
            </Typography>
            
            {paymentError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {paymentError}
              </Alert>
            )}
            
            <PayPalPayment
              paypalEmail={paypalEmail}
              onEmailChange={handleEmailChange}
              totalAmount={checkout.total + 8} // Include shipping
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              error={emailError}
              helperText={emailHelperText}
              orderItems={orderItems}
              customerName="Customer" // You can get this from user context
            />
            
            {/* Optional File Upload */}
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="eva:upload-fill" />}
                onClick={() => setShowFileUpload(true)}
              >
                Upload Receipt (Optional)
              </Button>
            </Stack>
          </Card>
        </Stack>
      </Grid>

      <Grid xs={12} md={4}>
        <CheckoutSummary
          total={checkout.total}
          discount={checkout.discount}
          subTotal={checkout.subTotal}
          items={checkout.items}
          onApplyDiscount={checkout.onApplyDiscount}
        />
      </Grid>

      {/* File Upload Modal */}
      <FileUploadModal
        open={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        orderId="pending"
        title="Upload Receipt or Proof of Payment"
        description="Upload a receipt or proof of payment for your order (optional)"
        acceptedFileTypes={PAYPAL_CONFIG.fileUpload.acceptedTypes}
        maxFileSize={PAYPAL_CONFIG.fileUpload.maxFileSize / (1024 * 1024)} // Convert to MB
        onUploadSuccess={handleFileUploadSuccess}
        onUploadError={handleFileUploadError}
      />
    </Grid>
  );
}
