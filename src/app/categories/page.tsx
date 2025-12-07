import { Metadata } from "next";

import { CategoriesView } from "src/sections/categories/view";

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Categories",
};

// ----------------------------------------------------------------------

export default function CategoriesPage() {
  return (
    <>
      <CategoriesView />
    </>
  );
}
