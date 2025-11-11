import { useRef } from "react";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import MenuItem from "@mui/material/MenuItem";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import Link from "@mui/material/Link";

import { useBoolean } from "src/hooks/use-boolean";

import { fCurrency } from "src/utils/format-number";
import { fDate, fTime } from "src/utils/format-time";
import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import Label from "src/components/label";
import Iconify from "src/components/iconify";
import { ConfirmDialog } from "src/components/custom-dialog";
import CustomPopover, { usePopover } from "src/components/custom-popover";

import { IOrderItem } from "src/types/order";
import OrderProductItem from "./components/order-product-item";

// ----------------------------------------------------------------------

type Props = {
  row: IOrderItem;
  selected: boolean;
  onViewRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

// Helper function to format currency with specific currency code
function formatCurrencyWithCode(amount: number, currency: string = "USD"): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
}

// Helper function to get initials from name
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Helper function to format date time as "04 Nov 2025 – 8:47 AM"
function formatDateTime(date: Date): string {
  const dateStr = fDate(date, "dd MMM yyyy");
  const timeStr = fTime(date, "h:mm a");
  return `${dateStr} – ${timeStr}`;
}

export default function OrderTableRow({
  row,
  selected,
  onViewRow,
  onSelectRow,
  onDeleteRow,
}: Props) {
  const {
    items,
    status,
    orderNumber,
    createdAt,
    updatedAt,
    customer,
    totalAmount,
    paymentMethod,
    paidAt,
    currency,
    carrier,
    trackingNumber,
    notes,
    internalNotes,
    shippingAddress,
    billingAddress,
    shipping,
    discount,
    subTotal,
  } = row;

  const confirm = useBoolean();
  const collapse = useBoolean();
  const popover = usePopover();
  const rowRef = useRef<HTMLTableRowElement>(null);

  // Get payment badge color
  const getPaymentColor = () => {
    if (!paymentMethod) return "default";
    switch (paymentMethod.toUpperCase()) {
      case "PAYPAL":
        return "info";
      case "STRIPE":
        return "secondary";
      case "COD":
        return "default";
      default:
        return "default";
    }
  };

  // Get payment display text
  const getPaymentText = () => {
    if (!paymentMethod) return "N/A";
    const methodName = paymentMethod.charAt(0) + paymentMethod.slice(1).toLowerCase();
    if (paidAt) {
      const paidDate = fDate(paidAt, "dd MMM");
      return `${methodName} • Paid on ${paidDate}`;
    }
    return methodName;
  };

  // Maximum products to display in Products column
  const MAX_PRODUCTS_DISPLAY = 2;

  const hasNotes = !!(notes || internalNotes);

  const handleRowClick = (e: React.MouseEvent) => {
    // Don't toggle if clicking on checkbox, action buttons, or links
    const target = e.target as HTMLElement;
    if (
      target.closest('input[type="checkbox"]') ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('[role="button"]')
    ) {
      return;
    }
    collapse.onToggle();
  };

  const renderPrimary = (
    <TableRow 
      ref={rowRef}
      hover 
      selected={selected}
      onClick={handleRowClick}
      sx={{ 
        position: "relative",
        cursor: "pointer",
      }}
    >
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectRow} />
      </TableCell>

      {/* Order No. - Bold, clickable */}
      <TableCell>
        <Box
          onClick={(e) => {
            e.stopPropagation();
            onViewRow();
          }}
          sx={{
            cursor: "pointer",
            fontWeight: 600,
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          {orderNumber}
        </Box>
      </TableCell>

      {/* Created At - Format: 04 Nov 2025 – 8:47 AM */}
      <TableCell>
        <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
          {formatDateTime(createdAt)}
        </Typography>
      </TableCell>

      {/* Updated At - Format: 04 Nov 2025 – 8:47 AM */}
      <TableCell>
        <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
          {formatDateTime(updatedAt)}
        </Typography>
      </TableCell>

      {/* Customer - Avatar (initials) + email below */}
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar
            alt={customer.name}
            src={customer.avatarUrl}
            sx={{ width: 36, height: 36 }}
          >
            {!customer.avatarUrl && getInitials(customer.name)}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {customer.name}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.disabled", display: "block" }}>
              {customer.email}
            </Typography>
          </Box>
        </Stack>
      </TableCell>

      {/* Total - Bold, right aligned, with currency */}
      <TableCell align="right">
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {formatCurrencyWithCode(totalAmount, currency)}
        </Typography>
      </TableCell>

      {/* Payment - Badge with paymentMethod and paidAt */}
      <TableCell>
        <Label
          variant="soft"
          color={getPaymentColor()}
        >
          {getPaymentText()}
        </Label>
      </TableCell>

      {/* Status - Badge */}
      <TableCell>
        <Label
          variant="soft"
          color={
            (status === "completed" && "success") ||
            (status === "pending" && "warning") ||
            (status === "cancelled" && "error") ||
            (status === "refunded" && "error") ||
            "default"
          }
        >
          {status}
        </Label>
      </TableCell>

      {/* Products - Simple text display */}
      <TableCell>
        <Typography variant="body2">
          {items.length === 0
            ? "No products"
            : items.length === 1
              ? `${items[0].name} (x${items[0].quantity})`
              : `${items[0].name} (x${items[0].quantity})${items.length > 1 ? ` +${items.length - 1} more` : ""}`}
        </Typography>
      </TableCell>

      {/* Shipping - Carrier and trackingNumber if available */}
      <TableCell>
        {trackingNumber ? (
          <Typography variant="body2">
            {carrier ? `${carrier} - ` : ""}
            {trackingNumber}
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ color: "text.disabled" }}>
            -
          </Typography>
        )}
      </TableCell>

      {/* Notes - Icon with tooltip if notes exist */}
      <TableCell align="center">
        {hasNotes && (
          <Tooltip
            title={
              <Box>
                {notes && <Typography variant="caption">Notes: {notes}</Typography>}
                {internalNotes && (
                  <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
                    Internal: {internalNotes}
                  </Typography>
                )}
              </Box>
            }
            arrow
          >
            <IconButton size="small" sx={{ color: "text.secondary" }}>
              <Iconify icon="solar:notes-bold" width={18} />
            </IconButton>
          </Tooltip>
        )}
      </TableCell>

      {/* Actions */}
      <TableCell align="right" sx={{ px: 1, whiteSpace: "nowrap" }}>
        <IconButton
          color={collapse.value ? "inherit" : "default"}
          onClick={(e) => {
            e.stopPropagation();
            collapse.onToggle();
          }}
          sx={{
            ...(collapse.value && {
              bgcolor: "action.hover",
            }),
            transform: collapse.value ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        >
          <Iconify icon="eva:arrow-ios-downward-fill" />
        </IconButton>

        <IconButton
          color={popover.open ? "inherit" : "default"}
          onClick={(e) => {
            e.stopPropagation();
            popover.onOpen(e);
          }}
        >
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  const renderSecondary = (
    <TableRow>
      <TableCell sx={{ p: 0, border: "none" }} colSpan={11}>
        <Collapse
          in={collapse.value}
          timeout="auto"
          unmountOnExit
          sx={{ bgcolor: "background.neutral" }}
        >
          <Paper sx={{ m: 1.5, p: 3 }}>
            <Stack spacing={3}>
              {/* Shipping Info */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                  Shipping Info
                </Typography>
                <Stack spacing={1}>
                  {carrier && (
                    <Typography variant="body2">
                      <strong>Carrier:</strong> {carrier}
                    </Typography>
                  )}
                  {trackingNumber && (
                    <Typography variant="body2">
                      <strong>Tracking Number:</strong> {trackingNumber}
                    </Typography>
                  )}
                  {shippingAddress && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Address:</strong>{" "}
                      {typeof shippingAddress === "string"
                        ? shippingAddress
                        : JSON.stringify(shippingAddress)}
                    </Typography>
                  )}
                  {!carrier && !trackingNumber && !shippingAddress && (
                    <Typography variant="body2" sx={{ color: "text.disabled" }}>
                      No shipping information available
                    </Typography>
                  )}
                </Stack>
              </Box>

              {/* Billing Info */}
              {billingAddress && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                    Billing Info
                  </Typography>
                  <Typography variant="body2">
                    {typeof billingAddress === "string"
                      ? billingAddress
                      : JSON.stringify(billingAddress)}
                  </Typography>
                </Box>
              )}

              {/* Payment Info */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                  Payment Info
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Method:</strong> {paymentMethod || "N/A"}
                  </Typography>
                  {paidAt && (
                    <Typography variant="body2">
                      <strong>Paid At:</strong> {formatDateTime(paidAt)}
                    </Typography>
                  )}
                  {!paidAt && (
                    <Typography variant="body2" sx={{ color: "text.disabled" }}>
                      Payment pending
                    </Typography>
                  )}
                </Stack>
              </Box>

              {/* Product Details */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                  Products ({items.length})
                </Typography>
                <Stack spacing={2}>
                  {items.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        border: 1,
                        borderColor: "divider",
                        bgcolor: "background.paper",
                      }}
                    >
                      <OrderProductItem item={item} currency={currency} showFullDetails />
                      {item.productSlug && (
                        <Link
                          component={RouterLink}
                          href={paths.product.details(item.productId || "")}
                          sx={{
                            mt: 1,
                            display: "inline-flex",
                            alignItems: "center",
                            fontSize: "0.75rem",
                            color: "primary.main",
                            textDecoration: "none",
                            "&:hover": {
                              textDecoration: "underline",
                            },
                          }}
                        >
                          View Product <Iconify icon="eva:external-link-fill" width={14} sx={{ ml: 0.5 }} />
                        </Link>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>

              {/* Order Summary */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                  Order Summary
                </Typography>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Subtotal:</Typography>
                    <Typography variant="body2">{formatCurrencyWithCode(subTotal, currency)}</Typography>
                  </Stack>
                  {shipping > 0 && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Shipping:</Typography>
                      <Typography variant="body2">{formatCurrencyWithCode(shipping, currency)}</Typography>
                    </Stack>
                  )}
                  {discount > 0 && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Discount:</Typography>
                      <Typography variant="body2" sx={{ color: "success.main" }}>
                        -{formatCurrencyWithCode(discount, currency)}
                      </Typography>
                    </Stack>
                  )}
                  <Stack 
                    direction="row" 
                    justifyContent="space-between" 
                    sx={{ pt: 1, mt: 1, borderTop: 1, borderColor: "divider" }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Total:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatCurrencyWithCode(totalAmount, currency)}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              {/* Notes */}
              {(notes || internalNotes) && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                    Notes
                  </Typography>
                  <Stack spacing={1}>
                    {notes && (
                      <Box>
                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
                          Customer Notes:
                        </Typography>
                        <Typography variant="body2">{notes}</Typography>
                      </Box>
                    )}
                    {internalNotes && (
                      <Box>
                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
                          Internal Notes:
                        </Typography>
                        <Typography variant="body2">{internalNotes}</Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>
              )}
            </Stack>
          </Paper>
        </Collapse>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      {renderPrimary}
      {renderSecondary}

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: "error.main" }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>

        <MenuItem
          onClick={() => {
            onViewRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}
