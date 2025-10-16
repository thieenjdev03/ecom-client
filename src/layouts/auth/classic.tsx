import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import { useResponsive } from "src/hooks/use-responsive";

import { bgGradient } from "src/theme/css";
import { useAuthContext } from "src/auth/hooks";

import Logo from "src/components/logo";

// ----------------------------------------------------------------------

const METHODS = [
  {
    id: "jwt",
    label: "Jwt",
    path: paths.auth.jwt.login,
    icon: "/assets/icons/auth/ic_jwt.svg",
  },
  {
    id: "firebase",
    label: "Firebase",
    path: paths.auth.firebase.login,
    icon: "/assets/icons/auth/ic_firebase.svg",
  },
  {
    id: "amplify",
    label: "Amplify",
    path: paths.auth.amplify.login,
    icon: "/assets/icons/auth/ic_amplify.svg",
  },
  {
    id: "auth0",
    label: "Auth0",
    path: paths.auth.auth0.login,
    icon: "/assets/icons/auth/ic_auth0.svg",
  },
  {
    id: "supabase",
    label: "Supabase",
    path: paths.auth.supabase.login,
    icon: "/assets/icons/auth/ic_supabase.svg",
  },
];

type Props = {
  title?: string;
  image?: string;
  children: React.ReactNode;
};

export default function AuthClassicLayout({ children, image, title }: Props) {
  const { method } = useAuthContext();

  const theme = useTheme();

  const mdUp = useResponsive("up", "md");

  const renderLogo = (
    <Logo
      sx={{
        zIndex: 9,
        position: "absolute",
        m: { xs: 2, md: 5 },
      }}
    />
  );

  const renderContent = (
    <Stack
      sx={{
        width: 1,
        mx: "auto",
        maxWidth: 480,
        backgroundColor: "white",
        borderRadius: 1,
        padding: 8,
        boxShadow: 1,
        border: "1px solid #e0e0e0",
        height: "50%",
        my: "auto",
      }}
    >
      {children}
    </Stack>
  );

  return (
    <Stack
      component="main"
      direction="row"
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f9efef",
      }}
    >
      {renderLogo}
      {renderContent}
    </Stack>
  );
}
