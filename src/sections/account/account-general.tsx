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
import Chip from "@mui/material/Chip";

import { useMockedUser } from "src/hooks/use-mocked-user";
import { IUserAddress } from "src/api/user";

import { useSnackbar } from "src/components/snackbar";
import FormProvider, {
  RHFTextField,
  RHFSelect,
  RHFSwitch,
} from "src/components/hook-form";
import { AddressAutocomplete } from "src/components/address-autocomplete";
import axiosInstance, { endpoints } from "src/utils/axios";

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
  marketingOptIn: boolean;
}

// ----------------------------------------------------------------------

export default function AccountGeneral() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useMockedUser();

  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | undefined>();
  const [marketingOptInSnapshot, setMarketingOptInSnapshot] = useState<boolean>(Boolean(user?.marketingOptIn));

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
    marketingOptIn: Yup.boolean().default(false).required(),
  });

  const defaultValues: FormValuesProps = {
    displayName: user?.displayName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    country: user?.country || "",
    address: user?.address || "",
    state: user?.state || "",
    city: user?.city || "",
    zipCode: user?.zipCode || "",
    about: user?.about || "",
    marketingOptIn: Boolean(user?.marketingOptIn),
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver<FormValuesProps>(UpdateUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
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
        marketingOptIn: Boolean(user?.marketingOptIn),
      });
      setMarketingOptInSnapshot(Boolean(user?.marketingOptIn));
    }
  }, [user, reset]);

  const persistMarketingPreference = (nextOptIn: boolean) => {
    try {
      const sessionUser = sessionStorage.getItem("user");
      if (!sessionUser) {
        return;
      }
      const parsedUser = JSON.parse(sessionUser);
      sessionStorage.setItem(
        "user",
        JSON.stringify({
          ...parsedUser,
          marketingOptIn: nextOptIn,
        }),
      );
    } catch (error) {
      console.error("Failed to persist marketing preference", error);
    }
  };

  const updateMarketingPreference = async (
    email: string,
    shouldOptIn: boolean,
    previousOptIn: boolean,
  ) => {
    if (shouldOptIn === previousOptIn) {
      return;
    }

    if (shouldOptIn) {
      await axiosInstance.post(endpoints.marketing.subscribe, {
        email,
        source: "account",
      });
      return;
    }

    await axiosInstance.get(endpoints.marketing.unsubscribe, {
      params: { email },
    });
  };

  const getErrorMessage = (error: unknown) => {
    if (typeof error === "string") {
      return error;
    }
    if (typeof error === "object" && error !== null) {
      const maybeError = error as { message?: string; error?: string };
      if (maybeError.message) {
        return maybeError.message;
      }
      if (maybeError.error) {
        return maybeError.error;
      }
    }
    return "Unable to update marketing preference. Please try again.";
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const shouldOptIn = Boolean(data.marketingOptIn);
      await updateMarketingPreference(data.email, shouldOptIn, marketingOptInSnapshot);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setMarketingOptInSnapshot(shouldOptIn);
      persistMarketingPreference(shouldOptIn);
      enqueueSnackbar("Update success!");
      console.log("DATA", data);
      console.log("COORDINATES", coordinates);
      console.log("MARKETING_OPT_IN", shouldOptIn);
      reset({
        ...data,
        marketingOptIn: shouldOptIn,
      });
    } catch (error) {
      const message = getErrorMessage(error);
      enqueueSnackbar(message, { variant: "error" });
      console.error(error);
    }
  });

  const handleAddressChange = (address: string, coords?: { lat: number; lon: number }) => {
    methods.setValue("address", address);
    setCoordinates(coords);
  };

  // Helper function to format full address from API address fields
  const formatAddressFromAPI = (address: IUserAddress): string => {
    const parts = [
      address.streetLine1,
      address.streetLine2,
      address.ward,
      address.district,
      address.province,
    ].filter(Boolean);
    return parts.join(", ");
  };

  // Get all addresses from user data
  const addresses = (user?.addresses as IUserAddress[]) || [];

  // Set coordinates from default address when form loads
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      const defaultAddress = user.addresses.find((addr: IUserAddress) => addr.isDefault) || user.addresses[0];
      if (defaultAddress.latitude && defaultAddress.longitude) {
        setCoordinates({
          lat: parseFloat(defaultAddress.latitude),
          lon: parseFloat(defaultAddress.longitude),
        });
      }
    }
  }, [user]);

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
              <Box
                sx={{
                  gridColumn: "span 2",
                  p: 2,
                  borderRadius: 1,
                  bgcolor: "background.neutral",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems="flex-start"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography variant="subtitle2">Marketing emails</Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Toggle to subscribe or unsubscribe from promotional updates.
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      size="small"
                      label={values.marketingOptIn ? "Subscribed" : "Unsubscribed"}
                      color={values.marketingOptIn ? "success" : "default"}
                      variant={values.marketingOptIn ? "soft" : "outlined"}
                    />
                    <RHFSwitch
                      name="marketingOptIn"
                      label="Nhận email khuyến mãi"
                      sx={{ m: 0 }}
                    />
                  </Stack>
                </Stack>
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
          <Stack spacing={3}>
            {addresses.length > 0 ? (
              addresses.map((address, index) => (
                <Card key={address.id} sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Typography variant="h6">
                      Address {index + 1}
                    </Typography>
                    {address.isDefault && (
                      <Chip label="Default" size="small" color="primary" variant="soft" />
                    )}
                  </Stack>
                  <Stack spacing={2}>
                    {address.label && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Label
                        </Typography>
                        <Typography variant="body2">{address.label}</Typography>
                      </Box>
                    )}
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Full Address
                      </Typography>
                      <Typography variant="body2">{formatAddressFromAPI(address)}</Typography>
                    </Box>
                    {address.recipientName && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Recipient Name
                        </Typography>
                        <Typography variant="body2">{address.recipientName}</Typography>
                      </Box>
                    )}
                    {address.recipientPhone && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Phone Number
                        </Typography>
                        <Typography variant="body2">{address.recipientPhone}</Typography>
                      </Box>
                    )}
                    {address.latitude && address.longitude && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Coordinates
                        </Typography>
                        <Typography variant="body2">
                          Lat: {parseFloat(address.latitude).toFixed(6)}, Lon: {parseFloat(address.longitude).toFixed(6)}
                        </Typography>
                      </Box>
                    )}
                    {address.note && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Note
                        </Typography>
                        <Typography variant="body2">{address.note}</Typography>
                      </Box>
                    )}
                  </Stack>
                </Card>
              ))
            ) : (
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
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Coordinates
                      </Typography>
                      <Typography variant="body2">
                        Lat: {coordinates.lat.toFixed(6)}, Lon: {coordinates.lon.toFixed(6)}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
