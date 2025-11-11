import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";

import Iconify from "src/components/iconify";
import AddressAutocomplete from "src/components/address-autocomplete/address-autocomplete";
import { COUNTRIES, getCountryConfig } from "src/config/shipping";
import { fCurrency } from "src/utils/format-number";

// ----------------------------------------------------------------------

interface ShippingAddressSectionProps {
  formData: {
    country: string;
    firstName: string;
    lastName: string;
    address: string;
    addressCoordinates: { lat: number; lon: number } | null;
    apartment: string;
    city: string;
    postalCode: string;
    phone: string;
  };
  onFieldChange: (field: string) => (event: any) => void;
  onAddressChange: (address: string, coordinates?: { lat: number; lon: number }) => void;
  onCountryChange: (event: any) => void;
  newsletterChecked: boolean;
  onNewsletterChange: (checked: boolean) => void;
  addressError?: boolean;
  addressHelperText?: string;
  onClearForm?: () => void;
  hasData?: boolean;
}

export default function ShippingAddressSection({
  formData,
  onFieldChange,
  onAddressChange,
  onCountryChange,
  newsletterChecked,
  onNewsletterChange,
  addressError = false,
  addressHelperText,
  onClearForm,
  hasData = false,
}: ShippingAddressSectionProps) {
  // Get country-specific messages
  const getCountryMessages = () => {
    switch (formData.country) {
      case "VN":
        return {
          addressPlaceholder: "Nhập địa chỉ giao hàng (ví dụ: 123 Đường Lê Lợi)...",
          addressLabel: "Địa chỉ",
          cityLabel: "Thành phố / Tỉnh",
          postalCodeLabel: "Mã bưu điện (tùy chọn)",
          phoneLabel: "Số điện thoại",
          apartmentLabel: "Căn hộ, tầng, v.v. (tùy chọn)",
        };
      case "US":
        return {
          addressPlaceholder: "Enter street address (e.g., 123 Main St)...",
          addressLabel: "Street Address",
          cityLabel: "City",
          postalCodeLabel: "ZIP Code (optional)",
          phoneLabel: "Phone Number",
          apartmentLabel: "Apt, suite, etc. (optional)",
        };
      case "UK":
        return {
          addressPlaceholder: "Enter street address (e.g., 123 High Street)...",
          addressLabel: "Street Address",
          cityLabel: "City / Town",
          postalCodeLabel: "Postcode (optional)",
          phoneLabel: "Phone Number",
          apartmentLabel: "Flat, unit, etc. (optional)",
        };
      default:
        return {
          addressPlaceholder: "Enter delivery address...",
          addressLabel: "Address",
          cityLabel: "City",
          postalCodeLabel: "Postal Code (optional)",
          phoneLabel: "Phone",
          apartmentLabel: "Apartment, suite, etc. (optional)",
        };
    }
  };

  const messages = getCountryMessages();
  const selectedCountry = getCountryConfig(formData.country);

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
          Shipping Address
        </Typography>
        {hasData && onClearForm && (
          <Button
            size="small"
            variant="text"
            color="error"
            onClick={onClearForm}
            startIcon={<Iconify icon="solar:trash-bin-minimalistic-bold" />}
          >
            Clear All
          </Button>
        )}
      </Stack>
      <Stack spacing={3}>
        {hasData && (
          <Alert severity="success" icon={<Iconify icon="solar:check-circle-bold" width={20} />}>
            <Typography variant="caption">
              Thông tin của bạn đã được lưu tự động
            </Typography>
          </Alert>
        )}
        <Box>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
            Please ensure your address is correct.
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            We cannot change addresses after checkout.
          </Typography>
        </Box>

        <Box>
          <TextField
            fullWidth
            select
            label="Country/Region"
            value={formData.country}
            onChange={onCountryChange}
          >
            {COUNTRIES.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <span>{option.flag}</span>
                  <span>{option.label}</span>
                </Stack>
              </MenuItem>
            ))}
          </TextField>

          {/* Shipping Info Alert */}
          {selectedCountry && (
            <Alert 
              severity="info" 
              sx={{ mt: 2 }}
              icon={<Iconify icon="solar:delivery-bold" width={24} />}
            >
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedCountry.flag} {selectedCountry.label}
                  </Typography>
                  <Chip 
                    label={selectedCountry.currency} 
                    size="small" 
                    color="primary" 
                    sx={{ height: 20 }}
                  />
                </Stack>
                
                <Stack spacing={0.5}>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    <strong>Shipping Cost:</strong>{" "}
                    {fCurrency(selectedCountry.shippingCost)}
                  </Typography>
                  
                  {selectedCountry.freeShippingThreshold && (
                    <Typography variant="caption" sx={{ color: "success.main", fontWeight: 500 }}>
                      ✓ Free shipping on orders over{" "}
                      {fCurrency(selectedCountry.freeShippingThreshold)}
                    </Typography>
                  )}
                  
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    <strong>Tax Rate:</strong> {selectedCountry.taxRate}%
                  </Typography>
                </Stack>
              </Stack>
            </Alert>
          )}
        </Box>

        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            label="First name"
            value={formData.firstName}
            onChange={onFieldChange("firstName")}
          />
          <TextField
            fullWidth
            label="Last name"
            value={formData.lastName}
            onChange={onFieldChange("lastName")}
          />
        </Stack>

        <AddressAutocomplete
          value={formData.address}
          onChange={onAddressChange}
          placeholder={messages.addressPlaceholder}
          label={messages.addressLabel}
          error={addressError}
          helperText={addressHelperText || `Tìm kiếm địa chỉ tại ${COUNTRIES.find(c => c.value === formData.country)?.label || 'your country'}`}
          required
          countryCode={formData.country.toLowerCase()}
        />

        <TextField
          fullWidth
          label={messages.apartmentLabel}
          value={formData.apartment}
          onChange={onFieldChange("apartment")}
        />

        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            label={messages.cityLabel}
            value={formData.city}
            onChange={onFieldChange("city")}
            required
          />
          <TextField
            fullWidth
            label={messages.postalCodeLabel}
            value={formData.postalCode}
            onChange={onFieldChange("postalCode")}
          />
        </Stack>

        <TextField
          fullWidth
          label={messages.phoneLabel}
          value={formData.phone}
          onChange={onFieldChange("phone")}
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Iconify icon="eva:info-outline" width={16} />
              </InputAdornment>
            ),
          }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={newsletterChecked}
              onChange={(e) => onNewsletterChange(e.target.checked)}
            />
          }
          label="Text me with news and offers"
        />
      </Stack>
    </Box>
  );
}
