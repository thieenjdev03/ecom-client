import { useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";

import Iconify from "src/components/iconify";

// ----------------------------------------------------------------------

const COUNTRIES = [
  { value: "VN", label: "Vietnam" },
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
];

export default function CheckoutShippingForm() {
  const [formData, setFormData] = useState({
    country: "VN",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    postalCode: "",
    phone: "",
  });
  const [newsletterChecked, setNewsletterChecked] = useState(false);

  const handleChange = (field: string) => (event: any) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

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
          onChange={handleChange("country")}
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
            onChange={handleChange("firstName")}
          />
          <TextField
            fullWidth
            label="Last name"
            value={formData.lastName}
            onChange={handleChange("lastName")}
          />
        </Stack>

        <TextField
          fullWidth
          label="Address"
          value={formData.address}
          onChange={handleChange("address")}
        />

        <TextField
          fullWidth
          label="Apartment, suite, etc. (optional)"
          value={formData.apartment}
          onChange={handleChange("apartment")}
        />

        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            label="City"
            value={formData.city}
            onChange={handleChange("city")}
          />
          <TextField
            fullWidth
            label="Postal code (optional)"
            value={formData.postalCode}
            onChange={handleChange("postalCode")}
          />
        </Stack>

        <TextField
          fullWidth
          label="Phone"
          value={formData.phone}
          onChange={handleChange("phone")}
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
              onChange={(e) => setNewsletterChecked(e.target.checked)}
            />
          }
          label="Text me with news and offers"
        />

        <Button
          fullWidth
          size="large"
          variant="contained"
          sx={{
            mt: 3,
            backgroundColor: "#8B4513",
            "&:hover": {
              backgroundColor: "#A0522D",
            },
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Continue to Shipping
        </Button>
      </Stack>
    </Box>
  );
}
