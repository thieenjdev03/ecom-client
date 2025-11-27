import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import CardHeader from "@mui/material/CardHeader";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";

import Iconify from "src/components/iconify";
import Scrollbar from "src/components/scrollbar";

import { IOrderProductItem } from "src/types/order";

// ----------------------------------------------------------------------

type Props = {
  taxes: number;
  shipping: number;
  discount: number;
  subTotal: number;
  totalAmount: number;
  currency: string;
  items: IOrderProductItem[];
};

function formatCurrencyWithCode(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export default function OrderDetailsItems({
  items,
  taxes,
  shipping,
  discount,
  subTotal,
  totalAmount,
  currency,
}: Props) {
  const renderTotal = (
    <Stack
      spacing={2}
      alignItems="flex-end"
      sx={{ my: 3, textAlign: "right", typography: "body2" }}
    >
      <Stack direction="row" spacing={3}>
        <Box sx={{ color: "text.secondary" }}>Subtotal</Box>
        <Box sx={{ width: 160, typography: "subtitle2" }}>
          {formatCurrencyWithCode(subTotal, currency)}
        </Box>
      </Stack>

      <Stack direction="row" spacing={3}>
        <Box sx={{ color: "text.secondary" }}>Shipping</Box>
        <Box sx={{ width: 160 }}>
          {shipping ? formatCurrencyWithCode(shipping, currency) : "-"}
        </Box>
      </Stack>

      <Stack direction="row" spacing={3}>
        <Box sx={{ color: "text.secondary" }}>Discount</Box>
        <Box sx={{ width: 160, color: discount ? "error.main" : "inherit" }}>
          {discount ? `- ${formatCurrencyWithCode(discount, currency)}` : "-"}
        </Box>
      </Stack>

      <Stack direction="row" spacing={3}>
        <Box sx={{ color: "text.secondary" }}>Taxes</Box>
        <Box sx={{ width: 160 }}>{taxes ? formatCurrencyWithCode(taxes, currency) : "-"}</Box>
      </Stack>

      <Stack direction="row" sx={{ typography: "subtitle1" }}>
        <Box>Total</Box>
        <Box sx={{ width: 160 }}>{formatCurrencyWithCode(totalAmount, currency)}</Box>
      </Stack>
    </Stack>
  );

  return (
    <Card>
      <CardHeader
        title="Details"
        action={
          <IconButton>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        }
      />

      <Stack
        sx={{
          px: 3,
        }}
      >
        <Scrollbar>
          {items.map((item) => (
            <Stack
              key={item.id}
              direction="row"
              alignItems="center"
              sx={{
                py: 3,
                minWidth: 640,
                borderBottom: (theme) =>
                  `dashed 2px ${theme.palette.background.neutral}`,
              }}
            >
              <Avatar
                src={item.coverUrl}
                variant="rounded"
                sx={{ width: 48, height: 48, mr: 2 }}
              />

              <Box sx={{ flexGrow: 1 }}>
                <ListItemText
                  primary={item.name}
                  secondary={item.sku}
                  primaryTypographyProps={{
                    typography: "body2",
                  }}
                  secondaryTypographyProps={{
                    component: "span",
                    color: "text.disabled",
                    mt: 0.5,
                  }}
                />
                {item.variantName && (
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Variant: {item.variantName}
                  </Typography>
                )}
              </Box>

              <Box sx={{ typography: "body2" }}>x{item.quantity}</Box>

              <Box
                sx={{ width: 110, textAlign: "right", typography: "subtitle2" }}
              >
                {formatCurrencyWithCode(item.price, currency)}
              </Box>
            </Stack>
          ))}
        </Scrollbar>

        {renderTotal}
      </Stack>
    </Card>
  );
}
