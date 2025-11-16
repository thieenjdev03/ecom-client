import PayPalCheckoutButton from "src/components/paypal/PayPalCheckoutButton";

export default function CheckoutPage() {
  const handlePaymentSuccess = (data: any) => {
    console.log("Payment successful:", data);
    // Redirect to success page or show success message
    alert("✅ Payment approved!");
  };

  const handlePaymentError = (error: any) => {
    console.error("Payment error:", error);
    alert("Payment failed");
  };

  const handlePaymentCancel = (data: any) => {
    alert("Payment cancelled");
  };

  return (
    <div className="checkout-container" style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <h2>Checkout</h2>
      <p>Total: <strong>$29.99</strong></p>
      <PayPalCheckoutButton 
        amount="29.99"
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
        onPaymentCancel={handlePaymentCancel}
      />
    </div>
  );
}
