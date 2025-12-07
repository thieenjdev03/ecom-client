"use client";

import { useMemo } from "react";
import { Grid, Card, CardContent, Typography, Box, Container, Stack } from "@mui/material";
import { alpha } from "@mui/material/styles";
import EmptyContent from "src/components/empty-content";
import { RouterLink } from "src/routes/components";
import { paths } from "src/routes/paths";
import { useGetCategoryTree, useGetCategories } from "src/api/reference";
import { useTranslate } from "src/locales";
import { useSettingsContext } from "src/components/settings";
import { LoadingScreen } from "src/components/loading-screen";
import CustomBreadcrumbs from "src/components/custom-breadcrumbs";
import Iconify from "src/components/iconify";
import AdminCategoriesView from "./admin-categories-view";

// ----------------------------------------------------------------------

// Interface matching API response
interface CategoryFromAPI {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent?: string | null;
  parent_name?: string;
  display_order?: number;
  is_active?: boolean;
  status?: string;
  created_at?: string;
  created_at_display?: string;
  children?: CategoryFromAPI[];
}

export default function CategoriesView() {
  const { t } = useTranslate();
  const settings = useSettingsContext();
  
  // Fetch category tree (parent with children nested)
  const { categoryTree, categoryTreeLoading, categoryTreeError } = useGetCategoryTree();
  
  // Also fetch flat categories list as fallback
  const { categories: flatCategories, categoriesLoading: flatLoading } = useGetCategories();

  // Group categories - must be called before any conditional returns
  const { parentsWithChildren, parentsWithoutChildren, allCategories } = useMemo(() => {
    // Try to use categoryTree first (nested structure)
    if (categoryTree && Array.isArray(categoryTree) && categoryTree.length > 0) {
      const parents: CategoryFromAPI[] = categoryTree;
      
      const withChildren = parents.filter((p) => p.children && p.children.length > 0);
      const withoutChildren = parents.filter((p) => !p.children || p.children.length === 0);
      
      return {
        parentsWithChildren: withChildren,
        parentsWithoutChildren: withoutChildren,
        allCategories: parents,
      };
    }
    
    // Fallback: use flat categories and group them manually
    if (flatCategories && Array.isArray(flatCategories) && flatCategories.length > 0) {
      // Separate parent and child categories
      const parentCategories = flatCategories.filter((c: CategoryFromAPI) => !c.parent);
      const childCategories = flatCategories.filter((c: CategoryFromAPI) => c.parent);
      
      // Group children under their parents
      const parentsMap = new Map<string, CategoryFromAPI>();
      parentCategories.forEach((p: CategoryFromAPI) => {
        parentsMap.set(p.id, { ...p, children: [] });
      });
      
      childCategories.forEach((child: CategoryFromAPI) => {
        if (child.parent && parentsMap.has(child.parent)) {
          const parent = parentsMap.get(child.parent);
          if (parent && parent.children) {
            parent.children.push(child);
          }
        }
      });
      
      const groupedParents = Array.from(parentsMap.values());
      const withChildren = groupedParents.filter((p) => p.children && p.children.length > 0);
      const withoutChildren = groupedParents.filter((p) => !p.children || p.children.length === 0);
      
      return {
        parentsWithChildren: withChildren,
        parentsWithoutChildren: withoutChildren,
        allCategories: groupedParents,
      };
    }
    
    return {
      parentsWithChildren: [],
      parentsWithoutChildren: [],
      allCategories: [],
    };
  }, [categoryTree, flatCategories]);

  // Check if we're in admin dashboard context
  const isAdminContext = typeof window !== 'undefined' && window.location.pathname.includes('/dashboard/categories');
  
  if (isAdminContext) {
    return <AdminCategoriesView />;
  }

  const isLoading = categoryTreeLoading || flatLoading;

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (categoryTreeError) {
    return (
      <Container sx={{ py: 4 }}>
        <EmptyContent
          filled
          title={t("categories.errorLoading")}
          description={categoryTreeError?.message || ""}
        />
      </Container>
    );
  }

  // Calculate total categories count
  const totalCategories = allCategories.length + 
    parentsWithChildren.reduce((acc, p) => acc + (p.children?.length || 0), 0);

  // Default placeholder image for categories
  const defaultCategoryImage = "/assets/background/overlay_4.jpg";

  const renderHero = (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: { xs: 200, sm: 260, md: 300 },
        overflow: "hidden",
        borderRadius: 2,
        mb: 4,
        bgcolor: "grey.900",
      }}
    >
      {/* Background gradient */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        }}
      />

      {/* Decorative elements */}
      <Box
        sx={{
          position: "absolute",
          top: "20%",
          right: "10%",
          width: 200,
          height: 200,
          borderRadius: "50%",
          bgcolor: alpha("#fff", 0.03),
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-20%",
          left: "5%",
          width: 150,
          height: 150,
          borderRadius: "50%",
          bgcolor: alpha("#fff", 0.02),
        }}
      />

      {/* Content */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          px: 2,
        }}
      >
        <Typography
          variant="h2"
          sx={{
            color: "common.white",
            fontWeight: 700,
            fontSize: { xs: "28px", sm: "36px", md: "44px" },
            letterSpacing: "2px",
            textTransform: "uppercase",
            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
            mb: 1,
          }}
        >
          {t("categories.title")}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "common.white",
            fontWeight: 400,
            fontSize: { xs: "14px", sm: "16px" },
            opacity: 0.8,
            mb: 2,
          }}
        >
          {t("categories.browseDescription")} • {totalCategories} {t("categories.categoriesCount")}
        </Typography>

        {/* Breadcrumbs */}
        <CustomBreadcrumbs
          links={[
            { name: t("header.home"), href: "/" },
            { name: t("categories.title") },
          ]}
          sx={{
            "& .MuiBreadcrumbs-ol": {
              justifyContent: "center",
            },
            "& .MuiLink-root, & .MuiTypography-root": {
              color: "common.white",
              opacity: 0.85,
              fontSize: "13px",
            },
            "& .MuiBreadcrumbs-separator": {
              color: "common.white",
              opacity: 0.6,
            },
          }}
        />
      </Box>
    </Box>
  );

  const renderCategoryCard = (category: CategoryFromAPI, isSubCategory = false) => (
    <Card
      component={RouterLink}
      href={paths.categories.details(category.slug)}
      sx={{
        textDecoration: "none",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: (theme) => `0 12px 24px ${alpha(theme.palette.common.black, 0.15)}`,
          "& .category-image": {
            transform: "scale(1.1)",
          },
          "& .view-icon": {
            opacity: 1,
            transform: "translateX(0)",
          },
        },
      }}
    >
      {/* Category Image */}
      <Box
        sx={{
          position: "relative",
          height: isSubCategory ? 140 : 180,
          overflow: "hidden",
          bgcolor: "grey.100",
        }}
      >
        <Box
          className="category-image"
          component="img"
          src={category.image_url || defaultCategoryImage}
          alt={category.name}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.4s ease",
          }}
        />
        {/* Overlay gradient */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "50%",
            background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)",
          }}
        />
        {/* Category name on image */}
        <Typography
          variant="h6"
          sx={{
            position: "absolute",
            bottom: 12,
            left: 16,
            right: 16,
            color: "common.white",
            fontWeight: 600,
            fontSize: isSubCategory ? "15px" : "18px",
            textShadow: "0 1px 4px rgba(0,0,0,0.4)",
          }}
        >
          {category.name}
        </Typography>
      </Box>

      {/* Card Content */}
      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 1.5,
          px: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          {category.children && category.children.length > 0 && (
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontSize: "12px",
              }}
            >
              {category.children.length} {t("categories.subCategoriesCount")}
            </Typography>
          )}
        </Stack>

        <Box
          className="view-icon"
          sx={{
            display: "flex",
            alignItems: "center",
            color: "primary.main",
            opacity: 0.7,
            transform: "translateX(-8px)",
            transition: "all 0.3s ease",
          }}
        >
          <Typography variant="caption" sx={{ mr: 0.5, fontWeight: 500 }}>
            {t("categories.viewDetails")}
          </Typography>
          <Iconify icon="eva:arrow-ios-forward-fill" width={16} />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container
      maxWidth={settings.themeStretch ? false : "lg"}
      sx={{
        mb: 15,
        mt: "80px",
      }}
    >
      {/* Hero Section */}
      {renderHero}

      {/* Main Categories with Children */}
      {parentsWithChildren.length > 0 && (
        <Box sx={{ mb: 6 }}>
          {parentsWithChildren.map((parent) => (
            <Box key={parent.id} sx={{ mb: 5 }}>
              {/* Parent Category Header */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 3 }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    {parent.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      bgcolor: "grey.100",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                    }}
                  >
                    {parent.children?.length || 0} {t("categories.subCategoriesCount")}
                  </Typography>
                </Stack>

                <Box
                  component={RouterLink}
                  href={paths.categories.details(parent.slug)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: "primary.main",
                    textDecoration: "none",
                    fontWeight: 500,
                    fontSize: "14px",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      color: "primary.dark",
                      "& .arrow-icon": {
                        transform: "translateX(4px)",
                      },
                    },
                  }}
                >
                  {t("categories.viewAll")}
                  <Iconify
                    className="arrow-icon"
                    icon="eva:arrow-ios-forward-fill"
                    width={18}
                    sx={{ ml: 0.5, transition: "transform 0.2s ease" }}
                  />
                </Box>
              </Stack>

              {/* Children Categories Grid */}
              <Grid container spacing={3}>
                {parent.children?.map((child) => (
                  <Grid item xs={6} sm={4} md={3} key={child.id}>
                    {renderCategoryCard(child, true)}
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Box>
      )}

      {/* Categories without Children */}
      {parentsWithoutChildren.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
              mb: 3,
            }}
          >
            {t("categories.otherCategories")}
          </Typography>

          <Grid container spacing={3}>
            {parentsWithoutChildren.map((category) => (
              <Grid item xs={6} sm={4} md={3} key={category.id}>
                {renderCategoryCard(category)}
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Empty State */}
      {allCategories.length === 0 && (
        <Box sx={{ py: 4 }}>
          <EmptyContent
            filled
            title={t("categories.noCategories")}
            description={t("categories.noCategoriesDescription")}
          />
        </Box>
      )}
    </Container>
  );
}
