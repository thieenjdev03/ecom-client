import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";

import Iconify from "src/components/iconify";
import { fCurrency } from "src/utils/format-number";

// ----------------------------------------------------------------------

interface SavedOrderInfo {
  orderId: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    country: string;
  };
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
  const { orderId, shippingAddress, orderSummary, createdAt } = orderInfo;

  // Format created date
  const createdDate = new Date(createdAt);
  const timeAgo = getTimeAgo(createdDate);

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
            Bạn có một đơn hàng đang chờ thanh toán
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Đơn hàng #{orderId.slice(0, 8)} • Tạo {timeAgo}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
              Giao đến
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {shippingAddress.firstName} {shippingAddress.lastName}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {shippingAddress.city}, {shippingAddress.country}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
              Tổng tiền
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
          Tiếp tục thanh toán
        </Button>
      </Stack>
    </Alert>
  );
}

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMins < 1) {
    return "vừa xong";
  } else if (diffMins < 60) {
    return `${diffMins} phút trước`;
  } else if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  } else {
    return date.toLocaleDateString("vi-VN");
  }
}

