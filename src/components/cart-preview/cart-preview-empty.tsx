import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import Iconify from "src/components/iconify";

// ----------------------------------------------------------------------

export default function CartPreviewEmpty() {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Stack spacing={2} alignItems="center">
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            backgroundColor: "action.hover",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Iconify
            icon="solar:cart-3-bold"
            width={40}
            sx={{ color: "text.disabled" }}
          />
        </Box>

        <Typography variant="h6" color="text.secondary" textAlign="center">
          Giỏ hàng của bạn đang trống
        </Typography>

        <Typography variant="body2" color="text.disabled" textAlign="center">
          Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
        </Typography>
      </Stack>
    </Box>
  );
}
