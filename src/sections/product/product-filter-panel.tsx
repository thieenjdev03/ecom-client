"use client";

import { useCallback } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Backdrop from "@mui/material/Backdrop";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import Slide from "@mui/material/Slide";

import ButtonBase from "@mui/material/ButtonBase";
import Iconify from "src/components/iconify";
import { useResponsive } from "src/hooks/use-responsive";

import { IProductFilters } from "src/types/product";

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  filters: IProductFilters;
  onFilters: (name: string, value: any) => void;
  colorOptions: string[];
  canReset: boolean;
  onResetFilters: VoidFunction;
  onClose: VoidFunction;
};

export default function ProductFilterPanel({
  open,
  filters,
  onFilters,
  colorOptions,
  canReset,
  onResetFilters,
  onClose,
}: Props) {
  const isMobile = useResponsive("down", "sm");

  const handleFilterColors = useCallback(
    (colors: string | string[]) => {
      onFilters("colors", colors);
    },
    [onFilters],
  );

  const handleApply = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleClear = useCallback(() => {
    onResetFilters();
  }, [onResetFilters]);

  const panelContent = (
    <>
      {/* Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: "18px",
            fontWeight: 600,
          }}
        >
          Filters
        </Typography>
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 3,
        }}
      >
        <Stack spacing={3}>
          {/* Color Filter */}
          <Stack spacing={1.5}>
            <Typography
              variant="subtitle2"
              sx={{
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "text.secondary",
              }}
            >
              Color
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "repeat(auto-fill, minmax(50px, 1fr))"
                  : "repeat(auto-fill, minmax(40px, 1fr))",
                gap: 1.5,
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
                      width: isMobile ? 50 : 40,
                      height: isMobile ? 50 : 40,
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
                        width: isMobile ? 36 : 28,
                        height: isMobile ? 36 : 28,
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
                          width={isMobile ? 20 : 16}
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
          </Stack>
        </Stack>
      </Box>

      {/* Footer Actions */}
      <Box
        sx={{
          p: 3,
          borderTop: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
          display: "flex",
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          fullWidth
          onClick={handleClear}
          disabled={!canReset}
          sx={{
            minHeight: isMobile ? 52 : 44,
            fontWeight: 600,
            fontSize: isMobile ? "16px" : "14px",
          }}
        >
          Clear Filters
        </Button>
        <Button
          variant="contained"
          fullWidth
          onClick={handleApply}
          sx={{
            minHeight: isMobile ? 52 : 44,
            fontWeight: 600,
            fontSize: isMobile ? "16px" : "14px",
          }}
        >
          Apply
        </Button>
      </Box>
    </>
  );

  return (
    <>
      {/* Backdrop */}
      <Backdrop
        open={open}
        onClick={onClose}
        sx={{
          zIndex: 1299,
          backgroundColor: alpha("#000", 0.5),
        }}
      />

      {/* Panel */}
      <Slide direction="left" in={open} timeout={220} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: "fixed",
            top: 0,
            right: 0,
            width: { xs: "100%", sm: 320 },
            height: "100vh",
            bgcolor: "background.paper",
            boxShadow: (theme) => theme.customShadows.z24,
            zIndex: 1300,
            display: "flex",
            flexDirection: "column",
            opacity: open ? 1 : 0,
            transform: open ? "translateX(0)" : "translateX(20px)",
            transition: "opacity 0.22s ease, transform 0.22s ease",
          }}
        >
          {panelContent}
        </Box>
      </Slide>
    </>
  );
}

