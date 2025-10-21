import { useState, useRef } from "react";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import CircularProgress from "@mui/material/CircularProgress";

import { RouterLink } from "src/routes/components";
import { paths } from "src/routes/paths";
import { useGetCategories } from "src/api/reference";

type Props = {
  label: string;
  color?: string;
  textShadow?: string;
};

interface Category {
  id: string;
  name: string;
  slug: string;
  parent?: Category | null;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export default function EcomCategoriesDropdown({
  label,
  color,
  textShadow,
}: Props) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const { categories, categoriesLoading, categoriesError } = useGetCategories();

  const handleOpen = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setOpen(true);
  };

  const handleClose = () => {
    timerRef.current = window.setTimeout(() => setOpen(false), 120);
  };

  // Group categories by parent/child relationship
  const groupedCategories = categories.reduce((acc: any, category: Category) => {
    if (!category.parent) {
      // This is a parent category
      if (!acc.parents) acc.parents = [];
      acc.parents.push(category);
    } else {
      // This is a child category
      if (!acc.children) acc.children = [];
      acc.children.push(category);
    }
    return acc;
  }, {});

  // Create groups for dropdown
  const createGroups = () => {
    const groups = [];
    
    if (groupedCategories.parents && groupedCategories.parents.length > 0) {
      groups.push({
        title: "Danh mục chính",
        items: groupedCategories.parents.map((category: Category) => ({
          label: category.name,
          href: paths.categories.details(category.slug),
        })),
      });
    }

    if (groupedCategories.children && groupedCategories.children.length > 0) {
      groups.push({
        title: "Danh mục con",
        items: groupedCategories.children.map((category: Category) => ({
          label: category.name,
          href: paths.categories.details(category.slug),
        })),
      });
    }

    return groups;
  };

  const groups = createGroups();

  return (
    <Box
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
      ref={anchorRef}
      sx={{ position: "relative" }}
    >
      <Typography
        component="span"
        sx={{
          typography: "subtitle2",
          letterSpacing: 1,
          color,
          textShadow,
          cursor: "pointer",
          transition: "all 0.3s ease",
          "&:hover": {
            color: "primary.main",
            transform: "translateY(-2px)",
            textShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        {label}
      </Typography>

      <Popover
        open={open}
        disableRestoreFocus
        anchorEl={anchorRef.current}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{ sx: { mt: 1, p: 2 } }}
      >
        {categoriesLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress />
          </Box>
        ) : categoriesError ? (
          <Typography variant="body2" color="error" sx={{ p: 2 }}>
            Lỗi tải danh mục
          </Typography>
        ) : groups.length > 0 ? (
          <Stack direction="row" spacing={4} sx={{ minWidth: 400 }}>
            {groups.map((g) => (
              <Box key={g.title} sx={{ minWidth: 160 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {g.title}
                </Typography>
                <List dense disablePadding>
                  {g.items.map((it: { label: string; href: string }) => (
                    <ListItemButton
                      key={it.label}
                      component={RouterLink}
                      href={it.href}
                      sx={{ 
                        px: 1,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "primary.lighter",
                          transform: "translateX(4px)",
                        },
                      }}
                    >
                      {it.label}
                    </ListItemButton>
                  ))}
                </List>
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            Chưa có danh mục nào
          </Typography>
        )}
      </Popover>
    </Box>
  );
}
