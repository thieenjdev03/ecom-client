import { InvoiceEditView } from "src/sections/invoice/view";

// ----------------------------------------------------------------------

export const metadata = {
  title: "Dashboard: Invoice Edit",
};

type Props = {
  params: {
    id: string;
  };
};

export default function InvoiceEditPage({ params }: Props) {
  const { id } = params;

  return <InvoiceEditView id={id} />;
}
