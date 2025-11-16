import { useState } from "react";
import Fab from "@mui/material/Fab";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import { fCurrency } from "src/utils/format-number";

import Label from "src/components/label";
import Image from "src/components/image";
import Iconify from "src/components/iconify";
import { ColorPreview } from "src/components/color-utils";

import { IProductItem, IApiProductItem } from "src/types/product";

import { useCheckoutContext } from "../checkout/context";
import { useWishlistContext } from "../wishlist/context";
import { ProductVariantDto } from "src/types/product-dto";
import { ICheckoutItem } from "src/types/checkout";

// ----------------------------------------------------------------------

type Props = {
  product: IProductItem | IApiProductItem;
};

export default function ProductItem({ product }: Props) {
  const { onAddToCart } = useCheckoutContext();
  const { onAddToWishlist, onRemoveFromWishlist, isInWishlist } = useWishlistContext();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  console.log("product", product);
  
  // Check if it's API product format or legacy format
  const isApiProduct = 'slug' in product && 'sale_price' in product;
  
  let id: string;
  let name: string;
  let price: number;
  let priceSale: number | null;
  let images: string[];
  let available: boolean;
  let isFeatured: boolean;
  let category: { name: string };
  let stock_quantity: number;
  let coverUrl: string;
  let variants: ProductVariantDto[];
  if (isApiProduct) {
    // API product format
    const apiProduct = product as IApiProductItem;
    id = apiProduct.id.toString();
    name = apiProduct.name;
    price = parseFloat(apiProduct.price);
    priceSale = apiProduct.sale_price ? parseFloat(apiProduct.sale_price) : null;
    images = apiProduct.images;
    stock_quantity = apiProduct.stock_quantity;
    available = apiProduct.stock_quantity > 0 && apiProduct.status === 'active';
    isFeatured = apiProduct.is_featured;
    category = apiProduct.category;
    coverUrl = apiProduct.images?.[0] || '';
    variants = apiProduct.variants || [];
  } else {
    // Legacy format
    const legacyProduct = product as IProductItem;
    id = legacyProduct.id;
    name = legacyProduct.name;
    price = legacyProduct.productPrice;
    priceSale = legacyProduct.priceSale;
    images = legacyProduct.images;
    stock_quantity = legacyProduct.quantity;
    available = legacyProduct.available > 0;
    isFeatured = legacyProduct.isFeatured;
    category = { name: legacyProduct.category };
    coverUrl = legacyProduct.coverUrl;
    variants = legacyProduct.variants;
  }
  
  // Mock colors and sizes for now (can be updated when API provides this data)
  const colors = ['#000000', '#FFFFFF', '#FF0000']; // Default colors
  const sizes = ['S', 'M', 'L', 'XL']; // Default sizes
  
  // Labels based on data
  const newLabel = { enabled: false, content: 'New' };
  const saleLabel = { 
    enabled: Boolean(priceSale),
    content: priceSale && price && Number(price) > 0
      ? `${Math.round(((Number(price) - Number(priceSale)) / Number(price)) * 100)}%`
      : ""
  };
  const linkTo = paths.product.details(id);

  const handleImageHover = () => {
    if (images && images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const handleImageLeave = () => {
    setCurrentImageIndex(0);
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(id)) {
      onRemoveFromWishlist(id);
    } else {
      // Convert to IProductItem format for wishlist
      const wishlistProduct: IProductItem = {
        id,
        name,
        sku: isApiProduct ? (product as IApiProductItem).sku : (product as IProductItem).sku,
        modelHeight: 0,
        modelSize: 0,
        code: '',
        price: price,
        taxes: 0,
        tags: [],
        gender: 'unisex',
        sizes: ['S', 'M', 'L', 'XL'],
        publish: 'published',
        coverUrl: coverUrl,
        images: images,
        colors: ['#000000'],
        quantity: stock_quantity,
        category: category.name,
        available: available ? 1 : 0,
        totalSold: 0,
        description: '',
        totalRatings: 0,
        productPrice: price,
        totalReviews: 0,
        inventoryType: 'infinite',
        subDescription: '',
        isFeatured: isFeatured,
        is_new: false,
        is_sale: !!priceSale,
        priceSale: priceSale,
        reviews: [],
        createdAt: new Date(),
        ratings: [],
        saleLabel: { enabled: !!priceSale, content: 'Sale' },
        newLabel: { enabled: false, content: 'New' },
        variants: variants,
        dimensions: null,
      };
      onAddToWishlist(wishlistProduct);
    }
  };

  const handleAddCart = async () => {
    // Note: This is a quick add without variant selection
    // For proper variant selection, user should go to product details page
    const newProduct: ICheckoutItem = {
      id,
      productId: id,
      variantId: `${id}-default`,
      name,
      coverUrl: images?.[0] || coverUrl,
      available: available ? 1 : 0,
      price: price,
      colors: [colors[0]],
      size: sizes[0],
      quantity: 1,
      category: category?.name || '',
      variants: variants || [],
      subTotal: price * 1,
      // color and sizeObj are undefined for quick add
      // They will be set when adding from product details with variant selection
    };
    onAddToCart(newProduct);
  };

  const renderLabels = (newLabel.enabled || saleLabel.enabled) && (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ position: "absolute", zIndex: 9, top: 16, right: 16 }}
    >
      {newLabel.enabled && (
        <Label variant="filled" color="info">
          {newLabel.content}
        </Label>
      )}
      {saleLabel.enabled && (
        <Label variant="filled" color="error">
          {saleLabel.content}
        </Label>
      )}
    </Stack>
  );

  const renderImg = (
    <Box
      sx={{
        position: "relative",
        p: 1,
        "&:hover .add-cart-btn": {
          opacity: 1,
        },
        "&:hover .wishlist-btn": {
          opacity: 1,
        },
      }}
      onMouseEnter={handleImageHover}
      onMouseLeave={handleImageLeave}
    >
      {!!available && !isFeatured && variants && variants.length > 0 && (
        <Fab
          color="warning"
          size="medium"
          className="add-cart-btn"
          onClick={handleAddCart}
          sx={{
            right: 16,
            bottom: 16,
            zIndex: 9,
            opacity: 0,
            position: "absolute",
            transition: (theme) =>
              theme.transitions.create("all", {
                easing: theme.transitions.easing.easeInOut,
                duration: theme.transitions.duration.shorter,
              }),
          }}
        >
          <Iconify icon="solar:cart-plus-bold" width={24} />
        </Fab>
      )}

      <IconButton
        className="wishlist-btn"
        onClick={handleWishlistToggle}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 9,
          opacity: 0,
          transition: (theme) =>
            theme.transitions.create("all", {
              easing: theme.transitions.easing.easeInOut,
              duration: theme.transitions.duration.shorter,
            }),
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 1)",
          },
        }}
      >
        <Iconify 
          icon={isInWishlist(id) ? "solar:heart-bold" : "solar:heart-outline"} 
          width={20} 
          sx={{ color: isInWishlist(id) ? "error.main" : "inherit" }}
        />
      </IconButton>

      <Tooltip
        title={!available && !isFeatured && variants && variants.length === 0 ? "Out of stock" : "In stock"}
        placement="bottom-end"
      >
        <Image
          alt={name}
          src={images?.[currentImageIndex] || images?.[0] || coverUrl}
          ratio="3/4"
          sx={{
            borderRadius: 1.5,
            transition: (theme) =>
              theme.transitions.create("all", {
                easing: theme.transitions.easing.easeInOut,
                duration: theme.transitions.duration.shorter,
              }),
            ...(!available &&
              !isFeatured && variants && variants.length === 0 && {
                opacity: 0.48,
                filter: "grayscale(1)",
              }),
          }}
        />
      </Tooltip>
    </Box>
  );

  const renderContent = (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <ColorPreview colors={colors} />
        {category && (
          <Box
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              bgcolor: 'grey.100',
              typography: 'caption',
              color: 'text.secondary',
            }}
          >
            {category.name}
          </Box>
        )}
      </Stack>

      <Link
        component={RouterLink}
        href={linkTo}
        color="inherit"
        variant="subtitle2"
        noWrap
        sx={{
          fontSize: "0.875rem",
          fontWeight: 500,
          lineHeight: 1.4,
          "&:hover": {
            textDecoration: "underline",
          },
        }}
      >
        {name}
      </Link>

      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={0.5} sx={{ typography: "subtitle1" }}>
          {priceSale && (
            <Box
              component="span"
              sx={{ color: "text.disabled", textDecoration: "line-through" }}
            >
              {fCurrency(priceSale)}
            </Box>
          )}

          <Box component="span" sx={{ fontWeight: 600, fontSize: "1rem" }}>
            {fCurrency(price)}
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          {stock_quantity > 0 && (
            <Box
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: 1,
                bgcolor: stock_quantity > 10 ? 'success.lighter' : 'warning.lighter',
                typography: 'caption',
                color: stock_quantity > 10 ? 'success.darker' : 'warning.darker',
              }}
            >
              {stock_quantity} left
            </Box>
          )}
          
          <IconButton
            size="small"
            onClick={handleWishlistToggle}
            sx={{
              p: 0.5,
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <Iconify 
              icon={isInWishlist(id) ? "solar:heart-bold" : "solar:heart-outline"} 
              width={20} 
              sx={{ color: isInWishlist(id) ? "error.main" : "inherit" }}
            />
          </IconButton>
        </Stack>
      </Stack>
    </Stack>
  );

  return (
    <Card
      sx={{
        position: "relative",
        borderRadius: 2,
        overflow: "hidden",
        transition: (theme) =>
          theme.transitions.create("all", {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.shorter,
          }),
        "&:hover": {
          boxShadow: (theme) => theme.shadows[8],
          transform: "translateY(-2px)",
        },
      }}
    >
      {renderLabels}
      {renderImg}
      {renderContent}
    </Card>
  );
}
