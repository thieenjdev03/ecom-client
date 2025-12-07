import { Metadata } from "next";

import { CategoryDetailsView } from "src/sections/categories/view";

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
      <CategoryDetailsView slug={params.slug} />
    </>
  );
}
