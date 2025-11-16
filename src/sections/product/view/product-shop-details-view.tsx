"use client";

import { useState, useCallback } from "react";
import { ProductVariantDto } from "src/types/product-dto";

import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import { alpha } from "@mui/material/styles";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import { useGetProduct } from "src/api/product";

import { useTranslate } from "src/locales";

import Iconify from "src/components/iconify";
import EmptyContent from "src/components/empty-content";
import { useSettingsContext } from "src/components/settings";
import CustomBreadcrumbs from "src/components/custom-breadcrumbs";

import { useCheckoutContext } from "../../checkout/context";
import ProductDetailsReview from "../product-details-review";
import { ProductDetailsSkeleton } from "../product-skeleton";
import ProductDetailsSummary from "../product-details-summary";
import ProductDetailsCarousel from "../product-details-carousel";
import ProductDetailsDescription from "../product-details-description";
import HomeProductShowcase from "src/sections/landing-page/home-product-showcase";

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function ProductShopDetailsView({ id }: Props) {
  const settings = useSettingsContext();
  const { t } = useTranslate();

  const checkout = useCheckoutContext();

  const [currentTab, setCurrentTab] = useState("description");
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantDto | null>(null);

  // ------------------------------------------------------------------
  // Get locale from i18n for multi-language support
  const { i18n } = useTranslate();
  const currentLocale = i18n.language || "en";

  // Use real API data instead of mockup
  const { product, productLoading, productError } = useGetProduct(id, currentLocale);
  const handleChangeTab = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      setCurrentTab(newValue);
    },
    [],
  );

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
      <Grid container spacing={{ xs: 3, md: 5, lg: 8 }}>
        <Grid xs={12} md={8} lg={8}>
          <ProductDetailsCarousel product={product} selectedVariant={selectedVariant} />
        </Grid>

        <Grid xs={12} md={4} lg={4}>
          <ProductDetailsSummary
            product={product}
            items={checkout.items}
            onAddCart={checkout.onAddToCart}
            onGotoStep={checkout.onGotoStep}
            onVariantChange={setSelectedVariant}
          />
        </Grid>
      </Grid>
    </>
  );

  return (
    <Container
      maxWidth={"lg"}
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
        <HomeProductShowcase priceBottom />
      </Box>
    </Container>
  );
}
