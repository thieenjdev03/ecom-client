"use client";

import { useState } from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";

import { useSnackbar } from "src/components/snackbar";

// ----------------------------------------------------------------------

export default function AccountNotifications() {
  const { enqueueSnackbar } = useSnackbar();

  const [notifications, setNotifications] = useState({
    emailMarketing: true,
    emailSecurity: true,
    emailActivity: false,
    emailNewsletter: true,
    pushMarketing: false,
    pushSecurity: true,
    pushActivity: true,
    pushNewsletter: false,
  });

  const handleChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      enqueueSnackbar("Settings saved!");
      console.log("NOTIFICATIONS", notifications);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Notifications
        </Typography>

        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Email Notifications
            </Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.emailMarketing}
                    onChange={() => handleChange("emailMarketing")}
                  />
                }
                label="Marketing emails"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.emailSecurity}
                    onChange={() => handleChange("emailSecurity")}
                  />
                }
                label="Security alerts"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.emailActivity}
                    onChange={() => handleChange("emailActivity")}
                  />
                }
                label="Activity summary"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.emailNewsletter}
                    onChange={() => handleChange("emailNewsletter")}
                  />
                }
                label="Newsletter"
              />
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Push Notifications
            </Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.pushMarketing}
                    onChange={() => handleChange("pushMarketing")}
                  />
                }
                label="Marketing push"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.pushSecurity}
                    onChange={() => handleChange("pushSecurity")}
                  />
                }
                label="Security alerts"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.pushActivity}
                    onChange={() => handleChange("pushActivity")}
                  />
                }
                label="Activity summary"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.pushNewsletter}
                    onChange={() => handleChange("pushNewsletter")}
                  />
                }
                label="Newsletter"
              />
            </Stack>
          </Box>

          <Button variant="contained" onClick={handleSubmit} sx={{ alignSelf: "flex-start" }}>
            Save Changes
          </Button>
        </Stack>
      </Card>
    </Box>
  );
}
