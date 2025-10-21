import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useCheckoutContext } from "src/sections/checkout/context/checkout-context";

import CartPreviewItem from "./cart-preview-item";

// ----------------------------------------------------------------------

export default function CartPreviewItems() {
  const checkout = useCheckoutContext();

  return (
    <Box sx={{ p: 2.5 }}>
      <Stack spacing={2}>
        {checkout.items.map((item) => (
          <CartPreviewItem
            key={item.id}
            item={item}
            onDelete={() => checkout.onDeleteCart(item.id)}
            onIncrease={() => checkout.onIncreaseQuantity(item.id)}
            onDecrease={() => checkout.onDecreaseQuantity(item.id)}
          />
        ))}
      </Stack>
    </Box>
  );
}
