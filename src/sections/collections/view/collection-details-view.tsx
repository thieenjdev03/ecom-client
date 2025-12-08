"use client";

import { useState, useCallback, useMemo } from "react";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

import {
  useGetCollectionBySlug,
  useGetCollectionProducts,
} from "src/api/reference";

import EmptyContent from "src/components/empty-content";
import { useSettingsContext } from "src/components/settings";
import { LoadingScreen } from "src/components/loading-screen";
import Iconify from "src/components/iconify";

import ProductList from "src/sections/product/product-list";

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

interface CollectionDetailsViewProps {
  slug: string;
}

export default function CollectionDetailsView({ slug }: CollectionDetailsViewProps) {
  const settings = useSettingsContext();

  // Fetch collection by slug
  const { collection, collectionLoading, collectionError } = useGetCollectionBySlug(slug);

  // State for cursor-based pagination
  const [cursors, setCursors] = useState<string[]>([]);
  const currentCursor = cursors.length > 0 ? cursors[cursors.length - 1] : undefined;

  // Fetch products in collection
  const {
    products,
    meta,
    productsLoading,
    productsError,
  } = useGetCollectionProducts(collection?.id || "", 20, currentCursor);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (meta?.next_cursor) {
      setCursors((prev) => [...prev, meta.next_cursor]);
    }
  }, [meta?.next_cursor]);

  // Accumulated products for infinite scroll effect
  const [accumulatedProducts, setAccumulatedProducts] = useState<any[]>([]);

  // Update accumulated products when new products are fetched
  useMemo(() => {
    if (products && products.length > 0) {
      if (cursors.length === 0) {
        // First page - replace all
        setAccumulatedProducts(products);
      } else {
        // Subsequent pages - append
        setAccumulatedProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newProducts = products.filter((p: any) => !existingIds.has(p.id));
          return [...prev, ...newProducts];
        });
      }
    }
  }, [products, cursors.length]);

  // Loading state
  if (collectionLoading) {
    return <LoadingScreen />;
  }

  // Error state
  if (collectionError) {
    return (
      <Container sx={{ py: 4 }}>
        <EmptyContent
          filled
          title="Error loading collection"
          description={collectionError?.message || ""}
        />
      </Container>
    );
  }

  // Collection not found
  if (!collection) {
    return (
      <Container sx={{ py: 2 }}>
        <EmptyContent
          filled
          title="Collection not found"
          description="The collection you are looking for does not exist."
        />
      </Container>
    );
  }

  // Check if collection is active
  if (!collection.is_active) {
    return (
      <Container sx={{ py: 2 }}>
        <EmptyContent
          filled
          title="Collection unavailable"
          description="This collection is currently not available."
        />
      </Container>
    );
  }

  // Check if collection has a valid banner image
  const hasBannerImage = collection?.banner_image_url && collection.banner_image_url.trim() !== "";
  const bannerImageUrl = collection?.banner_image_url || "";

  const renderHero = (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "80vh",
        minHeight: { xs: 400, sm: 500, md: 600 },
        maxHeight: 900,
        overflow: "hidden",
        mb: 5,
        mt: "80px",
      }}
    >
      {/* Background - Show banner image or gradient fallback */}
      {hasBannerImage ? (
        <>
          {/* Banner Image */}
          <Box
            component="img"
            src={bannerImageUrl}
            alt={collection?.name || "Collection"}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
          {/* Subtle gradient overlay at bottom for text readability */}
          <Box
            sx={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: "40%",
              background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)",
            }}
          />
        </>
      ) : (
        <>
          {/* Gradient background fallback when no image */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
            }}
          />
        </>
      )}

      {/* Content - positioned at bottom */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          px: 3,
          pb: { xs: 4, sm: 5, md: 6 },
        }}
      >
        {/* Small label/tag above title */}
        {collection?.description && (
          <Typography
            variant="caption"
            sx={{
              color: "common.white",
              fontWeight: 400,
              fontSize: { xs: "11px", sm: "12px" },
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              opacity: 0.8,
              mb: 1,
            }}
          >
            {collection.description.length > 60 
              ? `${collection.description.substring(0, 60)}...` 
              : collection.description}
          </Typography>
        )}

        {/* Collection Name */}
        <Typography
          variant="h2"
          sx={{
            color: "common.white",
            fontWeight: 500,
            fontSize: { xs: "28px", sm: "36px", md: "42px" },
            letterSpacing: "2px",
            textTransform: "uppercase",
            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
            mb: 1,
          }}
        >
          {collection?.name}
        </Typography>

        {/* Product count */}
        <Typography
          variant="body2"
          sx={{
            color: "common.white",
            fontWeight: 400,
            fontSize: { xs: "12px", sm: "13px" },
            opacity: 0.75,
            letterSpacing: "0.5px",
          }}
        >
          {accumulatedProducts.length} {accumulatedProducts.length === 1 ? "product" : "products"}
        </Typography>
      </Box>
    </Box>
  );

  const renderProducts = (
    <>
      {productsError ? (
        <EmptyContent
          filled
          title="Error loading products"
          description={productsError?.message || ""}
          sx={{ py: 10 }}
        />
      ) : accumulatedProducts.length === 0 && !productsLoading ? (
        <EmptyContent
          filled
          title="No products"
          description="This collection doesn't have any products yet."
          sx={{ py: 10 }}
        />
      ) : (
        <>
          <ProductList products={accumulatedProducts} loading={productsLoading && cursors.length === 0} />

          {/* Load More Button */}
          {meta?.has_more && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 5,
              }}
            >
              <Button
                variant="outlined"
                size="large"
                onClick={handleLoadMore}
                disabled={productsLoading}
                startIcon={productsLoading ? <CircularProgress size={20} /> : <Iconify icon="eva:arrow-ios-downward-fill" />}
                sx={{
                  minWidth: 200,
                  borderRadius: 2,
                }}
              >
                {productsLoading ? "Loading..." : "Load More"}
              </Button>
            </Box>
          )}
        </>
      )}
    </>
  );

  return (
    <>
      {/* Hero Banner - Full width */}
      {renderHero}

      {/* Products Section */}
      <Container
        maxWidth={settings.themeStretch ? false : "lg"}
        sx={{
          mb: 15,
        }}
      >
        {renderProducts}
      </Container>
    </>
  );
}

