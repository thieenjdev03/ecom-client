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
import { useGetCategoryTree } from "src/api/reference";

import { HEADER } from "../../config-layout";
import { NavItem } from "./desktop/nav-item";

// ----------------------------------------------------------------------

interface Category {
  id: number;
  name: string;
  slug: string;
  children?: Category[];
}

interface CategoriesDropdownProps {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  open: boolean;
}

export default function CategoriesDropdown({ onMouseEnter, onMouseLeave, open }: CategoriesDropdownProps) {
  const theme = useTheme();
  const pathname = usePathname();
  
  const { categoryTree, categoryTreeLoading, categoryTreeError } = useGetCategoryTree();
  const parents: Category[] = Array.isArray(categoryTree) ? (categoryTree as Category[]) : [];
  const parentsWithChildren = parents.filter((p) => (p.children || []).length > 0);
  const parentsWithoutChildren = parents.filter((p) => !p.children || p.children.length === 0);

  if (categoryTreeLoading) {
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

  if (categoryTreeError || !parents.length) {
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
          <Stack spacing={2} flexGrow={1} alignItems="flex-start" sx={{ pb: 2 }}>
            <ListSubheader
              disableSticky
              sx={{ p: 0, typography: "overline", fontSize: 11, color: "text.primary" }}
            >
              Danh mục
            </ListSubheader>

            {parentsWithChildren.map((parent) => (
              <Box key={parent.id} sx={{ width: 1 }}>
                <NavItem
                  title={parent.name}
                  path={paths.categories.details(parent.slug)}
                  active={pathname === paths.categories.details(parent.slug) || pathname === `${paths.categories.details(parent.slug)}/`}
                  subItem={false}
                />
                {(parent.children || []).map((child) => (
                  <NavItem
                    key={child.id}
                    title={child.name}
                    path={paths.categories.details(child.slug)}
                    active={pathname === paths.categories.details(child.slug) || pathname === `${paths.categories.details(child.slug)}/`}
                    subItem
                  />
                ))}
              </Box>
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
        </Paper>
      </Fade>
    </Portal>
  );
}
