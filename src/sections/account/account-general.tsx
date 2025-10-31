"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import { useMockedUser } from "src/hooks/use-mocked-user";

import { useSnackbar } from "src/components/snackbar";
import FormProvider, { RHFTextField, RHFSelect } from "src/components/hook-form";
import { AddressAutocomplete } from "src/components/address-autocomplete";

// ----------------------------------------------------------------------

interface FormValuesProps {
  displayName: string;
  email: string;
  phoneNumber: string;
  country: string;
  address: string;
  state: string;
  city: string;
  zipCode: string;
  about?: string;
}

// ----------------------------------------------------------------------

export default function AccountGeneral() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useMockedUser();

  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | undefined>();

  const UpdateUserSchema = Yup.object().shape({
    displayName: Yup.string().required("Name is required"),
    email: Yup.string().required("Email is required").email("Email must be a valid email address"),
    phoneNumber: Yup.string().required("Phone number is required"),
    country: Yup.string().required("Country is required"),
    address: Yup.string().required("Address is required"),
    state: Yup.string().required("State is required"),
    city: Yup.string().required("City is required"),
    zipCode: Yup.string().required("Zip code is required"),
    about: Yup.string(),
  });

  const defaultValues = {
    displayName: user?.displayName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    country: user?.country || "",
    address: user?.address || "",
    state: user?.state || "",
    city: user?.city || "",
    zipCode: user?.zipCode || "",
    about: user?.about || "",
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  // Update form values when user data is loaded
  useEffect(() => {
    if (user) {
      reset({
        displayName: user?.displayName || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        country: user?.country || "",
        address: user?.address || "",
        state: user?.state || "",
        city: user?.city || "",
        zipCode: user?.zipCode || "",
        about: user?.about || "",
      });
    }
  }, [user, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      enqueueSnackbar("Update success!");
      console.log("DATA", data);
      console.log("COORDINATES", coordinates);
    } catch (error) {
      console.error(error);
    }
  });

  const handleAddressChange = (address: string, coords?: { lat: number; lon: number }) => {
    methods.setValue("address", address);
    setCoordinates(coords);
  };

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
              }}
            >
              <RHFTextField name="displayName" label="Name" />

              <RHFTextField name="email" label="Email Address" />

              <RHFTextField name="phoneNumber" label="Phone Number" />

              <RHFSelect native name="country" label="Country">
                <option value="" />
                <option value="Vietnam">Vietnam</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
              </RHFSelect>

              <Box sx={{ gridColumn: "span 2" }}>
                <AddressAutocomplete
                  value={values.address}
                  onChange={handleAddressChange}
                  label="Address"
                  placeholder="Nhập địa chỉ giao hàng..."
                  required
                  countryCode={values.country as string}
                />
              </Box>

              <RHFTextField name="state" label="State/Region" />

              <RHFTextField name="city" label="City" />

              <RHFTextField name="zipCode" label="Zip/Code" />

              <Box sx={{ gridColumn: "span 2" }}>
                <RHFTextField name="about" multiline rows={4} label="About" />
              </Box>
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Address Information
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Full Address
                </Typography>
                <Typography variant="body2">{values.address || "No address entered"}</Typography>
              </Box>
              {coordinates && (
                <>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Coordinates
                    </Typography>
                    <Typography variant="body2">
                      Lat: {coordinates.lat.toFixed(6)}, Lon: {coordinates.lon.toFixed(6)}
                    </Typography>
                  </Box>
                </>
              )}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
