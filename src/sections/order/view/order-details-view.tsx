"use client";

import { useState, useCallback, useMemo, useEffect } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

import { paths } from "src/routes/paths";

import {
  ORDER_STATUS_ALL_OPTIONS,
  ORDER_STATUS_OPTIONS,
  getNextOrderStatuses,
  getOrderStatusDescription,
  getOrderStatusLabel,
  normalizeOrderStatus,
} from "../constant";

import { useSettingsContext } from "src/components/settings";
import { useSnackbar } from "src/components/snackbar";

import { useGetOrder, orderApi, Order, UpdateOrderPayload } from "src/api/order";
import OrderDetailsEditDrawer from "../components/order-edit-drawer";

import OrderDetailsInfo from "../order-details-info";
import OrderDetailsItems from "../order-details-item";
import OrderDetailsHistory from "../order-details-history";
import OrderDetailsToolbar from "../order-details-toolbar";
import OrderDetailsNotes from "../order-details-notes";
import { transformOrderForDetailView } from "../utils/transform-order";

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function OrderDetailsView({ id }: Props) {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  // Fetch order from API
  const { order, orderLoading, orderError, mutateOrder } = useGetOrder(id);

  const [status, setStatus] = useState<string>(ORDER_STATUS_OPTIONS[0].value);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Update status when order is loaded
  useEffect(() => {
    if (order?.status) {
      const normalized = normalizeOrderStatus(order.status);
      setStatus(normalized || ORDER_STATUS_OPTIONS[0].value);
    }
  }, [order]);
  const allowedStatusValues = useMemo(
    () => (order ? getNextOrderStatuses(order.status) : []),
    [order?.status],
  );

  const allowedStatusOptions = useMemo(
    () =>
      allowedStatusValues.map((value) => ({
        value,
        label: getOrderStatusLabel(value),
        description: getOrderStatusDescription(value),
      })),
    [allowedStatusValues],
  );

  const allStatusOptions = useMemo(
    () =>
      ORDER_STATUS_ALL_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
        description: getOrderStatusDescription(option.value),
      })),
    [],
  );

  // Transform order data when available
  const orderData = useMemo(() => {
    if (!order) return null;
    return transformOrderForDetailView(order);
  }, [order]);

  const handleChangeStatus = useCallback(
    async (newValue: string) => {
      if (!allowedStatusOptions.some((option) => option.value === newValue)) {
        enqueueSnackbar("Status transition is not allowed for this order", {
          variant: "warning",
        });
        return;
      }
      try {
        await orderApi.changeStatus(id, {
          toStatus: newValue.toUpperCase() as Order["status"],
          note: `Status updated from ${getOrderStatusLabel(status)} to ${getOrderStatusLabel(newValue)}`,
        });
        setStatus(newValue);
        enqueueSnackbar("Order status updated successfully", { variant: "success" });
        await mutateOrder?.();
      } catch (error) {
        console.error("Error updating order status:", error);
        enqueueSnackbar("Failed to update order status", { variant: "error" });
      }
    },
    [id, status, enqueueSnackbar, allowedStatusOptions, mutateOrder]
  );

  const handleEditSubmit = useCallback(
    async (payload: UpdateOrderPayload) => {
      if (!Object.keys(payload).length) {
        enqueueSnackbar("Nothing to update", { variant: "info" });
        setIsEditOpen(false);
        return;
      }

      try {
        setIsSavingEdit(true);
        await orderApi.update(id, payload);
        enqueueSnackbar("Order updated successfully", { variant: "success" });
        await mutateOrder?.();
        setIsEditOpen(false);
      } catch (error) {
        console.error("Error updating order:", error);
        enqueueSnackbar("Failed to update order", { variant: "error" });
      } finally {
        setIsSavingEdit(false);
      }
    },
    [enqueueSnackbar, id, mutateOrder]
  );

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
    <>
      <Container maxWidth={settings.themeStretch ? false : "lg"}>
        <OrderDetailsToolbar
          backLink={paths.dashboard.order.root}
          orderNumber={orderData.orderNumber}
          createdAt={orderData.createdAt}
          status={status}
          onChangeStatus={handleChangeStatus}
          statusOptions={allStatusOptions.map(({ value, label }) => ({ value, label }))}
          allowedStatusValues={allowedStatusValues}
          onEdit={order ? () => setIsEditOpen(true) : undefined}
        />

        <Grid container spacing={3}>
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

      <OrderDetailsEditDrawer
        order={order ?? null}
        open={isEditOpen}
        saving={isSavingEdit}
        statusOptions={allStatusOptions}
        allowedStatusValues={allowedStatusValues}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
      />
    </>
  );
}
