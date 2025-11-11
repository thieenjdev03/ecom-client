"use client";

import * as Yup from "yup";
import { useState, useEffect } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import InputAdornment from "@mui/material/InputAdornment";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";
import { useRouter, useSearchParams } from "src/routes/hooks";

import { useBoolean } from "src/hooks/use-boolean";

import { useAuthContext } from "src/auth/hooks";
import {
  PATH_AFTER_LOGIN,
  PATH_AFTER_LOGIN_USER,
  PATH_AFTER_REGISTER_USER,
} from "src/config-global";

import Iconify from "src/components/iconify";
import FormProvider, { RHFTextField } from "src/components/hook-form";
import RHFAutocomplete, { getCountry } from "src/components/hook-form/rhf-autocomplete";
import { countries } from "src/assets/data";
import TextField from "@mui/material/TextField";

// ----------------------------------------------------------------------

export default function JwtRegisterView() {
  const { register } = useAuthContext();

  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState("");

  const searchParams = useSearchParams();

  const returnTo = searchParams?.get("returnTo");

  const password = useBoolean();

  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().required("First name required"),
    lastName: Yup.string().required("Last name required"),
    email: Yup.string()
      .required("Email is required")
      .email("Email must be a valid email address"),
    password: Yup.string().required("Password is required"),
    phoneNumber: Yup.string().required("Phone number is required"),
    country: Yup.string().required("Country is required"),
  });

  const defaultValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    country: "",
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    control,
    getValues,
    formState: { isSubmitting, isValid },
  } = methods;

  // Watch country field to get phone code
  const selectedCountry = useWatch({
    control: methods.control,
    name: "country",
  });

  // Get country phone code
  const countryInfo = selectedCountry ? getCountry(selectedCountry) : null;
  const countryPhoneCode = countryInfo?.phone ? `+${countryInfo.phone}` : "";

  // Update phone number format when country changes
  useEffect(() => {
    const currentPhone = getValues("phoneNumber");
    if (countryPhoneCode && currentPhone) {
      // Remove existing country code if present
      const phoneWithoutCode = currentPhone.replace(/^\+\d{1,4}\s*/, "").trim();
      // Update with new country code
      if (phoneWithoutCode) {
        setValue("phoneNumber", `${countryPhoneCode} ${phoneWithoutCode}`, {
          shouldValidate: false,
        });
      }
    }
  }, [countryPhoneCode, setValue, getValues]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result: any = await register?.(
        data.email,
        data.password,
        data.firstName,
        data.lastName,
        data.phoneNumber,
        data.country,
      );
      if (result?.success as boolean) {
        router.push(PATH_AFTER_REGISTER_USER);
      }
    } catch (error) {
      console.error(error);
      reset();
      setErrorMsg(typeof error === "string" ? error : error.message);
    }
  });

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5, position: "relative" }}>
      <Typography variant="h4">Create an account</Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2"> Already have an account? </Typography>

        <Link
          href={paths.auth.jwt.login}
          component={RouterLink}
          variant="subtitle2"
        >
          Sign in
        </Link>
      </Stack>
    </Stack>
  );

  const renderTerms = (
    <Typography
      component="div"
      sx={{
        mt: 2.5,
        textAlign: "center",
        typography: "caption",
        color: "text.secondary",
      }}
    >
      {"By signing up, I agree to "}
      <Link underline="always" color="text.primary">
        Terms of Service
      </Link>
      {" and "}
      <Link underline="always" color="text.primary">
        Privacy Policy
      </Link>
      .
    </Typography>
  );


  const renderForm = (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <RHFTextField
          name="firstName"
          label="First name"
          sx={{
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": {
                borderColor: "#2563eb",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#2563eb",
                borderWidth: 2,
              },
            },
          }}
        />
        <RHFTextField
          name="lastName"
          label="Last name"
          sx={{
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": {
                borderColor: "#2563eb",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#2563eb",
                borderWidth: 2,
              },
            },
          }}
        />
      </Stack>

      <RHFTextField
        name="email"
        label="Email address"
        sx={{
          "& .MuiOutlinedInput-root": {
            "&:hover fieldset": {
              borderColor: "#2563eb",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#2563eb",
              borderWidth: 2,
            },
          },
        }}
      />

      {/* Combined Country and Phone Number */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ alignItems: { xs: "stretch", sm: "flex-start" } }}
      >
        <Box sx={{ width: { xs: "100%", sm: "40%" } }}>
          <RHFAutocomplete
            name="country"
            type="country"
            label="Country"
            placeholder="Choose a country"
            options={countries.map((option) => option.label)}
          />
        </Box>
        <Box sx={{ width: { xs: "100%", sm: "60%" } }}>
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field, fieldState: { error } }) => {
              // Extract phone number without country code for display
              const displayValue = field.value
                ? field.value.replace(/^\+\d{1,4}\s*/, "")
                : "";

              return (
                <TextField
                  {...field}
                  fullWidth
                  label="Phone number"
                  placeholder={
                    countryPhoneCode
                      ? "Enter your phone number"
                      : "Select country first"
                  }
                  value={displayValue}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    // If country is selected, prepend country code
                    if (countryPhoneCode) {
                      if (inputValue) {
                        field.onChange(`${countryPhoneCode} ${inputValue}`);
                      } else {
                        // Clear the field if input is empty
                        field.onChange("");
                      }
                    } else {
                      // Store without country code if country not selected
                      field.onChange(inputValue);
                    }
                  }}
                  error={!!error}
                  helperText={error ? error?.message : undefined}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#2563eb",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#2563eb",
                        borderWidth: 2,
                      },
                    },
                  }}
                  inputProps={{
                    autoComplete: "off",
                  }}
                  InputProps={{
                    startAdornment: countryPhoneCode ? (
                      <InputAdornment
                        position="start"
                        sx={{
                          padding: 1,
                          borderRight: "2px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                            fontWeight: 500,
                            userSelect: "none",
                          }}
                        >
                          {countryPhoneCode}
                        </Typography>
                      </InputAdornment>
                    ) : undefined,
                  }}
                />
              );
            }}
          />
        </Box>
      </Stack>

      <RHFTextField
        name="password"
        label="Password"
        type={password.value ? "text" : "password"}
        sx={{
          "& .MuiOutlinedInput-root": {
            "&:hover fieldset": {
              borderColor: "#2563eb",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#2563eb",
              borderWidth: 2,
            },
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify
                  icon={
                    password.value ? "solar:eye-bold" : "solar:eye-closed-bold"
                  }
                />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        disabled={!isValid || isSubmitting}
        sx={{
          mt: 1,
          "&:disabled": {
            backgroundColor: "action.disabledBackground",
            color: "action.disabled",
          },
        }}
      >
        Create account
      </LoadingButton>
    </Stack>
  );

  return (
    <Box
      sx={{
        backgroundColor: "white",
        padding: 0,
        borderRadius: 1,
        width: "100%",
        maxWidth: 650,
      }}
    >
      {renderHead}

      {!!errorMsg && (
        <Alert severity="error" sx={{ m: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <FormProvider methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </FormProvider>

      {renderTerms}
    </Box>
  );
}
