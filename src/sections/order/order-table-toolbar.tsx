import { useCallback, useState, useEffect } from "react";

import Stack from "@mui/material/Stack";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { formHelperTextClasses } from "@mui/material/FormHelperText";

import { useDebounce } from "src/hooks/use-debounce";

import Iconify from "src/components/iconify";
import CustomPopover, { usePopover } from "src/components/custom-popover";
import CountrySelect from "src/components/country-select";
import { countries } from "src/assets/data";

import { IOrderTableFilters, IOrderTableFilterValue } from "src/types/order";

// ----------------------------------------------------------------------

type Props = {
  filters: IOrderTableFilters;
  onFilters: (name: string, value: IOrderTableFilterValue) => void;
  //
  dateError: boolean;
};

const PAYMENT_METHOD_OPTIONS = [
  { value: "PAYPAL", label: "PayPal" },
  { value: "STRIPE", label: "Stripe" },
  { value: "COD", label: "COD" },
];

export default function OrderTableToolbar({
  filters,
  onFilters,
  dateError,
}: Props) {
  const popover = usePopover();
  const [search, setSearch] = useState<string>(filters.name || "");
  const debouncedSearch = useDebounce(search, 300);

  // Update filters when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== (filters.name || "")) {
      onFilters("name", debouncedSearch);
    }
  }, [debouncedSearch, filters.name, onFilters]);

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(event.target.value);
    },
    [],
  );

  const handleFilterStartDate = useCallback(
    (newValue: Date | null) => {
      onFilters("startDate", newValue);
    },
    [onFilters],
  );

  const handleFilterEndDate = useCallback(
    (newValue: Date | null) => {
      onFilters("endDate", newValue);
    },
    [onFilters],
  );

  const handleFilterPaymentMethod = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      const {
        target: { value },
      } = event;
      onFilters(
        "paymentMethod",
        typeof value === "string" ? value.split(",") : value,
      );
    },
    [onFilters],
  );

  const handleFilterCountry = useCallback(
    (newValue: string | null) => {
      onFilters("country", newValue || "");
    },
    [onFilters],
  );

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: "flex-end", md: "center" }}
        direction={{
          xs: "column",
          md: "row",
        }}
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 },
        }}
      >
        <DatePicker
          label="Start date"
          value={filters.startDate}
          onChange={handleFilterStartDate}
          slotProps={{
            textField: {
              fullWidth: true,
            },
          }}
          sx={{
            maxWidth: { md: 200 },
          }}
        />

        <DatePicker
          label="End date"
          value={filters.endDate}
          onChange={handleFilterEndDate}
          slotProps={{
            textField: {
              fullWidth: true,
              error: dateError,
              helperText: dateError && "End date must be later than start date",
            },
          }}
          sx={{
            maxWidth: { md: 200 },
            [`& .${formHelperTextClasses.root}`]: {
              position: { md: "absolute" },
              bottom: { md: -40 },
            },
          }}
        />

        <FormControl sx={{ minWidth: 150, maxWidth: { md: 200 } }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={(e) => onFilters("status", e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
            <MenuItem value="refunded">Refunded</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150, maxWidth: { md: 200 } }}>
          <InputLabel>Payment Method</InputLabel>
          <Select
            multiple
            value={filters.paymentMethod || []}
            label="Payment Method"
            onChange={handleFilterPaymentMethod}
            renderValue={(selected) => {
              if (selected.length === 0) return "All";
              if (selected.length === 1) {
                return PAYMENT_METHOD_OPTIONS.find((opt) => opt.value === selected[0])?.label || selected[0];
              }
              return `${selected.length} selected`;
            }}
          >
            {PAYMENT_METHOD_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <CountrySelect
          label="Country"
          value={filters.country || null}
          onChange={(event, newValue) => handleFilterCountry(newValue as string | null)}
          options={countries.map((c) => c.label)}
          getOptionLabel={(option) => option}
          sx={{ minWidth: 150, maxWidth: { md: 200 } }}
        />

        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          flexGrow={1}
          sx={{ width: 1 }}
        >
          <TextField
            fullWidth
            value={search}
            onChange={handleFilterName}
            placeholder="Search order number, email, tracking, product..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify
                    icon="eva:search-fill"
                    sx={{ color: "text.disabled" }}
                  />
                </InputAdornment>
              ),
            }}
          />

          <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:printer-minimalistic-bold" />
          Print
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:import-bold" />
          Import
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:export-bold" />
          Export
        </MenuItem>
      </CustomPopover>
    </>
  );
}
