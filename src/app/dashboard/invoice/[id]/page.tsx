import { InvoiceDetailsView } from "src/sections/invoice/view";

// ----------------------------------------------------------------------

export const metadata = {
  title: "Dashboard: Invoice Details",
};

type Props = {
  params: {
    id: string;
  };
};

export default function InvoiceDetailsPage({ params }: Props) {
  const { id } = params;

  return <InvoiceDetailsView id={id} />;
}
