import { Metadata } from "next";

import PaymentSuccessView from "src/sections/checkout/view/payment-success-view";

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Payment Success",
};

export default function Page() {
  return <PaymentSuccessView />;
}
