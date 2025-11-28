"use client";

import { useState } from "react";
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
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";

import { fDate, fTime } from "src/utils/format-time";
import { paths } from "src/routes/paths";

import Iconify from "src/components/iconify";
import Label from "src/components/label";
import EmptyContent from "src/components/empty-content";
import AddressAutocomplete from "src/components/address-autocomplete/address-autocomplete";
import { getCountryConfig, useShippingCountries } from "src/config/shipping";

import { useGetMyOrders, Order } from "src/api/order";
import {
  getOrderStatusColor,
  getOrderStatusLabel,
} from "src/sections/order/constant";

// ----------------------------------------------------------------------

interface AccountBillingProps {
  plans?: any[];
  cards?: any[];
  invoices?: any[];
  addressBook?: any[];
}

// Helper functions to normalize status presentation
function getStatusColor(status: Order["status"]) {
  return getOrderStatusColor(status);
}

function formatStatus(status: Order["status"]) {
  return getOrderStatusLabel(status);
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

function getPaymentColor(method?: Order["paymentMethod"]) {
  const colors: Record<string, "default" | "primary" | "info" | "warning" | "secondary"> = {
    PAYPAL: "info",
    STRIPE: "secondary",
    COD: "warning",
  };
  return colors[method || ""] || "default";
}

function formatPaymentMethodLabel(method?: Order["paymentMethod"]) {
  if (!method) return "Unknown";
  if (method === "COD") return "Cash on Delivery";
  return method.charAt(0) + method.slice(1).toLowerCase();
}

const getCountryMessages = (countryCode: string) => {
  switch (countryCode) {
    case "VN":
      return {
        addressPlaceholder: "Nhập địa chỉ giao hàng (ví dụ: 123 Đường Lê Lợi)...",
        addressLabel: "Địa chỉ",
      };
    case "US":
      return {
        addressPlaceholder: "Enter street address (e.g., 123 Main St)...",
        addressLabel: "Street Address",
      };
    case "UK":
      return {
        addressPlaceholder: "Enter street address (e.g., 123 High Street)...",
        addressLabel: "Street Address",
      };
    default:
      return {
        addressPlaceholder: "Enter delivery address...",
        addressLabel: "Address",
      };
  }
};

type ShippingInfo = {
  recipient?: string;
  phone?: string;
  addressLine?: string;
  raw?: string;
};

function extractShippingInfo(order: Order): ShippingInfo | null {
  const addressSource = order.shippingAddress || order.billingAddress;

  if (addressSource) {
    const recipient = addressSource.full_name || addressSource.fullName || addressSource.name;
    const phone = addressSource.phone || addressSource.phoneNumber;
    const addressParts = [
      addressSource.address_line || addressSource.addressLine,
      addressSource.ward,
      addressSource.district,
      addressSource.city,
      addressSource.state,
      addressSource.country,
      addressSource.postalCode || addressSource.postal_code,
    ]
      .filter(Boolean)
      .join(", ");

    return {
      recipient,
      phone,
      addressLine: addressParts || undefined,
    };
  }

  if (!order.notes) {
    return null;
  }

  const prefix = "Shipping Address:";
  if (!order.notes.includes(prefix)) {
    return { raw: order.notes };
  }

  const cleaned = order.notes.slice(order.notes.indexOf(prefix) + prefix.length).trim();
  if (!cleaned) {
    return { raw: order.notes };
  }

  const tokens = cleaned.split(",").map((token) => token.trim()).filter(Boolean);
  const [recipient, phone, ...rest] = tokens;

  return {
    recipient,
    phone,
    addressLine: rest.length ? rest.join(", ") : undefined,
    raw: order.notes,
  };
}

export default function AccountBilling(_props: AccountBillingProps) {
  const router = useRouter();

  const [addressSearch, setAddressSearch] = useState("");
  const [addressCoordinates, setAddressCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [countryCode, setCountryCode] = useState("VN");

  const {
    countries,
    loading: countriesLoading,
    error: countriesError,
    refresh: refreshCountries,
  } = useShippingCountries();
  const selectedCountry = getCountryConfig(countryCode, countries);
  const addressMessages = getCountryMessages(countryCode);

  // Fetch orders from API
  const { orders, ordersLoading, ordersError, ordersEmpty } = useGetMyOrders();

  const handleViewOrder = (orderId: string) => {
    router.push(paths.orders.details(orderId));
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Quick Shipping Address Lookup</Typography>
            <Typography variant="body2" color="text.secondary">
              Use the Geoapify-powered autocomplete (same config as&nbsp;
              <code>countrycode:{countryCode.toLowerCase()}</code>) to locate addresses quickly before saving
              them to your account or using them at checkout.
            </Typography>

            <Box>
              <TextField
                select
                fullWidth
                label="Country/Region"
                value={countryCode}
                onChange={(event) => setCountryCode(event.target.value)}
                helperText={countriesLoading ? "Loading country list..." : undefined}
              >
                {countries.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>{option.flag}</span>
                      <span>{option.label}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </TextField>
              {selectedCountry && (
                <Typography variant="caption" color="text.secondary">
                  Default shipping cost: {selectedCountry.shippingCost} — Tax: {selectedCountry.taxRate}%
                </Typography>
              )}

              {countriesError && (
                <Alert
                  severity="warning"
                  sx={{ mt: 2 }}
                  action={
                    <Button color="inherit" size="small" onClick={() => refreshCountries(true)} disabled={countriesLoading}>
                      Retry
                    </Button>
                  }
                >
                  Unable to refresh country list. Using cached values for now.
                </Alert>
              )}
            </Box>

            <AddressAutocomplete
              value={addressSearch}
              onChange={(value, coords) => {
                setAddressSearch(value);
                setAddressCoordinates(coords || null);
              }}
              label={addressMessages.addressLabel}
              placeholder={addressMessages.addressPlaceholder}
              countryCode={countryCode.toLowerCase()}
              helperText={
                selectedCountry
                  ? `Tìm kiếm địa chỉ tại ${selectedCountry.label}`
                  : "Start typing to search for addresses"
              }
              required
            />
            {addressSearch && (
              <Box
                sx={{
                  bgcolor: "background.neutral",
                  borderRadius: 1,
                  p: 2,
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Selected address
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                  {addressSearch}
                </Typography>
                {addressCoordinates && (
                  <Typography variant="caption" color="text.secondary">
                    Lat: {addressCoordinates.lat.toFixed(6)} • Lon: {addressCoordinates.lon.toFixed(6)}
                  </Typography>
                )}
              </Box>
            )}
          </Stack>
        </Card>
      </Grid>

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
              {orders.map((order) => {
                const shippingInfo = extractShippingInfo(order);
                const paymentChipLabel = [
                  formatPaymentMethodLabel(order.paymentMethod),
                  order.paidAt ? `Paid on ${fDate(order.paidAt, "dd MMM")} ${fTime(order.paidAt, "h:mm a")}` : "Awaiting payment",
                ]
                  .filter(Boolean)
                  .join(" • ");

                const summaryRows = [
                  { label: "Subtotal", value: formatCurrencyWithCode(order.summary.subtotal, order.summary.currency) },
                  { label: "Shipping", value: formatCurrencyWithCode(order.summary.shipping, order.summary.currency) },
                  { label: "Tax", value: formatCurrencyWithCode(order.summary.tax, order.summary.currency) },
                  { label: "Discount", value: formatCurrencyWithCode(order.summary.discount, order.summary.currency) },
                ];

                const paidAmount =
                  order.paidAmount && order.paidCurrency
                    ? formatCurrencyWithCode(order.paidAmount, order.paidCurrency)
                    : null;
                const carrier = (order as Record<string, any>).carrier as string | null | undefined;
                const trackingNumber = (order as Record<string, any>).trackingNumber as string | null | undefined;

                return (
                  <Card key={order.id} variant="outlined" sx={{ p: 2.5 }}>
                    <Stack spacing={2.5}>
                      {/* Header: Order Number, Date, Status */}
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        justifyContent="space-between"
                        gap={2}
                      >
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {order.orderNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Placed on {fDate(order.createdAt, "dd MMM yyyy")} at {fTime(order.createdAt, "h:mm a")}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <Label variant="soft" color={getStatusColor(order.status)}>
                            {formatStatus(order.status)}
                          </Label>
                          <Label variant="soft" color={getPaymentColor(order.paymentMethod)}>
                            {formatPaymentMethodLabel(order.paymentMethod)}
                          </Label>
                        </Stack>
                      </Stack>

                      <Divider />

                      {/* Order Items */}
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                          Items ({order.items.length})
                        </Typography>
                        <Stack spacing={1.25}>
                          {order.items.slice(0, 4).map((item, index) => (
                            <Stack
                              key={`${item.productId}-${index}`}
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              sx={{ py: 0.5 }}
                            >
                              <Box sx={{ pr: 2, flex: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {item.productName}
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                  {item.variantName && (
                                    <Typography variant="caption" color="text.secondary">
                                      Variant: {item.variantName}
                                    </Typography>
                                  )}
                                  <Typography variant="caption" color="text.secondary">
                                    Qty: {item.quantity}
                                  </Typography>
                                  {item.sku && (
                                    <Typography variant="caption" color="text.secondary">
                                      SKU: {item.sku}
                                    </Typography>
                                  )}
                                </Stack>
                              </Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {formatCurrencyWithCode(item.totalPrice, order.summary.currency)}
                              </Typography>
                            </Stack>
                          ))}
                          {order.items.length > 4 && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                              +{order.items.length - 4} more item{order.items.length - 4 > 1 ? "s" : ""}
                            </Typography>
                          )}
                        </Stack>
                      </Box>

                      <Divider />

                      {/* Information Grid */}
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                          <Stack spacing={1.5}>
                            <Typography variant="subtitle2">Payment</Typography>
                            <Chip label={paymentChipLabel} color={getPaymentColor(order.paymentMethod)} variant="filled" />
                            {paidAmount && (
                              <Typography variant="body2" color="text.secondary">
                                Captured amount: {paidAmount}
                              </Typography>
                            )}
                            {order.paypalOrderId && (
                              <Typography variant="caption" color="text.secondary">
                                PayPal Order ID: {order.paypalOrderId}
                              </Typography>
                            )}
                            {order.paypalTransactionId && (
                              <Typography variant="caption" color="text.secondary">
                                PayPal Txn ID: {order.paypalTransactionId}
                              </Typography>
                            )}
                          </Stack>
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <Stack spacing={1.5}>
                            <Typography variant="subtitle2">Shipping</Typography>
                            {carrier && trackingNumber ? (
                              <Chip
                                label={`${carrier} • ${trackingNumber}`}
                                variant="outlined"
                                size="small"
                                sx={{ width: "fit-content" }}
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No tracking details yet.
                              </Typography>
                            )}
                            {shippingInfo ? (
                              <Stack spacing={0.5}>
                                {shippingInfo.recipient && (
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {shippingInfo.recipient}
                                  </Typography>
                                )}
                                {shippingInfo.phone && (
                                  <Typography variant="body2" color="text.secondary">
                                    {shippingInfo.phone}
                                  </Typography>
                                )}
                                {shippingInfo.addressLine && (
                                  <Typography variant="body2" color="text.secondary">
                                    {shippingInfo.addressLine}
                                  </Typography>
                                )}
                                {!shippingInfo.addressLine && shippingInfo.raw && (
                                  <Typography variant="body2" color="text.secondary">
                                    {shippingInfo.raw}
                                  </Typography>
                                )}
                              </Stack>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Shipping address not provided.
                              </Typography>
                            )}
                          </Stack>
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <Stack spacing={1.5}>
                            <Typography variant="subtitle2">Order summary</Typography>
                            <Stack spacing={0.5}>
                              {summaryRows.map((row) => (
                                <Stack key={row.label} direction="row" justifyContent="space-between">
                                  <Typography variant="body2" color="text.secondary">
                                    {row.label}
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {row.value}
                                  </Typography>
                                </Stack>
                              ))}
                            </Stack>
                            <Divider flexItem />
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle2">Total</Typography>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {formatCurrencyWithCode(order.summary.total, order.summary.currency)}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Grid>
                      </Grid>

                      {order.notes && (
                        <>
                          <Divider />
                          <Box>
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                              Notes
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {order.notes}
                            </Typography>
                          </Box>
                        </>
                      )}

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
                );
              })}
            </Stack>
          )}
        </Card>
      </Grid>
    </Grid>
  );
}
