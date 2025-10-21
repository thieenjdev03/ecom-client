import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";

import { useCheckoutForm } from "./hooks/use-checkout-form";
import PaymentMethodSection from "./components/payment-method-section";
import ShippingAddressSection from "./components/shipping-address-section";

// ----------------------------------------------------------------------

export default function CheckoutShippingForm() {
  const {
    formData,
    newsletterChecked,
    addressError,
    paymentError,
    totalAmount,
    setNewsletterChecked,
    handleChange,
    handleAddressChange,
    handleCountryChange,
    handlePaymentMethodChange,
    handlePayPalEmailChange,
    handlePaymentSuccess,
    handlePaymentError,
    handleSubmit,
  } = useCheckoutForm();

  return (
    <Box sx={{ mb: 3 }}>
      <PaymentMethodSection
        paymentMethod={formData.paymentMethod}
        onPaymentMethodChange={handlePaymentMethodChange}
        paypalEmail={formData.paypalEmail}
        onPayPalEmailChange={handlePayPalEmailChange}
        totalAmount={totalAmount}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
        paymentError={paymentError}
      />

      <Divider sx={{ my: 3 }} />

      <ShippingAddressSection
        formData={formData}
        onFieldChange={handleChange}
        onAddressChange={handleAddressChange}
        onCountryChange={handleCountryChange}
        newsletterChecked={newsletterChecked}
        onNewsletterChange={setNewsletterChecked}
        addressError={addressError}
        addressHelperText={addressError ? "Please select a valid address from the suggestions" : ""}
      />

      <Button
        fullWidth
        size="large"
        variant="contained"
        onClick={handleSubmit}
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
        Complete Order
      </Button>
    </Box>
  );
}
