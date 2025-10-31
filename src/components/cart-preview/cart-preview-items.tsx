import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import { TransitionGroup } from "react-transition-group";
import { useCheckoutContext } from "src/sections/checkout/context/checkout-context";

import CartPreviewItem from "./cart-preview-item";

// ----------------------------------------------------------------------

export default function CartPreviewItems() {
  const checkout = useCheckoutContext();

  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const allSelected = checkout.items.length > 0 && selectedIds.length === checkout.items.length;
  const hasSelection = selectedIds.length > 0;

  const toggleSelectAll = () => {
    setSelectedIds((prev) => (prev.length === checkout.items.length ? [] : checkout.items.map((i) => i.id)));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleDeleteSelected = () => {
    // Delete selected items from cart
    selectedIds.forEach((id) => checkout.onDeleteCart(id));
    setSelectedIds([]);
  };

  return (
    <Box sx={{ p: 0.5 }}>
      {checkout.items.length > 1 && (
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Checkbox
              checked={allSelected}
              onChange={toggleSelectAll}
              inputProps={{ "aria-label": "Select all items" }}
            />
            <Typography variant="body2" color="text.secondary">
              Chọn tất cả ({checkout.items.length})
            </Typography>
          </Stack>
          <Button
            size="small"
            color="error"
            variant="outlined"
            disabled={!hasSelection}
            onClick={handleDeleteSelected}
            aria-label="Delete selected items"
          >
            Xóa đã chọn
          </Button>
        </Stack>
      )}

      <TransitionGroup>
        {checkout.items.map((item) => (
          <Collapse key={item.id} timeout={220}>
            <Box sx={{ mb: 2 }}>
              <CartPreviewItem
                item={item}
                onDelete={() => checkout.onDeleteCart(item.id)}
                onIncrease={() => checkout.onIncreaseQuantity(item.id)}
                onDecrease={() => checkout.onDecreaseQuantity(item.id)}
                selected={selectedIds.includes(item.id)}
                onToggleSelect={() => toggleSelect(item.id)}
              />
            </Box>
          </Collapse>
        ))}
      </TransitionGroup>
    </Box>
  );
}
