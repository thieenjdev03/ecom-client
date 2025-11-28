import { useState, useEffect, ChangeEvent } from "react";
import Box from "@mui/material/Box";

import ShippingAddressSection from "./components/shipping-address-section";

// ----------------------------------------------------------------------

export type CheckoutShippingData = {
  countryCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  province: string;
  district: string;
  ward: string;
  postalCode: string;
  label: string;
  note: string;
  isBilling: boolean;
  isDefault: boolean;
};

type ShippingFormState = CheckoutShippingData & {
  addressCoordinates: { lat: number; lon: number } | null;
};

interface CheckoutShippingFormProps {
  onShippingDataChange?: (data: CheckoutShippingData | null) => void;
  onSubmit?: () => void;
}

const STORAGE_KEY = 'checkout_shipping_info';

const EMPTY_FORM: ShippingFormState = {
  countryCode: "VN",
  firstName: "",
  lastName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  province: "",
  district: "",
  ward: "",
  postalCode: "",
  label: "",
  note: "",
  isBilling: false,
  isDefault: true,
  addressCoordinates: null,
};

type EditableField = Exclude<keyof ShippingFormState, "addressCoordinates">;

export default function CheckoutShippingForm({ 
  onShippingDataChange,
  onSubmit 
}: CheckoutShippingFormProps) {
  const [formData, setFormData] = useState<ShippingFormState>(EMPTY_FORM);

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
            countryCode: parsedData.countryCode || parsedData.country || "VN",
            firstName: parsedData.firstName || "",
            lastName: parsedData.lastName || "",
            phone: parsedData.phone || "",
            addressLine1: parsedData.addressLine1 || parsedData.address || "",
            addressLine2: parsedData.addressLine2 || parsedData.apartment || "",
            city: parsedData.city || "",
            province: parsedData.province || "",
            district: parsedData.district || "",
            ward: parsedData.ward || "",
            postalCode: parsedData.postalCode || "",
            label: parsedData.label || "",
            note: parsedData.note || "",
            isBilling: typeof parsedData.isBilling === "boolean" ? parsedData.isBilling : false,
            isDefault: typeof parsedData.isDefault === "boolean" ? parsedData.isDefault : true,
            addressCoordinates: parsedData.addressCoordinates || null,
          });
          setNewsletterChecked(Boolean(parsedData.newsletterChecked));
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
        ...formData,
        newsletterChecked,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData,
    newsletterChecked,
    isLoaded,
  ]);

  // Update parent component when form data changes
  useEffect(() => {
    if (!isLoaded) return; // Don't notify parent until we've loaded saved data

    const sanitize = (value: string) => value.trim();

    const hasAllRequiredFields =
      sanitize(formData.firstName) &&
      sanitize(formData.lastName) &&
      sanitize(formData.phone) &&
      sanitize(formData.addressLine1) &&
      sanitize(formData.province) &&
      sanitize(formData.district) &&
      sanitize(formData.ward) &&
      sanitize(formData.city) &&
      formData.countryCode;

    if (hasAllRequiredFields) {
      onShippingDataChange?.({
        countryCode: formData.countryCode,
        firstName: sanitize(formData.firstName),
        lastName: sanitize(formData.lastName),
        phone: sanitize(formData.phone),
        addressLine1: sanitize(formData.addressLine1),
        addressLine2: sanitize(formData.addressLine2),
        city: sanitize(formData.city),
        province: sanitize(formData.province),
        district: sanitize(formData.district),
        ward: sanitize(formData.ward),
        postalCode: sanitize(formData.postalCode),
        label: sanitize(formData.label),
        note: sanitize(formData.note),
        isBilling: formData.isBilling,
        isDefault: formData.isDefault,
      });
    } else {
      onShippingDataChange?.(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.firstName,
    formData.lastName,
    formData.phone,
    formData.addressLine1,
    formData.city,
    formData.province,
    formData.district,
    formData.ward,
    formData.postalCode,
    formData.addressLine2,
    formData.label,
    formData.note,
    formData.countryCode,
    formData.isBilling,
    formData.isDefault,
    isLoaded,
  ]);

  const handleChange = (field: EditableField) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = event.target as HTMLInputElement;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (address: string, coordinates?: { lat: number; lon: number }) => {
    setFormData((prev) => ({
      ...prev,
      addressLine1: address,
      addressCoordinates: coordinates || null,
    }));
    setAddressError(false);
  };

  const handleCountryChange = (event: any) => {
    const newCountry = event.target.value;
    setFormData((prev) => ({
      ...prev,
      countryCode: newCountry,
      addressLine1: "",
      addressCoordinates: null,
      city: "",
      province: "",
      district: "",
      ward: "",
      postalCode: "",
    }));
    setAddressError(false); // Reset address error
  };

  const handleClearForm = () => {
    setFormData(EMPTY_FORM);
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
