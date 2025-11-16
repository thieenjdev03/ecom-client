import { useMemo } from "react";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import IconButton from "@mui/material/IconButton";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import Iconify from "src/components/iconify";
import Image from "src/components/image";
import { useSnackbar } from "src/components/snackbar";
import Carousel, {
  useCarousel,
  CarouselArrows,
} from "src/components/carousel";
import { fCurrency } from "src/utils/format-number";
import { useGetProducts } from "src/api/product";
import { IProductItem } from "src/types/product";
import { useCheckoutContext } from "src/sections/checkout/context";
import { useWishlistContext } from "src/sections/wishlist/context";
import { ICheckoutItem } from "src/types/checkout";
import { useTranslate } from "src/locales";

export default function HomeProductShowcase({
  priceBottom,
  layout,
  showAddToCart,
  title,
}: {
  priceBottom?: boolean;
  layout?: "image-left" | "price-bottom";
  showAddToCart?: boolean;
  title?: string;
}) {
  const { t } = useTranslate();
  
  const displayTitle = title || t("homeProductShowcase.title");
  
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
      inStock: product.inventoryType !== "Out of Stock" && product.quantity > 0,
      discountPercent:
        product.priceSale && product.priceSale < product.price
          ? Math.round(((product.price - (product.priceSale || 0)) / product.price) * 100)
          : 0,
    }));
  }, [products]);

  const thumbnails = minimalProducts.map((p) => p.image);

  const effectiveLayout: "image-left" | "price-bottom" =
    layout ?? (priceBottom ? "price-bottom" : "image-left");

  const carousel = useCarousel({
    dots: true,
    arrows: false,
    autoplay: false,
    slidesToShow: effectiveLayout === "price-bottom" ? 5 : 4,
    slidesToScroll: 1,
    infinite: false,
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
          filled
          onPrev={carousel.onPrev}
          onNext={carousel.onNext}
          sx={{ height: 1 }}
        >
          <Carousel ref={carousel.carouselRef} {...carousel.carouselSettings}>
            {minimalProducts.map((p) => (
              <ProductCard 
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
  showAddToCart?: boolean;
};

function ProductCard({ product, layout = "image-left", showAddToCart }: CardProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslate();
  const checkout = useCheckoutContext();
  const wishlist = useWishlistContext();
  
  const isPriceBottom = layout === "price-bottom";
  const linkTo = paths.product.details(product.id);
  const isInWishlist = wishlist.isInWishlist(product.id);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Convert MinimalProduct to ICheckoutItem
      const cartItem: ICheckoutItem = {
        id: product.id,
        productId: product.id,
        variantId: `${product.id}-default`,
        name: product.name,
        variantName: undefined,
        coverUrl: product.image,
        available: product.inStock ? 1 : 0,
        price: product.priceSale || product.price,
        sku: product.id,
        quantity: 1,
        subTotal: product.priceSale || product.price,
        category: product.category || "",
        variants: [],
        colors: [],
        size: "",
      };
      
      checkout.onAddToCart(cartItem);
      enqueueSnackbar(t("homeProductShowcase.addedToCart", { name: product.name }), {
        variant: "success",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      enqueueSnackbar(t("homeProductShowcase.errorAddingToCart"), {
        variant: "error",
      });
    }
  };
  
  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (isInWishlist) {
        wishlist.onRemoveFromWishlist(product.id);
        enqueueSnackbar(t("homeProductShowcase.removedFromWishlist", { name: product.name }), {
          variant: "info",
        });
      } else {
        // Convert MinimalProduct to IProductItem for wishlist
        const wishlistProduct: IProductItem = {
          id: product.id,
          name: product.name,
          sku: product.id,
          modelHeight: 0,
          modelSize: 0,
          code: "",
          price: product.price,
          taxes: 0,
          tags: [],
          gender: "unisex",
          sizes: ["S", "M", "L", "XL"],
          publish: "published",
          coverUrl: product.image,
          images: [product.image],
          colors: ["#000000"],
          quantity: product.inStock ? 1 : 0,
          category: product.category || "",
          available: product.inStock ? 1 : 0,
          totalSold: 0,
          description: "",
          totalRatings: product.totalRatings || 0,
          productPrice: product.price,
          totalReviews: product.totalReviews || 0,
          inventoryType: product.inStock ? "infinite" : "out_of_stock",
          subDescription: "",
          isFeatured: product.isFeatured || false,
          is_new: product.isNew || false,
          is_sale: product.isSale || false,
          priceSale: product.priceSale || null,
          reviews: [],
          createdAt: new Date(),
          ratings: [],
          saleLabel: { 
            enabled: Boolean(product.priceSale),
            content: product.priceSale && product.price && Number(product.price) > 0
              ? `${((Number(product.price) - Number(product.priceSale)) / Number(product.price)) * 100}%`
              : ""
          },
          newLabel: { enabled: product.isNew || false, content: "New" },
          variants: [],
        };
        
        wishlist.onAddToWishlist(wishlistProduct);
        enqueueSnackbar(t("homeProductShowcase.addedToWishlist", { name: product.name }), {
          variant: "success",
        });
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      enqueueSnackbar(t("homeProductShowcase.errorAddingToWishlist"), {
        variant: "error",
      });
    }
  };
  
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
        {/* <Stack
          direction="row"
          spacing={0.5}
          sx={{
            position: "absolute",
            top: isPriceBottom ? 20 : 20,
            right: isPriceBottom ? 24 : 24,
            zIndex: 2,
          }}
        > */}
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
          {/* {product.isNew && (
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
          )} */}
          {/* {product.isSale && !product.discountPercent && (
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
          )} */}
          {/* {product.isFeatured && (
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
          )} */}
          {/* Stock label */}
          {/* {product.inStock === false && (
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
          )} */}
        {/* </Stack> */}

        <Stack
          spacing={1}
          sx={{
            width: { xs: 240, md: 260 },
            minWidth: { xs: 240, md: 260 },
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
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {fCurrency(product.price)}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            {showAddToCart && (
              <Button
                variant="contained"
                size="small"
                onClick={handleAddToCart}
                startIcon={<Iconify icon="solar:cart-3-bold" width={16} />}
                sx={{
                  flex: 1,
                  textTransform: "none",
                  fontSize: "0.75rem",
                  py: 0.75,
                }}
              >
                {t("homeProductShowcase.addToCart")}
              </Button>
            )}
            
            <IconButton
              size="small"
              onClick={handleToggleWishlist}
              sx={{
                border: 1,
                borderColor: "divider",
                color: isInWishlist ? "error.main" : "text.secondary",
                "&:hover": {
                  borderColor: "error.main",
                  bgcolor: "error.lighter",
                },
              }}
            >
              <Iconify 
                icon={isInWishlist ? "solar:heart-bold" : "solar:heart-linear"} 
                width={18} 
              />
            </IconButton>
          </Stack>
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
