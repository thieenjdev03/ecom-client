"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import Iconify from "src/components/iconify";
import { useSnackbar } from "src/components/snackbar";
import FormProvider, { RHFTextField, RHFSelect } from "src/components/hook-form";
import { AddressAutocomplete } from "src/components/address-autocomplete";

// ----------------------------------------------------------------------

interface AddressBook {
  id: string;
  primary: boolean;
  name: string;
  phoneNumber: string;
  fullAddress: string;
  addressType: string;
}

interface FormValuesProps {
  name: string;
  phoneNumber: string;
  address: string;
  addressType: string;
}

// ----------------------------------------------------------------------

interface AccountBillingProps {
  plans: any[];
  cards: any[];
  invoices: any[];
  addressBook: AddressBook[];
}

export default function AccountBilling({ addressBook }: AccountBillingProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | undefined>();

  const AddressSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    phoneNumber: Yup.string().required("Phone number is required"),
    address: Yup.string().required("Address is required"),
    addressType: Yup.string().required("Address type is required"),
  });

  const defaultValues = {
    name: "",
    phoneNumber: "",
    address: "",
    addressType: "Home",
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(AddressSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      enqueueSnackbar("Address added successfully!");
      console.log("ADDRESS DATA", data);
      console.log("COORDINATES", coordinates);
      reset();
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  });

  const handleAddressChange = (address: string, coords?: { lat: number; lon: number }) => {
    methods.setValue("address", address);
    setCoordinates(coords);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
              <Typography variant="h6">Address Book</Typography>
              <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleOpen}>
                Add Address
              </Button>
            </Stack>

            <Stack spacing={2}>
              {addressBook.map((address) => (
                <Card key={address.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <Typography variant="subtitle2">{address.name}</Typography>
                        {address.primary && (
                          <Chip label="Primary" size="small" color="primary" />
                        )}
                        <Chip label={address.addressType} size="small" variant="outlined" />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {address.phoneNumber}
                      </Typography>
                      <Typography variant="body2">{address.fullAddress}</Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <IconButton size="small">
                        <Iconify icon="eva:edit-fill" />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <Iconify icon="eva:trash-2-fill" />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <DialogTitle>Add New Address</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <Stack spacing={3}>
                <RHFTextField name="name" label="Full Name" />

                <RHFTextField name="phoneNumber" label="Phone Number" />

                <AddressAutocomplete
                  value={values.address}
                  onChange={handleAddressChange}
                  label="Address"
                  placeholder="Nhập địa chỉ giao hàng..."
                  required
                />

                <RHFSelect native name="addressType" label="Address Type">
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </RHFSelect>

                {coordinates && (
                  <Box sx={{ p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Coordinates detected:
                    </Typography>
                    <Typography variant="body2">
                      Lat: {coordinates.lat.toFixed(6)}, Lon: {coordinates.lon.toFixed(6)}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Address"}
            </Button>
          </DialogActions>
        </FormProvider>
      </Dialog>
    </>
  );
}
