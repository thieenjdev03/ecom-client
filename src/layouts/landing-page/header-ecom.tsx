import { useState, useEffect, useCallback, MouseEvent, useMemo } from "react";

import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Drawer from "@mui/material/Drawer";
import { useTheme } from "@mui/material/styles";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import Collapse from "@mui/material/Collapse";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import IconButton from "@mui/material/IconButton";

import { usePathname } from "next/navigation";
import Iconify from "src/components/iconify";
import { RouterLink } from "src/routes/components";
import { paths } from "src/routes/paths";
import Scrollbar from "src/components/scrollbar";
import { useRouter } from "src/routes/hooks";

import { bgBlur } from "src/theme/css";
import { useOffSetTop } from "src/hooks/use-off-set-top";
import { useResponsive } from "src/hooks/use-responsive";

import { HEADER } from "../config-layout";
import HeaderShadow from "../common/header-shadow";
import LanguagePopover from "../common/language-popover";
import { useAuthContext } from "src/auth/hooks";
import { useCheckoutContext } from "src/sections/checkout/context/checkout-context";
import { CartPreviewDrawer } from "src/components/cart-preview";
import { useGetCategoryTree, useGetCollections } from "src/api/reference";
import { useTranslate } from "src/locales";
import NavDropdown, { DropdownGroup, DropdownItem } from "./nav/nav-dropdown";

// ----------------------------------------------------------------------

export default function HeaderEcom() {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslate();

  const mdUp = useResponsive("up", "md");

  const offsetTop = useOffSetTop(HEADER.H_DESKTOP);

  const isHome = pathname === "/";
  const applyBlur = !isHome || offsetTop;

  const activeColor = isHome
    ? offsetTop
      ? "text.primary"
      : "common.white"
    : "text.primary";
  const activeShadow =
    applyBlur
      ? "none"
      : isHome && !offsetTop
        ? "0 0 10px rgba(0, 0, 0, 0.5)"
        : "0 0 10px rgba(0, 0, 0, 0.2)";
  const activeColorValue =
    isHome && !offsetTop
      ? theme.palette.common.white
      : theme.palette.text.primary;
  const userProfile = useAuthContext();
  const checkout = useCheckoutContext();
  // Mobile menu state
  console.log('userProfile', userProfile);
  const isAuthenticated = Boolean(userProfile?.authenticated);
  const userEmail = userProfile?.user?.email as string | undefined;
  const logoutUser = userProfile?.logout;

  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const [openCategories, setOpenCategories] = useState(false);
  const [openCollection, setOpenCollection] = useState(false);
  const [accountMenuAnchor, setAccountMenuAnchor] =
    useState<null | HTMLElement>(null);
  const isAccountMenuOpen = Boolean(accountMenuAnchor);

  const { categoryTree } = useGetCategoryTree();
  
  // Fetch collections from API
  const { collections, collectionsLoading } = useGetCollections();

  // Filter only active collections for display
  const activeCollections = useMemo(() => {
    return collections?.filter((c) => c.is_active) || [];
  }, [collections]);

  // Helper function to get user display name
  const getUserDisplayName = useCallback(() => {
    if (!userProfile?.user) return null;
    const user = userProfile.user;
    // Try different possible fields for user name
    return (
      user.profile ||
      user.displayName ||
      (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}`.trim() : null) ||
      user.name ||
      user.email?.split("@")[0] ||
      null
    );
  }, [userProfile?.user]);

  useEffect(() => {
    if (openMobileMenu) {
      setOpenMobileMenu(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleOpenMobileMenu = useCallback(() => {
    setOpenMobileMenu(true);
  }, []);

  const handleCloseMobileMenu = useCallback(() => {
    setOpenMobileMenu(false);
    setOpenCategories(false);
    setOpenCollection(false);
  }, []);

  const handleToggleCategories = useCallback(() => {
    setOpenCategories((prev) => !prev);
    setOpenCollection(false);
  }, []);

  const handleToggleCollection = useCallback(() => {
    setOpenCollection((prev) => !prev);
    setOpenCategories(false);
  }, []);

  const handleOpenAccountMenu = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (isAuthenticated) {
        setAccountMenuAnchor(event.currentTarget);
        return;
      }
      router.push(paths.auth.jwt.login);
    },
    [isAuthenticated, router],
  );

  const handleCloseAccountMenu = useCallback(() => {
    setAccountMenuAnchor(null);
  }, []);

  const handleGoToAccount = useCallback(() => {
    handleCloseAccountMenu();
    router.push(paths.landing.user.account);
  }, [handleCloseAccountMenu, router]);

  const handleLogout = useCallback(async () => {
    if (!logoutUser) return;
    try {
      await logoutUser();
      handleCloseAccountMenu();
      router.push("/");
    } catch (error) {
      console.error(error);
    }
  }, [handleCloseAccountMenu, logoutUser, router]);

  // Prepare categories data for mobile menu
  interface Category {
    id: number;
    name: string;
    slug: string;
    children?: Category[];
  }
  const parents: Category[] = Array.isArray(categoryTree) ? categoryTree : [];
  const groups = parents.map((p) => ({
    parent: p,
    children: (p.children && p.children.length > 0 ? p.children : []).slice().sort((a: Category, b: Category) => a.name.localeCompare(b.name)),
  }));
  const parentGroupsWithChildren = groups.filter((g) => g.children.length > 0);
  const parentsWithoutChildren = groups.filter((g) => g.children.length === 0).map((g) => g.parent);

  // Prepare data for NavDropdown components
  const shopDropdownGroups: DropdownGroup[] = useMemo(
    () =>
      parentGroupsWithChildren.map((g) => ({
        parent: { id: g.parent.id, name: g.parent.name, slug: g.parent.slug },
        children: g.children.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
      })),
    [parentGroupsWithChildren]
  );

  const shopOrphanItems: DropdownItem[] = useMemo(
    () => parentsWithoutChildren.map((p) => ({ id: p.id, name: p.name, slug: p.slug })),
    [parentsWithoutChildren]
  );

  const collectionDropdownItems: DropdownItem[] = useMemo(
    () =>
      activeCollections.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      })),
    [activeCollections]
  );

  return (
    <AppBar elevation={0} sx={{ bgcolor: "transparent", boxShadow: "none" }}>
      <Toolbar
        disableGutters
        sx={{
          height: {
            xs: HEADER.H_MOBILE,
            md: HEADER.H_DESKTOP,
          },
          transition: theme.transitions.create(["height", "background-color"], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.shorter,
          }),
          ...(applyBlur && {
            ...bgBlur({ color: theme.palette.background.paper, blur: 0.5 }),
            ...(offsetTop && { height: { md: HEADER.H_DESKTOP_OFFSET } }),
          }),
        }}
      >
        <Container sx={{ height: 1, display: "flex", alignItems: "center", px: { xs: 1, sm: 2 } }}>
          {/* Mobile Menu Button */}
          {!mdUp && (
            <IconButton
              onClick={handleOpenMobileMenu}
              sx={{
                color: activeColor,
                transition: "all 0.3s ease",
                mr: 1,
                "&:hover": {
                  color: theme.palette.primary.main,
                  transform: "scale(1.1)",
                  backgroundColor: "rgba(0, 0, 0, 0.05)",
                },
              }}
            >
              <Iconify
                icon="solar:hamburger-menu-linear"
                width={24}
                sx={{ textShadow: activeShadow }}
              />
            </IconButton>
          )}

          {/* Desktop Navigation with mega categories menu */}
          <Box
            sx={{
              flex: 1,
              display: { xs: "none", md: "flex" },
              alignItems: "stretch",
              position: "relative",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={4}>
              <Link
                component={RouterLink}
                href="/"
                underline="none"
                color={activeColor}
                sx={{
                  typography: "subtitle2",
                  letterSpacing: 1,
                  textShadow: activeShadow,
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  pb: 0.5,
                  borderBottom: "2px solid transparent",
                  "&:hover": {
                    borderBottomColor: "currentColor",
                  },
                }}
              >
                {t("header.home")}
              </Link>
              {/* Shop with 2-level mega menu using NavDropdown */}
              <NavDropdown
                label={t("header.shop")}
                  href={paths.product.root}
                  color={activeColor}
                textShadow={activeShadow}
                contentProps={{
                  type: "two-level",
                  groups: shopDropdownGroups,
                  orphanItems: shopOrphanItems,
                  orphanTitle: t("header.another"),
                  allItemsLink: paths.product.root,
                  allItemsText: t("header.allProducts"),
                  emptyChildrenText: t("categories.categoryDetails.noProducts"),
                  getItemHref: (slug) => paths.categories.details(slug),
                }}
              />

              {/* Collection with single-level dropdown using NavDropdown */}
              <NavDropdown
                label={t("header.collection")}
                color={activeColorValue}
                textShadow={activeShadow}
                contentProps={{
                  type: "single",
                  items: collectionDropdownItems,
                  loading: collectionsLoading,
                  emptyText: "No collections available",
                  loadingText: "Loading...",
                  viewAllLink: paths.collections.root,
                  viewAllText: t("header.viewAllCollections"),
                  getItemHref: (slug) => paths.collections.details(slug),
                }}
              />
            </Stack>
          </Box>

          {/* Logo */}
          <Box sx={{ flex: { xs: 1, md: 0 }, textAlign: "left" }}>
            <Typography
              variant={mdUp ? "h3" : "h4"}
              component={RouterLink}
              href="/"
              sx={{
                fontWeight: 700,
                letterSpacing: { xs: 2, md: 8 },
                color: activeColor,
                textShadow: activeShadow,
                textDecoration: "none",
                display: "block",
                transition: "all 0.3s ease",
                cursor: "pointer",
                "&:hover": {
                  color: theme.palette.primary.main,
                  transform: "scale(1.05)",
                  textShadow: "0 6px 12px rgba(0, 0, 0, 0.4)",
                },
              }}
            >
              LUMÉ
            </Typography>
          </Box>

          {/* Right side icons */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={{ xs: 0.5 }}
            sx={{ flex: { xs: 0, md: 1 }, justifyContent: "flex-end" }}
          >
            {/* Language Popover */}
            <Box
              sx={{
                "& .MuiIconButton-root": {
                  color: activeColor,
                  transition: "all 0.3s ease",
                  borderBottom: "2px solid transparent",
                  "&:hover": {
                    borderBottomColor: "currentColor",
                  },
                },
                "& .MuiIconButton-root svg": {
                  width: { xs: 18, md: 22 },
                  height: { xs: 18, md: 22 },
                },
              }}
            >
              <LanguagePopover />
            </Box>
            {/* Wishlist */}
            <IconButton
              component={RouterLink}
              href={paths.landing.product.wishlist}
              color="inherit"
              sx={{
                color: activeColor,
                transition: "all 0.3s ease",
                borderBottom: "2px solid transparent",
                "&:hover": {
                  borderBottomColor: "currentColor",
                },
              }}
            >
              <Iconify
                icon="solar:heart-linear"
                width={{ xs: 20, md: 22 }}
              />
            </IconButton>
            {/* User Account */}
            <IconButton
              color="inherit"
              sx={{
                color: activeColor,
                transition: "all 0.3s ease",
                borderBottom: "2px solid transparent",
                "&:hover": {
                  borderBottomColor: "currentColor",
                },
              }}
              onClick={handleOpenAccountMenu}
              aria-haspopup="true"
              aria-controls={isAccountMenuOpen ? "header-account-menu" : undefined}
            >
              <Iconify
                icon="solar:user-linear"
                width={{ xs: 20, md: 22 }}
              />
            </IconButton>
          
            {/* Cart */}
            <IconButton
              color="inherit"
              onClick={checkout.onOpenCartPreview}
              sx={{
                color: activeColor,
                transition: "all 0.3s ease",
                position: "relative",
                borderBottom: "2px solid transparent",
                "&:hover": {
                  borderBottomColor: "currentColor",
                },
              }}
            >
              <Iconify
                icon="solar:bag-3-linear"
                width={{ xs: 20, md: 22 }}
              />
              {checkout.totalItems > 0 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    minWidth: { xs: 16, md: 18 },
                    height: { xs: 16, md: 18 },
                    borderRadius: "50%",
                    backgroundColor: "error.main",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: { xs: "0.65rem", md: "0.75rem" },
                    fontWeight: 600,
                    lineHeight: 1,
                  }}
                >
                  {checkout.totalItems > 99 ? "99+" : checkout.totalItems}
                </Box>
              )}
            </IconButton>
          </Stack>
        </Container>
      </Toolbar>

      {offsetTop && <HeaderShadow />}

      {/* Mobile Menu Drawer */}
      <Drawer
        open={openMobileMenu}
        onClose={handleCloseMobileMenu}
        anchor="left"
        PaperProps={{
          sx: {
            width: { xs: 280, sm: 320 },
          },
        }}
      >
        <Scrollbar>
          <Box sx={{ p: 2.5 }}>
            <Stack direction="row" alignItems="left" justifyContent="space-between" sx={{ mb: 3 }}>
              <Typography
                variant="h5"
                component={RouterLink}
                href="/"
                onClick={handleCloseMobileMenu}
                sx={{
                  fontWeight: 700,
                  letterSpacing: 2,
                  color: "text.primary",
                  textDecoration: "none",
                }}
              >
                LUMÉ
              </Typography>
              <IconButton onClick={handleCloseMobileMenu}>
                <Iconify icon="solar:close-circle-bold" width={24} />
              </IconButton>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <List disablePadding>
              {/* Home */}
              <ListItemButton
                component={RouterLink}
                href="/"
                onClick={handleCloseMobileMenu}
                selected={pathname === "/"}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  "&.Mui-selected": {
                    bgcolor: "primary.lighter",
                    color: "primary.main",
                    "&:hover": {
                      bgcolor: "primary.lighter",
                    },
                  },
                }}
              >
                <Iconify icon="solar:home-2-bold-duotone" width={20} sx={{ mr: 2 }} />
                <Typography variant="body1">{t("header.home")}</Typography>
              </ListItemButton>

              {/* Shop */}
              <ListItemButton
                component={RouterLink}
                href={paths.product.root}
                onClick={handleCloseMobileMenu}
                selected={pathname === paths.product.root}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  "&.Mui-selected": {
                    bgcolor: "primary.lighter",
                    color: "primary.main",
                    "&:hover": {
                      bgcolor: "primary.lighter",
                    },
                  },
                }}
              >
                <Iconify icon="solar:shop-bold-duotone" width={20} sx={{ mr: 2 }} />
                <Typography variant="body1">{t("header.shop")}</Typography>
              </ListItemButton>

              {/* Categories */}
              <ListItemButton
                onClick={handleToggleCategories}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                }}
              >
                <Iconify icon="solar:category-bold-duotone" width={20} sx={{ mr: 2 }} />
                <Typography variant="body1" sx={{ flex: 1 }}>
                  {t("header.categories")}
                </Typography>
                <Iconify
                  icon={openCategories ? "eva:arrow-ios-downward-fill" : "eva:arrow-ios-forward-fill"}
                  width={16}
                />
              </ListItemButton>
              <Collapse in={openCategories} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {parentGroupsWithChildren.map((g) => (
                    <Box key={g.parent.id} sx={{ pl: 2, mb: 1 }}>
                      <Typography variant="overline" sx={{ fontSize: 11, color: "text.secondary", px: 2, py: 1 }}>
                        {g.parent.name}
                      </Typography>
                      {g.children.map((child: Category) => (
                        <ListItemButton
                          key={child.id}
                          component={RouterLink}
                          href={paths.categories.details(child.slug)}
                          onClick={handleCloseMobileMenu}
                          sx={{
                            borderRadius: 1,
                            pl: 4,
                            py: 0.75,
                            "&:hover": {
                              bgcolor: "action.hover",
                            },
                          }}
                        >
                          <Typography variant="body2">{child.name}</Typography>
                        </ListItemButton>
                      ))}
                    </Box>
                  ))}
                  {parentsWithoutChildren.length > 0 && (
                    <Box sx={{ pl: 2, mb: 1 }}>
                      <Typography variant="overline" sx={{ fontSize: 11, color: "text.secondary", px: 2, py: 1 }}>
                        {t("header.another")}
                      </Typography>
                      {parentsWithoutChildren.map((p) => (
                        <ListItemButton
                          key={p.id}
                          component={RouterLink}
                          href={paths.categories.details(p.slug)}
                          onClick={handleCloseMobileMenu}
                          sx={{
                            borderRadius: 1,
                            pl: 4,
                            py: 0.75,
                            "&:hover": {
                              bgcolor: "action.hover",
                            },
                          }}
                        >
                          <Typography variant="body2">{p.name}</Typography>
                        </ListItemButton>
                      ))}
                    </Box>
                  )}
                </List>
              </Collapse>

              {/* Collection */}
              <ListItemButton
                onClick={handleToggleCollection}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                }}
              >
                <Iconify icon="solar:folder-bold-duotone" width={20} sx={{ mr: 2 }} />
                <Typography variant="body1" sx={{ flex: 1 }}>
                  {t("header.collection")}
                </Typography>
                <Iconify
                  icon={openCollection ? "eva:arrow-ios-downward-fill" : "eva:arrow-ios-forward-fill"}
                  width={16}
                />
              </ListItemButton>
              <Collapse in={openCollection} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {collectionsLoading ? (
                    <Box sx={{ pl: 4, py: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Loading...
                      </Typography>
                    </Box>
                  ) : activeCollections.length === 0 ? (
                    <Box sx={{ pl: 4, py: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        No collections available
                      </Typography>
                    </Box>
                  ) : (
                    activeCollections.map((collection) => (
                      <ListItemButton
                        key={collection.id}
                        component={RouterLink}
                        href={paths.collections.details(collection.slug)}
                        onClick={handleCloseMobileMenu}
                        sx={{
                          borderRadius: 1,
                          pl: 4,
                          py: 0.75,
                          "&:hover": {
                            bgcolor: "action.hover",
                          },
                        }}
                      >
                        <Typography variant="body2">{collection.name}</Typography>
                      </ListItemButton>
                    ))
                  )}
                </List>
              </Collapse>
            </List>

            <Divider sx={{ my: 2 }} />

            {/* Mobile menu footer actions */}
            <Stack spacing={1}>
              <ListItemButton
                component={RouterLink}
                href={paths.landing.product.wishlist}
                onClick={handleCloseMobileMenu}
                sx={{ borderRadius: 1 }}
              >
                <Iconify icon="solar:heart-linear" width={20} sx={{ mr: 2 }} />
                <Typography variant="body1">{t("header.wishlist")}</Typography>
              </ListItemButton>
              <ListItemButton
                component={RouterLink}
                href={isAuthenticated ? paths.landing.user.account : paths.auth.jwt.login}
                onClick={handleCloseMobileMenu}
                sx={{ borderRadius: 1 }}
              >
                <Iconify icon="solar:user-linear" width={20} sx={{ mr: 2 }} />
                <Typography variant="body1">
                  {isAuthenticated ? t("header.account") : t("header.login")}
                </Typography>
              </ListItemButton>
            </Stack>
          </Box>
        </Scrollbar>
      </Drawer>

      {/* Cart Preview Drawer */}
      <CartPreviewDrawer />
      {isAuthenticated && (
        <Menu
          id="header-account-menu"
          anchorEl={accountMenuAnchor}
          open={isAccountMenuOpen}
          onClose={handleCloseAccountMenu}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            paper: {
              sx: { mt: 1, minWidth: 220 },
            },
          }}
        >
          <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
            <Typography variant="subtitle2" noWrap>
              {getUserDisplayName() || t("header.account")}
            </Typography>
            {userEmail && (
              <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
                {userEmail}
              </Typography>
            )}
          </Box>
          <Divider sx={{ borderStyle: "dashed" }} />
          <MenuItem onClick={handleGoToAccount}>
            <ListItemIcon>
              <Iconify icon="solar:user-linear" width={20} />
            </ListItemIcon>
            <ListItemText primary={t("header.viewProfile")} />
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
            <ListItemIcon>
              <Iconify icon="solar:logout-2-linear" width={20} />
            </ListItemIcon>
            <ListItemText primary={t("header.logout")} />
          </MenuItem>
        </Menu>
      )}
    </AppBar>
  );
}
