"use client";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

import LandingFooter from "../landing-page/footer";
import HeaderEcom from "./header-ecom";

import { HEADER } from "../config-layout";

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function LandingPageLayout({ children }: Props) {
  return (
    <Box 
      sx={{ 
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <HeaderEcom />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          mt: { 
            xs: `${HEADER.H_MOBILE}px`, 
            sm: `${HEADER.H_MOBILE}px`,
            md: `${HEADER.H_DESKTOP}px`,
            lg: `${HEADER.H_DESKTOP}px`,
          },
          minHeight: {
            xs: `calc(100vh - ${HEADER.H_MOBILE}px)`,
            md: `calc(100vh - ${HEADER.H_DESKTOP}px)`,
          },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Container
          sx={{
            width: "100%",
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </Container>
      </Box>

      <LandingFooter />
    </Box>
  );
}
