"use client";

import { Box, Card, CardContent, Chip, Grid, Typography } from "@mui/material";
import { useGetSizes } from "src/api/reference";
import AdminSizesView from "./admin-sizes-view";

export default function SizesView() {
  const isAdminContext = typeof window !== 'undefined' && window.location.pathname.includes('/dashboard/sizes');
  if (isAdminContext) {
    return <AdminSizesView />;
  }

  const { sizes, sizesLoading, sizesError } = useGetSizes();

  if (sizesLoading) return <div>Loading sizes...</div>;
  if (sizesError) return <div>Error loading sizes</div>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Sizes ({sizes.length})
      </Typography>
      <Grid container spacing={2}>
        {sizes.map((s: any) => (
          <Grid key={s.id} item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>{s.name}</Typography>
                {s.category?.name ? (
                  <Chip size="small" label={`Category: ${s.category.name}`} />
                ) : null}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}


