import { Metadata } from "next";

import { CollectionDetailsView } from "src/sections/collections/view";

// ----------------------------------------------------------------------

interface CollectionPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  return {
    title: `Collection: ${params.slug}`,
  };
}

// ----------------------------------------------------------------------

export default function CollectionPage({ params }: CollectionPageProps) {
  return <CollectionDetailsView slug={params.slug} />;
}

