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
import { useGetCategories } from "src/api/reference";
import { useGetProducts } from "src/api/product";

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

interface CategoryDetailsViewProps {
  slug: string;
}

export default function CategoryDetailsView({ slug }: CategoryDetailsViewProps) {
  const { t } = useTranslate();
  const settings = useSettingsContext();

  const openSortFilter = useBoolean();

  const [sortBy, setSortBy] = useState("priceAsc");

  const [searchQuery] = useState("");

  const debouncedQuery = useDebounce(searchQuery);

  const [filters, setFilters] = useState(defaultFilters);

  const [page, setPage] = useState(1);

  const limit = 20;

  // Get categories to find category by slug
  const { categories, categoriesLoading, categoriesError } = useGetCategories();

  // Find category by slug
  const category = useMemo(() => {
    if (!categories || categories.length === 0) return null;
    return categories.find((cat: any) => cat.slug === slug) || null;
  }, [categories, slug]);

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
  const queryParams = useMemo(() => {
    const params: any = {
      page,
      limit,
      locale: getLocale(),
      status: "active", // Only show active products
    };

    // Add category_id if category is found
    if (category?.id) {
      params.category_id = category.id;
    }

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
  }, [page, limit, debouncedQuery, sortBy, filters, getApiSort, getLocale, category]);

  // Fetch products with API-supported filters and pagination
  const { products: apiProducts, productsLoading, productsEmpty, meta } = useGetProducts({
    page: queryParams.page,
    limit: queryParams.limit,
    locale: queryParams.locale,
    status: queryParams.status,
    search: queryParams.search,
    sort_by: queryParams.sort_by,
    sort_order: queryParams.sort_order,
    category_id: queryParams.category_id,
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

  // Loading state
  if (categoriesLoading) {
    return <LoadingScreen />;
  }

  // Error state
  if (categoriesError) {
    return (
      <Container sx={{ py: 4 }}>
        <EmptyContent
          filled
          title={t("categories.categoryDetails.errorLoading")}
          description={categoriesError?.message || ""}
        />
      </Container>
    );
  }

  // Category not found
  if (!category) {
    return (
      <Container sx={{ py: 2 }}>
        <EmptyContent
          filled
          title={t("categories.categoryDetails.notFound")}
          description=""
        />
      </Container>
    );
  }

  // Total products count
  const totalProducts = meta?.total || products.length;

  const renderHero = (
    <Box
      sx={{
        textAlign: "center",
        mb: 4,
        py: 2,
      }}
    >
      <Typography
        variant="h2"
        sx={{
          fontWeight: 700,
          fontSize: { xs: "16px", sm: "20px", md: "24px" },
          letterSpacing: "2px",
          textTransform: "uppercase",
          mb: 1,
        }}
      >
        {category?.name}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          fontWeight: 500,
          fontSize: { xs: "10px", sm: "12px" },
          letterSpacing: "1px",
          textTransform: "uppercase",
          opacity: 0.7,
          mb: 2,
        }}
      >
        {totalProducts} {totalProducts === 1 ? t("shop.product") : t("shop.productsCount")}
      </Typography>

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
    <EmptyContent filled title="No Data" sx={{ py: 10 }} />
  );

  return (
    <Container
      maxWidth={settings.themeStretch ? false : "lg"}
      sx={{
        mb: 15,
        mt: "80px",
      }}
    >
      {/* Hero Image with Category Name and Breadcrumbs */}
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
