import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { GridCellParams } from "@mui/x-data-grid";
import ListItemText from "@mui/material/ListItemText";
import LinearProgress from "@mui/material/LinearProgress";
import AvatarGroup from "@mui/material/AvatarGroup";

import { fCurrency } from "src/utils/format-number";
import { fTime, fDate } from "src/utils/format-time";

import Label from "src/components/label";

// ----------------------------------------------------------------------

type ParamsProps = {
  params: GridCellParams;
};

// Render price with sale price comparison
export function RenderCellPrice({ params }: ParamsProps) {
  const price = parseFloat(params.row.price) || 0;
  const salePrice = params.row.sale_price ? parseFloat(params.row.sale_price) : null;
  const hasSale = salePrice && salePrice < price;

  return (
    <Stack>
      <Typography variant="body2" fontWeight={600}>
        {fCurrency(hasSale ? salePrice : price)}
      </Typography>
      {hasSale && (
        <Typography
          variant="caption"
          sx={{ color: "text.disabled", textDecoration: "line-through" }}
        >
          {fCurrency(price)}
        </Typography>
      )}
    </Stack>
  );
}

// Render status based on product status field
export function RenderCellPublish({ params }: ParamsProps) {
  const status = params.row.status || "draft";

  const statusConfig: Record<string, { color: "success" | "warning" | "error" | "default"; label: string }> = {
    active: { color: "success", label: "Active" },
    draft: { color: "default", label: "Draft" },
    inactive: { color: "warning", label: "Inactive" },
    archived: { color: "error", label: "Archived" },
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <Label variant="soft" color={config.color}>
      {config.label}
    </Label>
  );
}

// Render created date
export function RenderCellCreatedAt({ params }: ParamsProps) {
  const createdAt = params.row.created_at || params.row.createdAt;

  if (!createdAt) return "-";

  return (
    <ListItemText
      primary={fDate(createdAt)}
      secondary={fTime(createdAt)}
      primaryTypographyProps={{ typography: "body2", noWrap: true }}
      secondaryTypographyProps={{
        mt: 0.5,
        component: "span",
        typography: "caption",
      }}
    />
  );
}

// Render stock quantity with visual indicator
export function RenderCellStock({ params }: ParamsProps) {
  const stockQuantity = params.row.stock_quantity ?? 0;
  const variants = params.row.variants || [];

  // Calculate total stock from variants if available
  const totalVariantStock = variants.reduce(
    (sum: number, v: any) => sum + (v.stock || 0),
    0
  );
  const displayStock = variants.length > 0 ? totalVariantStock : stockQuantity;

  // Determine stock status
  let stockStatus = "in stock";
  let color: "success" | "warning" | "error" = "success";

  if (displayStock === 0) {
    stockStatus = "out of stock";
    color = "error";
  } else if (displayStock <= 10) {
    stockStatus = "low stock";
    color = "warning";
  }

  return (
    <Stack sx={{ typography: "caption", color: "text.secondary" }}>
      <LinearProgress
        value={Math.min((displayStock / 100) * 100, 100)}
        variant="determinate"
        color={color}
        sx={{ mb: 1, height: 6, maxWidth: 80 }}
      />
      <Typography variant="caption" color={`${color}.main`}>
        {displayStock} {stockStatus}
      </Typography>
    </Stack>
  );
}

// Render variants summary (colors/sizes)
export function RenderCellVariants({ params }: ParamsProps) {
  const variants = params.row.variants || [];

  if (!variants.length) {
    return (
      <Typography variant="caption" color="text.disabled">
        No variants
      </Typography>
    );
  }

  // Extract unique colors
  const uniqueColors = variants
    .filter((v: any) => v.color?.hexCode)
    .reduce((acc: any[], v: any) => {
      if (!acc.find((c) => c.id === v.color.id)) {
        acc.push(v.color);
      }
      return acc;
    }, []);

  // Extract unique sizes
  const uniqueSizes = variants
    .filter((v: any) => v.size?.name)
    .reduce((acc: any[], v: any) => {
      if (!acc.find((s) => s.id === v.size.id)) {
        acc.push(v.size);
      }
      return acc;
    }, []);

  return (
    <Stack spacing={0.5}>
      {/* Color swatches */}
      {uniqueColors.length > 0 && (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <AvatarGroup max={4} sx={{ "& .MuiAvatar-root": { width: 16, height: 16, fontSize: 10 } }}>
            {uniqueColors.map((color: any) => (
              <Tooltip key={color.id} title={color.name}>
                <Avatar
                  sx={{
                    width: 16,
                    height: 16,
                    bgcolor: color.hexCode,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  {" "}
                </Avatar>
              </Tooltip>
            ))}
          </AvatarGroup>
        </Stack>
      )}

      {/* Size badges */}
      {uniqueSizes.length > 0 && (
        <Typography variant="caption" color="text.secondary">
          {uniqueSizes.map((s: any) => s.name).join(", ")}
        </Typography>
      )}

      <Typography variant="caption" color="text.disabled">
        {variants.length} variant{variants.length > 1 ? "s" : ""}
      </Typography>
    </Stack>
  );
}

// Render product cell with image, name, category, SKU
export function RenderCellProduct({ params }: ParamsProps) {
  const images = params.row.images || [];
  const category = params.row.category;
  const categoryName = typeof category === "object" ? category?.name : category;
  const sku = params.row.sku;
  const isFeatured = params.row.is_featured;

  return (
    <Stack direction="row" alignItems="center" sx={{ py: 2, width: 1 }}>
      <Avatar
        alt={params.row.name}
        src={images[0] || "/assets/placeholder.svg"}
        variant="rounded"
        sx={{ width: 64, height: 64, mr: 2 }}
      />

      <ListItemText
        disableTypography
        primary={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Link
              noWrap
              color="inherit"
              variant="subtitle2"
              onClick={params.row.onViewRow}
              sx={{ cursor: "pointer" }}
            >
              {params.row.name}
            </Link>
            {isFeatured && (
              <Label variant="soft" color="warning" sx={{ fontSize: 10 }}>
                Featured
              </Label>
            )}
          </Stack>
        }
        secondary={
          <Stack spacing={0.25}>
            <Typography variant="body2" color="text.disabled" noWrap>
              {categoryName || "No category"}
            </Typography>
            {sku && (
              <Typography variant="caption" color="text.disabled">
                SKU: {sku}
              </Typography>
            )}
          </Stack>
        }
        sx={{ display: "flex", flexDirection: "column" }}
      />
    </Stack>
  );
}

// Legacy status cell (kept for compatibility)
export function RenderCellStatus({ params }: ParamsProps) {
  const inventoryType: string = params.row.inventoryType || "";
  const publish: string = params.row.publish || "";

  let color: "success" | "default" | "error" | "warning" = "success";
  let label = "active";

  if (publish === "draft") {
    color = "default";
    label = "draft";
  }
  if (inventoryType === "out of stock") {
    color = "error";
    label = "Out of Stock";
  }

  return (
    <Label variant="soft" color={color}>
      {label}
    </Label>
  );
}
