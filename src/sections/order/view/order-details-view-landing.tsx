"use client";

import { useMemo } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import { useSettingsContext } from "src/components/settings";
import Iconify from "src/components/iconify";
import Label from "src/components/label";

import { useGetOrder } from "src/api/order";

import { fDateTime } from "src/utils/format-time";

import OrderDetailsInfo from "../order-details-info";
import OrderDetailsItems from "../order-details-item";
import OrderDetailsHistory from "../order-details-history";
import OrderDetailsNotes from "../order-details-notes";
import { transformOrderForDetailView } from "../utils/transform-order";

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

// Helper function to get status color
function getStatusColor(status: string) {
  const colors: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
    pending: "warning",
    paid: "info",
    processing: "primary",
    shipped: "secondary",
    delivered: "success",
    cancelled: "error",
    failed: "error",
    refunded: "error",
  };
  return colors[status] || "default";
}

function formatStatusLabel(status: string) {
  if (!status) return "";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function OrderDetailsViewLanding({ id }: Props) {
  const settings = useSettingsContext();

  // Fetch order from API
  const { order, orderLoading, orderError } = useGetOrder(id);

  // Transform order data when available
  const orderData = useMemo(() => {
    if (!order) return null;
    return transformOrderForDetailView(order);
  }, [order]);

  // Loading state
  if (orderLoading) {
    return (
      <Container maxWidth={settings.themeStretch ? false : "lg"}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Error state
  if (orderError || !orderData) {
    return (
      <Container maxWidth={settings.themeStretch ? false : "lg"}>
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Order not found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {orderError
              ? "Failed to load order. Please try again."
              : "The order you're looking for doesn't exist."}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth={settings.themeStretch ? false : "lg"} 
      sx={{ 
        py: { xs: 3, md: 5 },
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {/* Simple toolbar for landing page - no status update */}
      <Stack
        spacing={3}
        direction={{ xs: "column", md: "row" }}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        <Stack spacing={1} direction="row" alignItems="flex-start">
          <IconButton component={RouterLink} href={paths.landing.user.account}>
            <Iconify icon="eva:arrow-ios-back-fill" />
          </IconButton>

          <Stack spacing={0.5}>
            <Stack spacing={1} direction="row" alignItems="center" flexWrap="wrap">
              <Typography variant="h4">Order {orderData.orderNumber}</Typography>
              <Label variant="soft" color={getStatusColor(orderData.status)}>
                {formatStatusLabel(orderData.status)}
              </Label>
            </Stack>

            <Typography variant="body2" sx={{ color: "text.disabled" }}>
              {fDateTime(orderData.createdAt)}
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      <Grid container spacing={{ xs: 2, sm: 3, md: 3 }}>
        <Grid xs={12} md={8}>
          <Stack spacing={3} direction={{ xs: "column-reverse", md: "column" }}>
            <OrderDetailsItems
              items={orderData.items}
              taxes={orderData.taxes}
              shipping={orderData.shipping}
              discount={orderData.discount}
              subTotal={orderData.subTotal}
              totalAmount={orderData.totalAmount}
              currency={orderData.currency}
            />

            <OrderDetailsNotes notes={orderData.notes} internalNotes={orderData.internalNotes} />

            <OrderDetailsHistory history={orderData.history} />
          </Stack>
        </Grid>

        <Grid xs={12} md={4}>
          <OrderDetailsInfo
            customer={orderData.customer}
            delivery={orderData.delivery}
            payment={orderData.payment}
            shippingAddress={orderData.shippingAddress}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

