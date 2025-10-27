import { Metadata } from "next";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import OrderHistory from "src/sections/checkout/components/order-history";

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Order History",
};

export default function Page() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h4" sx={{ mb: 5 }}>
        Order History
      </Typography>
      
      <OrderHistory />
    </Container>
  );
}
