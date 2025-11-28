import { useEffect, useMemo, useState, ReactNode } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Drawer from "@mui/material/Drawer";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import LoadingButton from "@mui/lab/LoadingButton";

import { Order, UpdateOrderPayload } from "src/api/order";
import {
  getOrderStatusDescription,
  getOrderStatusLabel,
  normalizeOrderStatus,
} from "../constant";

// ----------------------------------------------------------------------

type StatusOption = {
  value: string;
  label: string;
  description?: string;
};

type Props = {
  order: Order | null;
  open: boolean;
  saving: boolean;
  statusOptions: StatusOption[];
  allowedStatusValues: string[];
  onClose: VoidFunction;
  onSubmit: (payload: UpdateOrderPayload) => void;
};

type FormValues = {
  status: string;
  trackingNumber: string;
  carrier: string;
  shippingAddressId: string;
  billingAddressId: string;
  paypalOrderId: string;
  paypalTransactionId: string;
  paidAmount: string;
  paidCurrency: string;
  paidAt: string;
  notes: string;
  internalNotes: string;
};

const buildInitialValues = (order: Order | null): FormValues => {
  return {
    status: "",
    trackingNumber: (order as any)?.trackingNumber || "",
    carrier: (order as any)?.carrier || "",
    shippingAddressId: order?.shippingAddressId || order?.shippingAddress?.id || "",
    billingAddressId: order?.billingAddressId || order?.billingAddress?.id || "",
    paypalOrderId: order?.paypalOrderId || "",
    paypalTransactionId: order?.paypalTransactionId || "",
    paidAmount:
      typeof order?.paidAmount === "number"
        ? String(order?.paidAmount)
        : order?.paidAmount || "",
    paidCurrency: order?.paidCurrency || order?.summary?.currency || "",
    paidAt: order?.paidAt ? toDateTimeLocal(order.paidAt) : "",
    notes: order?.notes || "",
    internalNotes: order?.internalNotes || "",
  };
};

const toDateTimeLocal = (value: string) => {
  try {
    return new Date(value).toISOString().slice(0, 16);
  } catch (error) {
    return value;
  }
};

const toIsoString = (value: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString();
};

const normalizeFieldValue = (value: string) => value.trim();

const toNullable = (value: string) => {
  const trimmed = normalizeFieldValue(value);
  return trimmed ? trimmed : null;
};

export default function OrderDetailsEditDrawer({
  order,
  open,
  saving,
  statusOptions,
  allowedStatusValues,
  onClose,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<FormValues>(buildInitialValues(order));
  const [baseline, setBaseline] = useState<FormValues>(buildInitialValues(order));

  useEffect(() => {
    const next = buildInitialValues(order);
    setValues(next);
    setBaseline(next);
  }, [order, open]);

  const statusHelper = useMemo(() => {
    if (!values.status) return undefined;
    return getOrderStatusDescription(values.status);
  }, [values.status]);
  const currentStatusLabel = getOrderStatusLabel(order?.status);
  const allowedSet = useMemo(
    () => new Set((allowedStatusValues || []).map((value) => value)),
    [allowedStatusValues],
  );
  const hasStatusOptions = statusOptions.length > 0;

  const handleChange =
    (field: keyof FormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      setValues((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const changedPayload = useMemo(() => buildPayload(baseline, values), [baseline, values]);
  const isDirty = Object.keys(changedPayload).length > 0;

  const handleSave = () => {
    if (!isDirty) {
      onClose();
      return;
    }
    onSubmit(changedPayload);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 480, md: 520 },
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Box
        sx={{
          p: 3,
          flexGrow: 1,
          overflowY: "auto",
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6">Edit order</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              Update fulfillment status, tracking, payment, and notes.
            </Typography>
          </Box>

          {!order ? (
            <Alert severity="info">Select an order to edit.</Alert>
          ) : (
            <>
              <Section title="Status">
                <Stack spacing={2}>
                  <TextField
                    select
                    label="Next status"
                    value={values.status}
                    onChange={handleChange("status")}
                    disabled={!hasStatusOptions}
                    SelectProps={{ displayEmpty: true }}
                    helperText={
                      hasStatusOptions
                        ? statusHelper ||
                          `Current status: ${currentStatusLabel}. Select any status to update.`
                        : "No statuses available."
                    }
                  >
                    <MenuItem value="">
                      <Typography variant="body2">
                        Keep current status ({currentStatusLabel})
                      </Typography>
                    </MenuItem>
                    {statusOptions.map((option) => {
                      const isAllowed = allowedSet.has(option.value);
                      return (
                        <MenuItem key={option.value} value={option.value} disabled={!isAllowed}>
                          <Stack spacing={0.5}>
                            <Typography variant="body2">{option.label}</Typography>
                            {option.description && (
                              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                {option.description}
                              </Typography>
                            )}
                            {!isAllowed && (
                              <Typography variant="caption" sx={{ color: "error.main" }}>
                                Not allowed from current status
                              </Typography>
                            )}
                          </Stack>
                        </MenuItem>
                      );
                    })}
                  </TextField>
                </Stack>
              </Section>

              <Section title="Tracking">
                <Stack spacing={2}>
                  <TextField
                    label="Tracking number"
                    value={values.trackingNumber}
                    onChange={handleChange("trackingNumber")}
                    placeholder="e.g. 1Z999AA1234567890"
                  />
                  <TextField
                    label="Carrier"
                    value={values.carrier}
                    onChange={handleChange("carrier")}
                    placeholder="e.g. UPS, DHL"
                  />
                </Stack>
              </Section>

              <Section title="Shipping & Billing">
                <Stack spacing={2}>
                  <TextField
                    label="Shipping address ID"
                    value={values.shippingAddressId}
                    onChange={handleChange("shippingAddressId")}
                    placeholder="UUID"
                  />
                  <TextField
                    label="Billing address ID"
                    value={values.billingAddressId}
                    onChange={handleChange("billingAddressId")}
                    placeholder="UUID"
                  />
                </Stack>
              </Section>

              <Section title="Payment">
                <Stack spacing={2}>
                  <TextField
                    label="PayPal order ID"
                    value={values.paypalOrderId}
                    onChange={handleChange("paypalOrderId")}
                  />
                  <TextField
                    label="PayPal transaction ID"
                    value={values.paypalTransactionId}
                    onChange={handleChange("paypalTransactionId")}
                  />
                  <Stack direction="row" spacing={2}>
                    <TextField
                      label="Paid amount"
                      value={values.paidAmount}
                      onChange={handleChange("paidAmount")}
                      type="number"
                      fullWidth
                    />
                    <TextField
                      label="Currency"
                      value={values.paidCurrency}
                      onChange={handleChange("paidCurrency")}
                      sx={{ maxWidth: 160 }}
                    />
                  </Stack>
                  <TextField
                    label="Paid at"
                    type="datetime-local"
                    value={values.paidAt}
                    onChange={handleChange("paidAt")}
                    InputLabelProps={{ shrink: true }}
                  />
                </Stack>
              </Section>

              <Section title="Notes">
                <Stack spacing={2}>
                  <TextField
                    label="Customer notes"
                    multiline
                    minRows={3}
                    value={values.notes}
                    onChange={handleChange("notes")}
                  />
                  <TextField
                    label="Internal notes"
                    multiline
                    minRows={3}
                    value={values.internalNotes}
                    onChange={handleChange("internalNotes")}
                  />
                </Stack>
              </Section>
            </>
          )}
        </Stack>
      </Box>

      <Divider />

      <Stack
        direction="row"
        spacing={2}
        justifyContent="flex-end"
        sx={{ p: 3 }}
      >
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          disabled={!isDirty || saving || !order}
          loading={saving}
          onClick={handleSave}
        >
          Save changes
        </LoadingButton>
      </Stack>
    </Drawer>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function buildPayload(baseline: FormValues, current: FormValues): UpdateOrderPayload {
  const payload: UpdateOrderPayload = {};

  if (current.status && current.status !== baseline.status) {
    payload.status = current.status.toUpperCase() as UpdateOrderPayload["status"];
  }

  if (current.trackingNumber !== baseline.trackingNumber) {
    payload.trackingNumber = toNullable(current.trackingNumber);
  }

  if (current.carrier !== baseline.carrier) {
    payload.carrier = toNullable(current.carrier);
  }

  if (current.shippingAddressId !== baseline.shippingAddressId) {
    payload.shippingAddressId = toNullable(current.shippingAddressId);
  }

  if (current.billingAddressId !== baseline.billingAddressId) {
    payload.billingAddressId = toNullable(current.billingAddressId);
  }

  if (current.paypalOrderId !== baseline.paypalOrderId) {
    payload.paypalOrderId = toNullable(current.paypalOrderId);
  }

  if (current.paypalTransactionId !== baseline.paypalTransactionId) {
    payload.paypalTransactionId = toNullable(current.paypalTransactionId);
  }

  if (current.paidAmount !== baseline.paidAmount) {
    payload.paidAmount = toNullable(current.paidAmount);
  }

  if (current.paidCurrency !== baseline.paidCurrency) {
    payload.paidCurrency = toNullable(current.paidCurrency);
  }

  if (current.paidAt !== baseline.paidAt) {
    payload.paidAt = current.paidAt ? toIsoString(current.paidAt) : null;
  }

  if (current.notes !== baseline.notes) {
    payload.notes = toNullable(current.notes);
  }

  if (current.internalNotes !== baseline.internalNotes) {
    payload.internalNotes = toNullable(current.internalNotes);
  }

  return Object.fromEntries(
    Object.entries(payload).filter(
      ([, value]) => value !== undefined,
    ),
  ) as UpdateOrderPayload;
}

