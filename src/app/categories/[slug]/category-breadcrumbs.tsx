"use client";

import { Container } from "@mui/material";

import { paths } from "src/routes/paths";

import CustomBreadcrumbs from "src/components/custom-breadcrumbs";

// ----------------------------------------------------------------------

interface CategoryBreadcrumbsProps {
  slug: string;
}

export default function CategoryBreadcrumbs({ slug }: CategoryBreadcrumbsProps) {
  return (
    <Container maxWidth="lg">
      <CustomBreadcrumbs
        heading={`Category: ${slug}`}
        links={[
          { name: "Home", href: paths.landing.root },
          { name: "Categories", href: paths.categories.root },
          { name: slug },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
    </Container>
  );
}
