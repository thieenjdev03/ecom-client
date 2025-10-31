import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Checkbox from "@mui/material/Checkbox";
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
  // Optional selection props for bulk actions
  selected?: boolean;
  onToggleSelect?: VoidFunction;
};

export default function CartPreviewItem({
  item,
  onDelete,
  onIncrease,
  onDecrease,
  selected,
  onToggleSelect,
}: Props) {
  const { name, coverUrl, price, quantity, colors, size, subTotal } = item;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 1.5,
        border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
        backgroundColor: "#fff",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: (theme) => theme.customShadows.dropdown,
        },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        {onToggleSelect && (
          <Checkbox
            checked={!!selected}
            onChange={onToggleSelect}
            inputProps={{ "aria-label": "Select cart item" }}
            sx={{ p: 0.5, alignSelf: "center" }}
          />
        )}

        {/* Left: Product Image + Info */}
        <Stack direction="row" spacing={2} sx={{ flex: 1, minWidth: 0 }}>
          <Avatar
            src={coverUrl}
            variant="rounded"
            sx={{
              width: 88,
              height: 88,
              flexShrink: 0,
              boxShadow: (theme) => theme.customShadows.z8,
            }}
          />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 0.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={name}
            >
              {name}
            </Typography>

            <Stack direction="column" spacing={1} sx={{ mb: 1 }}>
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

            <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 600 }}>
              {fCurrency(price)}
            </Typography>
          </Box>
        </Stack>

        {/* Right: Quantity + Subtotal + Delete */}
        <Stack spacing={1} alignItems="flex-end" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconButton
              onClick={onDecrease}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              sx={{
                width: 30,
                height: 30,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                "&:hover": { backgroundColor: "action.hover" },
              }}
            >
              <Iconify icon="ic:round-remove" width={20} sx={{ color: "text.primary" }} />
            </IconButton>

            <Typography variant="body2" sx={{ minWidth: 28, textAlign: "center" }}>
              {quantity}
            </Typography>

            <IconButton
              onClick={onIncrease}
              aria-label="Increase quantity"
              sx={{
                width: 30,
                height: 30,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                "&:hover": { backgroundColor: "action.hover" },
              }}
            >
              <Iconify icon="ic:round-add" width={20} sx={{ color: "text.primary" }} />
            </IconButton>
          </Stack>

          <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
            {fCurrency(subTotal)}
          </Typography>

          <IconButton
            onClick={onDelete}
            aria-label="Remove item from cart"
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
      </Stack>
    </Box>
  );
}
