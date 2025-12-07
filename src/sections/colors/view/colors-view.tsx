"use client";

import dynamic from "next/dynamic";
import { Box, Card, CardContent, Chip, Grid, Typography } from "@mui/material";
import { useGetColors } from "src/api/reference";

// Lazy-load admin colors view so dashboard management is loaded on demand only
const AdminColorsView = dynamic(() => import("./admin-colors-view"), {
  ssr: false,
  loading: () => <div>Loading color management...</div>,
});

export default function ColorsView() {
  const { colors, colorsLoading, colorsError } = useGetColors();

  // Detect admin dashboard context by pathname (client-only)
  const isAdminContext =
    typeof window !== "undefined" && window.location.pathname.includes("/dashboard/colors");

  if (isAdminContext) {
    return <AdminColorsView />;
  }

  if (colorsLoading) return <div>Loading colors...</div>;
  if (colorsError) return <div>Error loading colors</div>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Colors ({colors.length})
      </Typography>
      <Grid container spacing={2}>
        {colors.map((c: any) => (
          <Grid key={c.id} item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  {c.name}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  {c.imageUrl ? (
                    <Box
                      component="img"
                      src={c.imageUrl}
                      alt={c.name}
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "divider",
                        objectFit: "cover",
                      }}
                    />
                  ) : null}
                  <Chip
                    size="small"
                    label={c.hexCode || (c.imageUrl ? "Image" : "N/A")}
                    sx={{
                      bgcolor: c.hexCode || undefined,
                      color: c.hexCode ? "#fff" : undefined,
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}


