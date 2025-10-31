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
import { useGetCategoryTree } from "src/api/reference";

type Props = {
  label: string;
  color?: string;
  textShadow?: string;
};

interface Category {
  id: number;
  name: string;
  slug: string;
  children?: Category[];
}

export default function EcomCategoriesDropdown({
  label,
  color,
  textShadow,
}: Props) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const { categoryTree, categoryTreeLoading, categoryTreeError } = useGetCategoryTree();
  console.log('useGetCategoryTree', categoryTree, categoryTreeLoading, categoryTreeError);
  const handleOpen = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setOpen(true);
  };

  const handleClose = () => {
    timerRef.current = window.setTimeout(() => setOpen(false), 120);
  };

  // Use tree response directly
  const parents: Category[] = Array.isArray(categoryTree) ? (categoryTree as Category[]) : [];

  // Create parent -> children groups for dropdown
  const groups = parents.map((p) => ({
    parent: p,
    children: (p.children && p.children.length > 0 ? p.children : []).slice().sort((a, b) => a.name.localeCompare(b.name)),
  }));
  console.log('groups', groups);
  const parentGroupsWithChildren = groups.filter((g) => g.children.length > 0);
  const parentsWithoutChildren = groups.filter((g) => g.children.length === 0).map((g) => g.parent);
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
        {categoryTreeLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress />
          </Box>
        ) : categoryTreeError ? (
          <Typography variant="body2" color="error" sx={{ p: 2 }}>
            Lỗi tải danh mục
          </Typography>
        ) : groups.length > 0 ? (
          <Stack direction="row" spacing={4} sx={{ minWidth: 480 }}>
            {parentGroupsWithChildren.map((g) => (
              <Box key={g.parent.id} sx={{ minWidth: 180 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {g.parent.name}
                </Typography>
                {g.children.length > 0 ? (
                  <List dense disablePadding>
                    {g.children.map((child) => (
                      <ListItemButton
                        key={child.id}
                        component={RouterLink}
                        href={paths.categories.details(child.slug)}
                        sx={{
                          px: 1,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: "primary.lighter",
                            transform: "translateX(4px)",
                          },
                        }}
                      >
                        {child.name}
                      </ListItemButton>
                    ))}
                  </List>
                ) : null}
              </Box>
            ))}
            {parentsWithoutChildren.length > 0 && (
              <Box key="another" sx={{ minWidth: 180 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Another
                </Typography>
                <List dense disablePadding>
                  {parentsWithoutChildren.map((p) => (
                    <ListItemButton
                      key={p.id}
                      component={RouterLink}
                      href={paths.categories.details(p.slug)}
                      sx={{
                        px: 1,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "primary.lighter",
                          transform: "translateX(4px)",
                        },
                      }}
                    >
                      {p.name}
                    </ListItemButton>
                  ))}
                </List>
              </Box>
            )}
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
