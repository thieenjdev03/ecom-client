import { ProductShopDetailsView } from "src/sections/product/view";

// ----------------------------------------------------------------------

export const metadata = {
  title: "Product: Details",
};

type Props = {
  params: {
    id: string;
  };
};

export default function ProductShopDetailsPage({ params }: Props) {
  const { id } = params;

  return <ProductShopDetailsView id={id} />;
}
