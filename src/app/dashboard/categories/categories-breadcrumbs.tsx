"use client";

import { Container } from "@mui/material";

import { paths } from "src/routes/paths";

import CustomBreadcrumbs from "src/components/custom-breadcrumbs";

// ----------------------------------------------------------------------

export default function CategoriesBreadcrumbs() {
  return (
    <Container maxWidth="lg">
      <CustomBreadcrumbs
        heading="Manage Categories"
        links={[
          { name: "Dashboard", href: paths.dashboard.root },
          { name: "Products", href: paths.dashboard.product.root },
          { name: "Categories" },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
    </Container>
  );
}
