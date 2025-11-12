import { ProductDetailsView } from "src/sections/product/view";

// ----------------------------------------------------------------------

export const metadata = {
  title: "Dashboard: Product Details",
};

type Props = {
  params: {
    id: string;
  };
};

export default function ProductDetailsPage({ params }: Props) {
  const { id } = params;

  return <ProductDetailsView id={id} />;
}
