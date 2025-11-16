import { useState, useEffect, useCallback } from "react";

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

import IconButton from "@mui/material/IconButton";

import { usePathname } from "next/navigation";
import Iconify from "src/components/iconify";
import { RouterLink } from "src/routes/components";
import { paths } from "src/routes/paths";
import Scrollbar from "src/components/scrollbar";

import { bgBlur } from "src/theme/css";
import { useOffSetTop } from "src/hooks/use-off-set-top";
import { useResponsive } from "src/hooks/use-responsive";

import { HEADER } from "../config-layout";
import HeaderShadow from "../common/header-shadow";
import LanguagePopover from "../common/language-popover";
import EcomDropdown from "../main/nav/ecom-dropdown";
import EcomCategoriesDropdown from "./nav/ecom-categories-dropdown";
import { PRODUCT_CATEGORY_GROUP_OPTIONS } from "src/_mock";
import { useAuthContext } from "src/auth/hooks";
import { useCheckoutContext } from "src/sections/checkout/context/checkout-context";
import { CartPreviewDrawer } from "src/components/cart-preview";
import { useGetCategoryTree } from "src/api/reference";
import { useTranslate } from "src/locales";

// ----------------------------------------------------------------------

export default function HeaderEcom() {
  const theme = useTheme();
  const pathname = usePathname();
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
    isHome && !offsetTop
      ? "0 0 10px rgba(0, 0, 0, 0.5)"
      : "0 0 10px rgba(0, 0, 0, 0.2)";
  const activeColorValue =
    isHome && !offsetTop
      ? theme.palette.common.white
      : theme.palette.text.primary;
  const userProfile = useAuthContext();
  const checkout = useCheckoutContext();

  // Mobile menu state
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const [openCategories, setOpenCategories] = useState(false);
  const [openCollection, setOpenCollection] = useState(false);

  const { categoryTree } = useGetCategoryTree();

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

  // Collection groups
  const collectionGroups = PRODUCT_CATEGORY_GROUP_OPTIONS.map((g) => ({
    title: g.group,
    items: g.classify.map((c) => ({
      label: c,
      href: `${paths.product.root}?category=${encodeURIComponent(c)}`,
    })),
  }));
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

          {/* Desktop Navigation */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={4}
            sx={{ flex: 1, display: { xs: "none", md: "flex" } }}
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
                  "&:hover": {
                    color: theme.palette.primary.main,
                    transform: "translateY(-2px)",
                    textShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
                  },
                }}
              >
                {t("header.home")}
              </Link>
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
                  "&:hover": {
                    color: theme.palette.primary.main,
                    transform: "translateY(-2px)",
                    textShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
                  },
                }}
              >
                {t("header.shop")}
              </Link>
              <EcomCategoriesDropdown
                label={t("header.categories")}
                color={activeColorValue}
                textShadow={activeShadow}
              />
              {/* <EcomDropdown
                label={t("header.collection")}
                color={activeColorValue}
                textShadow={activeShadow}
                groups={PRODUCT_CATEGORY_GROUP_OPTIONS.map((g) => ({
                  title: g.group,
                  items: g.classify.map((c) => ({
                    label: c,
                    href: `${paths.product.root}?category=${encodeURIComponent(c)}`,
                  })),
                }))}
              /> */}
            </Stack>
          </Stack>

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
            spacing={{ xs: 0.5, sm: 1, md: 1.5 }}
            sx={{ flex: { xs: 0, md: 1 }, justifyContent: "flex-end" }}
          >
            {/* Language Popover */}
            <Box
              sx={{
                "& .MuiIconButton-root": {
                  color: activeColor,
                  transition: "all 0.3s ease",
                  padding: { xs: 0.75, md: 1 },
                  "&:hover": {
                    color: theme.palette.primary.main,
                    transform: "scale(1.1)",
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                  },
                },
                "& .MuiIconButton-root svg": {
                  textShadow: activeShadow,
                  width: { xs: 18, md: 22 },
                  height: { xs: 18, md: 22 },
                },
              }}
            >
              <LanguagePopover />
            </Box>
            {/* Search - Hidden on mobile */}
            <IconButton 
              color="inherit" 
              sx={{ 
                display: { xs: "none", sm: "flex" },
                color: activeColor,
                transition: "all 0.3s ease",
                "&:hover": {
                  color: theme.palette.primary.main,
                  transform: "scale(1.1)",
                  backgroundColor: "rgba(0, 0, 0, 0.05)",
                },
              }}
            >
              <Iconify
                icon="solar:magnifier-linear"
                width={22}
                sx={{ textShadow: activeShadow }}
              />
            </IconButton>
            {/* Wishlist */}
            <IconButton 
              component={RouterLink} 
              href={paths.landing.product.wishlist} 
              color="inherit" 
              sx={{ 
                color: activeColor,
                transition: "all 0.3s ease",
                "&:hover": {
                  color: theme.palette.error.main,
                  transform: "scale(1.1)",
                  backgroundColor: "rgba(0, 0, 0, 0.05)",
                },
              }}
            >
              <Iconify
                icon="solar:heart-linear"
                width={{ xs: 20, md: 22 }}
                sx={{ textShadow: activeShadow }}
              />
            </IconButton>
            {/* User Account */}
            <IconButton
              color="inherit"
              sx={{ 
                color: activeColor,
                transition: "all 0.3s ease",
                "&:hover": {
                  color: theme.palette.primary.main,
                  transform: "scale(1.1)",
                  backgroundColor: "rgba(0, 0, 0, 0.05)",
                },
              }}
              component={RouterLink}
              href={userProfile?.authenticated ? paths.landing.user.account : paths.auth.jwt.login}
            >
              <Iconify
                icon="solar:user-linear"
                width={{ xs: 20, md: 22 }}
                sx={{ textShadow: activeShadow }}
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
                "&:hover": {
                  color: theme.palette.success.main,
                  transform: "scale(1.1)",
                  backgroundColor: "rgba(0, 0, 0, 0.05)",
                },
              }}
            >
              <Iconify
                icon="solar:bag-3-linear"
                width={{ xs: 20, md: 22 }}
                sx={{ textShadow: activeShadow }}
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
                  {collectionGroups.map((group) => (
                    <Box key={group.title} sx={{ pl: 2, mb: 1 }}>
                      <Typography variant="overline" sx={{ fontSize: 11, color: "text.secondary", px: 2, py: 1 }}>
                        {group.title}
                      </Typography>
                      {group.items.map((item) => (
                        <ListItemButton
                          key={item.href}
                          component={RouterLink}
                          href={item.href}
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
                          <Typography variant="body2">{item.label}</Typography>
                        </ListItemButton>
                      ))}
                    </Box>
                  ))}
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
                href={userProfile?.authenticated ? paths.landing.user.account : paths.auth.jwt.login}
                onClick={handleCloseMobileMenu}
                sx={{ borderRadius: 1 }}
              >
                <Iconify icon="solar:user-linear" width={20} sx={{ mr: 2 }} />
                <Typography variant="body1">
                  {userProfile?.authenticated ? t("header.account") : t("header.login")}
                </Typography>
              </ListItemButton>
            </Stack>
          </Box>
        </Scrollbar>
      </Drawer>

      {/* Cart Preview Drawer */}
      <CartPreviewDrawer />
    </AppBar>
  );
}
