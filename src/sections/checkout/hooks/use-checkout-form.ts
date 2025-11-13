import { useState } from "react";
import { PAYPAL_CONFIG } from "src/config/paypal";
import { useCheckoutContext } from "../context";
import { useAuthContext } from "src/auth/hooks/use-auth-context";
import { orderApi, type OrderItem, type OrderSummary, type CreateOrderRequest } from "src/api/order";
import { paypalApiService } from "src/services/paypal-api";

// ----------------------------------------------------------------------

interface FormData {
  country: string;
  firstName: string;
  lastName: string;
  address: string;
  addressCoordinates: { lat: number; lon: number } | null;
  apartment: string;
  city: string;
  postalCode: string;
  phone: string;
  paymentMethod: string;
  paypalEmail: string;
}

export function useCheckoutForm() {
  const [formData, setFormData] = useState<FormData>({
    country: "VN",
    firstName: "",
    lastName: "",
    address: "",
    addressCoordinates: null,
    apartment: "",
    city: "",
    postalCode: "",
    phone: "",
    paymentMethod: "paypal",
    paypalEmail: "",
  });

  const [newsletterChecked, setNewsletterChecked] = useState(false);
  const [addressError, setAddressError] = useState(false);
  const [paymentError, setPaymentError] = useState(false);
  const checkout = useCheckoutContext();
  const { user } = useAuthContext();
  const [totalAmount] = useState(checkout.subTotal - checkout.discount + checkout.shipping); // derived from checkout

  const handleChange = (field: string) => (event: any) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleAddressChange = (address: string, coordinates?: { lat: number; lon: number }) => {
    setFormData({
      ...formData,
      address,
      addressCoordinates: coordinates || null,
    });
    setAddressError(false);
  };

  const handleCountryChange = (event: any) => {
    const newCountry = event.target.value;
    setFormData({
      ...formData,
      country: newCountry,
      address: "", // Clear address when country changes
      addressCoordinates: null,
    });
  };

  const handlePaymentMethodChange = (method: string) => {
    setFormData({
      ...formData,
      paymentMethod: method,
    });
    setPaymentError(false);
  };

  const handlePayPalEmailChange = (email: string) => {
    setFormData({
      ...formData,
      paypalEmail: email,
    });
  };

  const handlePaymentSuccess = (details: any) => {
    console.log("Payment successful:", details);
    // Here you would typically:
    // 1. Send payment details to your backend
    // 2. Create order record
    // 3. Redirect to success page
    alert("Payment successful! Order placed.");
  };

  const handlePaymentError = (error: any) => {
    console.error("Payment error:", error);
    setPaymentError(true);
  };

  const validateForm = () => {
    let isValid = true;

    // Validate address selection
    if (!formData.address || !formData.addressCoordinates) {
      setAddressError(true);
      isValid = false;
    }

    // Validate payment method
    if (formData.paymentMethod === "paypal" && !formData.paypalEmail) {
      setPaymentError(true);
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Persist user checkout info locally for later steps
      const userInfo = {
        country: formData.country,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        apartment: formData.apartment,
        city: formData.city,
        postalCode: formData.postalCode,
        phone: formData.phone,
        paymentMethod: formData.paymentMethod,
        paypalEmail: formData.paypalEmail,
        coordinates: formData.addressCoordinates,
      };
      try {
        localStorage.setItem("checkoutUserInfo", JSON.stringify(userInfo));
      } catch (_) {
        // ignore localStorage errors
      }

      // Prepare order items with string currency values
      const formatCurrency = (value: number): string => value.toFixed(2);
      const items: OrderItem[] = checkout.items.map((item, index) => ({
        productId: item.id || `${index}`,
        productName: item.name,
        productSlug: item.name.toLowerCase().replace(/\s+/g, "-"),
        variantId: (item.variants?.[0] as any)?.id?.toString() || `${item.id}-variant-${index}`,
        variantName: `${item.colors.join(", ")} - ${item.size}`,
        quantity: item.quantity,
        unitPrice: formatCurrency(item.price),
        totalPrice: formatCurrency(item.price * item.quantity),
        sku: `${item.id}-${item.size}`,
      }));

      // Compute summary (backend will recalc for safety)
      const tax = parseFloat((checkout.subTotal * 0.1).toFixed(2));
      const shipping = checkout.shipping || 8;
      const summary: OrderSummary = {
        subtotal: formatCurrency(checkout.subTotal),
        shipping: formatCurrency(shipping),
        tax: formatCurrency(tax),
        discount: formatCurrency(checkout.discount),
        total: formatCurrency(checkout.subTotal - checkout.discount + shipping + tax),
        currency: PAYPAL_CONFIG.currency,
      };

      // Create order first
      const payload: CreateOrderRequest = {
        userId: user?.id || "local-dev",
        items,
        summary,
        notes: "Checkout via PayPal",
        paymentMethod: "PAYPAL",
      };

      const order = await orderApi.create(payload);
      if (!order?.id) throw new Error("Failed to create order");

      // Create PayPal order and redirect to approval URL
      const pp = await paypalApiService.createPayPalOrder({
        value: summary.total,
        currency: summary.currency,
        description: `Order #${order.orderNumber || order.id}`,
      });
      if (!pp.success || !pp.data?.approveUrl) throw new Error(pp.error || "Failed to create PayPal order");

      // Store pending IDs for success page reconciliation
      try {
        localStorage.setItem("pendingOrderId", order.id);
        localStorage.setItem("paypalOrderId", pp.data.orderId);
      } catch (_) {
        // ignore localStorage errors
      }

      // Redirect to PayPal
      window.location.href = pp.data.approveUrl;
    } catch (error) {
      console.error("Checkout submit error:", error);
      setPaymentError(true);
    }
  };

  return {
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
  };
}
