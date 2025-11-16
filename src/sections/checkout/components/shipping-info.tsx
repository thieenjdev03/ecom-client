import { memo, useMemo } from "react";

import { Stack, Typography, Chip, Paper } from "@mui/material";

import Iconify from "src/components/iconify";

import { fCurrency } from "src/utils/format-number";

import type { CountryConfig } from "src/config/shipping";

// ----------------------------------------------------------------------

interface ShippingInfoProps {
  selectedCountry: CountryConfig;
}

const ShippingInfo = memo(function ShippingInfo({ selectedCountry }: ShippingInfoProps) {
  const { flag, label, currency, shippingCost, freeShippingThreshold } =
    selectedCountry;

  const values = useMemo(
    () => ({
      cost: fCurrency(shippingCost),
      freeShip: freeShippingThreshold ? fCurrency(freeShippingThreshold) : null,
    }),
    [shippingCost, freeShippingThreshold]
  );

  return (
    <Paper
      elevation={1}
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack spacing={1.5}>
        <Header flag={flag} label={label} currency={currency} />
        <Details cost={values.cost} freeShip={values.freeShip} />
      </Stack>
    </Paper>
  );
});

/* --------------------------------------- */
/*              SUB COMPONENTS             */
/* --------------------------------------- */

const Header = memo(function Header({ flag, label, currency }: { flag: string; label: string; currency: string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.2} flexWrap="wrap">
      <Iconify icon="solar:delivery-bold" width={22} />
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {flag} {label}
      </Typography>

      <Chip
        label={currency}
        size="small"
        color="primary"
        sx={{ height: 20, ml: 0.5 }}
      />
    </Stack>
  );
});

const Details = memo(function Details({ cost, freeShip }: { cost: string; freeShip: string | null }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        <strong>Shipping Cost:</strong> {cost}
      </Typography>

      {freeShip && (
        <Typography
          variant="caption"
          sx={{ color: "success.main", fontWeight: 500 }}
        >
          ✓ Free shipping over {freeShip}
        </Typography>
      )}
    </Stack>
  );
});

export default ShippingInfo;

