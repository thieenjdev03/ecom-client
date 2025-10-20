import { useState, useCallback } from "react";

import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import ListSubheader from "@mui/material/ListSubheader";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

import { usePathname } from "src/routes/hooks";
import { paths } from "src/routes/paths";

import { useGetCategories } from "src/api/reference";

import { NavItem } from "./mobile/nav-item";

// ----------------------------------------------------------------------

interface Category {
  id: string;
  name: string;
  slug: string;
  parent?: Category | null;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

interface MobileCategoriesDropdownProps {
  open: boolean;
  onToggle: () => void;
}

export default function MobileCategoriesDropdown({ open, onToggle }: MobileCategoriesDropdownProps) {
  const theme = useTheme();
  const pathname = usePathname();
  
  const { categories, categoriesLoading, categoriesError } = useGetCategories();

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

  // Create navigation items for categories
  const createCategoryItems = (categoryList: Category[]) => {
    return categoryList.map((category) => ({
      title: category.name,
      path: paths.categories.details(category.slug),
    }));
  };

  if (categoriesLoading) {
    return (
      <Collapse in={open} unmountOnExit>
        <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      </Collapse>
    );
  }

  if (categoriesError || !categories.length) {
    return null;
  }

  return (
    <Collapse in={open} unmountOnExit>
      <Stack spacing={1} sx={{ pl: 2 }}>
        {groupedCategories.parents && groupedCategories.parents.length > 0 && (
          <Stack spacing={1}>
            <ListSubheader
              disableSticky
              sx={{
                p: 0,
                typography: "overline",
                fontSize: 11,
                color: "text.primary",
                mt: 1,
              }}
            >
              Danh mục chính
            </ListSubheader>

            {createCategoryItems(groupedCategories.parents).map((item) => (
              <NavItem
                key={item.title}
                title={item.title}
                path={item.path}
                active={pathname === item.path || pathname === `${item.path}/`}
                subItem
              />
            ))}
          </Stack>
        )}

        {groupedCategories.children && groupedCategories.children.length > 0 && (
          <Stack spacing={1}>
            <ListSubheader
              disableSticky
              sx={{
                p: 0,
                typography: "overline",
                fontSize: 11,
                color: "text.primary",
                mt: 1,
              }}
            >
              Danh mục con
            </ListSubheader>

            {createCategoryItems(groupedCategories.children).map((item) => (
              <NavItem
                key={item.title}
                title={item.title}
                path={item.path}
                active={pathname === item.path || pathname === `${item.path}/`}
                subItem
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Collapse>
  );
}
