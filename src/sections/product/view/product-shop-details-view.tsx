"use client";

import { useState, useCallback } from "react";
import { ProductVariantDto } from "src/types/product-dto";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Unstable_Grid2";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import { useGetProduct } from "src/api/product";

import { useTranslate } from "src/locales";

import Iconify from "src/components/iconify";
import EmptyContent from "src/components/empty-content";

import { useCheckoutContext } from "../../checkout/context";
import { ProductDetailsSkeleton } from "../product-skeleton";
import ProductDetailsSummary from "../product-details-summary";
import ProductDetailsCarousel from "../product-details-carousel";
import HomeProductShowcase from "src/sections/landing-page/home-product-showcase";
import WishlistProductShowcase from "src/sections/landing-page/wishlist-product-showcase";

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function ProductShopDetailsView({ id }: Props) {
  const { t } = useTranslate();

  const checkout = useCheckoutContext();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariantDto | null>(null);

  // ------------------------------------------------------------------
  // Get locale from i18n for multi-language support
  const { i18n } = useTranslate();
  const currentLocale = i18n.language || "en";

  // Use real API data instead of mockup
  const { product, productLoading, productError } = useGetProduct(id, currentLocale);
  const renderSkeleton = <ProductDetailsSkeleton />;

  const renderError = (
    <EmptyContent
      filled
      title={`${productError?.message}`}
      action={
        <Button
          component={RouterLink}
          href={paths.product.root}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
          sx={{ mt: 3 }}
        >
          {t("product.list")}
        </Button>
      }
      sx={{ py: 10 }}
    />
  );

  const renderProduct = product && (
    <>
      <Box sx={{ display: "flex", gap: 2, mb: 6, alignItems: "center", justifyContent: "center"}}>
        <Box sx={{ width: "50%" }}>
          <ProductDetailsCarousel product={product} selectedVariant={selectedVariant} />
        </Box>

        <Box sx={{ width: "40%" }}>
          <ProductDetailsSummary
            product={product}
            items={checkout.items}
            onAddCart={checkout.onAddToCart}
            onGotoStep={checkout.onGotoStep}
            onVariantChange={setSelectedVariant}
          />
        </Box>
      </Box>
    </>
  );

  return (
    <Container
      maxWidth={"xl"}
      sx={{
        mt: 15,
        mb: 15,
      }}
    >
      {productLoading && renderSkeleton}

      {productError && renderError}

      {product && renderProduct}
      <Box
        sx={{
          scrollSnapAlign: "start",
          position: "relative",
          bgcolor: "background.default",
        }}
      >
        <WishlistProductShowcase 
      title="My Wishlist"
      layout="price-bottom"
      showAddToCart
    />
        <HomeProductShowcase priceBottom title="Related Products" />
      </Box>
    </Container>
  );
}
