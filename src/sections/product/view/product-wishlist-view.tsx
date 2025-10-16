"use client";

import orderBy from "lodash/orderBy";
import isEqual from "lodash/isEqual";
import { useState, useCallback } from "react";

import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import { useBoolean } from "src/hooks/use-boolean";
import { useDebounce } from "src/hooks/use-debounce";

// Using local sample data for styling instead of API hooks
import {
  PRODUCT_SORT_OPTIONS,
  PRODUCT_COLOR_OPTIONS,
  PRODUCT_GENDER_OPTIONS,
  PRODUCT_RATING_OPTIONS,
  PRODUCT_CATEGORY_OPTIONS,
} from "src/_mock";
import { SAMPLE_PRODUCTS } from "src/_mock/_product-items";

import Iconify from "src/components/iconify";
import EmptyContent from "src/components/empty-content";
import { useSettingsContext } from "src/components/settings";

import {
  IProductItem,
  IProductFilters,
  IProductFilterValue,
} from "src/types/product";

import ProductList from "../product-list";
import ProductSort from "../product-sort";
import CartIcon from "../common/cart-icon";
import ProductSearch from "../product-search";
import ProductFilters from "../product-filters";
import { useCheckoutContext } from "../../checkout/context";
import { useWishlistContext } from "../../wishlist/context";
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

export default function ProductWishlistView() {
  const settings = useSettingsContext();

  const checkout = useCheckoutContext();
  const wishlist = useWishlistContext();

  const openFilters = useBoolean();

  const [sortBy, setSortBy] = useState("featured");

  const [searchQuery, setSearchQuery] = useState("");

  const debouncedQuery = useDebounce(searchQuery);

  const [filters, setFilters] = useState(defaultFilters);

  // ------------------------------------------------------------------
  // Use actual wishlist data from context
  const wishlistProducts = wishlist.items;
  const productsLoading = false;
  const productsEmpty = wishlistProducts.length === 0;

  const searchResults = debouncedQuery
    ? wishlistProducts.filter((p) =>
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
    },
    [],
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const dataFiltered = applyFilter({
    inputData: wishlistProducts,
    filters,
    sortBy,
  });

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = !dataFiltered.length && canReset;

  const handleSortBy = useCallback((newValue: string) => {
    setSortBy(newValue);
  }, []);

  const handleSearch = useCallback((inputValue: string) => {
    setSearchQuery(inputValue);
  }, []);

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
      results={dataFiltered.length}
    />
  );

  const renderEmptyWishlist = (
    <EmptyContent
      filled
      title="Your wishlist is empty"
      description="Add items to your wishlist to see them here"
      action={
        <Button
          component={RouterLink}
          href={paths.product.root}
          variant="contained"
          startIcon={<Iconify icon="solar:shopping-bag-bold" />}
          sx={{ mt: 3 }}
        >
          Continue Shopping
        </Button>
      }
      sx={{ py: 10 }}
    />
  );

  const renderNotFound = (
    <EmptyContent filled title="No items found" sx={{ py: 10 }} />
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

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          my: { xs: 3, md: 5 },
        }}
      >
        <Typography variant="h4">My Wishlist</Typography>
        
        <Button
          component={RouterLink}
          href={paths.product.root}
          variant="outlined"
          startIcon={<Iconify icon="solar:arrow-left-bold" />}
        >
          Back to Shop
        </Button>
      </Stack>

      <Stack
        spacing={2.5}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        {renderFilters}

        {canReset && renderResults}
      </Stack>

      {productsEmpty && renderEmptyWishlist}

      {(notFound && !productsEmpty) && renderNotFound}

      {!productsEmpty && <ProductList products={dataFiltered} loading={productsLoading} />}
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
