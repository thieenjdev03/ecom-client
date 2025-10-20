"use client";

import Container from "@mui/material/Container";

import { paths } from "src/routes/paths";

import { useSettingsContext } from "src/components/settings";
import CustomBreadcrumbs from "src/components/custom-breadcrumbs";

import ProductNewEditForm from "../product-new-edit-form";

// ----------------------------------------------------------------------

export default function ProductCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : "lg"}>
      <CustomBreadcrumbs
        heading="Tạo sản phẩm mới"
        links={[
          {
            name: "Bảng điều khiển",
            href: paths.dashboard.root,
          },
          {
            name: "Sản phẩm",
            href: paths.dashboard.product.root,
          },
          { name: "Tạo mới" },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ProductNewEditForm />
    </Container>
  );
}
