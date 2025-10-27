import { Metadata } from "next";

import { CategoriesView } from "src/sections/categories/view";
import CategoriesBreadcrumbs from "./categories-breadcrumbs";

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Categories Management",
};

// ----------------------------------------------------------------------

export default function CategoriesPage() {
  return (
    <>
      <CategoriesBreadcrumbs />
      <CategoriesView />
    </>
  );
}
