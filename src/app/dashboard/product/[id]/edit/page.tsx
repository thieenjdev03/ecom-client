import { ProductEditView } from "src/sections/product/view";

// ----------------------------------------------------------------------

export const metadata = {
  title: "Dashboard: Product Edit",
};

type Props = {
  params: {
    id: string;
  };
};

export default function ProductEditPage({ params }: Props) {
  const { id } = params;

  return <ProductEditView id={id} />;
}
