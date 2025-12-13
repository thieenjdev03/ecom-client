import Box, { BoxProps } from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Pagination, { paginationClasses } from "@mui/material/Pagination";

import { IProductItem } from "src/types/product";

import { useTranslate } from "src/locales";

import ProductItem from "./product-item";
import { ProductItemSkeleton } from "./product-skeleton";

// ----------------------------------------------------------------------

type Props = BoxProps & {
  products: IProductItem[];
  loading?: boolean;
  // Pagination props
  page?: number;
  totalPages?: number;
  total?: number;
  limit?: number;
  onPageChange?: (event: React.ChangeEvent<unknown>, value: number) => void;
};

export default function ProductList({
  products,
  loading,
  page = 1,
  totalPages = 1,
  total = 0,
  limit = 20,
  onPageChange,
  ...other
}: Props) {
  const { t } = useTranslate();
  const renderSkeleton = (
    <>
      {[...Array(16)].map((_, index) => (
        <ProductItemSkeleton key={index} />
      ))}
    </>
  );

  const renderList = (
    <>
      {products.map((product) => (
        <ProductItem key={product.id} product={product} />
      ))}
    </>
  );

  return (
    <>
      <Box
        gap={2}
        display="grid"
        gridTemplateColumns={{
          xs: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
        }}
        sx={{
          "& > *": {
            minHeight: "auto",
          },
        }}
        {...other}
      >
        {loading ? renderSkeleton : renderList}
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Stack
          direction="column"
          alignItems="center"
          spacing={2}
          sx={{ mt: 6, mb: 4 }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={onPageChange}
            showFirstButton
            showLastButton
            siblingCount={1}
            boundaryCount={1}
            sx={{
              mt: 8,
              [`& .${paginationClasses.ul}`]: {
                justifyContent: "center",
              },
            }}
          />

          {/* Pagination Info */}
          {total > 0 && (
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                textAlign: "center",
              }}
            >
              {t("common.showingResults") || "Showing"} {((page - 1) * limit) + 1}-{Math.min(page * limit, total)} {t("common.of") || "of"} {total} {t("shop.productsCount") || "products"}
            </Typography>
          )}
        </Stack>
      )}
    </>
  );
}
