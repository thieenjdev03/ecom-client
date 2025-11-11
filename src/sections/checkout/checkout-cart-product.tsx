import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

import { fCurrency } from "src/utils/format-number";

import Label from "src/components/label";
import Iconify from "src/components/iconify";
import { ColorPreview } from "src/components/color-utils";

import { ICheckoutItem } from "src/types/checkout";

import IncrementerButton from "../product/common/incrementer-button";

// ----------------------------------------------------------------------

type Props = {
  row: ICheckoutItem;
  onDelete: VoidFunction;
  onDecrease: VoidFunction;
  onIncrease: VoidFunction;
};

export default function CheckoutCartProduct({
  row,
  onDelete,
  onDecrease,
  onIncrease,
}: Props) {
  const { name, size, price, colors, coverUrl, quantity, available, color, sizeObj, variantName, sku } = row;

  // Use new color and size objects for better display
  const colorName = color?.name || (colors?.length > 0 ? colors[0] : null);
  const sizeName = sizeObj?.name || size;
  const displayVariantInfo = variantName || 
    (colorName && sizeName ? `${colorName} / ${sizeName}` : 
     colorName || sizeName || "");

  return (
    <TableRow>
      <TableCell sx={{ display: "flex", alignItems: "center" }}>
        <Avatar
          variant="rounded"
          alt={name}
          src={coverUrl}
          sx={{ width: 64, height: 64, mr: 2 }}
        />

        <Stack spacing={0.5}>
          <Typography noWrap variant="subtitle2" sx={{ maxWidth: 240 }}>
            {name}
          </Typography>

          {displayVariantInfo && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              {color?.hexCode && (
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    bgcolor: color.hexCode,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                  }}
                />
              )}
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {displayVariantInfo}
              </Typography>
            </Stack>
          )}

          {sku && (
            <Typography variant="caption" sx={{ color: "text.disabled" }}>
              SKU: {sku}
            </Typography>
          )}
        </Stack>
      </TableCell>

      <TableCell>{fCurrency(price)}</TableCell>

      <TableCell>
        <Box sx={{ width: 88, textAlign: "right" }}>
          <IncrementerButton
            quantity={quantity}
            onDecrease={onDecrease}
            onIncrease={onIncrease}
            disabledDecrease={quantity <= 1}
            disabledIncrease={quantity >= available}
          />

          <Typography
            variant="caption"
            component="div"
            sx={{ color: "text.secondary", mt: 1 }}
          >
            available: {available}
          </Typography>
        </Box>
      </TableCell>

      <TableCell align="right">{fCurrency(price * quantity)}</TableCell>

      <TableCell align="right" sx={{ px: 1 }}>
        <IconButton onClick={onDelete}>
          <Iconify icon="solar:trash-bin-trash-bold" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
