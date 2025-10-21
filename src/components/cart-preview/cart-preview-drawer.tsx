import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";

import { useCheckoutContext } from "src/sections/checkout/context/checkout-context";

import CartPreviewHeader from "./cart-preview-header";
import CartPreviewItems from "./cart-preview-items";
import CartPreviewFooter from "./cart-preview-footer";
import CartPreviewEmpty from "./cart-preview-empty";

// ----------------------------------------------------------------------

export default function CartPreviewDrawer() {
  const theme = useTheme();
  const checkout = useCheckoutContext();

  const isEmpty = !checkout.items.length;

  return (
    <Drawer
      anchor="right"
      open={checkout.cartPreviewOpen}
      onClose={checkout.onCloseCartPreview}
      slotProps={{
        backdrop: { 
          invisible: false,
          sx: { 
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }
        },
      }}
      PaperProps={{
        sx: {
          width: {
            xs: 1, // Full width on mobile
            sm: 400, // 400px on desktop
          },
          height: 1,
          display: "flex",
          flexDirection: "column",
        },
      }}
      sx={{
        "& .MuiDrawer-paper": {
          transition: theme.transitions.create("transform", {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
          }),
        },
      }}
    >
      {/* Header */}
      <CartPreviewHeader onClose={checkout.onCloseCartPreview} />

      <Divider />

      {/* Content */}
      <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {isEmpty ? (
          <CartPreviewEmpty />
        ) : (
          <>
            {/* Cart Items */}
            <Box sx={{ flex: 1, overflow: "auto" }}>
              <CartPreviewItems />
            </Box>

            <Divider />

            {/* Footer */}
            <CartPreviewFooter onClose={checkout.onCloseCartPreview} />
          </>
        )}
      </Box>
    </Drawer>
  );
}
