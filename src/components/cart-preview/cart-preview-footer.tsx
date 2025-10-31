import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { alpha } from "@mui/material/styles";
import { useRouter } from "src/routes/hooks";
import { paths } from "src/routes/paths";

import { fCurrency } from "src/utils/format-number";
import { useCheckoutContext } from "src/sections/checkout/context/checkout-context";

import Iconify from "src/components/iconify";

// ----------------------------------------------------------------------

type Props = {
  onClose: VoidFunction;
};

export default function CartPreviewFooter({ onClose }: Props) {
  const router = useRouter();
  const checkout = useCheckoutContext();

  const handleViewCart = () => {
    onClose();
    router.push(paths.product.checkout);
  };

  const handleCheckout = () => {
    onClose();
    router.push(paths.product.checkout);
  };

  return (
    <Box sx={{ p: 2.5 }}>
      <Stack spacing={2}>
        {/* Summary */}
        <Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Typography variant="body2" color="text.secondary">
              Tổng sản phẩm:
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {checkout.totalItems} sản phẩm
            </Typography>
          </Stack>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Tổng tiền:</Typography>
            <Typography variant="h6" color="primary.main">
              {fCurrency(checkout.total)}
            </Typography>
          </Stack>
        </Box>

        <Divider />

        {/* Action Buttons */}
        <Stack spacing={1.5}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<Iconify icon="solar:card-2-bold" width={20} />}
            onClick={handleCheckout}
            autoFocus
            aria-label="Proceed to checkout"
            sx={{
              py: 1.5,
              fontWeight: 700,
              backgroundColor: "#111",
              "&:hover": { backgroundColor: "#000" },
            }}
          >
            Thanh toán
          </Button>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<Iconify icon="solar:cart-3-bold" width={20} />}
            onClick={handleViewCart}
            aria-label="View cart details"
            sx={{
              py: 1.5,
              borderColor: "primary.main",
              color: "primary.main",
              "&:hover": {
                borderColor: "primary.dark",
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            Xem giỏ hàng
          </Button>

          <Stack spacing={0.5} alignItems="center" sx={{ pt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Bạn có thể thanh toán an toàn qua PayPal hoặc thẻ Visa.
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon="logos:paypal" width={32} />
              <Iconify icon="logos:visa" width={36} />
              <Iconify icon="logos:mastercard" width={28} />
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}
