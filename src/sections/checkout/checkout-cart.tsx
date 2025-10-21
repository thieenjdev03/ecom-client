import React from "react";

import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Unstable_Grid2";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import Iconify from "src/components/iconify";
import EmptyContent from "src/components/empty-content";

import { useCheckoutContext } from "./context";
import CheckoutSummary from "./checkout-summary";
import CheckoutCartProductList from "./checkout-cart-product-list";
import CheckoutContactForm from "./checkout-contact-form";
import CheckoutShippingForm from "./checkout-shipping-form";
import { SAMPLE_PRODUCTS } from "src/_mock/_product-items";

// ----------------------------------------------------------------------

export default function CheckoutCart() {
  const checkout = useCheckoutContext();

  const empty = !checkout.items.length;

  // Add sample product to cart if empty (for demo purposes)
  React.useEffect(() => {
    if (empty && SAMPLE_PRODUCTS.length > 0) {
      const sampleProduct = SAMPLE_PRODUCTS[0];
      checkout.onAddToCart({
        id: sampleProduct.id,
        name: sampleProduct.name,
        variants: sampleProduct.variants,
        category: "",
        coverUrl: sampleProduct.coverUrl,
        available: sampleProduct.available,
        price: sampleProduct.price,
        colors: [sampleProduct.colors[0]],
        size: sampleProduct.sizes[0],
        quantity: 1,
      });
    }
  }, [empty, checkout]);

  return (
    <Grid container spacing={4}>
      <Grid xs={12} md={8}>
        <Stack spacing={3}>
          {/* <CheckoutContactForm /> */}
          <CheckoutShippingForm />
        </Stack>
      </Grid>

      <Grid xs={12} md={4}>
        <CheckoutSummary
          total={checkout.total}
          discount={checkout.discount}
          subTotal={checkout.subTotal}
          items={checkout.items}
          onApplyDiscount={checkout.onApplyDiscount}
        />
      </Grid>
    </Grid>
  );
}
