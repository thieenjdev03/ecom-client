import { useState, useEffect } from "react";
import Box from "@mui/material/Box";

import ShippingAddressSection from "./components/shipping-address-section";

// ----------------------------------------------------------------------

interface CheckoutShippingFormProps {
  onShippingDataChange?: (data: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    postalCode?: string;
    apartment?: string;
    country: string;
  } | null) => void;
  onSubmit?: () => void;
}

const STORAGE_KEY = 'checkout_shipping_info';

export default function CheckoutShippingForm({ 
  onShippingDataChange,
  onSubmit 
}: CheckoutShippingFormProps) {
  const [formData, setFormData] = useState({
    country: "VN",
    firstName: "",
    lastName: "",
    address: "",
    addressCoordinates: null as { lat: number; lon: number } | null,
    apartment: "",
    city: "",
    postalCode: "",
    phone: "",
  });

  const [newsletterChecked, setNewsletterChecked] = useState(false);
  const [addressError, setAddressError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved shipping info from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // Check if data was saved within last 7 days
        const savedAt = new Date(parsedData.savedAt);
        const now = new Date();
        const daysDiff = (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysDiff < 7) {
          setFormData({
            country: parsedData.country || "VN",
            firstName: parsedData.firstName || "",
            lastName: parsedData.lastName || "",
            address: parsedData.address || "",
            addressCoordinates: parsedData.addressCoordinates || null,
            apartment: parsedData.apartment || "",
            city: parsedData.city || "",
            postalCode: parsedData.postalCode || "",
            phone: parsedData.phone || "",
          });
          setNewsletterChecked(parsedData.newsletterChecked || false);
          console.log('Restored shipping info from localStorage');
        } else {
          // Data too old, remove it
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading saved shipping info:', error);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save shipping info to localStorage when it changes
  useEffect(() => {
    if (isLoaded) {
      const dataToSave = {
        country: formData.country,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        addressCoordinates: formData.addressCoordinates,
        apartment: formData.apartment,
        city: formData.city,
        postalCode: formData.postalCode,
        phone: formData.phone,
        newsletterChecked,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.country,
    formData.firstName,
    formData.lastName,
    formData.address,
    formData.addressCoordinates,
    formData.apartment,
    formData.city,
    formData.postalCode,
    formData.phone,
    newsletterChecked,
    isLoaded,
  ]);

  // Update parent component when form data changes
  useEffect(() => {
    if (!isLoaded) return; // Don't notify parent until we've loaded saved data

    const hasAllRequiredFields = 
      formData.firstName &&
      formData.lastName &&
      formData.phone &&
      formData.address &&
      formData.addressCoordinates &&
      formData.city &&
      formData.country;

    if (hasAllRequiredFields) {
      onShippingDataChange?.({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        apartment: formData.apartment,
        country: formData.country,
      });
    } else {
      onShippingDataChange?.(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.firstName,
    formData.lastName,
    formData.phone,
    formData.address,
    formData.addressCoordinates,
    formData.city,
    formData.country,
    formData.postalCode,
    formData.apartment,
    isLoaded,
  ]);

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
      city: "", // Clear city when country changes
      postalCode: "", // Clear postal code when country changes
    });
    setAddressError(false); // Reset address error
  };

  const handleClearForm = () => {
    setFormData({
      country: "VN",
      firstName: "",
      lastName: "",
      address: "",
      addressCoordinates: null,
      apartment: "",
      city: "",
      postalCode: "",
      phone: "",
    });
    setNewsletterChecked(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <ShippingAddressSection
        formData={formData}
        onFieldChange={handleChange}
        onAddressChange={handleAddressChange}
        onCountryChange={handleCountryChange}
        newsletterChecked={newsletterChecked}
        onNewsletterChange={setNewsletterChecked}
        addressError={addressError}
        addressHelperText={addressError ? "Please select a valid address from the suggestions" : ""}
        onClearForm={handleClearForm}
        hasData={!!(formData.firstName || formData.lastName || formData.phone)}
      />
    </Box>
  );
}
