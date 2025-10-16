import { useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

// ----------------------------------------------------------------------

export default function CheckoutContactForm() {
  const [email, setEmail] = useState("");
  const [newsletterChecked, setNewsletterChecked] = useState(true);

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, textTransform: "uppercase", mb: 3 }}>
        Contact
      </Typography>
      <Stack spacing={3}>
        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
        
        <FormControlLabel
          control={
            <Checkbox
              checked={newsletterChecked}
              onChange={(e) => setNewsletterChecked(e.target.checked)}
            />
          }
          label="Email me with news and offers"
        />
      </Stack>
    </Box>
  );
}
