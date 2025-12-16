import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";

import Iconify from "src/components/iconify";
import AddressAutocomplete from "src/components/address-autocomplete/address-autocomplete";
import { getCountryConfig, useShippingCountries } from "src/config/shipping";
import ShippingInfo from "./shipping-info";

// ----------------------------------------------------------------------

interface ShippingAddressSectionProps {
  formData: {
    countryCode: string;
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    province: string;
    district: string;
    ward: string;
    postalCode: string;
    phone: string;
    label: string;
    note: string;
    isBilling: boolean;
    isDefault: boolean;
    addressCoordinates: { lat: number; lon: number } | null;
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
  const {
    countries,
    loading: countriesLoading,
    error: countriesError,
    refresh: refreshCountries,
  } = useShippingCountries();

  // Get country-specific messages
  const getCountryMessages = () => {
    switch (formData.countryCode) {
      case "VN":
        return {
          addressPlaceholder: "Nhập địa chỉ giao hàng (ví dụ: 123 Đường Lê Lợi)...",
          addressLabel: "Địa chỉ",
          cityLabel: "Thành phố / Tỉnh",
          postalCodeLabel: "Mã bưu điện (tùy chọn)",
          phoneLabel: "Số điện thoại",
          apartmentLabel: "Căn hộ, tầng, v.v. (tùy chọn)",
          provinceLabel: "Tỉnh/Thành",
          districtLabel: "Quận/Huyện",
          wardLabel: "Phường/Xã",
          labelLabel: "Nhãn địa chỉ (tùy chọn)",
          noteLabel: "Ghi chú giao hàng (tùy chọn)",
        };
      case "US":
        return {
          addressPlaceholder: "Street address, P.O. box, company name, c/o",
          addressLabel: "Street Address",
          cityLabel: "City/Town",
          postalCodeLabel: "Postal code",
          phoneLabel: "Phone Number",
          apartmentLabel: "(Optional) Apartment, suite, unit, building, floor, etc.",
          provinceLabel: "State/Country",
          districtLabel: "County / District",
          wardLabel: "Neighborhood (optional)",
          labelLabel: "Label (optional)",
          noteLabel: "Notes about your order, e.g. special notes for delivery.",
        };
      case "UK":
        return {
          addressPlaceholder: "Street address, P.O. box, company name, c/o",
          addressLabel: "Street Address",
          cityLabel: "City/Town",
          postalCodeLabel: "Postal code",
          phoneLabel: "Phone Number",
          apartmentLabel: "(Optional) Apartment, suite, unit, building, floor, etc.",
          provinceLabel: "State/Country",
          districtLabel: "District",
          wardLabel: "Ward (optional)",
          labelLabel: "Label (optional)",
          noteLabel: "Notes about your order, e.g. special notes for delivery.",
        };
      default:
        return {
          addressPlaceholder: "Street address, P.O. box, company name, c/o",
          addressLabel: "Address",
          cityLabel: "City/Town",
          postalCodeLabel: "Postal code",
          phoneLabel: "Phone Number",
          apartmentLabel: "(Optional) Apartment, suite, unit, building, floor, etc.",
          provinceLabel: "State/Country",
          districtLabel: "District",
          wardLabel: "Ward",
          labelLabel: "Label (optional)",
          noteLabel: "Notes about your order, e.g. special notes for delivery.",
        };
    }
  };

  const messages = getCountryMessages();
  const selectedCountry = getCountryConfig(formData.countryCode, countries);
  const selectedCountryLabel = countries.find((country) => country.value === formData.countryCode)?.label;

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
          Delivery Information
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
        <Box>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
            Please ensure your address is correct.
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            We cannot change addresses after checkout.
          </Typography>

          {countriesError && (
            <Alert
              severity="warning"
              sx={{ mt: 2 }}
              action={
                <Button color="inherit" size="small" onClick={() => refreshCountries(true)} disabled={countriesLoading}>
                  Retry
                </Button>
              }
            >
              Unable to refresh country list. Using cached values for now.
            </Alert>
          )}
        </Box>

        <Box>
          <TextField
            fullWidth
            select
            label="Country/Region"
            value={formData.countryCode}
            onChange={onCountryChange}
            helperText={countriesLoading ? "Loading country list..." : undefined}
          >
            {countries.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <span>{option.flag}</span>
                  <span>{option.label}</span>
                </Stack>
              </MenuItem>
            ))}
          </TextField>

          {/* Shipping Info */}
          {selectedCountry && <ShippingInfo selectedCountry={selectedCountry} />}
        </Box>

        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            label="First Name"
            value={formData.firstName}
            onChange={onFieldChange("firstName")}
          />
          <TextField
            fullWidth
            label="Last Name"
            value={formData.lastName}
            onChange={onFieldChange("lastName")}
          />
        </Stack>

        <AddressAutocomplete
          value={formData.addressLine1}
          onChange={onAddressChange}
          placeholder={messages.addressPlaceholder}
          label={messages.addressLabel}
          error={addressError}
          helperText={
            addressHelperText ||
            `Tìm kiếm địa chỉ tại ${selectedCountryLabel || "your country"}`
          }
          required
          countryCode={formData.countryCode.toLowerCase()}
        />

        <TextField
          fullWidth
          label={messages.apartmentLabel}
          value={formData.addressLine2}
          onChange={onFieldChange("addressLine2")}
        />

        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            label={messages.provinceLabel}
            value={formData.province}
            onChange={onFieldChange("province")}
            required
          />
          <TextField
            fullWidth
            label={messages.districtLabel}
            value={formData.district}
            onChange={onFieldChange("district")}
            required
          />
        </Stack>

        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            label={messages.wardLabel}
            value={formData.ward}
            onChange={onFieldChange("ward")}
            required
          />
          <TextField
            fullWidth
            label={messages.cityLabel}
            value={formData.city}
            onChange={onFieldChange("city")}
            required
          />
        </Stack>

        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            label={messages.postalCodeLabel}
            value={formData.postalCode}
            onChange={onFieldChange("postalCode")}
          />
          <TextField
            fullWidth
            label={messages.labelLabel}
            value={formData.label}
            onChange={onFieldChange("label")}
          />
        </Stack>

        <TextField
          fullWidth
          label={messages.noteLabel}
          value={formData.note}
          onChange={onFieldChange("note")}
          multiline
          minRows={2}
        />

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

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isDefault}
                onChange={onFieldChange("isDefault")}
              />
            }
            label={
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Set as default shipping address
              </Typography>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isBilling}
                onChange={onFieldChange("isBilling")}
              />
            }
            label={
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Use as billing address too
              </Typography>
            }
          />
        </Stack>
      </Stack>
    </Box>
  );
}
