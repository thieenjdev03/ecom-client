import { Metadata } from "next";

import { AdminCollectionsView } from "src/sections/collections/view";

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Collections Management",
};

// ----------------------------------------------------------------------

export default function CollectionsPage() {
  return <AdminCollectionsView />;
}

