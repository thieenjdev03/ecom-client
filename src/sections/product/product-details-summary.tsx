import { useEffect, useCallback, useState } from "react";
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

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { useBoolean } from "src/hooks/use-boolean";

import { fCurrency, fShortenNumber } from "src/utils/format-number";

import Label from "src/components/label";
import Iconify from "src/components/iconify";
import { ColorPicker } from "src/components/color-utils";
import FormProvider from "src/components/hook-form";

import { IProductItem } from "src/types/product";
import { ICheckoutItem } from "src/types/checkout";

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
  const [openDetails, setOpenDetails] = useState(false);
  const [openAdditional, setOpenAdditional] = useState(false);
  const sizeGuideDialog = useBoolean();

  const {
    id,
    name,
    sizes,
    price,
    coverUrl,
    images,
    colors,
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
  } = product;

  const existProduct =
    !!items?.length && items.map((item) => item.id).includes(id);

  const isMaxQuantity =
    !!items?.length &&
    items.filter((item) => item.id === id).map((item) => item.quantity)[0] >=
      available;

  const defaultValues = {
    id,
    name,
    coverUrl,
    available,
    price,
    colors: colors[0],
    size: sizes[4],
    quantity: available < 1 ? 0 : 1,
  };

  const methods = useForm({
    defaultValues,
  });

  const { reset, watch, control, setValue, handleSubmit } = methods;

  const values = watch();

  useEffect(() => {
    if (product) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!existProduct) {
        onAddCart?.({
          ...data,
          variants: [],
          category: "",
          colors: [values.colors],
          subTotal: data.price * data.quantity,
        });
      }
      onGotoStep?.(0);
      router.push(paths.product.checkout);
    } catch (error) {
      console.error(error);
    }
  });

  const handleAddCart = useCallback(() => {
    try {
      onAddCart?.({
        ...values,
        variants: [],
        category: "",
        colors: [values.colors],
        subTotal: values.price * values.quantity,
      });
    } catch (error) {
      console.error(error);
    }
  }, [onAddCart, values]);

  const renderPrice = (
    <Box sx={{ typography: "h5" }}>
      {priceSale && (
        <Box
          component="span"
          sx={{
            color: "text.disabled",
            textDecoration: "line-through",
            mr: 0.5,
          }}
        >
          {fCurrency(priceSale)}
        </Box>
      )}

      {fCurrency(price)}
    </Box>
  );

  const renderColorOptions = (
    <Stack direction="column">
      <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
        Color
      </Typography>
      <Controller
        name="colors"
        control={control}
        render={({ field }) => (
          <ColorPicker
            colors={colors}
            selected={field.value}
            onSelectColor={(color) => field.onChange(color as string)}
            limit={4}
          />
        )}
      />
    </Stack>
  );

  const renderSizeOptions = (
    <Stack spacing={1.5}>
      <Stack direction="row">
        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
          Size
        </Typography>
      </Stack>

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
        {sizes.map((size) => (
          <Button
            key={size}
            variant={values.size === size ? "contained" : "outlined"}
            color={values.size === size ? "primary" : "inherit"}
            onClick={() => setValue("size", size)}
            sx={{
              py: 1,
              fontWeight: 600,
              padding: "10px",
              height: "40px",
              width: "fit-content",
            }}
          >
            {size}
          </Button>
        ))}
      </Box>
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
          disabledDecrease={values.quantity <= 1}
          disabledIncrease={values.quantity >= available}
          onIncrease={() => setValue("quantity", values.quantity + 1)}
          onDecrease={() => setValue("quantity", values.quantity - 1)}
        />

        <Typography
          variant="caption"
          component="div"
          sx={{ textAlign: "right" }}
        >
          Available: {available}
        </Typography>
      </Stack>
    </Stack>
  );

  const renderActions = (
    <Stack direction="row" spacing={2}>
      <Button
        startIcon={<Iconify icon="solar:cart-plus-bold" width={24} />}
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        disabled={disabledActions}
      >
        Add to Bag
      </Button>
    </Stack>
  );

  const renderSubDescription = (
    <Typography variant="body2" sx={{ color: "text.secondary" }}>
      {subDescription ||
        "Page layouts look better with something in each section. Web page designers, content writers, and layout artists use lorem ipsum, also known as placeholder copy, to distinguish which areas on a page will hold advertisements, editorials, and filler before the final written content and website designs receive client approval."}
    </Typography>
  );

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

  const renderInventoryType = (
    <Box
      component="span"
      sx={{
        typography: "overline",
        color:
          (inventoryType === "out of stock" && "error.main") ||
          (inventoryType === "low stock" && "warning.main") ||
          "success.main",
      }}
    >
      {inventoryType}
    </Box>
  );
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
          {!!sizes?.length && (
            <Typography variant="body2">
              Available sizes: {sizes.join(", ")}
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

          {renderInventoryType}

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

        {renderActions}

        {renderMoreDetailSection}

        {renderAdditionalInfoSection}
      </Stack>
    </FormProvider>
  );
}
