import { Metadata } from "next";

import { CategoryDetailsView } from "src/sections/categories/view";
import CategoryBreadcrumbs from "./category-breadcrumbs";

// ----------------------------------------------------------------------

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  return {
    title: `Category: ${params.slug}`,
  };
}

// ----------------------------------------------------------------------

export default function CategoryPage({ params }: CategoryPageProps) {
  return (
    <>
      <CategoryBreadcrumbs slug={params.slug} />
      <CategoryDetailsView slug={params.slug} />
    </>
  );
}
