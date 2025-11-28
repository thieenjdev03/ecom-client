import { useMemo } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

import { RouterLink } from "src/routes/components";

import { fDateTime } from "src/utils/format-time";

import Label from "src/components/label";
import Iconify from "src/components/iconify";
import CustomPopover, { usePopover } from "src/components/custom-popover";
import { getOrderStatusColor, getOrderStatusLabel } from "./constant";

// ----------------------------------------------------------------------

type Props = {
  status: string;
  backLink: string;
  orderNumber: string;
  createdAt: Date;
  onChangeStatus: (newValue: string) => void;
  statusOptions: {
    value: string;
    label: string;
  }[];
  allowedStatusValues?: string[];
  onEdit?: VoidFunction;
};

export default function OrderDetailsToolbar({
  status,
  backLink,
  createdAt,
  orderNumber,
  statusOptions,
  allowedStatusValues,
  onChangeStatus,
  onEdit,
}: Props) {
  const popover = usePopover();
  const statusLabel = getOrderStatusLabel(status);
  const statusColor = getOrderStatusColor(status);
  const canChangeStatus = statusOptions.length > 0;
  const allowedSet = useMemo(
    () => new Set((allowedStatusValues || []).map((value) => value)),
    [allowedStatusValues],
  );

  return (
    <>
      <Stack
        spacing={3}
        direction={{ xs: "column", md: "row" }}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        <Stack spacing={1} direction="row" alignItems="flex-start">
          <IconButton component={RouterLink} href={backLink}>
            <Iconify icon="eva:arrow-ios-back-fill" />
          </IconButton>

          <Stack spacing={0.5}>
            <Stack spacing={1} direction="row" alignItems="center">
              <Typography variant="h4"> Order {orderNumber} </Typography>
              <Label
                variant="soft"
                color={statusColor}
              >
                {statusLabel}
              </Label>
            </Stack>

            <Typography variant="body2" sx={{ color: "text.disabled" }}>
              {fDateTime(createdAt)}
            </Typography>
          </Stack>
        </Stack>

        <Stack
          flexGrow={1}
          spacing={1.5}
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
        >
          <Button
            color="inherit"
            variant="outlined"
            endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
            onClick={popover.onOpen}
            disabled={!canChangeStatus}
            sx={{ textTransform: "capitalize" }}
          >
            {statusLabel}
          </Button>

          <Button
            color="inherit"
            variant="outlined"
            startIcon={<Iconify icon="solar:printer-minimalistic-bold" />}
          >
            Print
          </Button>

          <Button
            color="inherit"
            variant="contained"
            startIcon={<Iconify icon="solar:pen-bold" />}
            onClick={onEdit}
            disabled={!onEdit}
          >
            Edit
          </Button>
        </Stack>
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="top-right"
        sx={{ width: 140 }}
      >
        {canChangeStatus ? (
          statusOptions.map((option) => {
            const isAllowed = !allowedStatusValues || allowedSet.has(option.value);
            return (
            <MenuItem
              key={option.value}
              selected={option.value === status}
                disabled={!isAllowed}
              onClick={() => {
                  if (!isAllowed) return;
                  popover.onClose();
                  onChangeStatus(option.value);
              }}
            >
              {option.label}
            </MenuItem>
            );
          })
        ) : (
          <MenuItem disabled>No transitions</MenuItem>
        )}
      </CustomPopover>
    </>
  );
}
