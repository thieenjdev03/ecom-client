"use client";

import { Grid, Card, CardContent, Typography, Box, Chip } from "@mui/material";
import EmptyContent from "src/components/empty-content";
import { RouterLink } from "src/routes/components";
import { paths } from "src/routes/paths";
import { useGetCategories } from "src/api/reference";
import { useTranslate } from "src/locales";
import AdminCategoriesView from "./admin-categories-view";

// ----------------------------------------------------------------------

export default function CategoriesView() {
  const { t } = useTranslate();

  // Check if we're in admin dashboard context
  const isAdminContext = typeof window !== 'undefined' && window.location.pathname.includes('/dashboard/categories');
  
  if (isAdminContext) {
    return <AdminCategoriesView />;
  }

  const { categories, categoriesLoading, categoriesError } = useGetCategories();

  if (categoriesLoading) {
    return <div>{t("categories.loading")}</div>;
  }

  if (categoriesError) {
    return <div>{t("categories.errorLoading")}{categoriesError.message}</div>;
  }

  // Group categories by parent/child relationship
  const groupedCategories = categories.reduce((acc: any, category: any) => {
    if (!category.parent) {
      // This is a parent category
      if (!acc.parents) acc.parents = [];
      acc.parents.push(category);
    } else {
      // This is a child category
      if (!acc.children) acc.children = [];
      acc.children.push(category);
    }
    return acc;
  }, {});

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t("categories.title")} ({categories.length})
      </Typography>

      {groupedCategories.parents && groupedCategories.parents.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
            {t("categories.mainCategories")}
          </Typography>
          <Grid container spacing={3}>
            {groupedCategories.parents.map((category: any) => (
              <Grid item xs={12} sm={6} md={4} key={category.id}>
                <Card
                  component={RouterLink}
                  href={paths.categories.details(category.slug)}
                  sx={{
                    textDecoration: "none",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {category.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {category.slug}
                    </Typography>
                    {category.children && category.children.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {category.children.length} {t("categories.subCategoriesCount")}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ mt: 2 }}>
                      <Chip
                        label={t("categories.viewDetails")}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {groupedCategories.children && groupedCategories.children.length > 0 && (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
            {t("categories.subCategories")}
          </Typography>
          <Grid container spacing={2}>
            {groupedCategories.children.map((category: any) => (
              <Grid item xs={12} sm={6} md={4} key={category.id}>
                <Card
                  component={RouterLink}
                  href={paths.categories.details(category.slug)}
                  sx={{
                    textDecoration: "none",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 2,
                    },
                  }}
                >
                  <CardContent>
                    {category.parent && (
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={`${t("categories.belongsTo")}${category.parent.name}`}
                          size="small"
                          variant="outlined"
                          color="secondary"
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {categories.length === 0 && (
        <Box sx={{ py: 4 }}>
          <EmptyContent
            filled
            title={t("categories.noCategories")}
            description={t("categories.noCategoriesDescription")}
          />
        </Box>
      )}
    </Box>
  );
}
