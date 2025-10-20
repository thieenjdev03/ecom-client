"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { useSnackbar } from "src/components/snackbar";
import FormProvider, { RHFTextField } from "src/components/hook-form";

// ----------------------------------------------------------------------

interface FormValuesProps {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// ----------------------------------------------------------------------

export default function AccountChangePassword() {
  const { enqueueSnackbar } = useSnackbar();

  const ChangePasswordSchema = Yup.object().shape({
    oldPassword: Yup.string().required("Old password is required"),
    newPassword: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("New password is required"),
    confirmNewPassword: Yup.string()
      .oneOf([Yup.ref("newPassword")], "Passwords must match")
      .required("Confirm new password is required"),
  });

  const defaultValues = {
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(ChangePasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      enqueueSnackbar("Password changed successfully!");
      console.log("PASSWORD CHANGE", data);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Change Password
        </Typography>

        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <RHFTextField
              name="oldPassword"
              label="Old Password"
              type="password"
              helperText="Enter your current password"
            />

            <RHFTextField
              name="newPassword"
              label="New Password"
              type="password"
              helperText="Password must be at least 6 characters"
            />

            <RHFTextField
              name="confirmNewPassword"
              label="Confirm New Password"
              type="password"
              helperText="Re-enter your new password"
            />

            <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ alignSelf: "flex-start" }}>
              {isSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </Stack>
        </FormProvider>
      </Card>
    </Box>
  );
}
