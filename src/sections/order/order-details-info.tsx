import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

import Iconify from "src/components/iconify";

import {
  IOrderPayment,
  IOrderCustomer,
  IOrderDelivery,
  IOrderShippingAddress,
} from "src/types/order";

// ----------------------------------------------------------------------

type Props = {
  customer: IOrderCustomer;
  delivery: IOrderDelivery;
  payment: IOrderPayment;
  shippingAddress: IOrderShippingAddress;
};

function formatCurrencyWithCode(amount?: number | null, currency?: string | null) {
  if (amount === null || amount === undefined) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function OrderDetailsInfo({
  customer,
  delivery,
  payment,
  shippingAddress,
}: Props) {
  const renderCustomer = (
    <>
      <CardHeader
        title="Customer Info"
        action={
          <IconButton>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        }
      />
      <Stack direction="row" sx={{ p: 3 }}>
        <Avatar
          alt={customer.name}
          src={customer.avatarUrl}
          sx={{ width: 48, height: 48, mr: 2 }}
        />

        <Stack
          spacing={0.5}
          alignItems="flex-start"
          sx={{ typography: "body2" }}
        >
          <Typography variant="subtitle2">{customer.name}</Typography>

          <Box sx={{ color: "text.secondary" }}>{customer.email}</Box>

          {customer.country && (
            <Box sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
              {customer.country}
            </Box>
          )}
        </Stack>
      </Stack>
    </>
  );

  const renderDelivery = (
    <>
      <CardHeader
        title="Delivery"
        action={
          <IconButton>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        }
      />
      <Stack spacing={1.5} sx={{ p: 3, typography: "body2" }}>
        <Stack direction="row" alignItems="center">
          <Box
            component="span"
            sx={{ color: "text.secondary", width: 120, flexShrink: 0 }}
          >
            Ship by
          </Box>
          {delivery.shipBy || "Not assigned"}
        </Stack>
        <Stack direction="row" alignItems="center">
          <Box
            component="span"
            sx={{ color: "text.secondary", width: 120, flexShrink: 0 }}
          >
            Speedy
          </Box>
          {delivery.speedy || "Standard"}
        </Stack>
        <Stack direction="row" alignItems="center">
          <Box
            component="span"
            sx={{ color: "text.secondary", width: 120, flexShrink: 0 }}
          >
            Tracking No.
          </Box>
          {delivery.trackingNumber ? (
            <Link underline="always" color="inherit">
              {delivery.trackingNumber}
            </Link>
          ) : (
            "-"
          )}
        </Stack>
      </Stack>
    </>
  );

  const renderShipping = (
    <>
      <CardHeader
        title="Shipping"
        action={
          <IconButton>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        }
      />
      <Stack spacing={1.5} sx={{ p: 3, typography: "body2" }}>
        <Stack direction="row">
          <Box
            component="span"
            sx={{ color: "text.secondary", width: 120, flexShrink: 0 }}
          >
            Address
          </Box>
          {shippingAddress.fullAddress || "Not provided"}
        </Stack>

        {shippingAddress.recipientName && (
          <Stack direction="row">
            <Box
              component="span"
              sx={{ color: "text.secondary", width: 120, flexShrink: 0 }}
            >
              Recipient
            </Box>
            {shippingAddress.recipientName}
          </Stack>
        )}

        <Stack direction="row">
          <Box
            component="span"
            sx={{ color: "text.secondary", width: 120, flexShrink: 0 }}
          >
            Phone number
          </Box>
          {shippingAddress.phoneNumber || "-"}
        </Stack>
      </Stack>
    </>
  );

  const renderPayment = (
    <>
      <CardHeader
        title="Payment"
        action={
          <IconButton>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        }
      />
      <Stack spacing={1.5} sx={{ p: 3, typography: "body2" }}>
        <Stack direction="row" alignItems="center">
          <Box
            component="span"
            sx={{ color: "text.secondary", width: 120, flexShrink: 0 }}
          >
            Method
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={payment.cardType} size="small" variant="soft" />
            {payment.status && (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {payment.status}
              </Typography>
            )}
          </Stack>
        </Stack>
        <Stack direction="row" alignItems="center">
          <Box
            component="span"
            sx={{ color: "text.secondary", width: 120, flexShrink: 0 }}
          >
            Details
          </Box>
          {payment.cardNumber}
        </Stack>
        {payment.paidAmount !== undefined && (
          <Stack direction="row" alignItems="center">
            <Box
              component="span"
              sx={{ color: "text.secondary", width: 120, flexShrink: 0 }}
            >
              Paid amount
            </Box>
            {formatCurrencyWithCode(payment.paidAmount, payment.paidCurrency)}
          </Stack>
        )}
        {payment.paidAt && (
          <Stack direction="row" alignItems="center">
            <Box
              component="span"
              sx={{ color: "text.secondary", width: 120, flexShrink: 0 }}
            >
              Paid at
            </Box>
            {payment.paidAt.toLocaleString()}
          </Stack>
        )}
        {payment.transactionId && (
          <Stack direction="row" alignItems="center">
            <Box
              component="span"
              sx={{ color: "text.secondary", width: 120, flexShrink: 0 }}
            >
              Transaction ID
            </Box>
            {payment.transactionId}
          </Stack>
        )}
        {payment.orderId && (
          <Stack direction="row" alignItems="center">
            <Box
              component="span"
              sx={{ color: "text.secondary", width: 120, flexShrink: 0 }}
            >
              External order
            </Box>
            {payment.orderId}
          </Stack>
        )}
      </Stack>
    </>
  );

  return (
    <Card>
      {renderCustomer}

      <Divider sx={{ borderStyle: "dashed" }} />

      {renderDelivery}

      <Divider sx={{ borderStyle: "dashed" }} />

      {renderShipping}

      <Divider sx={{ borderStyle: "dashed" }} />

      {renderPayment}
    </Card>
  );
}
