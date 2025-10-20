"use client";

import { notFound } from "next/navigation";
import orderBy from "lodash/orderBy";
import isEqual from "lodash/isEqual";
import { useState, useCallback } from "react";

import { Typography, Box, Grid, Card, CardContent, Chip, Stack, Container } from "@mui/material";
import { RouterLink } from "src/routes/components";
import { paths } from "src/routes/paths";
import { useGetCategories } from "src/api/reference";
import { useGetProducts } from "src/api/product";

import { useBoolean } from "src/hooks/use-boolean";
import { useDebounce } from "src/hooks/use-debounce";
import { useSettingsContext } from "src/components/settings";
import { useCheckoutContext } from "src/sections/checkout/context";

import {
  PRODUCT_SORT_OPTIONS,
  PRODUCT_COLOR_OPTIONS,
  PRODUCT_GENDER_OPTIONS,
  PRODUCT_RATING_OPTIONS,
  PRODUCT_CATEGORY_OPTIONS,
} from "src/_mock";

import EmptyContent from "src/components/empty-content";
import ProductList from "src/sections/product/product-list";
import ProductSort from "src/sections/product/product-sort";
import CartIcon from "src/sections/product/common/cart-icon";
import ProductSearch from "src/sections/product/product-search";
import ProductFilters from "src/sections/product/product-filters";
import ProductFiltersResult from "src/sections/product/product-filters-result";

import {
  IProductItem,
  IProductFilters,
  IProductFilterValue,
} from "src/types/product";

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
  const settings = useSettingsContext();
  const checkout = useCheckoutContext();
  const openFilters = useBoolean();

  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery);
  const [filters, setFilters] = useState(defaultFilters);
  const { categories, categoriesLoading, categoriesError } = useGetCategories();
  const { products, productsLoading, productsError } = useGetProducts();

  // Filter handlers - moved before early returns
  const handleFilters = useCallback(
    (name: string, value: IProductFilterValue) => {
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [],
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleSortBy = useCallback((newValue: string) => {
    setSortBy(newValue);
  }, []);

  const handleSearch = useCallback((inputValue: string) => {
    setSearchQuery(inputValue);
  }, []);

  // Early returns after all hooks
  if (categoriesLoading || productsLoading) {
    return <div>Loading...</div>;
  }

  if (categoriesError || productsError) {
    return <div>Error loading data</div>;
  }

  // Find category by slug
  const category = categories.find((cat: any) => cat.slug === slug);

  if (!category) {
    return <div>Category not found</div>;
  }

  // Filter products by category
  const categoryProducts = products.filter((product: IProductItem) => 
    product.category === category.name || 
    product.category === category.slug ||
    product.category?.toLowerCase().includes(category.name.toLowerCase())
  );

  // Search functionality
  const searchResults = debouncedQuery
    ? categoryProducts.filter((p) =>
        p.name.toLowerCase().includes(debouncedQuery.toLowerCase()),
      )
    : [];

  // Apply filters to products
  const dataFiltered = applyFilter({
    inputData: categoryProducts,
    filters,
    sortBy,
  });

  const canReset = !isEqual(defaultFilters, filters);
  const notFound = !dataFiltered.length && canReset;
  const productsEmpty = categoryProducts.length === 0;

  // Render filters
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
        loading={false}
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
      results={dataFiltered.length}
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
      <CartIcon totalItems={checkout.totalItems} />

      {/* Category Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h4">
          {category.name}
        </Typography>
        <Chip
          label={category.slug}
          variant="outlined"
          color="primary"
        />
      </Stack>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {categoryProducts.length} sản phẩm trong danh mục này
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

      <ProductList products={dataFiltered} loading={productsLoading} />
    </Container>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  filters,
  sortBy,
}: {
  inputData: IProductItem[];
  filters: IProductFilters;
  sortBy: string;
}) {
  const { gender, category, colors, priceRange, rating } = filters;

  const min = priceRange[0];
  const max = priceRange[1];

  // SORT BY
  if (sortBy === "featured") {
    inputData = orderBy(inputData, ["totalSold"], ["desc"]);
  }

  if (sortBy === "newest") {
    inputData = orderBy(inputData, ["createdAt"], ["desc"]);
  }

  if (sortBy === "priceDesc") {
    inputData = orderBy(inputData, ["price"], ["desc"]);
  }

  if (sortBy === "priceAsc") {
    inputData = orderBy(inputData, ["price"], ["asc"]);
  }

  // FILTERS
  if (gender.length) {
    inputData = inputData.filter((product) => gender.includes(product.gender));
  }

  if (category !== "all") {
    inputData = inputData.filter((product) => product.category === category);
  }

  if (colors.length) {
    inputData = inputData.filter((product) =>
      product.colors.some((color) => colors.includes(color)),
    );
  }

  if (min !== 0 || max !== 200) {
    inputData = inputData.filter(
      (product) => product.price >= min && product.price <= max,
    );
  }

  if (rating) {
    inputData = inputData.filter((product) => {
      const convertRating = (value: string) => {
        if (value === "up4Star") return 4;
        if (value === "up3Star") return 3;
        if (value === "up2Star") return 2;
        return 1;
      };
      return product.totalRatings > convertRating(rating);
    });
  }

  return inputData;
}
