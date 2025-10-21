import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import { alpha } from "@mui/material/styles";

import { fCurrency } from "src/utils/format-number";
import { ICheckoutItem } from "src/types/checkout";

import Iconify from "src/components/iconify";

// ----------------------------------------------------------------------

type Props = {
  item: ICheckoutItem;
  onDelete: VoidFunction;
  onIncrease: VoidFunction;
  onDecrease: VoidFunction;
};

export default function CartPreviewItem({
  item,
  onDelete,
  onIncrease,
  onDecrease,
}: Props) {
  const { name, coverUrl, price, quantity, colors, size, subTotal } = item;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 1.5,
        border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
        backgroundColor: "background.neutral",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: (theme) => theme.customShadows.dropdown,
        },
      }}
    >
      <Stack direction="row" spacing={2}>
        {/* Product Image */}
        <Avatar
          src={coverUrl}
          variant="rounded"
          sx={{
            width: 64,
            height: 64,
            flexShrink: 0,
          }}
        />

        {/* Product Details */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            sx={{
              mb: 0.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </Typography>

          {/* Variant Info */}
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            {colors && colors.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                Màu: {colors.join(", ")}
              </Typography>
            )}
            {size && (
              <Typography variant="caption" color="text.secondary">
                Size: {size}
              </Typography>
            )}
          </Stack>

          {/* Price */}
          <Typography variant="subtitle2" color="primary.main" sx={{ mb: 1 }}>
            {fCurrency(price)}
          </Typography>

          {/* Quantity Controls */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton
              size="small"
              onClick={onDecrease}
              disabled={quantity <= 1}
              sx={{
                width: 28,
                height: 28,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <Iconify icon="solar:minus-bold" width={16} />
            </IconButton>

            <Typography variant="body2" sx={{ minWidth: 24, textAlign: "center" }}>
              {quantity}
            </Typography>

            <IconButton
              size="small"
              onClick={onIncrease}
              sx={{
                width: 28,
                height: 28,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <Iconify icon="solar:add-bold" width={16} />
            </IconButton>

            {/* Subtotal */}
            <Typography
              variant="subtitle2"
              color="primary.main"
              sx={{ ml: "auto", fontWeight: 600 }}
            >
              {fCurrency(subTotal)}
            </Typography>
          </Stack>
        </Box>

        {/* Remove Button */}
        <IconButton
          size="small"
          onClick={onDelete}
          sx={{
            color: "error.main",
            "&:hover": {
              backgroundColor: (theme) => alpha(theme.palette.error.main, 0.08),
            },
          }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" width={18} />
        </IconButton>
      </Stack>
    </Box>
  );
}
