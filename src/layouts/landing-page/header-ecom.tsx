import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

import IconButton from "@mui/material/IconButton";

import { usePathname } from "next/navigation";
import Iconify from "src/components/iconify";
import { RouterLink } from "src/routes/components";
import { paths } from "src/routes/paths";

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

// ----------------------------------------------------------------------

export default function HeaderEcom() {
  const theme = useTheme();
  const pathname = usePathname();

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
  console.log('userProfile', userProfile);
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
        <Container sx={{ height: 1, display: "flex", alignItems: "center" }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={4}
            sx={{ flex: 1 }}
          >
            {mdUp && (
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
                  HOME
                </Link>
                <EcomDropdown
                  label="SHOP"
                  color={activeColorValue}
                  textShadow={activeShadow}
                  groups={PRODUCT_CATEGORY_GROUP_OPTIONS.map((g) => ({
                    title: g.group,
                    items: g.classify.map((c) => ({
                      label: c,
                      href: `${paths.product.root}?category=${encodeURIComponent(c)}`,
                    })),
                  }))}
                />
                <EcomCategoriesDropdown
                  label="CATEGORIES"
                  color={activeColorValue}
                  textShadow={activeShadow}
                />
                <EcomDropdown
                  label="COLLECTION"
                  color={activeColorValue}
                  textShadow={activeShadow}
                  groups={PRODUCT_CATEGORY_GROUP_OPTIONS.map((g) => ({
                    title: g.group,
                    items: g.classify.map((c) => ({
                      label: c,
                      href: `${paths.product.root}?category=${encodeURIComponent(c)}`,
                    })),
                  }))}
                />
              </Stack>
            )}
          </Stack>

          <Box sx={{ flex: 0, textAlign: "center" }}>
            <Typography
              variant="h3"
              component={RouterLink}
              href="/"
              sx={{
                fontWeight: 700,
                letterSpacing: 8,
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

          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ flex: 1, justifyContent: "flex-end" }}
          >
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
                },
              }}
            >
              <LanguagePopover />
            </Box>
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
            >
              <Iconify
                icon="solar:magnifier-linear"
                width={22}
                sx={{ textShadow: activeShadow }}
              />
            </IconButton>
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
                width={22}
                sx={{ textShadow: activeShadow }}
              />
            </IconButton>
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
                width={22}
                sx={{ textShadow: activeShadow }}
              />
            </IconButton>
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
                width={22}
                sx={{ textShadow: activeShadow }}
              />
              {checkout.totalItems > 0 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    minWidth: 18,
                    height: 18,
                    borderRadius: "50%",
                    backgroundColor: "error.main",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
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

      {/* Cart Preview Drawer */}
      <CartPreviewDrawer />
    </AppBar>
  );
}
