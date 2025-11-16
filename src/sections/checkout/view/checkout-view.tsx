"use client";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Unstable_Grid2";
import { useSettingsContext } from "src/components/settings";

import CheckoutCart from "../checkout-cart";
import { useCheckoutContext } from "../context";
import CheckoutPayment from "../checkout-payment";
import CheckoutOrderComplete from "../checkout-order-complete";
// ----------------------------------------------------------------------

export default function CheckoutView() {
  const settings = useSettingsContext();

  const checkout = useCheckoutContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : "lg"} sx={{ mb: 10, mt: 10 }}>

      <Grid
        container
        justifyContent={checkout.completed ? "center" : "flex-start"}
      >
        {/* <Grid xs={12} md={8}>
          <CheckoutSteps
            activeStep={checkout.activeStep}
            steps={PRODUCT_CHECKOUT_STEPS}
          />
        </Grid> */}
      </Grid>

      {checkout.completed ? (
        <CheckoutOrderComplete
          open={checkout.completed}
          onReset={checkout.onReset}
          onDownloadPDF={() => {}}
        />
      ) : (
        <>
          {checkout.activeStep === 0 && <CheckoutCart />}

          {/* {checkout.activeStep === 0 && <CheckoutBillingAddress />} */}
        
          {checkout.activeStep === 1 && <CheckoutPayment />}
        </>
      )}
    </Container>
  );
}
