import { useState, useEffect, useCallback } from "react";

import Fade from "@mui/material/Fade";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Portal from "@mui/material/Portal";
import { useTheme } from "@mui/material/styles";
import ListSubheader from "@mui/material/ListSubheader";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

import { usePathname } from "src/routes/hooks";
import { useActiveLink } from "src/routes/hooks/use-active-link";
import { paths } from "src/routes/paths";

import { paper } from "src/theme/css";
import { useGetCategories } from "src/api/reference";

import { HEADER } from "../../config-layout";
import { NavItem } from "./desktop/nav-item";

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

interface CategoriesDropdownProps {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  open: boolean;
}

export default function CategoriesDropdown({ onMouseEnter, onMouseLeave, open }: CategoriesDropdownProps) {
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
      <Portal>
        <Fade in={open}>
          <Paper
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            sx={{
              ...paper({ theme }),
              left: 0,
              right: 0,
              m: "auto",
              display: "flex",
              borderRadius: 2,
              position: "fixed",
              zIndex: theme.zIndex.modal,
              p: theme.spacing(5, 1, 1, 3),
              top: HEADER.H_DESKTOP_OFFSET,
              maxWidth: theme.breakpoints.values.lg,
              boxShadow: theme.customShadows.dropdown,
              minHeight: 200,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Paper>
        </Fade>
      </Portal>
    );
  }

  if (categoriesError || !categories.length) {
    return null;
  }

  return (
    <Portal>
      <Fade in={open}>
        <Paper
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          sx={{
            ...paper({ theme }),
            left: 0,
            right: 0,
            m: "auto",
            display: "flex",
            borderRadius: 2,
            position: "fixed",
            zIndex: theme.zIndex.modal,
            p: theme.spacing(5, 1, 1, 3),
            top: HEADER.H_DESKTOP_OFFSET,
            maxWidth: theme.breakpoints.values.lg,
            boxShadow: theme.customShadows.dropdown,
          }}
        >
          {groupedCategories.parents && groupedCategories.parents.length > 0 && (
            <Stack
              spacing={2}
              flexGrow={1}
              alignItems="flex-start"
              sx={{ pb: 2 }}
            >
              <ListSubheader
                disableSticky
                sx={{
                  p: 0,
                  typography: "overline",
                  fontSize: 11,
                  color: "text.primary",
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
            <Stack
              spacing={2}
              flexGrow={1}
              alignItems="flex-start"
              sx={{ pb: 2 }}
            >
              <ListSubheader
                disableSticky
                sx={{
                  p: 0,
                  typography: "overline",
                  fontSize: 11,
                  color: "text.primary",
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
        </Paper>
      </Fade>
    </Portal>
  );
}
