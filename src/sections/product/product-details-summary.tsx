import { useEffect, useCallback, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import ButtonBase from "@mui/material/ButtonBase";
import { alpha } from "@mui/material/styles";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { useBoolean } from "src/hooks/use-boolean";
import { useGetColors } from "src/api/reference";
import { useGetSizes } from "src/api/reference";

import { fCurrency, fShortenNumber } from "src/utils/format-number";

import Label from "src/components/label";
import Iconify from "src/components/iconify";
import FormProvider from "src/components/hook-form";
import { useSnackbar } from "src/components/snackbar";

import { IProductItem } from "src/types/product";
import { ICheckoutItem } from "src/types/checkout";
import { ProductVariantDto } from "src/types/product-dto";

import IncrementerButton from "./common/incrementer-button";

// ----------------------------------------------------------------------

type Props = {
  product: IProductItem;
  items?: ICheckoutItem[];
  disabledActions?: boolean;
  onGotoStep?: (step: number) => void;
  onAddCart?: (cartItem: ICheckoutItem) => void;
};

export default function ProductDetailsSummary({
  items,
  product,
  onAddCart,
  onGotoStep,
  disabledActions,
  ...other
}: Props) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [openDetails, setOpenDetails] = useState(false);
  const [openAdditional, setOpenAdditional] = useState(false);
  const sizeGuideDialog = useBoolean();

  // Fetch colors and sizes for variant selection
  const { colors: allColors } = useGetColors();
  const { sizes: allSizes } = useGetSizes();

  const {
    id,
    name,
    sizes: productSizes,
    price,
    coverUrl,
    images,
    colors: productColors,
    newLabel,
    available,
    priceSale,
    saleLabel,
    totalRatings,
    totalReviews,
    inventoryType,
    subDescription,
    modelHeight,
    modelSize,
    variants,
    description,
    publish,
  } = product;

  // Variant selection state
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);

  // Extract unique colors from variants
  const availableColors = useMemo(() => {
    if (!variants || variants.length === 0) return [];
    const colorIds = Array.from(new Set(variants.map((v) => v.color_id).filter(Boolean)));
    return colorIds
      .map((colorId) => allColors.find((c: any) => c.id === colorId))
      .filter(Boolean);
  }, [variants, allColors]);

  // Get all unique sizes from variants
  const allAvailableSizes = useMemo(() => {
    if (!variants || variants.length === 0) return [];
    const sizeIds = Array.from(
      new Set(
        variants
          .map((v) => v.size_id)
          .filter(Boolean),
      ),
    );
    return sizeIds
      .map((sizeId) => allSizes.find((s: any) => s.id === sizeId))
      .filter(Boolean);
  }, [variants, allSizes]);

  // Check if size is available for selected color
  const isSizeAvailableForColor = useCallback(
    (sizeId: string) => {
      if (!selectedColorId || !variants) return false;
      return variants.some(
        (v) => v.color_id === selectedColorId && v.size_id === sizeId,
      );
    },
    [selectedColorId, variants],
  );

  // Find selected variant
  const selectedVariant = useMemo(() => {
    if (!selectedColorId || !selectedSizeId || !variants) return null;
    return variants.find(
      (v) => v.color_id === selectedColorId && v.size_id === selectedSizeId,
    ) || null;
  }, [selectedColorId, selectedSizeId, variants]);

  // Auto-select first color if available
  useEffect(() => {
    if (availableColors.length > 0 && !selectedColorId) {
      setSelectedColorId((availableColors[0] as any).id);
    }
  }, [availableColors, selectedColorId]);

  // Reset size when color changes
  useEffect(() => {
    setSelectedSizeId(null);
  }, [selectedColorId]);

  const existProduct =
    !!items?.length && items.map((item) => item.id).includes(id);

  // Use variant price/stock if variant selected, otherwise use product price/stock
  const displayPrice = selectedVariant
    ? selectedVariant.price
    : priceSale
      ? Number(priceSale)
      : Number(price);
  const displayOriginalPrice = selectedVariant
    ? null
    : priceSale
      ? Number(price)
      : null;
  const displayStock = selectedVariant
    ? selectedVariant.stock
    : available;
  const displaySku = selectedVariant ? selectedVariant.sku : product.sku;

  const defaultValues = {
    id,
    name,
    coverUrl,
    available: displayStock,
    price: displayPrice,
    quantity: displayStock > 0 ? 1 : 0,
  };

  const methods = useForm({
    defaultValues,
  });

  const { reset, watch, control, setValue, handleSubmit } = methods;

  const values = watch();

  // Update form when variant changes
  useEffect(() => {
    if (selectedVariant) {
      setValue("price", selectedVariant.price);
      setValue("available", selectedVariant.stock);
      setValue("quantity", selectedVariant.stock > 0 ? 1 : 0);
    } else {
      setValue("price", displayPrice);
      setValue("available", displayStock);
      setValue("quantity", displayStock > 0 ? 1 : 0);
    }
  }, [selectedVariant, displayPrice, displayStock, setValue]);

  useEffect(() => {
    if (product) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Validate quantity
      const quantity = data.quantity || 1;
      if (quantity <= 0) {
        enqueueSnackbar("Số lượng phải lớn hơn 0", {
          variant: "error",
        });
        return;
      }

      // Validate variant selection if product has variants
      if (variants && variants.length > 0) {
        if (!selectedColorId || !selectedSizeId) {
          enqueueSnackbar("Vui lòng chọn màu và size trước khi thêm vào giỏ hàng", {
            variant: "warning",
          });
          return;
        }
        if (!selectedVariant) {
          enqueueSnackbar("Variant không tồn tại. Vui lòng chọn lại màu và size.", {
            variant: "error",
          });
          return;
        }

        // Validate stock for variant
        if (selectedVariant.stock < quantity) {
          enqueueSnackbar(
            `Số lượng yêu cầu (${quantity}) vượt quá số lượng tồn kho (${selectedVariant.stock})`,
            {
              variant: "error",
            }
          );
          return;
        }
      } else {
        // Validate stock for product without variants
        if (displayStock < quantity) {
          enqueueSnackbar(
            `Số lượng yêu cầu (${quantity}) vượt quá số lượng tồn kho (${displayStock})`,
            {
              variant: "error",
            }
          );
          return;
        }
      }

      if (!existProduct) {
        // Generate variantId from variant
        // Always use color_id + size_id combination to ensure uniqueness
        const variantId = selectedVariant
          ? `${id}-${selectedVariant.color_id || 'no-color'}-${selectedVariant.size_id || 'no-size'}`
          : `${id}-default`;

        // Get variant name for display
        const selectedColor = allColors.find((c: any) => c.id === selectedColorId);
        const selectedSize = allSizes.find((s: any) => s.id === selectedSizeId);
        const variantName = selectedColor && selectedSize
          ? `${selectedColor.name} / ${selectedSize.name}`
          : selectedVariant?.name || "";

        // Prepare cart item with all required fields
        const cartItem: ICheckoutItem = {
          id: id, // Product ID
          productId: id, // Product ID
          variantId: variantId, // Variant ID
          name: name, // Product name
          variantName: variantName, // Display name
          coverUrl: coverUrl || images?.[0] || "", // Product image
          available: selectedVariant ? selectedVariant.stock : displayStock, // Available stock
          price: data.price, // Current price
          sku: selectedVariant?.sku || displaySku || "", // SKU
          quantity: quantity, // Quantity
          subTotal: data.price * quantity, // Subtotal
          category: product.category || "", // Category
          variants: selectedVariant ? [selectedVariant] : [], // Variant data
          colors: selectedColorId ? [selectedColorId] : [], // Color IDs (backward compatibility)
          size: selectedSizeId || "", // Size ID (backward compatibility)
          color: selectedColor || undefined, // Full color object
          sizeObj: selectedSize || undefined, // Full size object
        };
        onAddCart?.(cartItem);

        // Show success notification
        enqueueSnackbar(
          `Đã thêm ${quantity} ${quantity > 1 ? 'sản phẩm' : 'sản phẩm'} vào giỏ hàng`,
          {
            variant: "success",
          }
        );
      }
      onGotoStep?.(0);
      router.push(paths.product.checkout);
    } catch (error) {
      console.error("Error submitting form:", error);
      enqueueSnackbar("Có lỗi xảy ra khi thêm vào giỏ hàng", {
        variant: "error",
      });
    }
  });

  const handleAddCart = useCallback(() => {
    try {
      // Validate quantity
      const quantity = values.quantity || 1;
      if (quantity <= 0) {
        enqueueSnackbar("Số lượng phải lớn hơn 0", {
          variant: "error",
        });
        return;
      }

      // Validate variant selection if product has variants
      if (variants && variants.length > 0) {
        if (!selectedColorId || !selectedSizeId) {
          enqueueSnackbar("Vui lòng chọn màu và size trước khi thêm vào giỏ hàng", {
            variant: "warning",
          });
          return;
        }
        if (!selectedVariant) {
          enqueueSnackbar("Variant không tồn tại. Vui lòng chọn lại màu và size.", {
            variant: "error",
          });
          return;
        }

        // Validate stock for variant
        if (selectedVariant.stock < quantity) {
          enqueueSnackbar(
            `Số lượng yêu cầu (${quantity}) vượt quá số lượng tồn kho (${selectedVariant.stock})`,
            {
              variant: "error",
            }
          );
          return;
        }
      } else {
        // Validate stock for product without variants
        if (displayStock < quantity) {
          enqueueSnackbar(
            `Số lượng yêu cầu (${quantity}) vượt quá số lượng tồn kho (${displayStock})`,
            {
              variant: "error",
            }
          );
          return;
        }
      }

      // Generate variantId from variant
      // Always use color_id + size_id combination to ensure uniqueness
      // SKU might not be unique across variants, so we use the combination instead
      const variantId = selectedVariant
        ? `${id}-${selectedVariant.color_id || 'no-color'}-${selectedVariant.size_id || 'no-size'}`
        : `${id}-default`;

      // Get variant name for display
      const selectedColor = allColors.find((c: any) => c.id === selectedColorId);
      const selectedSize = allSizes.find((s: any) => s.id === selectedSizeId);
      const variantName = selectedColor && selectedSize
        ? `${selectedColor.name} / ${selectedSize.name}`
        : selectedVariant?.name || "";

      // Prepare cart item with all required fields
      const cartItem: ICheckoutItem = {
        id: id, // Product ID (will be used as fallback)
        productId: id, // Product ID
        variantId: variantId, // Variant ID
        name: name, // Product name
        variantName: variantName, // Display name
        coverUrl: coverUrl || images?.[0] || "", // Product image
        available: selectedVariant ? selectedVariant.stock : displayStock, // Available stock
        price: displayPrice, // Current price (variant price or product price)
        sku: selectedVariant?.sku || displaySku || "", // SKU
        quantity: quantity, // Quantity
        subTotal: displayPrice * quantity, // Subtotal
        category: product.category || "", // Category
        variants: selectedVariant ? [selectedVariant] : [], // Variant data
        colors: selectedColorId ? [selectedColorId] : [], // Color IDs (backward compatibility)
        size: selectedSizeId || "", // Size ID (backward compatibility)
        color: selectedColor || undefined, // Full color object
        sizeObj: selectedSize || undefined, // Full size object
      };

      // Add to cart
      onAddCart?.(cartItem);

      // Show success notification
      enqueueSnackbar(
        `Đã thêm ${quantity} ${quantity > 1 ? 'sản phẩm' : 'sản phẩm'} vào giỏ hàng`,
        {
          variant: "success",
        }
      );
    } catch (error) {
      console.error("Error adding to cart:", error);
      enqueueSnackbar("Có lỗi xảy ra khi thêm vào giỏ hàng", {
        variant: "error",
      });
    }
  }, [
    onAddCart,
    values,
    selectedVariant,
    selectedColorId,
    selectedSizeId,
    product.category,
    id,
    name,
    coverUrl,
    images,
    variants,
    allColors,
    allSizes,
    displaySku,
    displayPrice,
    displayStock,
    enqueueSnackbar,
  ]);

  const renderPrice = (
    <Box sx={{ typography: "h5" }}>
      {displayOriginalPrice && (
        <Box
          component="span"
          sx={{
            color: "text.disabled",
            textDecoration: "line-through",
            mr: 0.5,
          }}
        >
          {fCurrency(displayOriginalPrice)}
        </Box>
      )}

      <Box component="span" sx={{ fontWeight: 700 }}>
        {fCurrency(displayPrice)}
      </Box>
    </Box>
  );

  const renderColorOptions = (
    <Stack direction="column" spacing={1.5}>
      <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
        Color
      </Typography>
      {availableColors.length > 0 ? (
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {availableColors.map((color: any) => {
            const isSelected = selectedColorId === color.id;
            return (
              <ButtonBase
                key={color.id}
                onClick={() => setSelectedColorId(color.id)}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: (theme) =>
                    `2px solid ${
                      isSelected
                        ? theme.palette.primary.main
                        : alpha(theme.palette.grey[500], 0.16)
                    }`,
                  p: 0.5,
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    bgcolor: color.hexCode || "#ccc",
                    border: (theme) =>
                      `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
                  }}
                />
              </ButtonBase>
            );
          })}
        </Stack>
      ) : (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          No colors available
        </Typography>
      )}
    </Stack>
  );

  const renderSizeOptions = (
    <Stack spacing={1.5}>
      <Stack direction="row">
        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
          Size
        </Typography>
      </Stack>

      {allAvailableSizes.length > 0 ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(3, minmax(0, 1fr))",
              sm: "repeat(5, minmax(0, 1fr))",
            },
            gap: 1,
          }}
        >
          {allAvailableSizes.map((size: any) => {
            const isAvailableForColor = selectedColorId
              ? isSizeAvailableForColor(size.id)
              : false;
            const variantForSize = variants?.find(
              (v) =>
                v.color_id === selectedColorId && v.size_id === size.id,
            );
            const isSelected = selectedSizeId === size.id;
            const isOutOfStock = variantForSize
              ? variantForSize.stock === 0
              : false;
            const isDisabled = !isAvailableForColor || isOutOfStock;

            return (
              <Button
                key={size.id}
                variant={isSelected ? "contained" : "outlined"}
                color={isSelected ? "primary" : "inherit"}
                onClick={() => {
                  if (isAvailableForColor) {
                    setSelectedSizeId(size.id);
                  }
                }}
                disabled={isDisabled}
                sx={{
                  py: 1,
                  fontWeight: 600,
                  padding: "10px",
                  height: "40px",
                  width: "fit-content",
                  opacity: !isAvailableForColor ? 0.4 : isOutOfStock ? 0.5 : 1,
                  textDecoration: !isAvailableForColor ? "line-through" : "none",
                  color: !isAvailableForColor
                    ? "text.disabled"
                    : isSelected
                      ? undefined
                      : "inherit",
                  cursor: !isAvailableForColor ? "not-allowed" : "pointer",
                }}
              >
                {size.name}
              </Button>
            );
          })}
        </Box>
      ) : variants && variants.length > 0 ? (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          No sizes available
        </Typography>
      ) : (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Please select a color first
        </Typography>
      )}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "flex-start",
          alignItems: { xs: "center", sm: "center" },
          gap: 1.5,
          mt: 1,
        }}
      >
        <Link
          underline="always"
          component="button"
          onClick={sizeGuideDialog.onTrue}
          sx={{
            cursor: "pointer",
            border: "none",
            background: "none",
            padding: 0,
            font: "inherit",
            color: "inherit",
          }}
        >
          Size Guide
        </Link>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
        >
          Model size: {modelSize || "N/A"} | Model height:{" "}
          {modelHeight || "N/A"}
        </Typography>
      </Box>

      <Dialog
        open={sizeGuideDialog.value}
        onClose={sizeGuideDialog.onFalse}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Size Guide
          <IconButton
            aria-label="close"
            onClick={sizeGuideDialog.onFalse}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            component="img"
            src={
              images && images.length > 0
                ? images[images.length - 1]
                : "https://placehold.co/600x400"
            }
            alt="Size Guide"
            sx={{
              width: "100%",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </DialogContent>
      </Dialog>
    </Stack>
  );

  const renderQuantity = (
    <Stack direction="row">
      <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
        Quantity
      </Typography>

      <Stack spacing={1}>
        <IncrementerButton
          name="quantity"
          quantity={values.quantity}
          disabledDecrease={values.quantity <= 1 || (variants && variants.length > 0 && !selectedVariant)}
          disabledIncrease={values.quantity >= displayStock}
          onIncrease={() => setValue("quantity", values.quantity + 1)}
          onDecrease={() => setValue("quantity", values.quantity - 1)}
        />

        <Stack spacing={0.5} sx={{ textAlign: "right" }}>
          {displaySku && (
            <Typography variant="caption" component="div">
              SKU: {displaySku}
            </Typography>
          )}
          {/* <Typography variant="caption" component="div">
            Available: {displayStock}
          </Typography> */}
        </Stack>
      </Stack>
    </Stack>
  );

  const renderActions = () => {
    // Determine button state and label
    let buttonLabel = "Thêm vào giỏ";
    let isDisabled = disabledActions || publish === "draft";

    // If product has variants, require variant selection
    if (variants && variants.length > 0) {
      if (!selectedVariant) {
        buttonLabel = "Chọn màu & size";
        isDisabled = true;
      } else if (selectedVariant.stock === 0) {
        buttonLabel = "Hết hàng";
        isDisabled = true;
      }
    } else {
      // No variants, use product-level stock
      if (displayStock === 0) {
        buttonLabel = "Hết hàng";
        isDisabled = true;
      }
    }

    return (
      <Stack direction="row" spacing={2}>
        <Button
          startIcon={<Iconify icon="solar:cart-plus-bold" width={24} />}
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          disabled={isDisabled}
        >
          {buttonLabel}
        </Button>
      </Stack>
    );
  };

  const renderSubDescription = (
    <Typography variant="body2" sx={{ color: "text.secondary" }}>
      {subDescription ||
        "Page layouts look better with something in each section. Web page designers, content writers, and layout artists use lorem ipsum, also known as placeholder copy, to distinguish which areas on a page will hold advertisements, editorials, and filler before the final written content and website designs receive client approval."}
    </Typography>
  );

  const renderDescription = description ? (
    <Box
      sx={{
        "& p": { mb: 2 },
        "& ul, & ol": { pl: 3, mb: 2 },
        "& img": { maxWidth: "100%", height: "auto" },
      }}
      dangerouslySetInnerHTML={{ __html: description }}
    />
  ) : null;

  const renderRating = (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        color: "text.disabled",
        typography: "body2",
      }}
    >
      <Rating
        size="small"
        value={totalRatings}
        precision={0.1}
        readOnly
        sx={{ mr: 1 }}
      />
      {`(${fShortenNumber(totalReviews)} reviews)`}
    </Stack>
  );

  const renderLabels = (newLabel.enabled || saleLabel.enabled) && (
    <Stack direction="row" alignItems="center" spacing={1}>
      {newLabel.enabled && <Label color="info">{newLabel.content}</Label>}
      {saleLabel.enabled && <Label color="error">{saleLabel.content}</Label>}
    </Stack>
  );

  const renderInventoryType = () => {
    // Stock status based on displayStock and publish status
    if (publish === "draft") {
      return (
        <Label color="default" variant="filled">
          Ngừng kinh doanh
        </Label>
      );
    }
    if (displayStock > 0) {
      return (
        <Label color="success" variant="filled">
          In Stock
        </Label>
      );
    }
    return (
      <Label color="error" variant="filled">
        Hết hàng
      </Label>
    );
  };
  const renderMoreDetailSection = (
    <Stack spacing={1.5}>
      <Stack alignItems="center" direction="row" justifyContent="space-between">
        <Typography variant="h6">DETAILS</Typography>
        <IconButton
          size="small"
          onClick={() => setOpenDetails((prev) => !prev)}
          aria-label={openDetails ? "Collapse details" : "Expand details"}
        >
          <Iconify
            icon="eva:arrow-ios-downward-fill"
            width={24}
            style={{
              transform: openDetails ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 200ms",
            }}
          />
        </IconButton>
      </Stack>
      <Collapse in={openDetails} timeout="auto" unmountOnExit>
        <Stack spacing={1} sx={{ color: "text.secondary" }}>
          <Typography variant="body2">
            Model size: {modelSize || "N/A"}
          </Typography>
          <Typography variant="body2">
            Model height: {modelHeight || "N/A"}
          </Typography>
          <Typography variant="body2">
            Fit: Regular fit with breathable upper
          </Typography>
          <Typography variant="body2">
            Sole: Cushioned midsole for daily wear
          </Typography>
          <Typography variant="body2">Origin: Designed locally</Typography>
        </Stack>
      </Collapse>
    </Stack>
  );
  const renderAdditionalInfoSection = (
    <Stack spacing={1.5}>
      <Stack alignItems="center" direction="row" justifyContent="space-between">
        <Typography variant="h6">ADDITIONAL INFO</Typography>
        <IconButton
          size="small"
          onClick={() => setOpenAdditional((prev) => !prev)}
          aria-label={
            openAdditional
              ? "Collapse additional info"
              : "Expand additional info"
          }
        >
          <Iconify
            icon="eva:arrow-ios-downward-fill"
            width={24}
            style={{
              transform: openAdditional ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 200ms",
            }}
          />
        </IconButton>
      </Stack>
      <Collapse in={openAdditional} timeout="auto" unmountOnExit>
        <Stack spacing={1} sx={{ color: "text.secondary" }}>
          <Typography variant="body2">
            Material: Mesh upper, rubber outsole
          </Typography>
          <Typography variant="body2">
            Care: Spot clean with mild detergent
          </Typography>
          <Typography variant="body2">
            Warranty: 1 year limited warranty
          </Typography>
          <Typography variant="body2">
            Shipping: Free shipping on orders over $100
          </Typography>
          {!!productSizes?.length && (
            <Typography variant="body2">
              Available sizes: {productSizes.join(", ")}
            </Typography>
          )}
        </Stack>
      </Collapse>
    </Stack>
  );
  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3} sx={{ pt: 3 }} {...other}>
        <Stack spacing={2} alignItems="flex-start">
          {renderLabels}

          {renderInventoryType()}

          <Typography variant="h5">{name}</Typography>

          {renderPrice}

          {/* {renderRating} */}

          {renderSubDescription}
        </Stack>

        <Divider sx={{ borderStyle: "dashed" }} />

        {renderColorOptions}

        {renderSizeOptions}

        {renderQuantity}

        <Divider sx={{ borderStyle: "dashed" }} />

        {renderActions()}

        {renderMoreDetailSection}

        {/* {renderAdditionalInfoSection} */}
      </Stack>
    </FormProvider>
  );
}
