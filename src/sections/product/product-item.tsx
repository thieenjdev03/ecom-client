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

import { IProductItem } from "src/types/product";

import { useCheckoutContext } from "../checkout/context";
import { useWishlistContext } from "../wishlist/context";

// ----------------------------------------------------------------------

type Props = {
  product: IProductItem;
};

export default function ProductItem({ product }: Props) {
  const { onAddToCart } = useCheckoutContext();
  const { onAddToWishlist, onRemoveFromWishlist, isInWishlist } = useWishlistContext();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const {
    id,
    name,
    coverUrl,
    productPrice,
    colors,
    available,
    sizes,
    priceSale,
    newLabel,
    saleLabel,
    images,
    isFeatured,
  } = product;
  console.log("product", product);
  const linkTo = paths.product.details(id);

  const handleImageHover = () => {
    if (images.length > 1) {
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
      onAddToWishlist(product);
    }
  };

  const handleAddCart = async () => {
    const newProduct = {
      id,
      name,
      coverUrl,
      available,
      price: productPrice,
      productPrice,
      colors: [colors[0]],
      size: sizes[0],
      quantity: 1,
    };
    try {
      onAddToCart(newProduct);
    } catch (error) {
      console.error(error);
    }
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
      {!!available && !isFeatured && (
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
        title={!available && !isFeatured && "Out of stock"}
        placement="bottom-end"
      >
        <Image
          alt={name}
          src={images[currentImageIndex] || images[0]}
          ratio="3/4"
          sx={{
            borderRadius: 1.5,
            transition: (theme) =>
              theme.transitions.create("all", {
                easing: theme.transitions.easing.easeInOut,
                duration: theme.transitions.duration.shorter,
              }),
            ...(!available &&
              !isFeatured && {
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
            {fCurrency(productPrice)}
          </Box>
        </Stack>

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
