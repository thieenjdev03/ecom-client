"use client";

import { useRouter } from "next/navigation";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";

import { fDate, fTime } from "src/utils/format-time";
import { paths } from "src/routes/paths";

import Iconify from "src/components/iconify";
import Label from "src/components/label";
import EmptyContent from "src/components/empty-content";

import { useGetMyOrders, Order } from "src/api/order";

// ----------------------------------------------------------------------

interface AccountBillingProps {
  plans?: any[];
  cards?: any[];
  invoices?: any[];
  addressBook?: any[];
}

// Helper function to get status color
function getStatusColor(status: Order["status"]) {
  const colors: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
    PENDING: "warning",
    PAID: "info",
    PROCESSING: "primary",
    SHIPPED: "secondary",
    DELIVERED: "success",
    CANCELLED: "error",
    FAILED: "error",
    REFUNDED: "error",
  };
  return colors[status] || "default";
}

// Helper function to format status text
function formatStatus(status: Order["status"]) {
  const statusMap: Record<string, string> = {
    PENDING: "Pending",
    PAID: "Paid",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    FAILED: "Failed",
    REFUNDED: "Refunded",
  };
  return statusMap[status] || status;
}

// Helper function to format payment method
function formatPaymentMethod(method?: string) {
  if (!method) return "N/A";
  return method.charAt(0) + method.slice(1).toLowerCase();
}

// Helper function to format currency with specific currency code
function formatCurrencyWithCode(amount: string | number, currency: string = "USD"): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return formatter.format(numAmount);
}

export default function AccountBilling(_props: AccountBillingProps) {
  const router = useRouter();

  // Fetch orders from API
  const { orders, ordersLoading, ordersError, ordersEmpty } = useGetMyOrders();

  const handleViewOrder = (orderId: string) => {
    router.push(paths.orders.details(orderId));
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Typography variant="h6">Order History</Typography>
          </Stack>

          {ordersLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress />
            </Box>
          )}

          {ordersError && (
            <Box sx={{ py: 5 }}>
              <EmptyContent
                title="Error loading orders"
                description={ordersError.message || "Failed to load order history. Please try again later."}
                imgUrl="/assets/illustrations/illustration-empty.svg"
              />
            </Box>
          )}

          {!ordersLoading && !ordersError && ordersEmpty && (
            <Box sx={{ py: 5 }}>
              <EmptyContent
                title="No orders yet"
                description="You haven't placed any orders yet. Start shopping to see your order history here."
                imgUrl="/assets/illustrations/illustration-empty.svg"
              />
            </Box>
          )}

          {!ordersLoading && !ordersError && !ordersEmpty && (
            <Stack spacing={2}>
              {orders.map((order) => (
                <Card key={order.id} variant="outlined" sx={{ p: 2.5 }}>
                  <Stack spacing={2}>
                    {/* Header: Order Number, Date, Status */}
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      flexWrap="wrap"
                      gap={2}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {order.orderNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {fDate(order.createdAt, "dd MMM yyyy")} at {fTime(order.createdAt, "h:mm a")}
                          </Typography>
                        </Box>
                      </Stack>
                      <Label variant="soft" color={getStatusColor(order.status)}>
                        {formatStatus(order.status)}
                      </Label>
                    </Stack>

                    <Divider />

                    {/* Order Items */}
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                        Items ({order.items.length})
                      </Typography>
                      <Stack spacing={1}>
                        {order.items.slice(0, 3).map((item, index) => (
                          <Stack
                            key={index}
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{ py: 0.5 }}
                          >
                            <Typography variant="body2">
                              {item.productName}
                              {item.variantName && (
                                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                  ({item.variantName})
                                </Typography>
                              )}
                              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                × {item.quantity}
                              </Typography>
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {formatCurrencyWithCode(item.totalPrice, order.summary.currency)}
                            </Typography>
                          </Stack>
                        ))}
                        {order.items.length > 3 && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                            +{order.items.length - 3} more item{order.items.length - 3 > 1 ? "s" : ""}
                          </Typography>
                        )}
                      </Stack>
                    </Box>

                    <Divider />

                    {/* Order Summary */}
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          Payment Method
                        </Typography>
                        <Chip
                          label={formatPaymentMethod(order.paymentMethod)}
                          size="small"
                          variant="outlined"
                          sx={{ width: "fit-content" }}
                        />
                      </Stack>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                          Total Amount
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {formatCurrencyWithCode(order.summary.total, order.summary.currency)}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Actions */}
                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Iconify icon="solar:eye-bold" />}
                        onClick={() => handleViewOrder(order.id)}
                      >
                        View Details
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}
        </Card>
      </Grid>
    </Grid>
  );
}
