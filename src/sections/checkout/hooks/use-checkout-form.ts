import { useState } from "react";

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
  const [totalAmount] = useState(99.99); // This should come from cart/order context

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

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    // Here you would typically proceed with the checkout process
    console.log("Form data:", formData);
    // Add your checkout logic here
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
