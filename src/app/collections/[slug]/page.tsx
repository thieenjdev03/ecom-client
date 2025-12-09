import { Metadata } from "next";

import axios from "src/utils/axios";
import { endpoints } from "src/utils/axios";

import { CollectionDetailsView } from "src/sections/collections/view";

// ----------------------------------------------------------------------

interface CollectionPageProps {
  params: {
    slug: string;
  };
}

// Fetch collection data for metadata
async function getCollection(slug: string) {
  try {
    const res = await axios.get(endpoints.collections.bySlug(slug));
    return res.data?.data || res.data || null;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const collection = await getCollection(params.slug);

  if (!collection) {
    return {
      title: "Collection Not Found",
    };
  }

  return {
    title: collection.seo_title || collection.name || `Collection: ${params.slug}`,
    description: collection.seo_description || collection.description || `Browse products in ${collection.name} collection`,
    openGraph: {
      title: collection.seo_title || collection.name,
      description: collection.seo_description || collection.description,
      images: collection.banner_image_url ? [collection.banner_image_url] : [],
    },
  };
}

// ----------------------------------------------------------------------

export default function CollectionPage({ params }: CollectionPageProps) {
  return <CollectionDetailsView slug={params.slug} />;
}
