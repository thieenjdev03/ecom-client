import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import Avatar from "@mui/material/Avatar";

import { fCurrency } from "src/utils/format-number";

import Iconify from "src/components/iconify";

// ----------------------------------------------------------------------

type Props = {
  total: number;
  discount?: number;
  subTotal: number;
  shipping?: number;
  items: any[];
  //
  onEdit?: VoidFunction;
  onApplyDiscount?: (discount: number) => void;
};

export default function CheckoutSummary({
  total,
  discount,
  subTotal,
  shipping,
  items,
  //
  onEdit,
  onApplyDiscount,
}: Props) {
  const displayShipping = shipping !== null ? "Free" : "Calculated at next step";

  return (
    <Box sx={{ mb: 3 }}>
      <Stack spacing={3}>
        {/* Product Details */}
        {items.length > 0 ? (
          items.map((item, index) => (
            <Stack key={item.id || index} direction="row" spacing={2}>
              <Avatar
                src={item.coverUrl || "/assets/images/product/product_1.jpg"}
                variant="rounded"
                sx={{ width: 60, height: 60 }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
                  {item.name}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                  Variant: {item.category || "Product"}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Size: {item.size || "One Size"}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Quantity x {item.quantity}
                </Typography>
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {fCurrency(item.price * item.quantity)}
              </Typography>
            </Stack>
          ))
        ) : (
          <Stack direction="row" spacing={2}>
            <Avatar
              src="/assets/images/product/product_1.jpg"
              variant="rounded"
              sx={{ width: 60, height: 60 }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
                Sample Product
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                Variant: Product
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Size: One Size
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Quantity x 1
              </Typography>
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {fCurrency(subTotal)}
            </Typography>
          </Stack>
        )}

        <Divider />

        {/* Discount Code */}
        <TextField
          fullWidth
          placeholder="Enter code"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onApplyDiscount?.(5)}
                  sx={{ mr: -0.5 }}
                >
                  Apply
                </Button>
              </InputAdornment>
            ),
          }}
        />

        {/* Price Breakdown */}
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Subtotal
            </Typography>
            <Typography variant="body2">{fCurrency(subTotal)}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Shipping
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {displayShipping}
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Direct Signature Required
            </Typography>
            <Typography variant="body2">$8</Typography>
          </Stack>

          <Divider />

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h6" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
              Total
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {fCurrency(total + 8)}
            </Typography>
          </Stack>

          <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic" }}>
            *Tax excluded, where applicable
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
