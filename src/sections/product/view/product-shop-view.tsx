"use client";

import isEqual from "lodash/isEqual";
import { useState, useCallback, useMemo } from "react";

import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Pagination from "@mui/material/Pagination";
import Box from "@mui/material/Box";

import { paths } from "src/routes/paths";

import { useBoolean } from "src/hooks/use-boolean";
import { useDebounce } from "src/hooks/use-debounce";
import { useGetProducts } from "src/api/product";

import {
  PRODUCT_SORT_OPTIONS,
  PRODUCT_COLOR_OPTIONS,
  PRODUCT_GENDER_OPTIONS,
  PRODUCT_RATING_OPTIONS,
  PRODUCT_CATEGORY_OPTIONS,
} from "src/_mock";

import EmptyContent from "src/components/empty-content";
import { useSettingsContext } from "src/components/settings";

import {
  IProductFilters,
  IProductFilterValue,
} from "src/types/product";

import ProductList from "../product-list";
import ProductSort from "../product-sort";
import ProductSearch from "../product-search";
import ProductFilters from "../product-filters";
import ProductFiltersResult from "../product-filters-result";

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
  const settings = useSettingsContext();

  const openFilters = useBoolean();

  const [sortBy, setSortBy] = useState("featured");

  const [searchQuery, setSearchQuery] = useState("");

  const debouncedQuery = useDebounce(searchQuery);

  const [filters, setFilters] = useState(defaultFilters);

  const [page, setPage] = useState(1);

  const limit = 20;

  // Convert sortBy UI value to API sort_by and sort_order
  const getApiSort = useCallback((sortValue: string) => {
    const sortMap: Record<string, { sort_by: "created_at" | "updated_at" | "name" | "price" | "status"; sort_order: "ASC" | "DESC" }> = {
      featured: { sort_by: "created_at", sort_order: "DESC" }, // Featured products - using created_at DESC as fallback
      newest: { sort_by: "created_at", sort_order: "DESC" },
      priceDesc: { sort_by: "price", sort_order: "DESC" },
      priceAsc: { sort_by: "price", sort_order: "ASC" },
    };
    return sortMap[sortValue] || sortMap.featured;
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

    // Add category filter (if category is provided and not "all")
    // Note: API uses category_id (UUID), but UI uses category name/slug
    // For now, we'll pass it as-is and let backend handle the mapping
    // TODO: Convert category name/slug to category_id if needed
    if (filters.category && filters.category !== "all") {
      // Assuming category could be ID or slug - backend should handle both
      params.category_id = filters.category;
    }

    // Client-side filters (not sent to API, will filter after fetch)
    // These are stored in params but not sent to API
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

  // Search results for autocomplete (client-side filtering for quick results)
  const searchResults = debouncedQuery
    ? products.filter((p) =>
        p.name.toLowerCase().includes(debouncedQuery.toLowerCase()),
      )
    : [];
  const searchLoading = false;

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
  // If API returns empty, or if client-side filtering results in empty
  const notFound = (productsEmpty || products.length === 0) && canReset;

  const handleSortBy = useCallback((newValue: string) => {
    setSortBy(newValue);
    setPage(1); // Reset to page 1 when sort changes
  }, []);

  const handleSearch = useCallback((inputValue: string) => {
    setSearchQuery(inputValue);
    setPage(1); // Reset to page 1 when search changes
  }, []);

  const handlePageChange = useCallback((event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Calculate total pages based on client-side filtered results
  // Since we're doing client-side filtering, pagination might not be accurate
  // For better UX, we could fetch more items and paginate client-side
  // Or implement server-side filtering for all filters
  const totalPages = meta?.totalPages || 1;

  const renderFilters = (
    <Stack
      spacing={3}
      justifyContent="space-between"
      alignItems={{ xs: "flex-end", sm: "center" }}
      direction={{ xs: "column", sm: "row" }}
    >
      <ProductSearch
        query={debouncedQuery}
        results={searchResults}
        onSearch={handleSearch}
        loading={searchLoading}
        hrefItem={(id: string) => paths.product.details(id)}
      />

      <Stack direction="row" spacing={1} flexShrink={0}>
        <ProductFilters
          open={openFilters.value}
          onOpen={openFilters.onTrue}
          onClose={openFilters.onFalse}
          //
          filters={filters}
          onFilters={handleFilters}
          //
          canReset={canReset}
          onResetFilters={handleResetFilters}
          //
          colorOptions={PRODUCT_COLOR_OPTIONS}
          ratingOptions={PRODUCT_RATING_OPTIONS}
          genderOptions={PRODUCT_GENDER_OPTIONS}
          categoryOptions={["all", ...PRODUCT_CATEGORY_OPTIONS]}
        />

        <ProductSort
          sort={sortBy}
          onSort={handleSortBy}
          sortOptions={PRODUCT_SORT_OPTIONS}
        />
      </Stack>
    </Stack>
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
      <Typography
        variant="h4"
        sx={{
          my: { xs: 3, md: 5 },
        }}
      >
        Categories of Products
      </Typography>

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

      {!productsEmpty && totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 5,
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Container>
  );
}

