"use client";

import { useState, useCallback, useMemo, useEffect } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

import { paths } from "src/routes/paths";

import { ORDER_STATUS_OPTIONS } from "src/_mock";

import { useSettingsContext } from "src/components/settings";
import { useSnackbar } from "src/components/snackbar";

import { useGetOrder, orderApi, Order } from "src/api/order";

import {
  IOrderCustomer,
  IOrderDelivery,
  IOrderPayment,
  IOrderShippingAddress,
  IOrderHistory,
  IOrderProductItem,
} from "src/types/order";

import OrderDetailsInfo from "../order-details-info";
import OrderDetailsItems from "../order-details-item";
import OrderDetailsHistory from "../order-details-history";
import OrderDetailsToolbar from "../order-details-toolbar";

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

// Transform API Order to detail view format
function transformOrderForDetailView(order: Order) {
  const subTotal = parseFloat(order.summary.subtotal || order.summary.total);
  const shipping = parseFloat(order.summary.shipping);
  const tax = parseFloat(order.summary.tax || "0");
  const discount = parseFloat(order.summary.discount);

  // Transform customer
  const customer: IOrderCustomer = order.user
    ? {
        id: order.user.id,
        name:
          order.user.name ||
          `${(order as any).user?.firstName || ""} ${(order as any).user?.lastName || ""}`.trim() ||
          "Unknown",
        email: order.user.email,
        avatarUrl: order.user.avatarUrl || "",
        ipAddress: "",
        country: (order as any).user?.country || "",
        firstName: (order as any).user?.firstName,
        lastName: (order as any).user?.lastName,
      }
    : {
        id: order.userId,
        name: "Unknown Customer",
        email: "unknown@example.com",
        avatarUrl: "",
        ipAddress: "",
      };

  // Transform items
  const productItems: IOrderProductItem[] = order.items.map((item, index) => ({
    id: item.variantId || item.productId.toString() || index.toString(),
    sku: item.sku || `${item.productId}-${item.variantId || "default"}`,
    name: item.productName,
    price: parseFloat(item.unitPrice),
    coverUrl: "", // API doesn't provide this, may need to fetch from product
    quantity: item.quantity,
    variantName: item.variantName,
    productSlug: item.productSlug,
    productId: typeof item.productId === "string" ? parseInt(item.productId, 10) : item.productId,
    variantId: item.variantId,
  }));

  // Transform history
  const history: IOrderHistory = {
    orderTime: new Date(order.createdAt),
    paymentTime: order.paidAt ? new Date(order.paidAt) : new Date(order.createdAt),
    deliveryTime: new Date(order.createdAt),
    completionTime: new Date(order.updatedAt),
    timeline: [
      {
        title: "Order placed",
        time: new Date(order.createdAt),
      },
      ...(order.paidAt
        ? [
            {
              title: "Payment completed",
              time: new Date(order.paidAt),
            },
          ]
        : []),
      {
        title: "Order updated",
        time: new Date(order.updatedAt),
      },
    ],
  };

  // Transform delivery
  const delivery: IOrderDelivery = {
    shipBy: (order as any).carrier || "",
    speedy: "",
    trackingNumber: (order as any).trackingNumber || "",
  };

  // Transform shipping address
  const shippingAddress: IOrderShippingAddress = order.shippingAddress
    ? typeof order.shippingAddress === "string"
      ? {
          fullAddress: order.shippingAddress,
          phoneNumber: "",
        }
      : {
          fullAddress: [
            order.shippingAddress.streetLine1,
            order.shippingAddress.streetLine2,
            order.shippingAddress.ward,
            order.shippingAddress.district,
            order.shippingAddress.province,
          ]
            .filter(Boolean)
            .join(", ") || "",
          phoneNumber: order.shippingAddress.recipientPhone || "",
        }
    : {
        fullAddress: "",
        phoneNumber: "",
      };

  // Transform payment (mock data for now as API doesn't provide card details)
  const payment: IOrderPayment = {
    cardType:
      order.paymentMethod === "PAYPAL"
        ? "PayPal"
        : order.paymentMethod === "STRIPE"
          ? "Stripe"
          : "COD",
    cardNumber:
      order.paymentMethod === "PAYPAL"
        ? "PayPal Account"
        : order.paymentMethod === "STRIPE"
          ? "**** **** **** 4242"
          : "Cash on Delivery",
  };

  return {
    customer,
    delivery,
    payment,
    shippingAddress,
    history,
    items: productItems,
    taxes: tax,
    shipping,
    discount,
    subTotal: subTotal - discount,
    totalAmount: parseFloat(order.summary.total),
    orderNumber: order.orderNumber,
    createdAt: new Date(order.createdAt),
    status: order.status.toLowerCase(),
  };
}

export default function OrderDetailsView({ id }: Props) {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  // Fetch order from API
  const { order, orderLoading, orderError } = useGetOrder(id);

  const [status, setStatus] = useState<string>("pending");

  // Update status when order is loaded
  useEffect(() => {
    if (order?.status) {
      setStatus(order.status.toLowerCase());
    }
  }, [order]);

  // Transform order data when available
  const orderData = useMemo(() => {
    if (!order) return null;
    return transformOrderForDetailView(order);
  }, [order]);

  const handleChangeStatus = useCallback(
    async (newValue: string) => {
      try {
        await orderApi.updateStatus(id, newValue.toUpperCase() as Order["status"]);
        setStatus(newValue);
        enqueueSnackbar("Order status updated successfully", { variant: "success" });
      } catch (error) {
        console.error("Error updating order status:", error);
        enqueueSnackbar("Failed to update order status", { variant: "error" });
      }
    },
    [id, enqueueSnackbar]
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
    <Container maxWidth={settings.themeStretch ? false : "lg"}>
      <OrderDetailsToolbar
        backLink={paths.dashboard.order.root}
        orderNumber={orderData.orderNumber}
        createdAt={orderData.createdAt}
        status={status}
        onChangeStatus={handleChangeStatus}
        statusOptions={ORDER_STATUS_OPTIONS}
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
            />

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
