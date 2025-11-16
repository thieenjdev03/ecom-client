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
        bgcolor: "background.default",
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container sx={{ pt: 6, pb: 0 }}>
        <Grid
          container
          spacing={{ xs: 4, md: 8 }}
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Grid xs={12} md={2.5}>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 1 }}>
              {t("footer.weAre")}
            </Typography>
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Link
                component={RouterLink}
                href={paths.about}
                color="inherit"
                variant="body1"
              >
                {t("footer.ourStory")}
              </Link>
              <Link href="#" color="inherit" variant="body1">
                {t("footer.careers")}
              </Link>
            </Stack>
          </Grid>

          <Grid xs={12} md={3}>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 1 }}>
              {t("footer.contactUs")}
            </Typography>
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Link
                component={RouterLink}
                href={paths.contact}
                color="inherit"
                variant="body1"
                sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
              >
                <Iconify icon="solar:letter-broken" width={20} /> {t("footer.email")}
              </Link>
              <Link
                href="#"
                color="inherit"
                variant="body1"
                sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
              >
                <Iconify icon="solar:phone-linear" width={20} /> (+84)
              </Link>
            </Stack>
          </Grid>

          <Grid xs={12} md={3}>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 1 }}>
              {t("footer.policy")}
            </Typography>
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Link href="#" color="inherit" variant="body1">
                {t("footer.shippingPolicy")}
              </Link>
              <Link href="#" color="inherit" variant="body1">
                {t("footer.privacyPolicy")}
              </Link>
              <Link href="#" color="inherit" variant="body1">
                {t("footer.exchangePolicy")}
              </Link>
              <Link href="#" color="inherit" variant="body1">
                {t("footer.termsOfUse")}
              </Link>
            </Stack>
          </Grid>

          <Grid xs={12} md={2}>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 1 }}>
              {t("footer.category")}
            </Typography>
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Link href="#" color="inherit" variant="body1">
                {t("footer.bikini")}
              </Link>
            </Stack>
          </Grid>

          <Grid xs={12} md={1.5}>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 1 }}>
              {t("footer.followUs")}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <IconButton size="small">
                <Iconify icon="mdi:instagram" width={22} />
              </IconButton>
              <IconButton size="small">
                <Iconify icon="mdi:tiktok" width={22} />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      <Divider sx={{ mt: 6 }} />

      <Container sx={{ py: 2 }}>
        <Typography
          variant="body2"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          {t("footer.copyright", { year: YEAR })}
        </Typography>
      </Container>
    </Box>
  );

  return mainFooter;
}
