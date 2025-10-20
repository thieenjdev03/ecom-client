"use client";

import { Container } from "@mui/material";

import { paths } from "src/routes/paths";

import CustomBreadcrumbs from "src/components/custom-breadcrumbs";

// ----------------------------------------------------------------------

export default function CategoriesBreadcrumbs() {
  return (
    <Container maxWidth="lg">
      <CustomBreadcrumbs
        heading="Categories"
        links={[
          { name: "Home", href: paths.landing.root },
          { name: "Categories" },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
    </Container>
  );
}
