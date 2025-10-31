"use client";

import Container from "@mui/material/Container";
import SizesView from "src/sections/sizes/view/sizes-view";

export default function Page() {
  return (
    <Container maxWidth={false} sx={{ pt: 2 }}>
      <SizesView />
    </Container>
  );
}


