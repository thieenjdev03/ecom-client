import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";

import Image from "src/components/image";

import { IOrderProductItem } from "src/types/order";

// ----------------------------------------------------------------------

type Props = {
  item: IOrderProductItem;
  currency?: string;
  showFullDetails?: boolean;
};

// Helper function to format currency with specific currency code
function formatCurrencyWithCode(amount: number, currency: string = "USD"): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
}

// Helper to parse variant name (format: "Color: White – Size: L")
function parseVariantName(variantName?: string): { label: string; value: string }[] {
  if (!variantName) return [];
  
  // Split by "–" or "-" and parse each part
  const parts = variantName.split(/[–-]/).map((p) => p.trim());
  return parts
    .map((part) => {
      const colonIndex = part.indexOf(":");
      if (colonIndex > 0) {
        return {
          label: part.substring(0, colonIndex).trim(),
          value: part.substring(colonIndex + 1).trim(),
        };
      }
      return null;
    })
    .filter((item): item is { label: string; value: string } => item !== null);
}

export default function OrderProductItem({ item, currency = "USD", showFullDetails = false }: Props) {
  const { name, sku, quantity, price, coverUrl, variantName } = item;
  
  const totalPrice = quantity * price;
  const variants = parseVariantName(variantName);
  
  // Get product image URL - try coverUrl first, then construct from productSlug if needed
  const imageUrl = coverUrl || `/assets/images/products/product-placeholder.svg`;

  const productContent = (
    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ width: "100%" }}>
      {/* Thumbnail */}
      <Box
        sx={{
          width: 40,
          height: 40,
          flexShrink: 0,
          borderRadius: 1,
          overflow: "hidden",
          position: "relative",
          bgcolor: "background.neutral",
        }}
      >
        {imageUrl && imageUrl !== `/assets/images/products/product-placeholder.svg` ? (
          <Image
            alt={name}
            src={imageUrl}
            ratio="1/1"
            disabledEffect
            sx={{ borderRadius: 1 }}
          />
        ) : (
          <Avatar
            variant="rounded"
            sx={{
              width: 40,
              height: 40,
            }}
          >
            {name[0]?.toUpperCase()}
          </Avatar>
        )}
      </Box>

      {/* Product Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Product Name */}
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            mb: 0.25,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
          }}
        >
          {name}
        </Typography>

        {/* Variant Chips */}
        {variants.length > 0 && (
          <Stack direction="row" spacing={0.5} sx={{ mb: 0.5, flexWrap: "wrap" }}>
            {variants.map((variant, index) => (
              <Chip
                key={index}
                label={`${variant.label}: ${variant.value}`}
                size="small"
                variant="outlined"
                sx={{
                  height: 18,
                  fontSize: "0.65rem",
                  "& .MuiChip-label": {
                    px: 0.5,
                  },
                }}
              />
            ))}
          </Stack>
        )}

        {/* Quantity and Price */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
          <Chip
            label={`x${quantity}`}
            size="small"
            variant="soft"
            color="primary"
            sx={{
              height: 20,
              fontSize: "0.7rem",
              fontWeight: 600,
            }}
          />
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {formatCurrencyWithCode(price, currency)}
          </Typography>
          {showFullDetails && (
            <Typography variant="caption" sx={{ color: "text.primary", fontWeight: 600, ml: "auto" }}>
              {formatCurrencyWithCode(totalPrice, currency)}
            </Typography>
          )}
        </Stack>
      </Box>
    </Stack>
  );

  return <Box>{productContent}</Box>;
}

