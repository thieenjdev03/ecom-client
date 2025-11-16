import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import { fCurrency } from "src/utils/format-number";

import Iconify from "src/components/iconify";
import { ICheckoutItem } from "src/types/checkout";
import { calculateShipping, calculateTax, getCountryConfig } from "src/config/shipping";
// ----------------------------------------------------------------------

type Props = {
  total: number;
  discount?: number;
  subTotal: number;
  shipping?: number;
  tax?: number; // Tax from order summary (optional, will calculate if not provided)
  items: ICheckoutItem[];
  countryCode?: string;
  //
  onEdit?: VoidFunction;
  onApplyDiscount?: (discount: number) => void;
};

export default function CheckoutSummary({
  total,
  discount,
  subTotal,
  shipping,
  tax,
  items,
  countryCode,
  //
  onEdit,
  onApplyDiscount,
}: Props) {
  // Calculate shipping and tax based on country (all in USD)
  // If shipping/tax is provided as prop, use it; otherwise calculate from countryCode
  const country = countryCode ? getCountryConfig(countryCode) : null;
  const calculatedShippingInfo = countryCode ? calculateShipping(countryCode, subTotal) : { cost: 0, isFree: false, currency: "USD" };
  const calculatedTax = countryCode ? calculateTax(countryCode, subTotal) : 0;
  
  // Use provided shipping/tax from props if available, otherwise use calculated values
  const finalShipping = shipping !== undefined ? shipping : calculatedShippingInfo.cost;
  const finalTax = tax !== undefined ? tax : calculatedTax;
  
  const displayShipping = calculatedShippingInfo.isFree || finalShipping === 0
    ? "Free" 
    : fCurrency(finalShipping);
  
  const calculatedTotal = subTotal - (discount || 0) + finalShipping + finalTax;

  return (
    <Card sx={{ mt: 10, p: 3 }}>
      <Stack spacing={3}>
        {/* Product Details */}
        {items.length > 0 ? (
          items.map((item: ICheckoutItem, index: number) => {
            // Use new color and size objects for better display
            const colorName = item.color?.name || (item.colors?.length > 0 ? item.colors[0] : null);
            const sizeName = item.sizeObj?.name || item.size;
            const variantDisplay = item.variantName || 
              (colorName && sizeName ? `${colorName} / ${sizeName}` : 
               colorName || sizeName || "Standard");

            return (
              <Stack key={item.variantId || item.id || index} direction="row" spacing={2}>
                <Avatar
                  src={item.coverUrl || "/assets/images/product/product_1.jpg"}
                  variant="rounded"
                  sx={{ width: 64, height: 64, boxShadow: 1 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {item.name}
                  </Typography>
                  {variantDisplay && (
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      {item.color?.hexCode && (
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            bgcolor: item.color.hexCode,
                            border: (theme) => `1px solid ${theme.palette.divider}`,
                          }}
                        />
                      )}
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {variantDisplay}
                      </Typography>
                    </Stack>
                  )}
                  {item.sku && (
                    <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mb: 0.5 }}>
                      SKU: {item.sku}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Qty: {item.quantity} × {fCurrency(item.price)}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {fCurrency(item.price * item.quantity)}
                </Typography>
              </Stack>
            );
          })
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

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Shipping
              </Typography>
              {(calculatedShippingInfo.isFree || finalShipping === 0) && (
                <Chip label="FREE" size="small" color="success" sx={{ height: 18, fontSize: "0.65rem" }} />
              )}
            </Stack>
            <Typography variant="body2" sx={{ color: (calculatedShippingInfo.isFree || finalShipping === 0) ? "success.main" : "text.secondary", fontWeight: (calculatedShippingInfo.isFree || finalShipping === 0) ? 600 : 400 }}>
              {displayShipping}
            </Typography>
          </Stack>

          {country && country.freeShippingThreshold && !calculatedShippingInfo.isFree && finalShipping > 0 && subTotal < country.freeShippingThreshold && (
            <Typography variant="caption" sx={{ color: "info.main", fontSize: "0.7rem" }}>
              Add {fCurrency(country.freeShippingThreshold - subTotal)} more for free shipping!
            </Typography>
          )}

          {finalTax > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Tax ({country?.taxRate || 0}%)
              </Typography>
              <Typography variant="body2">{fCurrency(finalTax)}</Typography>
            </Stack>
          )}

          {discount && discount > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Discount
              </Typography>
              <Typography variant="body2" sx={{ color: "error.main" }}>
                -{fCurrency(discount)}
              </Typography>
            </Stack>
          )}

          <Divider />

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
                Total (USD)
              </Typography>
            </Stack>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {fCurrency(calculatedTotal)}
            </Typography>
          </Stack>

          {country && (
            <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic" }}>
              *Tax included • Shipping to {country.flag} {country.label}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
