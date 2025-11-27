import { FormEvent, useState } from "react";

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

import { useSnackbar } from "src/components/snackbar";
import axiosInstance, { endpoints } from "src/utils/axios";

type FeedbackState = {
  type: "idle" | "success" | "error";
  message: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUCCESS_MESSAGE = "Bạn đã đăng ký nhận tin thành công 🎉";
const FALLBACK_ERROR = "Đăng ký nhận tin thất bại. Vui lòng thử lại.";

const getErrorMessage = (error: unknown) => {
  if (typeof error === "string") {
    return error;
  }
  if (typeof error === "object" && error !== null) {
    const maybeError = error as { message?: string; error?: string };
    if (maybeError.message) {
      return maybeError.message;
    }
    if (maybeError.error) {
      return maybeError.error;
    }
  }
  return FALLBACK_ERROR;
};

export default function HomeContactForm() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({
    type: "idle",
    message: "",
  });

  const handleSubscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setFeedback({ type: "error", message: "Vui lòng nhập email" });
      return;
    }

    if (!emailRegex.test(email)) {
      setFeedback({ type: "error", message: "Email không hợp lệ" });
      return;
    }

    setIsLoading(true);
    setFeedback({ type: "idle", message: "" });

    try {
      const { data } = await axiosInstance.post(endpoints.marketing.subscribe, {
        email,
        source: "modal",
      });

      const successMessage = data?.message || SUCCESS_MESSAGE;
      setFeedback({ type: "success", message: successMessage });
      setEmail("");
      enqueueSnackbar(SUCCESS_MESSAGE, { variant: "success" });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setFeedback({ type: "error", message: errorMessage });
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const borderColor =
    feedback.type === "error"
      ? theme.palette.error.main
      : feedback.type === "success"
        ? theme.palette.success.main
        : alpha(theme.palette.text.primary, 0.3);

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

          <Stack spacing={1} sx={{ width: "100%" }}>
            <Paper
              component="form"
              onSubmit={handleSubscribe}
              noValidate
              elevation={0}
              sx={{
                p: 0,
                display: "flex",
                alignItems: "stretch",
                width: "100%",
                borderRadius: 0,
                border: `1px solid ${borderColor}`,
                overflow: "hidden",
              }}
            >
              <InputBase
                type="email"
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (feedback.type !== "idle") {
                    setFeedback({ type: "idle", message: "" });
                  }
                }}
                disabled={isLoading}
                placeholder="your email"
                sx={{ px: 2, py: 1.5, flex: 1, fontSize: 16 }}
                inputProps={{
                  "aria-label": "newsletter email",
                  autoComplete: "email",
                }}
              />
              <IconButton
                type="submit"
                color="inherit"
                disabled={isLoading}
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 0,
                  bgcolor: theme.palette.grey[900],
                  color: theme.palette.common.white,
                  "&:hover": { bgcolor: theme.palette.grey[800] },
                  opacity: isLoading ? 0.72 : 1,
                }}
                aria-label="submit email"
              >
                <Icon icon="ic:round-chevron-right" width={24} height={24} />
              </IconButton>
            </Paper>

            {feedback.message && (
              <Typography
                variant="body2"
                sx={{
                  color:
                    feedback.type === "success"
                      ? "success.main"
                      : "error.main",
                }}
              >
                {feedback.message}
              </Typography>
            )}
          </Stack>

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
