import { useState, useCallback } from "react";

import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import ListSubheader from "@mui/material/ListSubheader";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

import { usePathname } from "src/routes/hooks";
import { paths } from "src/routes/paths";

import { useGetCategoryTree } from "src/api/reference";

import { NavItem } from "./mobile/nav-item";

// ----------------------------------------------------------------------

interface Category {
  id: number;
  name: string;
  slug: string;
  children?: Category[];
}

interface MobileCategoriesDropdownProps {
  open: boolean;
  onToggle: () => void;
}

export default function MobileCategoriesDropdown({ open, onToggle }: MobileCategoriesDropdownProps) {
  const theme = useTheme();
  const pathname = usePathname();
  
  const { categoryTree, categoryTreeLoading, categoryTreeError } = useGetCategoryTree();
  const parents: Category[] = Array.isArray(categoryTree) ? (categoryTree as Category[]) : [];
  const parentsWithChildren = parents.filter((p) => (p.children || []).length > 0);
  const parentsWithoutChildren = parents.filter((p) => !p.children || p.children.length === 0);

  // Create navigation items for categories
  const createCategoryItems = (categoryList: Category[]) => {
    return categoryList.map((category) => ({
      title: category.name,
      path: paths.categories.details(category.slug),
    }));
  };

  if (categoryTreeLoading) {
    return (
      <Collapse in={open} unmountOnExit>
        <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      </Collapse>
    );
  }

  if (categoryTreeError || !parents.length) {
    return null;
  }

  return (
    <Collapse in={open} unmountOnExit>
      <Stack spacing={1} sx={{ pl: 2 }}>
        <Stack spacing={1}>
          <ListSubheader
            disableSticky
            sx={{ p: 0, typography: "overline", fontSize: 11, color: "text.primary", mt: 1 }}
          >
            Danh mục
          </ListSubheader>

          {parentsWithChildren.map((parent) => (
            <>
              <NavItem
                key={`p-${parent.id}`}
                title={parent.name}
                path={paths.categories.details(parent.slug)}
                active={pathname === paths.categories.details(parent.slug) || pathname === `${paths.categories.details(parent.slug)}/`}
                subItem={false}
              />
              {(parent.children || []).map((child) => (
                <NavItem
                  key={`c-${child.id}`}
                  title={child.name}
                  path={paths.categories.details(child.slug)}
                  active={pathname === paths.categories.details(child.slug) || pathname === `${paths.categories.details(child.slug)}/`}
                  subItem
                />
              ))}
            </>
          ))}

          {parentsWithoutChildren.length > 0 && (
            <>
              <ListSubheader
                disableSticky
                sx={{ p: 0, typography: "overline", fontSize: 11, color: "text.primary", mt: 1 }}
              >
                Another
              </ListSubheader>
              {parentsWithoutChildren.map((parent) => (
                <NavItem
                  key={`another-${parent.id}`}
                  title={parent.name}
                  path={paths.categories.details(parent.slug)}
                  active={pathname === paths.categories.details(parent.slug) || pathname === `${paths.categories.details(parent.slug)}/`}
                  subItem
                />
              ))}
            </>
          )}
        </Stack>
      </Stack>
    </Collapse>
  );
}
