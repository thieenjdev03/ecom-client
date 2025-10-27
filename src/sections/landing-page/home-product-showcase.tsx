import { useMemo } from "react";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";

import { useTheme } from "@mui/material/styles";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import Iconify from "src/components/iconify";
import Image from "src/components/image";
import Carousel, {
  useCarousel,
  CarouselDots,
  CarouselArrows,
} from "src/components/carousel";
import { fCurrency } from "src/utils/format-number";
import { useGetProducts } from "src/api/product";
import { IProductItem } from "src/types/product";

export default function HomeProductShowcase({
  priceBottom,
  layout,
}: {
  priceBottom?: boolean;
  layout?: "image-left" | "price-bottom";
}) {
  // Fetch real products from API
  const { products, productsLoading, productsError } = useGetProducts({
    page: 1,
    limit: 10,
  });

  const minimalProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    return products.map((product: IProductItem) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      priceSale: product.priceSale,
      image: product.coverUrl || product.images?.[0] || "/assets/placeholder.svg",
      isFeatured: product.isFeatured,
      isNew: product.is_new,
      isSale: product.is_sale,
      totalRatings: product.totalRatings,
      totalReviews: product.totalReviews,
      // Additional fields for better card display
      category: product.category,
      inStock: product.inventoryType !== "out_of_stock" && product.quantity > 0,
      discountPercent:
        product.priceSale && product.priceSale < product.price
          ? Math.round(((product.price - (product.priceSale || 0)) / product.price) * 100)
          : 0,
    }));
  }, [products]);

  const thumbnails = minimalProducts.map((p) => p.image);

  const carousel = useCarousel({
    dots: true,
    arrows: false,
    autoplay: false,
    slidesToShow:
      (layout ?? (priceBottom ? "price-bottom" : "image-left")) ===
      "price-bottom"
        ? 4
        : 2,
    appendDots: (dots: React.ReactNode) => (
      <Box
        component="div"
        sx={{
          display: "flex",
          justifyContent: "center",
          position: "static",
          "& ul": {
            m: 4,
            p: 0,
            display: "flex",
            alignItems: "center",
            gap: 1,
            listStyle: "none",
          },
          "& li": {
            width: { xs: 42, md: 42 },
            height: { xs: 42, md: 56 },
            aspectRatio: "3/4",
            opacity: 0.6,
            cursor: "pointer",
            transition: (theme) =>
              theme.transitions.create(["opacity", "transform"], {
                duration: 200,
              }),
            "&.slick-active": {
              opacity: 1,
              transform: "scale(1.03)",
            },
          },
        }}
      >
        {dots}
      </Box>
    ),
    customPaging: (index: number) => (
      <Box
        component="div"
        sx={{
          width: 1,
          height: 1,
          borderRadius: 1,
          overflow: "hidden",
          bgcolor: "background.neutral",
        }}
      >
        <Image
          src={thumbnails[index]}
          alt={`preview-${index + 1}`}
          ratio="1/1"
          imgSx={{ objectFit: "cover" }}
        />
      </Box>
    ),
  });

  const effectiveLayout: "image-left" | "price-bottom" =
    layout ?? (priceBottom ? "price-bottom" : "image-left");

  // Show loading skeleton
  if (productsLoading) {
    return (
      <Container
        maxWidth={false}
        sx={{
          px: { xs: 6, md: 8 },
          py: { xs: 6, md: 8 },
          mx: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Skeleton variant="text" width={300} height={60} sx={{ mb: 3 }} />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 2,
          }}
        >
          {[...Array(4)].map((_, index) => (
            <Box key={index} sx={{ p: 2 }}>
              <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="80%" height={24} />
              <Skeleton variant="text" width="60%" height={20} />
            </Box>
          ))}
        </Box>
      </Container>
    );
  }

  // Show error state
  if (productsError) {
    return (
      <Container
        maxWidth={false}
        sx={{
          px: { xs: 6, md: 8 },
          py: { xs: 6, md: 8 },
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Typography variant="h3" sx={{ mb: 3, fontWeight: 700 }}>
          SẢN PHẨM NỔI BẬT
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Không thể tải sản phẩm. Vui lòng thử lại sau.
        </Typography>
      </Container>
    );
  }

  // Show empty state
  if (minimalProducts.length === 0) {
    return (
      <Container
        maxWidth={false}
        sx={{
          px: { xs: 6, md: 8 },
          py: { xs: 6, md: 8 },
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Typography variant="h3" sx={{ mb: 3, fontWeight: 700 }}>
          SẢN PHẨM NỔI BẬT
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Chưa có sản phẩm nào.
        </Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth={false}
      sx={{
        px: { xs: 6, md: 8 },
        py: { xs: 6, md: 8 },
        mx: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography
        variant="h3"
        sx={{ mb: 3, textAlign: "left", fontWeight: 700, flex: "0 0 auto" }}
      >
        SẢN PHẨM NỔI BẬT
      </Typography>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          position: "relative",
          "--thumb-h": { xs: "56px", md: "72px" },
          "& .slick-list": { height: "calc(100% - var(--thumb-h))" },
          "& .slick-track": { height: "100%" },
          "& .slick-slide > div": { height: "100%" },
          "& .slick-dots": { position: "static", mb: 0, mt: 2 },
        }}
      >
        <CarouselArrows
          filled
          onPrev={carousel.onPrev}
          onNext={carousel.onNext}
          sx={{ height: 1 }}
        >
          <Carousel ref={carousel.carouselRef} {...carousel.carouselSettings}>
            {minimalProducts.map((p) => (
              <ProductCard key={p.id} product={p} layout={effectiveLayout} />
            ))}
          </Carousel>
        </CarouselArrows>
      </Box>
    </Container>
  );
}

type MinimalProduct = {
  id: string;
  name: string;
  price: number;
  priceSale?: number | null;
  image: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  totalRatings?: number;
  totalReviews?: number;
  category?: string;
  inStock?: boolean;
  discountPercent?: number;
};

type ProductCardLayout = "image-left" | "price-bottom";

type CardProps = {
  product: MinimalProduct;
  layout?: ProductCardLayout;
};

function ProductCard({ product, layout = "image-left" }: CardProps) {
  const isPriceBottom = layout === "price-bottom";
  console.log('product  ', product);
  
  const linkTo = paths.product.details(product.id);
  
  return (
    <Box sx={{ px: 1, height: "100%" }}>
      <Link
        component={RouterLink}
        href={linkTo}
        sx={{
          display: "block",
          height: "100%",
          textDecoration: "none",
          "&:hover": {
            textDecoration: "none",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "stretch",
            flexDirection: isPriceBottom ? "column-reverse" : "row",
            p: isPriceBottom ? 2 : 0,
            height: "100%",
            position: "relative",
            cursor: "pointer",
            transition: (theme) =>
              theme.transitions.create("all", {
                easing: theme.transitions.easing.easeInOut,
                duration: theme.transitions.duration.shorter,
              }),
            "&:hover": {
              transform: "translateY(-2px)",
            },
          }}
        >
        {/* Product Labels */}
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            position: "absolute",
            top: isPriceBottom ? 20 : 20,
            right: isPriceBottom ? 24 : 24,
            zIndex: 2,
          }}
        >
          {/* Discount percent label */}
          {/* {product.discountPercent && product.discountPercent > 0 && (
            <Box
              sx={{
                px: 1,
                py: 0.5,
                bgcolor: "error.main",
                color: "white",
                borderRadius: 0.5,
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              -{product.discountPercent}%
            </Box>
          )} */}
          {product.isNew && (
            <Box
              sx={{
                px: 1,
                py: 0.5,
                bgcolor: "success.main",
                color: "white",
                borderRadius: 0.5,
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              MỚI
            </Box>
          )}
          {product.isSale && !product.discountPercent && (
            <Box
              sx={{
                px: 1,
                py: 0.5,
                bgcolor: "error.main",
                color: "white",
                borderRadius: 0.5,
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              SALE
            </Box>
          )}
          {product.isFeatured && (
            <Box
              sx={{
                px: 1,
                py: 0.5,
                bgcolor: "warning.main",
                color: "white",
                borderRadius: 0.5,
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              HOT
            </Box>
          )}
          {/* Stock label */}
          {product.inStock === false && (
            <Box
              sx={{
                px: 1,
                py: 0.5,
                bgcolor: "text.disabled",
                color: "white",
                borderRadius: 0.5,
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              HẾT HÀNG
            </Box>
          )}
        </Stack>

        <Stack
          spacing={1}
          sx={{
            width: { xs: 140, md: 200 },
            minWidth: { xs: 140, md: 200 },
            pr: isPriceBottom ? 0 : 2,
            pt: isPriceBottom ? 2 : 1,
            pb: 1,
            justifyContent: "flex-end",
            flexShrink: 0,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {product.name}
          </Typography>

          {/* Category */}
          {product.category && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {product.category}
            </Typography>
          )}
          
          {/* Rating */}
          {/* {product.totalRatings && product.totalReviews && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Iconify icon="solar:star-bold" width={16} sx={{ color: "warning.main" }} />
              <Typography variant="caption" color="text.secondary">
                {product.totalRatings.toFixed(1)} ({product.totalReviews} đánh giá)
              </Typography>
            </Stack>
          )} */}

          <Stack direction="row" spacing={1} alignItems="center">
            {product.priceSale && (
              <Typography
                variant="body2"
                sx={{ color: "text.disabled", textDecoration: "line-through" }}
              >
                {fCurrency(product.priceSale)}
              </Typography>
            )}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "primary.main" }}>
              {fCurrency(product.price)}
            </Typography>
          </Stack>

          <Link
            color="inherit"
            underline="always"
            onClick={(e) => e.stopPropagation()}
            sx={{
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: "0.875rem",
              "&:hover": {
                color: "primary.main",
              },
            }}
          >
            <Iconify icon="solar:heart-linear" width={18} /> Thêm vào yêu thích
          </Link>
        </Stack>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <Image
            src={product.image}
            alt={product.name}
            ratio={isPriceBottom ? "3/4" : undefined}
            loading="lazy"
            height={"100%"}
            sx={{ borderRadius: 1 }}
            imgSx={{
              objectPosition: "center",
              objectFit: "cover",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          />
        </Box>
        </Box>
      </Link>
    </Box>
  );
}
