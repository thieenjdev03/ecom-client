import { useState, useEffect, useCallback, MouseEvent, useMemo, useRef } from "react";

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

  // Shop mega menu state (2-level categories)
  const [isShopMegaMenuOpen, setIsShopMegaMenuOpen] = useState(false);
  const [activeShopParentId, setActiveShopParentId] = useState<number | null>(null);
  const shopMegaMenuTimerRef = useRef<number | null>(null);

  // Collection/Tags dropdown state  
  const [isTagsDropdownOpen, setIsTagsDropdownOpen] = useState(false);
  const tagsMenuTimerRef = useRef<number | null>(null);

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


  // Shop mega menu handlers (2-level categories)
  const clearShopMegaMenuTimer = useCallback(() => {
    if (shopMegaMenuTimerRef.current) {
      window.clearTimeout(shopMegaMenuTimerRef.current);
      shopMegaMenuTimerRef.current = null;
    }
  }, []);

  const openShopMegaMenu = useCallback(() => {
    clearShopMegaMenuTimer();
    if (!parentGroupsWithChildren.length) {
      setIsShopMegaMenuOpen(false);
      return;
    }
    setIsShopMegaMenuOpen(true);
    // Set default active parent to first item when opening
    setActiveShopParentId((prev) => (prev == null ? parentGroupsWithChildren[0].parent.id : prev));
  }, [clearShopMegaMenuTimer, parentGroupsWithChildren]);

  const closeShopMegaMenu = useCallback(() => {
    clearShopMegaMenuTimer();
    shopMegaMenuTimerRef.current = window.setTimeout(() => {
      setIsShopMegaMenuOpen(false);
    }, 200);
  }, [clearShopMegaMenuTimer]);

  const handleSelectShopParent = useCallback((id: number) => {
    setActiveShopParentId(id);
  }, []);

  // Get active parent group for shop mega menu
  const activeShopParentGroup = useMemo(() => {
    if (!parentGroupsWithChildren.length) {
      return null;
    }
    if (activeShopParentId == null) {
      return parentGroupsWithChildren[0];
    }
    return parentGroupsWithChildren.find((g) => g.parent.id === activeShopParentId) || parentGroupsWithChildren[0];
  }, [activeShopParentId, parentGroupsWithChildren]);

  const activeShopChildren = activeShopParentGroup?.children || [];

  // Tags dropdown handlers
  const clearTagsMenuTimer = useCallback(() => {
    if (tagsMenuTimerRef.current) {
      window.clearTimeout(tagsMenuTimerRef.current);
      tagsMenuTimerRef.current = null;
    }
  }, []);

  const openTagsDropdown = useCallback(() => {
    clearTagsMenuTimer();
    setIsTagsDropdownOpen(true);
  }, [clearTagsMenuTimer]);

  const closeTagsDropdown = useCallback(() => {
    clearTagsMenuTimer();
    tagsMenuTimerRef.current = window.setTimeout(() => {
      setIsTagsDropdownOpen(false);
    }, 200);
  }, [clearTagsMenuTimer]);

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
              {/* Shop with 2-level mega menu */}
              <Box
                onMouseEnter={openShopMegaMenu}
                onMouseLeave={closeShopMegaMenu}
                sx={{ position: "relative" }}
              >
                <Link
                  component={RouterLink}
                  href={paths.product.root}
                  underline="none"
                  color={activeColor}
                  sx={{
                    typography: "subtitle2",
                    letterSpacing: 1,
                    textShadow: activeShadow,
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    position: "relative",
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
                  {t("header.shop")}
                  <Iconify
                    icon="eva:arrow-ios-downward-fill"
                    width={16}
                    sx={{
                      transition: "transform 0.2s",
                      transform: isShopMegaMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </Link>

                {/* Shop Mega Menu - 2 Level Categories */}
                {isShopMegaMenuOpen && parentGroupsWithChildren.length > 0 && (
                  <Box
                    sx={{
                      position: "absolute",
                      left: 0,
                      top: "100%",
                      mt: 1,
                      bgcolor: "background.paper",
                      borderRadius: 2,
                      boxShadow: "0 24px 50px rgba(15, 23, 42, 0.18)",
                      display: { xs: "none", md: "flex" },
                      minHeight: 260,
                      width: "max-content",
                      minWidth: 600,
                      maxWidth: 900,
                      overflow: "hidden",
                      zIndex: (theme) => theme.zIndex.appBar + 1,
                    }}
                    onMouseEnter={openShopMegaMenu}
                    onMouseLeave={closeShopMegaMenu}
                  >
                    {/* Left column: parent categories */}
                    <Box
                      sx={{
                        width: "28%",
                        minWidth: 200,
                        borderRight: 1,
                        borderColor: "divider",
                        py: 3,
                        px: 2,
                        bgcolor: "grey.50",
                      }}
                    >
                      {/* All Products link */}
                      <Link
                        component={RouterLink}
                        href={paths.product.root}
                        underline="none"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          minHeight: 44,
                          mb: 1,
                          px: 1.5,
                          borderRadius: 1,
                          fontSize: 15,
                          fontWeight: 600,
                          color: "primary.main",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: "action.hover",
                          },
                        }}
                      >
                        <Iconify icon="solar:shop-bold-duotone" width={20} />
                        {t("header.allProducts")}
                      </Link>

                      <Divider sx={{ mb: 1.5 }} />

                      {parentGroupsWithChildren.map((g) => {
                        const isActive = activeShopParentGroup?.parent.id === g.parent.id;
                        return (
                          <Box
                            key={g.parent.id}
                            onMouseEnter={() => handleSelectShopParent(g.parent.id)}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              minHeight: 44,
                              mb: 0.5,
                              px: 1.5,
                              borderRadius: 1,
                              cursor: "pointer",
                              bgcolor: isActive ? "action.hover" : "transparent",
                              color: isActive ? "primary.main" : "text.primary",
                              fontWeight: isActive ? 600 : 400,
                              transition: "all 0.2s ease",
                              "&:hover": {
                                bgcolor: "action.hover",
                                color: "primary.main",
                                fontWeight: 600,
                              },
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontSize: 15,
                                fontWeight: "inherit",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                width: "100%",
                              }}
                            >
                              {g.parent.name}
                            </Typography>
                          </Box>
                        );
                      })}

                      {parentsWithoutChildren.length > 0 && (
                        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
                          <Typography
                            variant="overline"
                            sx={{
                              fontSize: 11,
                              color: "text.secondary",
                              letterSpacing: 0.6,
                              display: "block",
                              mb: 1,
                              px: 1.5,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {t("header.another")}
                          </Typography>
                          {parentsWithoutChildren.map((p) => (
                            <Link
                              key={p.id}
                              component={RouterLink}
                              href={paths.categories.details(p.slug)}
                              underline="none"
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                minHeight: 36,
                                mb: 0.5,
                                px: 1.5,
                                fontSize: 14,
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
                          ))}
                        </Box>
                      )}
                    </Box>

                    {/* Right panel: children categories */}
                    <Box
                      sx={{
                        flex: 1,
                        py: 3,
                        px: 4,
                        display: "flex",
                        flexDirection: "column",
                        bgcolor: "background.paper",
                      }}
                    >
                      {activeShopParentGroup && (
                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: 18,
                            fontWeight: 700,
                            mb: 2,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {activeShopParentGroup.parent.name}
                        </Typography>
                      )}

                      {activeShopChildren.length === 0 ? (
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary", mt: 1 }}
                        >
                          {t("categories.categoryDetails.noProducts")}
                        </Typography>
                      ) : (
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: {
                              md: "repeat(3, minmax(0, 1fr))",
                              lg: "repeat(3, minmax(0, 1fr))",
                            },
                            columnGap: 3,
                            rowGap: 1.5,
                          }}
                        >
                          {activeShopChildren.map((child: Category) => (
                            <Link
                              key={child.id}
                              component={RouterLink}
                              href={paths.categories.details(child.slug)}
                              underline="none"
                              sx={{
                                fontSize: 14,
                                fontWeight: 400,
                                color: "text.primary",
                                lineHeight: 1.5,
                                py: 0.5,
                                px: 1,
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
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Collection with tags dropdown */}
              <Box
                onMouseEnter={openTagsDropdown}
                onMouseLeave={closeTagsDropdown}
                sx={{ position: "relative" }}
              >
                <Typography
                  component="span"
                  sx={{
                    typography: "subtitle2",
                    letterSpacing: 1,
                    color: activeColorValue,
                    textShadow: activeShadow,
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
                  {t("header.collection")}
                  <Iconify
                    icon="eva:arrow-ios-downward-fill"
                    width={16}
                    sx={{
                      transition: "transform 0.2s",
                      transform: isTagsDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </Typography>

                {/* Collection Dropdown */}
                {isTagsDropdownOpen && (
                  <Box
                    sx={{
                      position: "absolute",
                      left: 0,
                      top: "100%",
                      mt: 1,
                      bgcolor: "background.paper",
                      borderRadius: 2,
                      boxShadow: "0 24px 50px rgba(15, 23, 42, 0.18)",
                      minWidth: 280,
                      maxWidth: 320,
                      overflow: "hidden",
                      zIndex: (theme) => theme.zIndex.appBar + 1,
                    }}
                    onMouseEnter={openTagsDropdown}
                    onMouseLeave={closeTagsDropdown}
                  >
                    <Box sx={{ py: 2 }}>
                      <Typography
                        variant="overline"
                        sx={{
                          fontSize: 11,
                          color: "text.secondary",
                          letterSpacing: 0.6,
                          display: "block",
                          px: 2.5,
                          mb: 1,
                        }}
                      >
                        {t("header.collection")}
                      </Typography>

                      {/* Collections list from API */}
                      {collectionsLoading ? (
                        <Box sx={{ px: 2.5, py: 2, textAlign: "center" }}>
                          <Typography variant="body2" color="text.secondary">
                            Loading...
                          </Typography>
                        </Box>
                      ) : activeCollections.length === 0 ? (
                        <Box sx={{ px: 2.5, py: 2, textAlign: "center" }}>
                          <Typography variant="body2" color="text.secondary">
                            No collections available
                          </Typography>
                        </Box>
                      ) : (
                        activeCollections.slice(0, 8).map((collection) => (
                          <Box
                            key={collection.id}
                            sx={{
                              px: 2.5,
                              py: 1,
                            }}
                          >
                            <Link
                              component={RouterLink}
                              href={paths.collections.details(collection.slug)}
                              underline="none"
                              sx={{
                                display: "inline-block",
                                fontSize: 14,
                                color: "text.primary",
                                transition: "all 0.2s ease",
                                borderBottom: "1px solid transparent",
                                "&:hover": {
                                  borderBottomColor: "currentColor",
                                },
                              }}
                            >
                              {collection.name}
                            </Link>
                          </Box>
                        ))
                      )}

                      {activeCollections.length > 0 && (
                        <>
                          <Divider sx={{ my: 1.5 }} />

                          {/* View all collections link */}
                          <Link
                            component={RouterLink}
                            href={paths.collections.root}
                            underline="none"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 0.5,
                              px: 2.5,
                              py: 1,
                              fontSize: 13,
                              fontWeight: 500,
                              color: "primary.main",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                bgcolor: "primary.lighter",
                              },
                            }}
                          >
                            {t("header.viewAllCollections")}
                            <Iconify icon="eva:arrow-ios-forward-fill" width={16} />
                          </Link>
                        </>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
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
              onClick={handleOpenAccountMenu}
              aria-haspopup="true"
              aria-controls={isAccountMenuOpen ? "header-account-menu" : undefined}
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
