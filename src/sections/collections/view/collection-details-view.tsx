"use client";

import isEqual from "lodash/isEqual";
import { useState, useCallback, useMemo, useEffect } from "react";

import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Pagination from "@mui/material/Pagination";
import Box from "@mui/material/Box";

import { paths } from "src/routes/paths";

import { useBoolean } from "src/hooks/use-boolean";
import { useDebounce } from "src/hooks/use-debounce";
import { useGetCollectionBySlug } from "src/api/reference";
import { useGetProducts, ProductQueryParams } from "src/api/product";

import {
  PRODUCT_SORT_OPTIONS,
  PRODUCT_COLOR_OPTIONS,
} from "src/_mock";

import EmptyContent from "src/components/empty-content";
import { useSettingsContext } from "src/components/settings";
import CustomBreadcrumbs from "src/components/custom-breadcrumbs";
import { LoadingScreen } from "src/components/loading-screen";
import { useTranslate } from "src/locales";

import {
  IProductFilters,
  IProductFilterValue,
} from "src/types/product";

import ProductList from "src/sections/product/product-list";
import ProductFiltersResult from "src/sections/product/product-filters-result";
import ProductSortFilterAccordion from "src/sections/product/product-sort-filter-accordion";

// ----------------------------------------------------------------------

const defaultFilters: IProductFilters = {
  gender: [],
  colors: [],
  rating: "",
  category: "all",
  priceRange: [0, 200],
};

// ----------------------------------------------------------------------

interface CollectionDetailsViewProps {
  slug: string;
}

export default function CollectionDetailsView({ slug }: CollectionDetailsViewProps) {
  const { t } = useTranslate();
  const settings = useSettingsContext();

  const openSortFilter = useBoolean();

  const [sortBy, setSortBy] = useState("priceAsc");

  const [searchQuery] = useState("");

  const debouncedQuery = useDebounce(searchQuery);

  const [filters, setFilters] = useState(defaultFilters);

  const [page, setPage] = useState(1);

  const limit = 20;

  // Fetch collection by slug
  const { collection, collectionLoading, collectionError } = useGetCollectionBySlug(slug);

  // Convert sortBy UI value to API sort_by and sort_order
  const getApiSort = useCallback((sortValue: string) => {
    const sortMap: Record<string, { sort_by: "created_at" | "updated_at" | "name" | "price" | "status"; sort_order: "ASC" | "DESC" }> = {
      priceAsc: { sort_by: "price", sort_order: "ASC" },
      priceDesc: { sort_by: "price", sort_order: "DESC" },
      bestSelling: { sort_by: "created_at", sort_order: "DESC" }, // Fallback to newest for best selling
      newest: { sort_by: "created_at", sort_order: "DESC" },
      oldest: { sort_by: "created_at", sort_order: "ASC" },
    };
    return sortMap[sortValue] || sortMap.priceAsc;
  }, []);

  // Get locale from i18n
  const getLocale = useCallback(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("i18nextLng");
      return stored || "en";
    }
    return "en";
  }, []);

  // Build query parameters for API (only API-supported filters)
  const queryParams = useMemo((): ProductQueryParams | null => {
    // Don't create params until collection is loaded
    if (!collection?.id) return null;

    const sortConfig = getApiSort(sortBy);

    const params: ProductQueryParams = {
      page,
      limit,
      locale: getLocale(),
      status: "active",
      collection_id: collection.id,
      sort_by: sortConfig.sort_by,
      sort_order: sortConfig.sort_order,
    };

    // Add search query
    if (debouncedQuery) {
      params.search = debouncedQuery;
    }

    return params;
  }, [page, limit, debouncedQuery, sortBy, getApiSort, getLocale, collection?.id]);

  // Fetch products with API-supported filters and pagination
  const { products: apiProducts, productsLoading, productsEmpty, meta } = useGetProducts(
    queryParams || undefined
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [sortBy, debouncedQuery]);

  // Apply client-side filters for filters not supported by API
  const products = useMemo(() => {
    let filtered = [...apiProducts];

    // Filter by gender
    if (filters.gender && filters.gender.length > 0) {
      filtered = filtered.filter((product) =>
        filters.gender.includes(product.gender),
      );
    }

    // Filter by colors
    if (filters.colors && filters.colors.length > 0) {
      filtered = filtered.filter((product) =>
        product.colors.some((color) => filters.colors.includes(color)),
      );
    }

    // Filter by price range
    const [min, max] = filters.priceRange;
    if (min !== 0 || max !== 200) {
      filtered = filtered.filter(
        (product) => product.price >= min && product.price <= max,
      );
    }

    // Filter by rating
    if (filters.rating) {
      const convertRating = (value: string) => {
        if (value === "up4Star") return 4;
        if (value === "up3Star") return 3;
        if (value === "up2Star") return 2;
        return 1;
      };
      const minRating = convertRating(filters.rating);
      filtered = filtered.filter((product) => product.totalRatings > minRating);
    }

    return filtered;
  }, [apiProducts, filters]);

  const handleFilters = useCallback(
    (name: string, value: IProductFilterValue) => {
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
      // Reset to page 1 when filters change
      setPage(1);
    },
    [],
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setPage(1);
  }, []);

  const canReset = !isEqual(defaultFilters, filters);

  // Note: notFound logic needs to account for client-side filtering
  const notFound = (productsEmpty || products.length === 0) && canReset;

  const handleSortBy = useCallback((newValue: string) => {
    setSortBy(newValue);
    setPage(1); // Reset to page 1 when sort changes
  }, []);

  const handlePageChange = useCallback((event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Calculate total pages based on API meta
  const totalPages = meta?.totalPages || 1;

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
          title={t("collections.errorLoading") || "Error loading collection"}
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
          title={t("collections.notFound") || "Collection not found"}
          description={t("collections.notFoundDescription") || "The collection you are looking for does not exist."}
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
          title={t("collections.unavailable") || "Collection unavailable"}
          description={t("collections.unavailableDescription") || "This collection is currently not available."}
        />
      </Container>
    );
  }

  // Total products count
  const totalProducts = meta?.total || products.length;

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
          variant="body1"
          sx={{
            color: "common.white",
            fontWeight: 500,
            fontSize: { xs: "14px", sm: "16px" },
            letterSpacing: "1px",
            textTransform: "uppercase",
            opacity: 0.9,
            mb: 2,
          }}
        >
          {totalProducts} {totalProducts === 1 ? t("shop.product") : t("shop.productsCount")}
        </Typography>

        {/* Breadcrumbs inside hero */}
        <CustomBreadcrumbs
          links={[
            { name: t("header.home"), href: "/" },
            { name: t("collections.title") || "Collections", href: paths.collections.root },
            { name: collection?.name || "" },
          ]}
          sx={{
            "& .MuiBreadcrumbs-ol": {
              justifyContent: "center",
            },
            "& .MuiLink-root, & .MuiTypography-root": {
              color: "common.white",
              opacity: 0.85,
              fontSize: "13px",
            },
            "& .MuiBreadcrumbs-separator": {
              color: "common.white",
              opacity: 0.6,
            },
          }}
        />
      </Box>
    </Box>
  );

  const renderFilters = (
    <ProductSortFilterAccordion
      open={openSortFilter.value}
      onToggle={openSortFilter.onToggle}
      sort={sortBy}
      onSort={handleSortBy}
      sortOptions={PRODUCT_SORT_OPTIONS}
      filters={filters}
      onFilters={handleFilters}
      colorOptions={PRODUCT_COLOR_OPTIONS}
      canReset={canReset}
      onResetFilters={handleResetFilters}
    />
  );

  const renderResults = (
    <ProductFiltersResult
      filters={filters}
      onFilters={handleFilters}
      canReset={canReset}
      onResetFilters={handleResetFilters}
      results={meta?.total || products.length}
    />
  );

  const renderNotFound = (
    <EmptyContent filled title={t("common.noData") || "No Data"} sx={{ py: 10 }} />
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
        {/* Filter & Sort Bar */}
        <Stack
          spacing={2.5}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        >
          {renderFilters}

          {canReset && renderResults}
        </Stack>

        {(notFound || productsEmpty) && renderNotFound}

        <ProductList products={products} loading={productsLoading} />

        {/* Pagination */}
        {!productsEmpty && totalPages > 1 && (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={2}
            sx={{ mt: 6, mb: 2 }}
          >
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
              siblingCount={1}
              boundaryCount={1}
              sx={{
                "& .MuiPaginationItem-root": {
                  "&.Mui-selected": {
                    fontWeight: 700,
                  },
                },
              }}
            />
          </Stack>
        )}

        {/* Pagination Info */}
        {!productsEmpty && meta && (
          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              color: "text.secondary",
              mb: 4,
            }}
          >
            {t("common.showingResults") || "Showing"} {((page - 1) * limit) + 1}-{Math.min(page * limit, meta.total || 0)} {t("common.of") || "of"} {meta.total || 0} {t("shop.productsCount") || "products"}
          </Typography>
        )}
      </Container>
    </>
  );
}
