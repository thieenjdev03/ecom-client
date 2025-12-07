"use client";

import { useCallback } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import Collapse from "@mui/material/Collapse";

import Iconify from "src/components/iconify";
import { useResponsive } from "src/hooks/use-responsive";

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  sort: string;
  onSort: (newValue: string) => void;
  onClose?: VoidFunction;
  sortOptions: {
    value: string;
    label: string;
  }[];
};

export default function ProductSortPanel({ open, sort, onSort, onClose, sortOptions }: Props) {
  const isMobile = useResponsive("down", "sm");

  const handleSelect = useCallback(
    (value: string) => {
      onSort(value);
      if (onClose) {
        onClose();
      }
    },
    [onSort, onClose],
  );

  const renderContent = (
    <Box
      sx={{
        p: 2,
        opacity: open ? 1 : 0,
        transform: open ? "translateY(0)" : "translateY(-10px)",
        transition: "opacity 0.18s ease, transform 0.18s ease",
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
        }}
      >
        Sort by:
      </Typography>

      <Stack spacing={1.5}>
        {sortOptions.map((option) => {
          const isSelected = option.value === sort;

          return (
            <Box
              key={option.value}
              onClick={() => handleSelect(option.value)}
              sx={{
                px: 1.5,
                py: 1,
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
      </Stack>
    </Box>
  );

  // Mobile: Bottom sheet drawer
  if (isMobile) {
    return (
      <Drawer
        anchor="bottom"
        open={open}
        onClose={onClose || (() => {})}
        slotProps={{
          backdrop: {
            invisible: false,
            sx: {
              backgroundColor: alpha("#000", 0.5),
            },
          },
        }}
        PaperProps={{
          sx: {
            height: "60vh",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            overflow: "hidden",
          },
        }}
      >
        {renderContent}
      </Drawer>
    );
  }

  // Desktop: Collapse panel
  return (
    <Collapse
      in={open}
      timeout={180}
      sx={{
        width: "100%",
        position: "absolute",
        top: "100%",
        left: 0,
        zIndex: 10,
        bgcolor: "background.paper",
        boxShadow: (theme) => theme.customShadows.z8,
        borderRadius: 1,
        mt: 0.5,
        overflow: "hidden",
      }}
    >
      {renderContent}
    </Collapse>
  );
}

