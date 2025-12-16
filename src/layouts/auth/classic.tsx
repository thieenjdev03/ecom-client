import Stack from "@mui/material/Stack";

import Logo from "src/components/logo";

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  image?: string;
  children: React.ReactNode;
};

export default function AuthClassicLayout({ children }: Props) {
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
        padding: 4,
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
