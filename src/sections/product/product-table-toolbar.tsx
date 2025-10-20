import { useState, useCallback, useEffect } from "react";

import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import TextField from "@mui/material/TextField";

import Iconify from "src/components/iconify";
import CustomPopover, { usePopover } from "src/components/custom-popover";

import {
  IProductTableFilters,
  IProductTableFilterValue,
} from "src/types/product";
import { useDebounce } from "src/hooks/use-debounce";

// ----------------------------------------------------------------------

type Props = {
  filters: IProductTableFilters;
  onFilters: (name: string, value: IProductTableFilterValue) => void;
  //
  stockOptions: {
    value: string;
    label: string;
  }[];
  publishOptions: {
    value: string;
    label: string;
  }[];
  categoryOptions?: string[];
  sort?: string;
  onSort?: (newValue: string) => void;
  sortOptions?: { value: string; label: string }[];
};

export default function ProductTableToolbar({
  filters,
  onFilters,
  //
  stockOptions,
  publishOptions,
  categoryOptions = [],
  sort,
  onSort,
  sortOptions = [],
}: Props) {
  const popover = usePopover();

  const [stock, setStock] = useState<string[]>(filters.stock);

  const [publish, setPublish] = useState<string[]>(filters.publish);

  const [category, setCategory] = useState<string>(filters.category || "all");
  const [search, setSearch] = useState<string>(filters.search || "");
  const debouncedSearch = useDebounce(search, 500);

  const handleChangeStock = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      const {
        target: { value },
      } = event;
      setStock(typeof value === "string" ? value.split(",") : value);
    },
    [],
  );

  const handleChangePublish = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      const {
        target: { value },
      } = event;
      setPublish(typeof value === "string" ? value.split(",") : value);
    },
    [],
  );

  const handleCloseStock = useCallback(() => {
    onFilters("stock", stock);
  }, [onFilters, stock]);

  const handleClosePublish = useCallback(() => {
    onFilters("publish", publish);
  }, [onFilters, publish]);

  const handleCategoryChange = useCallback((event: SelectChangeEvent<string>) => {
    const value = event.target.value as string;
    setCategory(value);
    onFilters("category", value);
  }, [onFilters]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearch(value);
  }, []);

  // propagate debounced value (guard against redundant updates)
  useEffect(() => {
    if (debouncedSearch !== (filters.search || "")) {
      onFilters("search", debouncedSearch);
    }
  }, [debouncedSearch, filters.search, onFilters]);

  return (
    <>
      <FormControl
        sx={{
          flexShrink: 0,
          width: { xs: 1, md: 200 },
        }}
      >
        <InputLabel>Stock</InputLabel>

        <Select
          multiple
          value={stock}
          onChange={handleChangeStock}
          input={<OutlinedInput label="Stock" />}
          renderValue={(selected) => selected.map((value) => value).join(", ")}
          onClose={handleCloseStock}
          sx={{ textTransform: "capitalize" }}
        >
          {stockOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Checkbox
                disableRipple
                size="small"
                checked={stock.includes(option.value)}
              />
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl
        sx={{
          flexShrink: 0,
          width: { xs: 1, md: 200 },
        }}
      >
        <InputLabel>Publish</InputLabel>

        <Select
          multiple
          value={publish}
          onChange={handleChangePublish}
          input={<OutlinedInput label="Publish" />}
          renderValue={(selected) => selected.map((value) => value).join(", ")}
          onClose={handleClosePublish}
          sx={{ textTransform: "capitalize" }}
        >
          {publishOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Checkbox
                disableRipple
                size="small"
                checked={publish.includes(option.value)}
              />
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl
        sx={{
          flexShrink: 0,
          width: { xs: 1, md: 200 },
        }}
      >
        <InputLabel>Category</InputLabel>
        <Select
          value={category}
          input={<OutlinedInput label="Category" />}
          onChange={handleCategoryChange}
          sx={{ textTransform: "capitalize" }}
        >
          {(["all", ...categoryOptions]).map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {!!sortOptions.length && (
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 220 },
          }}
        >
          <InputLabel>Sort by</InputLabel>
          <Select
            value={sort || ''}
            input={<OutlinedInput label="Sort by" />}
            onChange={(e) => onSort?.(e.target.value as string)}
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <TextField
        placeholder="Search product..."
        value={search}
        onChange={handleSearchChange}
        sx={{ width: { xs: 1, md: 260 } }}
      />

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
