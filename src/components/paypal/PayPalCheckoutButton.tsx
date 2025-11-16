"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";
import axios from "axios";
import { PAYPAL_CONFIG } from "src/config/paypal";

// ----------------------------------------------------------------------

interface PayPalCheckoutButtonProps {
  amount: string;
  currency?: string;
  onPaymentSuccess?: (data: any) => void;
  onPaymentError?: (error: any) => void;
  onPaymentCancel?: (data: any) => void;
  disabled?: boolean;
  style?: {
    layout?: "vertical" | "horizontal";
    color?: "gold" | "blue" | "silver" | "white" | "black";
    shape?: "rect" | "pill";
    height?: number;
  };
}

export default function PayPalCheckoutButton({
  amount,
  currency = "USD",
  onPaymentSuccess,
  onPaymentError,
  onPaymentCancel,
  disabled = false,
  style = { layout: "vertical" },
}: PayPalCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCreateOrder = async () => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await axios.post(`${baseUrl}/paypal/create-order`, {
        value: amount,
        currency: currency,
      });
      setLoading(false);
      return res.data.orderId;
    } catch (err) {
      setLoading(false);
      console.error("Error creating PayPal order:", err);
      onPaymentError?.(err);
      throw err;
    }
  };

  const handleApprove = async (data: any) => {
    onPaymentSuccess?.(data);
  };

  const handleError = (err: any) => {
    console.error("❌ PayPal Checkout Error:", err);
    onPaymentError?.(err);
  };

  const handleCancel = (data: any) => {
    onPaymentCancel?.(data);
  };

  return (
    <PayPalScriptProvider
      options={{
        clientId: PAYPAL_CONFIG.clientId,
        currency: PAYPAL_CONFIG.currency,
        intent: PAYPAL_CONFIG.intent,
      }}
    >
      <div>
        <PayPalButtons
          style={style}
          createOrder={handleCreateOrder}
          onApprove={handleApprove}
          onError={handleError}
          onCancel={handleCancel}
          disabled={disabled || loading}
        />
        {loading && (
          <div style={{ textAlign: "center", marginTop: "10px" }}>
            Creating order...
          </div>
        )}
      </div>
    </PayPalScriptProvider>
  );
}
