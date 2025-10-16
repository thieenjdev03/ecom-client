import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import { Icon } from "@iconify/react";

export default function HomeContactForm() {
  const theme = useTheme();

  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="sm">
        <Stack spacing={3} alignItems="center" textAlign="center">
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Stay in the know
          </Typography>

          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Be the first to discover new drops, special offers, and all things
            SKIMS
          </Typography>

          <Paper
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
            }}
            elevation={0}
            sx={{
              p: 0,
              display: "flex",
              alignItems: "stretch",
              width: "100%",
              borderRadius: 0,
              border: `1px solid ${alpha(theme.palette.text.primary, 0.3)}`,
              overflow: "hidden",
            }}
          >
            <InputBase
              type="email"
              required
              placeholder="your email"
              sx={{ px: 2, py: 1.5, flex: 1, fontSize: 16 }}
            />
            <IconButton
              type="submit"
              color="inherit"
              sx={{
                width: 56,
                height: 56,
                borderRadius: 0,
                bgcolor: theme.palette.grey[900],
                color: theme.palette.common.white,
                "&:hover": { bgcolor: theme.palette.grey[800] },
              }}
              aria-label="submit email"
            >
              <Icon icon="ic:round-chevron-right" width={24} height={24} />
            </IconButton>
          </Paper>

          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            By submitting your email you agree to receive recurring automated
            marketing messages from SKIMS. View{" "}
            <Link href="#" underline="always">
              Terms
            </Link>{" "}
            &amp;{" "}
            <Link href="#" underline="always">
              Privacy
            </Link>
            .
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
