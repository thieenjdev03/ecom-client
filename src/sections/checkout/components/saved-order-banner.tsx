import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";

import Iconify from "src/components/iconify";
import { fCurrency } from "src/utils/format-number";
import { useTranslate } from "src/locales";
import { getCountryConfig } from "src/config/shipping";
import type { CheckoutShippingData } from "../checkout-shipping-form";

// ----------------------------------------------------------------------

type SavedOrderShippingAddress = Partial<CheckoutShippingData> & {
  // Legacy / API field name for full recipient name
  full_name?: string;
  phone?: string;
  address?: string; // legacy storage
  country?: string; // legacy storage
};

interface SavedOrderInfo {
  orderId: string;
  shippingAddress: SavedOrderShippingAddress;
  orderSummary: {
    subtotal: string;
    shipping: string;
    tax: string;
    discount: string;
    total: string;
    currency: string;
  };
  createdAt: string;
}

interface SavedOrderBannerProps {
  orderInfo: SavedOrderInfo;
  onContinue: () => void;
  onDismiss: () => void;
}

export default function SavedOrderBanner({
  orderInfo,
  onContinue,
  onDismiss,
}: SavedOrderBannerProps) {
  const { t } = useTranslate();
  const { orderId, shippingAddress, orderSummary, createdAt } = orderInfo;
  const recipientName =
    shippingAddress.full_name ||
    `${shippingAddress.firstName ?? ""} ${shippingAddress.lastName ?? ""}`.trim() ||
    "Customer";
  const cityLine =
    shippingAddress.city ||
    shippingAddress.province ||
    shippingAddress.district ||
    "";
  const countryConfig = shippingAddress.countryCode
    ? getCountryConfig(shippingAddress.countryCode)
    : null;
  const countryLabel = countryConfig?.label || shippingAddress.country || shippingAddress.countryCode || "";

  // Format created date
  const createdDate = new Date(createdAt);
  const timeAgo = getTimeAgo(createdDate, t);

  return (
    <Alert
      severity="info"
      icon={<Iconify icon="solar:clock-circle-bold" width={24} />}
      sx={{
        mb: 3,
        "& .MuiAlert-message": {
          width: "100%",
        },
      }}
      action={
        <IconButton size="small" onClick={onDismiss} aria-label="dismiss">
          <Iconify icon="eva:close-fill" width={20} />
        </IconButton>
      }
    >
      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {t("savedOrderBanner.title")}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {t("savedOrderBanner.orderInfo", {
              orderId: orderId.slice(0, 8),
              timeAgo,
            })}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
              {t("savedOrderBanner.shippingTo")}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {recipientName}
            </Typography>
            {(cityLine || countryLabel) && (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {[cityLine, countryLabel].filter(Boolean).join(", ")}
              </Typography>
            )}
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
              {t("savedOrderBanner.totalAmount")}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main" }}>
              {fCurrency(parseFloat(orderSummary.total))}
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="contained"
          size="small"
          onClick={onContinue}
          startIcon={<Iconify icon="solar:arrow-right-bold" />}
          sx={{ alignSelf: "flex-start" }}
        >
          {t("savedOrderBanner.continuePayment")}
        </Button>
      </Stack>
    </Alert>
  );
}

// Helper function to format time ago
function getTimeAgo(date: Date, t: (key: string, options?: any) => string): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMins < 1) {
    return t("savedOrderBanner.justNow");
  } else if (diffMins < 60) {
    return t("savedOrderBanner.minutesAgo", { minutes: diffMins });
  } else if (diffHours < 24) {
    return t("savedOrderBanner.hoursAgo", { hours: diffHours });
  } else {
    // Use locale-aware date formatting
    const locale = typeof window !== "undefined" 
      ? localStorage.getItem("i18nextLng") || "en"
      : "en";
    return date.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}

