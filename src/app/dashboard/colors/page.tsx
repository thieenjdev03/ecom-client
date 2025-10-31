"use client";

import Container from "@mui/material/Container";
import ColorsView from "src/sections/colors/view/colors-view";

export default function Page() {
  return (
    <Container maxWidth={false} sx={{ pt: 2 }}>
      <ColorsView />
    </Container>
  );
}


