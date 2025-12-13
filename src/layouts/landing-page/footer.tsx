import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Unstable_Grid2";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import Iconify from "src/components/iconify";
import { useTranslate } from "src/locales";

// ----------------------------------------------------------------------

const YEAR = new Date().getFullYear();

// ----------------------------------------------------------------------

export default function Footer() {
  const { t } = useTranslate();

const mainFooter = (
    <Box
      component="footer"
      sx={{
        position: "relative",
        bgcolor: "#ffffff",
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        width: "100%",
        pb: 4,
      }}
    >
      <Container sx={{ pt: 6, pb: 0 }}>
        <Grid
          container
          spacing={{ xs: 4, md: 8 }}
          justifyContent="space-between"
          alignItems="flex-start"
        >
          {/* ABOUT Section */}
          <Grid xs={12} md={2.5}>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1 }}>
              {t("footer.about")}
            </Typography>
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Link
                component={RouterLink}
                href={paths.about}
                color="inherit"
                variant="body2"
              >
                {t("footer.swaslic")}
              </Link>
              <Link href="#" color="inherit" variant="body2">
                {t("footer.joinUs")}
              </Link>
            </Stack>
          </Grid>

          {/* CONTACTS Section */}
          <Grid xs={12} md={2.5}>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1 }}>
              {t("footer.contacts")}
            </Typography>
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Link
                component={RouterLink}
                href={paths.contact}
                color="inherit"
                variant="body2"
                sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
              >
                <Iconify icon="solar:letter-broken" width={18} />{" "}
                {t("footer.mail")}
              </Link>
              <Link
                href="#"
                color="inherit"
                variant="body2"
                sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
              >
                <Iconify icon="solar:phone-linear" width={18} />{" "}
                {t("footer.phone")}
              </Link>
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton size="small">
                  <Iconify icon="mdi:instagram" width={20} />
                </IconButton>
                <IconButton size="small">
                  <Iconify icon="mdi:tiktok" width={20} />
                </IconButton>
              </Stack>
            </Stack>
          </Grid>

          {/* POLICY Section */}
          <Grid xs={12} md={2.5}>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1 }}>
              {t("footer.policy")}
            </Typography>
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Link href="#" color="inherit" variant="body2">
                {t("footer.shipping")}
              </Link>
              <Link href="#" color="inherit" variant="body2">
                {t("footer.privacy")}
              </Link>
              <Link href="#" color="inherit" variant="body2">
                {t("footer.exchange")}
              </Link>
              <Link href="#" color="inherit" variant="body2">
                {t("footer.faqs")}
              </Link>
            </Stack>
          </Grid>

          {/* CATEGORY Section */}
          <Grid xs={12} md={3}>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1 }}>
              {t("footer.category")}
            </Typography>
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Link
                component={RouterLink}
                href={paths.product.root}
                color="inherit"
                variant="body2"
              >
                {t("footer.allProducts")}
              </Link>
              <Link href="#" color="inherit" variant="body2">
                {t("footer.newArrivals")}
              </Link>
              <Link href="#" color="inherit" variant="body2">
                {t("footer.onePiece")}
              </Link>
              <Link href="#" color="inherit" variant="body2">
                {t("footer.twoPieces")}
              </Link>
              <Link href="#" color="inherit" variant="body2">
                {t("footer.tops")}
              </Link>
              <Link href="#" color="inherit" variant="body2">
                {t("footer.bottoms")}
              </Link>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );

  return mainFooter;
}
