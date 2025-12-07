"use client";

import { useCallback } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Badge from "@mui/material/Badge";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import Collapse from "@mui/material/Collapse";

import Iconify from "src/components/iconify";
import ButtonBase from "@mui/material/ButtonBase";

import { IProductFilters } from "src/types/product";

// ----------------------------------------------------------------------

type Props = {
  // Common toggle for both sections
  open: boolean;
  onToggle: VoidFunction;
  // Sort props
  sort: string;
  onSort: (newValue: string) => void;
  sortOptions: {
    value: string;
    label: string;
  }[];
  // Filter props
  filters: IProductFilters;
  onFilters: (name: string, value: any) => void;
  colorOptions: string[];
  canReset: boolean;
  onResetFilters: VoidFunction;
};

export default function ProductSortFilterAccordion({
  open,
  onToggle,
  sort,
  onSort,
  sortOptions,
  filters,
  onFilters,
  colorOptions,
  canReset,
  onResetFilters,
}: Props) {
  const handleSortSelect = useCallback(
    (value: string) => {
      onSort(value);
    },
    [onSort],
  );

  const handleFilterColors = useCallback(
    (colors: string | string[]) => {
      onFilters("colors", colors);
    },
    [onFilters],
  );

  return (
    <Box>
      {/* Header - Sort (left) and Filter (right) text buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 1,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* Sort Button - Left */}
        <ButtonBase
          onClick={onToggle}
          disableRipple
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            "&:hover": {
              "& .sort-text": {
                textDecoration: "underline",
              },
            },
          }}
        >
          <Typography
            className="sort-text"
            sx={{
              fontWeight: 500,
              fontSize: "15px",
            }}
          >
            Sort
          </Typography>
          <Iconify
            icon={open ? "eva:arrow-ios-upward-fill" : "eva:arrow-ios-downward-fill"}
            width={18}
          />
        </ButtonBase>

        {/* Filter Button - Right */}
        <ButtonBase
          onClick={onToggle}
          disableRipple
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            "&:hover": {
              "& .filter-text": {
                textDecoration: "underline",
              },
            },
          }}
        >
          <Typography
            className="filter-text"
            sx={{
              fontWeight: 500,
              fontSize: "15px",
            }}
          >
            Filter
          </Typography>
          <Badge color="error" variant="dot" invisible={!canReset}>
            <Iconify
              icon={open ? "eva:arrow-ios-upward-fill" : "eva:arrow-ios-downward-fill"}
              width={18}
            />
          </Badge>
        </ButtonBase>
      </Box>

      {/* Content - Sort left, Filter right */}
      <Collapse in={open} timeout={180}>
        <Box
          sx={{
            py: 2,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            gap: { xs: 3, md: 4 },
          }}
        >
          {/* Sort Section - Align Left */}
          <Box
            sx={{
              flex: { xs: 1, md: "0 0 auto" },
              minWidth: { md: 200 },
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1.5,
                fontSize: "13px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "text.secondary",
                textAlign: "left",
              }}
            >
              Sort by:
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 0.5,
              }}
            >
              {sortOptions.map((option) => {
                const isSelected = option.value === sort;

                return (
                  <Box
                    key={option.value}
                    onClick={() => handleSortSelect(option.value)}
                    sx={{
                      px: 1,
                      py: 0.75,
                      borderRadius: 1,
                      cursor: "pointer",
                      fontSize: "15px",
                      lineHeight: 1.6,
                      color: isSelected ? "text.primary" : "text.secondary",
                      fontWeight: isSelected ? 600 : 400,
                      bgcolor: isSelected ? alpha("#000", 0.04) : "transparent",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      "&:hover": {
                        bgcolor: alpha("#000", 0.06),
                        color: "text.primary",
                      },
                    }}
                  >
                    {isSelected && (
                      <Iconify
                        icon="eva:checkmark-fill"
                        width={16}
                        sx={{ color: "primary.main" }}
                      />
                    )}
                    <Box component="span">{option.label}</Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Filter Section - Align Right */}
          <Box
            sx={{
              flex: { xs: 1, md: "0 0 auto" },
              minWidth: { md: 280 },
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "flex-start", md: "flex-end" },
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1.5,
                fontSize: "13px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "text.secondary",
                textAlign: { xs: "left", md: "right" },
                width: "100%",
              }}
            >
              Color
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1.5,
                justifyContent: { xs: "flex-start", md: "flex-end" },
                width: "100%",
              }}
            >
              {colorOptions.map((color) => {
                const isSelected = filters.colors.includes(color);

                return (
                  <ButtonBase
                    key={color}
                    onClick={() => {
                      const newColors = isSelected
                        ? filters.colors.filter((c) => c !== color)
                        : [...filters.colors, color];
                      handleFilterColors(newColors);
                    }}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      border: (theme) =>
                        `2px solid ${
                          isSelected
                            ? theme.palette.primary.main
                            : alpha(theme.palette.grey[500], 0.2)
                        }`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: (theme) => theme.palette.primary.main,
                        transform: "scale(1.05)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 0.75,
                        bgcolor: color,
                        border: (theme) =>
                          color === "#FFFFFF"
                            ? `1px solid ${alpha(theme.palette.grey[500], 0.3)}`
                            : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isSelected && (
                        <Iconify
                          icon="eva:checkmark-fill"
                          width={16}
                          sx={{
                            color:
                              color === "#FFFFFF" || color === "#FFC0CB"
                                ? "text.primary"
                                : "common.white",
                          }}
                        />
                      )}
                    </Box>
                  </ButtonBase>
                );
              })}
            </Box>

            {/* Action Button - Align Right */}
            {canReset && (
              <Button
                variant="outlined"
                onClick={onResetFilters}
                sx={{
                  mt: 2,
                  minHeight: 44,
                  fontWeight: 600,
                  minWidth: 140,
                }}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}
