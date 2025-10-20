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

import { useSnackbar } from "src/components/snackbar";
import FormProvider, { RHFTextField } from "src/components/hook-form";

// ----------------------------------------------------------------------

interface FormValuesProps {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
}

// ----------------------------------------------------------------------

interface AccountSocialLinksProps {
  socialLinks: {
    facebook: string;
    instagram: string;
    linkedin: string;
    twitter: string;
  };
}

export default function AccountSocialLinks({ socialLinks }: AccountSocialLinksProps) {
  const { enqueueSnackbar } = useSnackbar();

  const UpdateSocialSchema = Yup.object().shape({
    facebook: Yup.string().url("Must be a valid URL"),
    instagram: Yup.string().url("Must be a valid URL"),
    linkedin: Yup.string().url("Must be a valid URL"),
    twitter: Yup.string().url("Must be a valid URL"),
  });

  const defaultValues = {
    facebook: socialLinks.facebook || "",
    instagram: socialLinks.instagram || "",
    linkedin: socialLinks.linkedin || "",
    twitter: socialLinks.twitter || "",
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(UpdateSocialSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      enqueueSnackbar("Update success!");
      console.log("SOCIAL LINKS", data);
    } catch (error) {
      console.error(error);
    }
  });

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
              <RHFTextField name="facebook" label="Facebook" placeholder="https://facebook.com/username" />

              <RHFTextField name="instagram" label="Instagram" placeholder="https://instagram.com/username" />

              <RHFTextField name="linkedin" label="LinkedIn" placeholder="https://linkedin.com/in/username" />

              <RHFTextField name="twitter" label="Twitter" placeholder="https://twitter.com/username" />
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
