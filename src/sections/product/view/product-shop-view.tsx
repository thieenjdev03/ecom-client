"use client";

import isEqual from "lodash/isEqual";
import { useState, useCallback, useMemo } from "react";

import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";

import { paths } from "src/routes/paths";

import { useBoolean } from "src/hooks/use-boolean";
import { useDebounce } from "src/hooks/use-debounce";
import { useGetProducts } from "src/api/product";

import {
  PRODUCT_SORT_OPTIONS,
  PRODUCT_COLOR_OPTIONS,
} from "src/_mock";

import EmptyContent from "src/components/empty-content";
import { useSettingsContext } from "src/components/settings";
import CustomBreadcrumbs from "src/components/custom-breadcrumbs";
import { useTranslate } from "src/locales";

import {
  IProductFilters,
  IProductFilterValue,
} from "src/types/product";

import ProductList from "../product-list";
import ProductFiltersResult from "../product-filters-result";
import ProductSortFilterAccordion from "../product-sort-filter-accordion";

// ----------------------------------------------------------------------

const defaultFilters: IProductFilters = {
  gender: [],
  colors: [],
  rating: "",
  category: "all",
  priceRange: [0, 200],
};

// ----------------------------------------------------------------------

export default function ProductShopView() {
  const { t } = useTranslate();
  const settings = useSettingsContext();

  const openSortFilter = useBoolean();

  const [sortBy, setSortBy] = useState("priceAsc");

  const [searchQuery] = useState("");

  const debouncedQuery = useDebounce(searchQuery);

  const [filters, setFilters] = useState(defaultFilters);

  const [page, setPage] = useState(1);

  const limit = 20;

  // Convert sortBy UI value to API sort_by and sort_order
  const getApiSort = useCallback((sortValue: string) => {
    const sortMap: Record<string, { sort_by: "created_at" | "updated_at" | "name" | "price" | "status"; sort_order: "ASC" | "DESC" }> = {
      priceAsc: { sort_by: "price", sort_order: "ASC" },
      priceDesc: { sort_by: "price", sort_order: "DESC" },
      bestSelling: { sort_by: "created_at", sort_order: "DESC" },
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
  const queryParams = useMemo(() => {
    const params: any = {
      page,
      limit,
      locale: getLocale(),
      status: "active", // Only show active products
    };

    // Add search query (API uses 'search' not 'query')
    if (debouncedQuery) {
      params.search = debouncedQuery;
    }

    // Add sort
    const sortConfig = getApiSort(sortBy);
    params.sort_by = sortConfig.sort_by;
    params.sort_order = sortConfig.sort_order;

    // Client-side filters (not sent to API, will filter after fetch)
    if (filters.gender && filters.gender.length > 0) {
      params.gender = filters.gender;
    }

    if (filters.colors && filters.colors.length > 0) {
      params.colors = filters.colors;
    }

    const [min, max] = filters.priceRange;
    if (min !== 0 || max !== 200) {
      params.price_min = min;
      params.price_max = max;
    }

    if (filters.rating) {
      params.rating = filters.rating;
    }

    return params;
  }, [page, limit, debouncedQuery, sortBy, filters, getApiSort, getLocale]);

  // Fetch products with API-supported filters and pagination
  const { products: apiProducts, productsLoading, productsEmpty, meta } = useGetProducts({
    page: queryParams.page,
    limit: queryParams.limit,
    locale: queryParams.locale,
    status: queryParams.status,
    search: queryParams.search,
    sort_by: queryParams.sort_by,
    sort_order: queryParams.sort_order,
  });

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

  // Total products count
  const totalProducts = meta?.total || products.length;

  // Hero image for shop page
  const heroImage = "/assets/background/overlay_4.jpg";

  const renderHero = (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: { xs: 280, sm: 360, md: 400 },
        overflow: "hidden",
        borderRadius: 2,
        mb: 4,
      }}
    >
      {/* Background gradient */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        }}
      />

      {/* Background Image with overlay */}
      <Box
        component="img"
        src={heroImage}
        alt="Shop"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          opacity: 0.3,
        }}
      />

      {/* Decorative elements */}
      <Box
        sx={{
          position: "absolute",
          top: "20%",
          right: "10%",
          width: 200,
          height: 200,
          borderRadius: "50%",
          bgcolor: alpha("#fff", 0.03),
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-20%",
          left: "5%",
          width: 150,
          height: 150,
          borderRadius: "50%",
          bgcolor: alpha("#fff", 0.02),
        }}
      />

      {/* Content */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          px: 2,
        }}
      >
        <Typography
          variant="h2"
          sx={{
            color: "common.white",
            fontWeight: 700,
            fontSize: { xs: "32px", sm: "40px", md: "48px" },
            letterSpacing: "2px",
            textTransform: "uppercase",
            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
            mb: 1,
          }}
        >
          {t("shop.title")}
        </Typography>

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
          {totalProducts} {t("shop.productsCount")}
        </Typography>

        {/* Breadcrumbs inside hero */}
        <CustomBreadcrumbs
          links={[
            { name: t("header.home"), href: "/" },
            { name: t("shop.title") },
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
      //
      canReset={canReset}
      onResetFilters={handleResetFilters}
      //
      results={meta?.total || products.length}
    />
  );

  const renderNotFound = (
    <EmptyContent filled title={t("shop.noProducts")} sx={{ py: 10 }} />
  );

  return (
    <Container
      maxWidth={settings.themeStretch ? false : "lg"}
      sx={{
        mb: 15,
        mt: "80px",
      }}
    >
      {/* Hero Image with Shop Title and Breadcrumbs */}
      {renderHero}

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

      <ProductList
        products={products}
        loading={productsLoading}
        page={page}
        totalPages={totalPages}
        total={meta?.total || 0}
        limit={limit}
        onPageChange={handlePageChange}
      />
    </Container>
  );
}
