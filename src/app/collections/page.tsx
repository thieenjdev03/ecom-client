import { Metadata } from "next";

import { CollectionsListView } from "src/sections/collections/view";

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Collections",
};

// ----------------------------------------------------------------------

export default function CollectionsPage() {
  return <CollectionsListView />;
}

