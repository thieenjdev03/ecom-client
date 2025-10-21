import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

// ----------------------------------------------------------------------

interface PayPalPaymentProps {
  paypalEmail: string;
  onEmailChange: (email: string) => void;
  totalAmount: number;
  onPaymentSuccess: (details: any) => void;
  onPaymentError: (error: any) => void;
  error?: boolean;
  helperText?: string;
}

export default function PayPalPayment({
  paypalEmail,
  onEmailChange,
  totalAmount,
  onPaymentSuccess,
  onPaymentError,
  error = false,
  helperText,
}: PayPalPaymentProps) {
  const handlePayPalCreateOrder = (data: any, actions: any) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: totalAmount.toString(),
            currency_code: "USD",
          },
        },
      ],
    });
  };

  const handlePayPalApprove = (data: any, actions: any) => {
    return actions.order.capture().then((details: any) => {
      console.log("Payment completed:", details);
      onPaymentSuccess(details);
    });
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
      />

      <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
        You'll be redirected to PayPal to complete your payment securely.
      </Typography>

      <PayPalScriptProvider
        options={{
          clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb",
          currency: "USD",
        }}
      >
        <PayPalButtons
          style={{ layout: "horizontal", color: "blue" }}
          createOrder={handlePayPalCreateOrder}
          onApprove={handlePayPalApprove}
          onError={(err) => {
            console.error("PayPal error:", err);
            onPaymentError(err);
          }}
        />
      </PayPalScriptProvider>
    </Box>
  );
}
