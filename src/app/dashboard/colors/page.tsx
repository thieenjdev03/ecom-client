"use client";

import dynamic from "next/dynamic";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

const ColorsView = dynamic(() => import("src/sections/colors/view/colors-view"), {
  ssr: false,
  loading: () => (
    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
      <CircularProgress />
    </Box>
  ),
});

export default function Page() {
  return (
    <Container maxWidth={false} sx={{ pt: 2 }}>
      <ColorsView />
    </Container>
  );
}


