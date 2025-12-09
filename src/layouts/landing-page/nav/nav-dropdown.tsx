import { useState, useRef, useCallback, useMemo, ReactNode } from "react";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

import { RouterLink } from "src/routes/components";
import Iconify from "src/components/iconify";

// ----------------------------------------------------------------------

// Shared dropdown padding constants for consistent styling
const DROPDOWN_PADDING = {
  container: { py: 2.5, px: 2 },
  item: { px: 1.5, py: 0.75 },
  leftColumn: { py: 2.5, px: 2 },
  rightColumn: { py: 2.5, px: 3 },
};

// ----------------------------------------------------------------------

interface DropdownItem {
  id: number | string;
  name: string;
  slug: string;
  href?: string;
}

interface DropdownGroup {
  parent: DropdownItem;
  children: DropdownItem[];
}

// Props for single-level dropdown (like Collection)
interface SingleLevelDropdownProps {
  type: "single";
  items: DropdownItem[];
  loading?: boolean;
  emptyText?: string;
  loadingText?: string;
  title?: string;
  viewAllLink?: string;
  viewAllText?: string;
  getItemHref: (slug: string) => string;
}

// Props for two-level dropdown (like Shop categories)
interface TwoLevelDropdownProps {
  type: "two-level";
  groups: DropdownGroup[];
  orphanItems?: DropdownItem[];
  orphanTitle?: string;
  allItemsLink?: string;
  allItemsText?: string;
  emptyChildrenText?: string;
  getItemHref: (slug: string) => string;
}

// Combined props
type NavDropdownContentProps = SingleLevelDropdownProps | TwoLevelDropdownProps;

// Main component props
interface NavDropdownProps {
  label: string;
  href?: string;
  color?: string;
  textShadow?: string;
  contentProps: NavDropdownContentProps;
}

// ----------------------------------------------------------------------

// Shared link style for dropdown items
const linkItemSx = {
  display: "inline-block",
  fontSize: 14,
  fontWeight: 400,
  color: "text.primary",
  transition: "all 0.2s ease",
  borderBottom: "1px solid transparent",
  "&:hover": {
    borderBottomColor: "currentColor",
  },
};

// ----------------------------------------------------------------------

// Single level dropdown content (for Collection)
function SingleLevelContent({
  items,
  loading,
  emptyText = "No items available",
  loadingText = "Loading...",
  title,
  viewAllLink,
  viewAllText,
  getItemHref,
}: Omit<SingleLevelDropdownProps, "type">) {
  return (
    <Box sx={DROPDOWN_PADDING.container}>
      {title && (
        <Typography
          variant="overline"
          sx={{
            fontSize: 11,
            color: "text.secondary",
            letterSpacing: 0.6,
            display: "block",
            px: DROPDOWN_PADDING.item.px,
            mb: 1,
          }}
        >
          {title}
        </Typography>
      )}

      {loading ? (
        <Box sx={{ ...DROPDOWN_PADDING.item, py: 2, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            {loadingText}
          </Typography>
        </Box>
      ) : items.length === 0 ? (
        <Box sx={{ ...DROPDOWN_PADDING.item, py: 2, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            {emptyText}
          </Typography>
        </Box>
      ) : (
        items.slice(0, 8).map((item) => (
          <Box key={item.id} sx={DROPDOWN_PADDING.item}>
            <Link
              component={RouterLink}
              href={item.href || getItemHref(item.slug)}
              underline="none"
              sx={linkItemSx}
            >
              {item.name}
            </Link>
          </Box>
        ))
      )}

      {items.length > 0 && viewAllLink && viewAllText && (
        <>
          <Divider sx={{ my: 1.5 }} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              ...DROPDOWN_PADDING.item,
            }}
          >
            <Link
              component={RouterLink}
              href={viewAllLink}
              underline="none"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                fontSize: 14,
                fontWeight: 500,
                color: "text.primary",
                transition: "all 0.2s ease",
                borderBottom: "1px solid transparent",
                "&:hover": {
                  borderBottomColor: "currentColor",
                },
              }}
            >
              {viewAllText}
              <Iconify icon="eva:arrow-ios-forward-fill" width={16} />
            </Link>
          </Box>
        </>
      )}
    </Box>
  );
}

// ----------------------------------------------------------------------

// Two level dropdown content (for Shop categories)
function TwoLevelContent({
  groups,
  orphanItems = [],
  orphanTitle = "Other",
  allItemsLink,
  allItemsText,
  emptyChildrenText = "No items found",
  getItemHref,
}: Omit<TwoLevelDropdownProps, "type">) {
  const [activeParentId, setActiveParentId] = useState<number | string | null>(
    groups.length > 0 ? groups[0].parent.id : null
  );

  const activeGroup = useMemo(() => {
    if (!groups.length) return null;
    if (activeParentId == null) return groups[0];
    return groups.find((g) => g.parent.id === activeParentId) || groups[0];
  }, [activeParentId, groups]);

  const activeChildren = activeGroup?.children || [];

  if (!groups.length) {
    return (
      <Box sx={{ ...DROPDOWN_PADDING.container, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          {emptyChildrenText}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: 260,
        width: "max-content",
        minWidth: 600,
        maxWidth: 900,
      }}
    >
      {/* Left column: parent categories */}
      <Box
        sx={{
          width: "28%",
          minWidth: 200,
          borderRight: 1,
          borderColor: "divider",
          ...DROPDOWN_PADDING.leftColumn,
          bgcolor: "grey.50",
        }}
      >
        {/* All items link */}
        {allItemsLink && allItemsText && (
          <Box sx={{ ...DROPDOWN_PADDING.item, mb: 0.5 }}>
            <Link
              component={RouterLink}
              href={allItemsLink}
              underline="none"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                fontSize: 14,
                fontWeight: 500,
                transition: "all 0.2s ease",
                borderBottom: "1px solid transparent",
                color: "text.primary",
                "&:hover": {
                  borderBottomColor: "currentColor",
                },
              }}
            >
              {allItemsText}
            </Link>
          </Box>
        )}

        {/* Parent categories */}
        {groups.map((g) => {
          const isActive = activeGroup?.parent.id === g.parent.id;
          return (
            <Box
              key={g.parent.id}
              onMouseEnter={() => setActiveParentId(g.parent.id)}
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 0.5,
                ...DROPDOWN_PADDING.item,
                cursor: "pointer",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontSize: 14,
                  fontWeight: isActive ? 500 : 400,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  borderBottom: "1px solid",
                  borderBottomColor: isActive ? "currentColor" : "transparent",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderBottomColor: "currentColor",
                  },
                }}
              >
                {g.parent.name}
              </Typography>
            </Box>
          );
        })}

        {/* Orphan items (categories without children) */}
        {orphanItems.length > 0 && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
            <Typography
              variant="overline"
              sx={{
                fontSize: 11,
                color: "text.secondary",
                letterSpacing: 0.6,
                display: "block",
                mb: 1,
                ...DROPDOWN_PADDING.item,
                whiteSpace: "nowrap",
              }}
            >
              {orphanTitle}
            </Typography>
            {orphanItems.map((p) => (
              <Box key={p.id} sx={{ ...DROPDOWN_PADDING.item, mb: 0.5 }}>
                <Link
                  component={RouterLink}
                  href={p.href || getItemHref(p.slug)}
                  underline="none"
                  sx={{
                    display: "inline-block",
                    fontSize: 14,
                    fontWeight: 400,
                    color: "text.secondary",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease",
                    borderBottom: "1px solid transparent",
                    "&:hover": {
                      borderBottomColor: "currentColor",
                    },
                  }}
                >
                  {p.name}
                </Link>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Right panel: children categories */}
      <Box
        sx={{
          flex: 1,
          ...DROPDOWN_PADDING.rightColumn,
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.paper",
        }}
      >
        {activeGroup && (
          <Typography
            variant="h6"
            sx={{
              fontSize: 18,
              fontWeight: 700,
              mb: 2,
              whiteSpace: "nowrap",
            }}
          >
            {activeGroup.parent.name}
          </Typography>
        )}

        {activeChildren.length === 0 ? (
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
            {emptyChildrenText}
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              columnGap: 3,
              rowGap: 1.5,
            }}
          >
            {activeChildren.map((child) => (
              <Box key={child.id} sx={DROPDOWN_PADDING.item}>
                <Link
                  component={RouterLink}
                  href={child.href || getItemHref(child.slug)}
                  underline="none"
                  sx={{
                    fontSize: 14,
                    fontWeight: 400,
                    color: "text.primary",
                    lineHeight: 1.5,
                    transition: "all 0.2s ease",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "inline-block",
                    borderBottom: "1px solid transparent",
                    "&:hover": {
                      borderBottomColor: "currentColor",
                    },
                  }}
                >
                  {child.name}
                </Link>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

// Main NavDropdown component
export default function NavDropdown({
  label,
  href,
  color,
  textShadow,
  contentProps,
}: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  const handleOpen = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    timerRef.current = window.setTimeout(() => setOpen(false), 200);
  }, []);

  // Determine dropdown width based on type
  const dropdownWidth =
    contentProps.type === "two-level"
      ? { minWidth: 600, maxWidth: 900, width: "max-content" }
      : { minWidth: 280, maxWidth: 320 };

  return (
    <Box
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
      sx={{ position: "relative" }}
    >
      {/* Label/Trigger */}
      {href ? (
        <Link
          component={RouterLink}
          href={href}
          underline="none"
          sx={{
            typography: "subtitle2",
            letterSpacing: 1,
            color,
            textShadow,
            cursor: "pointer",
            transition: "all 0.3s ease",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            pb: 0.5,
            borderBottom: "2px solid transparent",
            "&:hover": {
              borderBottomColor: "currentColor",
            },
          }}
        >
          {label}
        </Link>
      ) : (
        <Typography
          component="span"
          sx={{
            typography: "subtitle2",
            letterSpacing: 1,
            color,
            textShadow,
            cursor: "pointer",
            transition: "all 0.3s ease",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            pb: 0.5,
            borderBottom: "2px solid transparent",
            "&:hover": {
              borderBottomColor: "currentColor",
            },
          }}
        >
          {label}
        </Typography>
      )}

      {/* Dropdown Content */}
      {open && (
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: "100%",
            mt: 1,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: "0 24px 50px rgba(15, 23, 42, 0.18)",
            overflow: "hidden",
            zIndex: (theme) => theme.zIndex.appBar + 1,
            ...dropdownWidth,
          }}
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
        >
          {contentProps.type === "single" ? (
            <SingleLevelContent {...contentProps} />
          ) : (
            <TwoLevelContent {...contentProps} />
          )}
        </Box>
      )}
    </Box>
  );
}

// Export types for external use
export type { DropdownItem, DropdownGroup, NavDropdownProps };

