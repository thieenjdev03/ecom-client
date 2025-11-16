"use client";

import { useState, useEffect, useCallback } from "react";
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
import { PRODUCT_PUBLISH_OPTIONS } from "src/_mock";

import { useTranslate } from "src/locales";

import Iconify from "src/components/iconify";
import EmptyContent from "src/components/empty-content";
import { useSettingsContext } from "src/components/settings";

import { ProductDetailsSkeleton } from "../product-skeleton";
import ProductDetailsReview from "../product-details-review";
import ProductDetailsSummary from "../product-details-summary";
import ProductDetailsToolbar from "../product-details-toolbar";
import ProductDetailsCarousel from "../product-details-carousel";
import ProductDetailsDescription from "../product-details-description";
import HomeProductShowcase from "src/sections/landing-page/home-product-showcase";

// ----------------------------------------------------------------------

const SUMMARY = [
  {
    title: "100% Original",
    description: "Chocolate bar candy canes ice cream toffee cookie halvah.",
    icon: "solar:verified-check-bold",
  },
  {
    title: "10 Day Replacement",
    description: "Marshmallow biscuit donut dragée fruitcake wafer.",
    icon: "solar:clock-circle-bold",
  },
  {
    title: "Year Warranty",
    description: "Cotton candy gingerbread cake I love sugar sweet.",
    icon: "solar:shield-check-bold",
  },
];

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function ProductDetailsView({ id }: Props) {
  const { product, productLoading, productError } = useGetProduct(id);
  console.log("product", product);
  const settings = useSettingsContext();
  const { t } = useTranslate();

  const [currentTab, setCurrentTab] = useState("description");
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantDto | null>(null);

  const [publish, setPublish] = useState("");

  useEffect(() => {
    if (product) {
      setPublish(product?.publish);
    }
  }, [product]);

  const handleChangePublish = useCallback((newValue: string) => {
    setPublish(newValue);
  }, []);

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
          href={paths.dashboard.product.root}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
          sx={{ mt: 3 }}
        >
          Back to List
        </Button>
      }
      sx={{ py: 10 }}
    />
  );

  const renderProduct = product && (
    <>
      <ProductDetailsToolbar
        backLink={paths.dashboard.product.root}
        editLink={paths.dashboard.product.edit(`${product?.id}`)}
        liveLink={paths.product.details(`${product?.id}`)}
        publish={publish || ""}
        onChangePublish={handleChangePublish}
        publishOptions={PRODUCT_PUBLISH_OPTIONS}
      />

      <Grid container spacing={{ xs: 3, md: 5, lg: 8 }}>
        <Grid xs={12} md={6} lg={7}>
          <ProductDetailsCarousel product={product} selectedVariant={selectedVariant} />
        </Grid>

        <Grid xs={12} md={6} lg={5}>
          <ProductDetailsSummary 
            disabledActions 
            product={product} 
            onVariantChange={setSelectedVariant}
          />

          {/* Quick product info aligned with backend fields */}
          <Card sx={{ mt: 3, p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700 }}>
              {t("productForm.productMeta")}
            </Typography>
            <Box sx={{ display: 'grid', rowGap: 1, columnGap: 2, gridTemplateColumns: 'auto 1fr' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{t("productDetails.sku")}</Typography>
              <Typography variant="body2">{product.sku || '-'}</Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{t("productForm.category")}</Typography>
              <Typography variant="body2">{product.category || '-'}</Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{t("productForm.stockQuantity")}</Typography>
              <Typography variant="body2">{product.quantity ?? 0}</Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{t("productForm.status")}</Typography>
              <Typography variant="body2">{product.inventoryType}</Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Tags</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(product.tags || []).length ? (
                  product.tags.map((t) => (
                    <Box key={t} sx={{ px: 1, py: 0.25, borderRadius: 1, bgcolor: 'background.neutral', fontSize: 12 }}>
                      {t}
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2">-</Typography>
                )}
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Box
        gap={5}
        display="grid"
        gridTemplateColumns={{
          xs: "repeat(1, 1fr)",
          md: "repeat(3, 1fr)",
        }}
        sx={{ my: 10 }}
      >
      </Box>

      {/* <Card>
        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          sx={{
            px: 3,
            boxShadow: (theme) =>
              `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
          }}
        >
          {[
            {
              value: "description",
              label: "Description",
            },
            {
              value: "reviews",
              label: `Reviews (${product.reviews.length})`,
            },
          ].map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>

        {currentTab === "description" && (
          <ProductDetailsDescription description={product?.description} />
        )}

        {currentTab === "reviews" && (
          <ProductDetailsReview
            ratings={product.ratings}
            reviews={product.reviews}
            totalRatings={product.totalRatings}
            totalReviews={product.totalReviews}
          />
        )}
      </Card> */}
    </>
  );

  return (
    <Container maxWidth={settings.themeStretch ? "lg" : "xl"}>
      {productLoading && renderSkeleton}

      {productError && renderError}

      {product && renderProduct}
    </Container>
  );
}
