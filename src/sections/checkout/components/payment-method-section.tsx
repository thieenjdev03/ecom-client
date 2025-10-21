import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";

import PayPalPayment from "./paypal-payment";

// ----------------------------------------------------------------------

interface PaymentMethodSectionProps {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  paypalEmail: string;
  onPayPalEmailChange: (email: string) => void;
  totalAmount: number;
  onPaymentSuccess: (details: any) => void;
  onPaymentError: (error: any) => void;
  paymentError?: boolean;
}

export default function PaymentMethodSection({
  paymentMethod,
  onPaymentMethodChange,
  paypalEmail,
  onPayPalEmailChange,
  totalAmount,
  onPaymentSuccess,
  onPaymentError,
  paymentError = false,
}: PaymentMethodSectionProps) {
  const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onPaymentMethodChange(event.target.value);
  };

  return (
    <Box sx={{ mt: 4, mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, textTransform: "uppercase", mb: 3 }}>
        Payment Method
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
        Choose your payment method to complete checkout.
      </Typography>

      <FormControl component="fieldset" error={paymentError}>
        <RadioGroup
          value={paymentMethod}
          onChange={handlePaymentMethodChange}
          sx={{ mb: 3 }}
        >
          <FormControlLabel
            value="paypal"
            control={<Radio />}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body1">Pay with PayPal</Typography>
                <Box
                  component="img"
                  src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg"
                  alt="PayPal"
                  sx={{ height: 20 }}
                />
              </Box>
            }
          />
          <FormControlLabel
            value="card"
            control={<Radio />}
            label="Credit/Debit Card (Coming Soon)"
            disabled
          />
        </RadioGroup>

        {paymentMethod === "paypal" && (
          <PayPalPayment
            paypalEmail={paypalEmail}
            onEmailChange={onPayPalEmailChange}
            totalAmount={totalAmount}
            onPaymentSuccess={onPaymentSuccess}
            onPaymentError={onPaymentError}
            error={paymentError}
            helperText={paymentError ? "Please enter your PayPal email" : ""}
          />
        )}

        {paymentError && (
          <Typography variant="caption" color="error" sx={{ display: "block", mt: 1 }}>
            Please select a valid payment method
          </Typography>
        )}
      </FormControl>
    </Box>
  );
}
