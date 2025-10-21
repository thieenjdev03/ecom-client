import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";

import Iconify from "src/components/iconify";
import AddressAutocomplete from "src/components/address-autocomplete/address-autocomplete";

// ----------------------------------------------------------------------

const COUNTRIES = [
  { value: "VN", label: "Vietnam" },
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
];

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
}: ShippingAddressSectionProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, textTransform: "uppercase", mb: 3 }}>
        Shipping Address
      </Typography>
      <Stack spacing={3}>
        <Box>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
            Please ensure your address is correct.
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            We cannot change addresses after checkout.
          </Typography>
        </Box>

        <TextField
          fullWidth
          select
          label="Country/Region"
          value={formData.country}
          onChange={onCountryChange}
        >
          {COUNTRIES.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

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
          placeholder="Nhập địa chỉ giao hàng..."
          label="Address"
          error={addressError}
          helperText={addressHelperText}
          required
          countryCode={formData.country.toLowerCase()}
        />

        <TextField
          fullWidth
          label="Apartment, suite, etc. (optional)"
          value={formData.apartment}
          onChange={onFieldChange("apartment")}
        />

        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            label="City"
            value={formData.city}
            onChange={onFieldChange("city")}
          />
          <TextField
            fullWidth
            label="Postal code (optional)"
            value={formData.postalCode}
            onChange={onFieldChange("postalCode")}
          />
        </Stack>

        <TextField
          fullWidth
          label="Phone"
          value={formData.phone}
          onChange={onFieldChange("phone")}
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
