import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Unstable_Grid2";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import Iconify from "src/components/iconify";
import { useTranslate } from "src/locales";

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
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1, textAlign: 'center' }}>
              {t("footer.about")}
            </Typography>
            <Stack spacing={2} sx={{ mt: 3, justifyContent: "center", alignItems: "center" }}>
              <Link
                component={RouterLink}
                href={paths.about}
                color="inherit"
                variant="body2"
                sx={{ textAlign: 'center' }}
              >
                {t("footer.swaslic")}
              </Link>
              <Link href="#" color="inherit" variant="body2" sx={{ textAlign: 'center' }}>
                {t("footer.joinUs")}
              </Link>
            </Stack>
          </Grid>

          {/* CONTACTS Section */}
          <Grid xs={12} md={2.5}>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1, textAlign: 'center' }}>
              {t("footer.contacts")}
            </Typography>
            <Stack spacing={2} sx={{ mt: 3, justifyContent: "center", alignItems: "center" }}>
              <Link
                component={RouterLink}
                href={paths.contact}
                color="inherit"
                variant="body2"
                sx={{ display: "inline-flex", alignItems: "center", gap: 1, textAlign: 'center' }}
              >
                <Iconify icon="solar:letter-broken" width={18} />{" "}
                {t("footer.mail")}
              </Link>
              <Link
                href="#"
                color="inherit"
                variant="body2"
                sx={{ display: "inline-flex", alignItems: "center", gap: 1, textAlign: 'center' }}
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
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1, textAlign: 'center' }}>
              {t("footer.policy")}
            </Typography>
            <Stack spacing={2} sx={{ mt: 3, justifyContent: "center", alignItems: "center" }}>
              <Link href="#" color="inherit" variant="body2" sx={{ textAlign: 'center' }}>
                {t("footer.shipping")}
              </Link>
              <Link href="#" color="inherit" variant="body2" sx={{ textAlign: 'center' }}>
                {t("footer.privacy")}
              </Link>
              <Link href="#" color="inherit" variant="body2" sx={{ textAlign: 'center' }}>
                {t("footer.exchange")}
              </Link>
              <Link href="#" color="inherit" variant="body2" sx={{ textAlign: 'center' }}>
                {t("footer.faqs")}
              </Link>
            </Stack>
          </Grid>

          {/* CATEGORY Section */}
          <Grid xs={12} md={3}>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1, textAlign: 'center' }}>
              {t("footer.category")}
            </Typography>
            <Stack spacing={2} sx={{ mt: 3, justifyContent: "center", alignItems: "center" }}>
              <Link
                component={RouterLink}
                href={paths.product.root}
                color="inherit"
                variant="body2"
                sx={{ textAlign: 'center' }}
              >
                {t("footer.allProducts")}
              </Link>
              <Link href="#" color="inherit" variant="body2" sx={{ textAlign: 'center' }}>
                {t("footer.newArrivals")}
              </Link>
              <Link href="#" color="inherit" variant="body2" sx={{ textAlign: 'center' }}>
                {t("footer.onePiece")}
              </Link>
              <Link href="#" color="inherit" variant="body2" sx={{ textAlign: 'center' }}>
                {t("footer.twoPieces")}
              </Link>
              <Link href="#" color="inherit" variant="body2" sx={{ textAlign: 'center' }}>
                {t("footer.tops")}
              </Link>
              <Link href="#" color="inherit" variant="body2" sx={{ textAlign: 'center' }}>
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
