"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDebounce } from "src/hooks/use-debounce";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

// ----------------------------------------------------------------------

interface AddressSuggestion {
  formatted: string;
  lat: number;
  lon: number;
  city?: string;
  state?: string;
  country?: string;
  country_code?: string;
}

interface AddressAutocompleteProps {
  value?: string;
  onChange: (address: string, coordinates?: { lat: number; lon: number }) => void;
  placeholder?: string;
  label?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  countryCode?: string;
}

// ----------------------------------------------------------------------

export default function AddressAutocomplete({
  value = "",
  onChange,
  placeholder = "Nhập địa chỉ...",
  label = "Địa chỉ",
  error = false,
  helperText,
  disabled = false,
  required = false,
  countryCode = "vn",
}: AddressAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const debouncedInputValue = useDebounce(inputValue, 300);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch address suggestions from Geoapify API
  const fetchAddressSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setOptions([]);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);

      const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;
      if (!apiKey) {
        console.error("Geoapify API key not found");
        return;
      }

      const params = new URLSearchParams({
        text: query,
        apiKey,
        lang: "vi",
        limit: "5",
        countryCodes: countryCode,
      });

      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?${params}`,
        {
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.features && Array.isArray(data.features)) {
        const suggestions: AddressSuggestion[] = data.features.map((feature: any) => ({
          formatted: feature.properties.formatted || "",
          lat: feature.properties.lat || 0,
          lon: feature.properties.lon || 0,
          city: feature.properties.city,
          state: feature.properties.state,
          country: feature.properties.country,
          country_code: feature.properties.country_code,
        }));

        setOptions(suggestions);
      } else {
        setOptions([]);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error fetching address suggestions:", error);
      }
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (debouncedInputValue) {
      fetchAddressSuggestions(debouncedInputValue);
    } else {
      setOptions([]);
    }
  }, [debouncedInputValue, fetchAddressSuggestions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleInputChange = useCallback((event: React.SyntheticEvent, newInputValue: string) => {
    setInputValue(newInputValue);
  }, []);

  const handleChange = useCallback(
    (event: React.SyntheticEvent, newValue: AddressSuggestion | null) => {
      if (newValue) {
        setInputValue(newValue.formatted);
        onChange(newValue.formatted, {
          lat: newValue.lat,
          lon: newValue.lon,
        });
      } else {
        setInputValue("");
        onChange("", undefined);
      }
    },
    [onChange]
  );

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <Autocomplete
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={handleChange}
      options={options}
      loading={loading}
      disabled={disabled}
      getOptionLabel={(option) => (typeof option === "string" ? option : option.formatted)}
      isOptionEqualToValue={(option, value) => option.formatted === value.formatted}
      filterOptions={(x) => x} // Disable client-side filtering since we're using server-side
      noOptionsText="Không tìm thấy địa chỉ"
      loadingText="Đang tìm kiếm..."
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          required={required}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {option.formatted}
            </Typography>
            {(option.city || option.state) && (
              <Typography variant="caption" color="text.secondary">
                {[option.city, option.state].filter(Boolean).join(", ")}
              </Typography>
            )}
          </Box>
        </Box>
      )}
    />
  );
}
