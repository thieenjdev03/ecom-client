"use client";

import { useState, useEffect } from "react";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import Iconify from "src/components/iconify";
import Image from "src/components/image";
import { useSnackbar } from "src/components/snackbar";
import { fCurrency } from "src/utils/format-number";
import { IProductItem } from "src/types/product";
import { useCheckoutContext } from "src/sections/checkout/context";
import { useWishlistContext } from "src/sections/wishlist/context";
import { ICheckoutItem } from "src/types/checkout";
import { useTranslate } from "src/locales";

// ----------------------------------------------------------------------

// Type for minimal product data (optimized for card display)
export type MinimalProduct = {
  id: string;
  name: string;
  price: number;
  priceSale?: number | null;
  image: string;
  hoverImage?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  totalRatings?: number;
  totalReviews?: number;
  category?: string;
  inStock?: boolean;
  discountPercent?: number;
};

export type ProductCardLayout = "image-left" | "price-bottom";

export type ProductShowcaseCardProps = {
  product: MinimalProduct;
  layout?: ProductCardLayout;
  showAddToCart?: boolean;
  showWishlistButton?: boolean;
};

// ----------------------------------------------------------------------

// Helper function to convert IProductItem to MinimalProduct
export function productToMinimal(product: IProductItem): MinimalProduct {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    priceSale: product.priceSale,
    image: product.coverUrl || product.images?.[0] || "/assets/placeholder.svg",
    hoverImage: product.images && product.images.length > 1 ? product.images[1] : undefined,
    isFeatured: product.isFeatured,
    isNew: product.is_new,
    isSale: product.is_sale,
    totalRatings: product.totalRatings,
    totalReviews: product.totalReviews,
    category: product.category,
    inStock: product.inventoryType !== "Out of Stock" && product.quantity > 0,
    discountPercent:
      product.priceSale && product.priceSale < product.price
        ? Math.round(((product.price - (product.priceSale || 0)) / product.price) * 100)
        : 0,
  };
}

// Helper function to convert MinimalProduct to IProductItem (for wishlist)
export function minimalToProduct(product: MinimalProduct): IProductItem {
  return {
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
      content:
        product.priceSale && product.price && Number(product.price) > 0
          ? `${((Number(product.price) - Number(product.priceSale)) / Number(product.price)) * 100}%`
          : "",
    },
    newLabel: { enabled: product.isNew || false, content: "New" },
    variants: [],
    dimensions: null,
  };
}

// ----------------------------------------------------------------------

export default function ProductShowcaseCard({
  product,
  layout = "image-left",
  showAddToCart,
  showWishlistButton = true,
}: ProductShowcaseCardProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { t, i18n } = useTranslate();
  const checkout = useCheckoutContext();
  const wishlist = useWishlistContext();
  const [isImageHovered, setIsImageHovered] = useState(false);
  const displayedImage =
    isImageHovered && product.hoverImage ? product.hoverImage : product.image;

  useEffect(() => {
    setIsImageHovered(false);
  }, [product.id]);

  const isPriceBottom = layout === "price-bottom";
  const linkTo = paths.product.details(product.id);
  const isInWishlist = wishlist.isInWishlist(product.id);

  // Handle add to cart
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
      const productText = i18n.language === "vi" ? "sản phẩm" : "product";
      enqueueSnackbar(
        t("homeProductShowcase.addedToCart", {
          quantity: 1,
          product: productText,
        }),
        {
          variant: "success",
        }
      );
    } catch (error) {
      console.error("Error adding to cart:", error);
      enqueueSnackbar(t("homeProductShowcase.errorAddingToCart"), {
        variant: "error",
      });
    }
  };

  // Handle toggle wishlist
  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (isInWishlist) {
        wishlist.onRemoveFromWishlist(product.id);
        enqueueSnackbar(
          t("homeProductShowcase.removedFromWishlist", { name: product.name }),
          {
            variant: "info",
          }
        );
      } else {
        // Convert MinimalProduct to IProductItem for wishlist
        const wishlistProduct = minimalToProduct(product);
        wishlist.onAddToWishlist(wishlistProduct);
        enqueueSnackbar(
          t("homeProductShowcase.addedToWishlist", { name: product.name }),
          {
            variant: "success",
          }
        );
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
      <Box
        sx={{
          display: "flex",
          alignItems: "stretch",
          flexDirection: isPriceBottom ? "column-reverse" : "row",
          height: "100%",
          position: "relative",
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
          <Stack
            spacing={1}
            sx={{
              pr: isPriceBottom ? 0 : 2,
              pt: isPriceBottom ? 2 : 1,
              pb: 1,
              justifyContent: "flex-end",
              flexShrink: 0,
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Link
                component={RouterLink}
                href={linkTo}
                sx={{
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "none",
                  },
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, cursor: "pointer" }}>
                  {product.name}
                </Typography>
              </Link>
              {showWishlistButton && (
                <IconButton
                  size="small"
                  onClick={handleToggleWishlist}
                  sx={{
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
              )}
            </Stack>

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
            </Stack>
          </Stack>

          <Box
            sx={{ flex: 1, minHeight: 0 }}
            onMouseEnter={() => {
              if (product.hoverImage) {
                setIsImageHovered(true);
              }
            }}
            onMouseLeave={() => setIsImageHovered(false)}
          >
            <Image
              src={displayedImage}
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
      </Box>
  );
}

