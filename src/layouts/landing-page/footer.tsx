import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const YEAR = new Date().getFullYear();

// ----------------------------------------------------------------------

export default function Footer() {
  const pathname = usePathname();

  const homePage = pathname === '/';

  const simpleFooter = (
    <Box
      component="footer"
      sx={{
        py: 5,
        textAlign: 'center',
        position: 'relative',
        bgcolor: 'background.default',
      }}
    >
      <Container>
        <Logo sx={{ mb: 1, mx: 'auto' }} />

        <Typography variant="caption" component="div">
          © All rights reserved
          <br /> made by
          <Link href="https://minimals.cc/"> minimals.cc </Link>
        </Typography>
      </Container>
    </Box>
  );

  const mainFooter = (
    <Box
      component="footer"
      sx={{
        position: 'relative',
        bgcolor: 'background.default',
      }}
    >
      <Container sx={{ pt: 6, pb: 0 }}>
        <Grid container spacing={{ xs: 4, md: 8 }} justifyContent="space-between" alignItems="flex-start">
          <Grid xs={12} md={2.5}>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 1 }}>
              WE ARE ...
            </Typography>
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Link component={RouterLink} href={paths.about} color="inherit" variant="body1">
                Our Story
              </Link>
              <Link href="#" color="inherit" variant="body1">
                Careers
              </Link>
            </Stack>
          </Grid>

          <Grid xs={12} md={3}>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 1 }}>
              CONTRACT US
            </Typography>
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Link component={RouterLink} href={paths.contact} color="inherit" variant="body1" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:letter-broken" width={20} /> Email
              </Link>
              <Link href="#" color="inherit" variant="body1" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:phone-linear" width={20} /> (+84)
              </Link>
            </Stack>
          </Grid>

          <Grid xs={12} md={3}>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 1 }}>
              POLICY
            </Typography>
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Link href="#" color="inherit" variant="body1">
                Shipping policy
              </Link>
              <Link href="#" color="inherit" variant="body1">
                Privacy Policy
              </Link>
              <Link href="#" color="inherit" variant="body1">
                Exchange Policy
              </Link>
              <Link href="#" color="inherit" variant="body1">
                Terms of Use
              </Link>
            </Stack>
          </Grid>

          <Grid xs={12} md={2}>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 1 }}>
              CATEGORY
            </Typography>
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Link href="#" color="inherit" variant="body1">
                Bikini
              </Link>
            </Stack>
          </Grid>

          <Grid xs={12} md={1.5}>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 1 }}>
              FOLLOW US
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
        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          © {YEAR} NO NAME
        </Typography>
      </Container>
    </Box>
  );

  return mainFooter;
}
