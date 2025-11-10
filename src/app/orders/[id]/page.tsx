import { Metadata } from "next";

import OrderDetailsViewLanding from "src/sections/order/view/order-details-view-landing";

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Order Details",
};

type Props = {
  params: {
    id: string;
  };
};

export default function OrderDetailsPage({ params }: Props) {
  const { id } = params;

  return <OrderDetailsViewLanding id={id} />;
}

