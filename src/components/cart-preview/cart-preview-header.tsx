import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";

import Iconify from "src/components/iconify";
import { useTranslate } from "src/locales";

// ----------------------------------------------------------------------

type Props = {
  onClose: VoidFunction;
};

export default function CartPreviewHeader({ onClose }: Props) {
  const { t } = useTranslate();

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
        {t("cart.title")}
      </Typography>

      <IconButton
        onClick={onClose}
        aria-label="Close cart preview"
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
