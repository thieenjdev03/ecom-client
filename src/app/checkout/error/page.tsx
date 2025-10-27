import { Metadata } from "next";

import PaymentErrorView from "src/sections/checkout/view/payment-error-view";

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Payment Error",
};

export default function Page() {
  return <PaymentErrorView />;
}
