import { Metadata } from "next";

import PayPalTestComponent from "src/sections/checkout/components/paypal-test";

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: "PayPal Test",
};

export default function Page() {
  return <PayPalTestComponent />;
}
