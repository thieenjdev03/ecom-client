"use client";

import { useMemo } from "react";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";

import Image from "src/components/image";
import Carousel, { useCarousel, CarouselArrows } from "src/components/carousel";
import { useGetProducts } from "src/api/product";
import { IProductItem } from "src/types/product";
import { useTranslate } from "src/locales";

import ProductShowcaseCard, {
  productToMinimal,
  ProductCardLayout,
} from "./product-showcase-card";

// ----------------------------------------------------------------------

type HomeProductShowcaseProps = {
  priceBottom?: boolean;
  layout?: ProductCardLayout;
  showAddToCart?: boolean;
  title?: string;
};

// ----------------------------------------------------------------------

export default function HomeProductShowcase({
  priceBottom,
  layout,
  showAddToCart,
  title,
}: HomeProductShowcaseProps) {
  const { t } = useTranslate();

  const displayTitle = title || t("homeProductShowcase.title");

  // Fetch real products from API
  const { products, productsLoading, productsError } = useGetProducts({
    page: 1,
    limit: 10,
  });

  const minimalProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    return products.map((product: IProductItem) => productToMinimal(product));
  }, [products]);

  const thumbnails = minimalProducts.map((p) => p.image);

  const effectiveLayout: ProductCardLayout =
    layout ?? (priceBottom ? "price-bottom" : "image-left");

  const carousel = useCarousel({
    dots: true,
    arrows: false,
    autoplay: false,
    slidesToShow: effectiveLayout === "price-bottom" ? 5 : 4,
    slidesToScroll: 1,
    infinite: false,
    swipe: true,
    swipeToSlide: true,
    touchMove: true,
    draggable: true,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: effectiveLayout === "price-bottom" ? 4 : 3,
        },
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: effectiveLayout === "price-bottom" ? 3 : 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
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
          {displayTitle}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("homeProductShowcase.errorLoading")}
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
          {displayTitle}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("homeProductShowcase.noProducts")}
        </Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth={false}
      sx={{
        gap: 2,
        display: "flex",
        flexDirection: "column",
        px: 6,
        py: 6,
      }}
    >
      <Typography
        variant="h3"
        sx={{ mb: 3, textAlign: "left", fontWeight: 700, flex: "0 0 auto" }}
      >
        {displayTitle}
      </Typography>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          position: "relative",
          "--thumb-h": { xs: "56px", md: "72px" },
          "& .slick-list": {
            height: "calc(100% - var(--thumb-h))",
          },
          "& .slick-track": {
            height: "100%",
            display: "flex",
            alignItems: "stretch",
          },
          "& .slick-slide": {
            height: "auto",
            "& > div": { height: "100%" },
          },
          "& .slick-dots": { position: "static", mb: 0, mt: 2 },
        }}
      >
        <CarouselArrows
          filled={false}
          onPrev={carousel.onPrev}
          onNext={carousel.onNext}
          sx={{ height: 1 }}
        >
          <Carousel ref={carousel.carouselRef} {...carousel.carouselSettings}>
            {minimalProducts.map((p) => (
              <ProductShowcaseCard
                key={p.id}
                product={p}
                layout={effectiveLayout}
                showAddToCart={showAddToCart}
              />
            ))}
          </Carousel>
        </CarouselArrows>
      </Box>
    </Container>
  );
}
