import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";

import Iconify from "src/components/iconify";

// ----------------------------------------------------------------------

type Props = {
  onClose: VoidFunction;
};

export default function CartPreviewHeader({ onClose }: Props) {
  return (
    <Box
      sx={{
        p: 2.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 64,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Giỏ hàng của bạn
      </Typography>

      <IconButton
        onClick={onClose}
        sx={{
          p: 1,
          "&:hover": {
            backgroundColor: "action.hover",
          },
        }}
      >
        <Iconify icon="solar:close-circle-bold" width={24} />
      </IconButton>
    </Box>
  );
}
