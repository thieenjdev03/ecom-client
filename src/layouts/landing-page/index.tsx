"use client";
import Box from "@mui/material/Box";

import LandingFooter from "../landing-page/footer";
import HeaderEcom from "./header-ecom";

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function LandingPageLayout({ children }: Props) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: 1 }}>
      <HeaderEcom />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ...( {
            mt: { xs: 8, md: 10 },
          }),
        }}
      >
        {children}
      </Box>

      {<LandingFooter />}
    </Box>
  );
}
