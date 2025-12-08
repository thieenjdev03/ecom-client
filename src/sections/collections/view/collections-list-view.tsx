"use client";

import { useState, useCallback } from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { alpha } from "@mui/material/styles";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import { useGetCollections, Collection } from "src/api/reference";

import EmptyContent from "src/components/empty-content";
import { useSettingsContext } from "src/components/settings";
import CustomBreadcrumbs from "src/components/custom-breadcrumbs";
import { LoadingScreen } from "src/components/loading-screen";
import { useTranslate } from "src/locales";
import Iconify from "src/components/iconify";

// ----------------------------------------------------------------------

export default function CollectionsListView() {
  const { t } = useTranslate();
  const settings = useSettingsContext();

  // State for cursor-based pagination
  const [allCollections, setAllCollections] = useState<Collection[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(undefined);

  const { collections, nextCursor, hasMore, collectionsLoading, collectionsError } = useGetCollections(20, currentCursor);

  // Update accumulated collections
  if (collections.length > 0 && !collectionsLoading) {
    const existingIds = new Set(allCollections.map((c) => c.id));
    const newCollections = collections.filter((c) => !existingIds.has(c.id));
    if (newCollections.length > 0) {
      setAllCollections((prev) => [...prev, ...newCollections]);
    }
  }

  // Initialize with first batch
  if (allCollections.length === 0 && collections.length > 0 && !collectionsLoading) {
    setAllCollections(collections);
  }

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (nextCursor) {
      setCurrentCursor(nextCursor);
    }
  }, [nextCursor]);

  // Filter only active collections
  const activeCollections = allCollections.filter((c) => c.is_active);

  // Loading state
  if (collectionsLoading && allCollections.length === 0) {
    return <LoadingScreen />;
  }

  // Error state
  if (collectionsError) {
    return (
      <Container sx={{ py: 4 }}>
        <EmptyContent
          filled
          title="Error loading collections"
          description={collectionsError?.message || ""}
        />
      </Container>
    );
  }

  return (
    <Container
      maxWidth={settings.themeStretch ? false : "lg"}
      sx={{
        mb: 15,
        mt: "100px",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <CustomBreadcrumbs
          heading={t("header.collection")}
          links={[
            { name: t("header.home"), href: "/" },
            { name: t("header.collection") },
          ]}
          sx={{ mb: 3 }}
        />

        <Typography variant="body1" color="text.secondary">
          Explore our curated collections of products
        </Typography>
      </Box>

      {/* Collections Grid */}
      {activeCollections.length === 0 ? (
        <EmptyContent
          filled
          title="No collections"
          description="There are no collections available at the moment."
          sx={{ py: 10 }}
        />
      ) : (
        <>
          <Grid container spacing={3}>
            {activeCollections.map((collection) => (
              <Grid xs={12} sm={6} md={4} key={collection.id}>
                <Card
                  component={RouterLink}
                  href={paths.collections.details(collection.slug)}
                  sx={{
                    position: "relative",
                    height: 280,
                    overflow: "hidden",
                    textDecoration: "none",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: (theme) => theme.shadows[20],
                      "& .collection-overlay": {
                        bgcolor: alpha("#000", 0.5),
                      },
                      "& .collection-content": {
                        transform: "translateY(-8px)",
                      },
                    },
                  }}
                >
                  {/* Background Image or Gradient */}
                  {collection.banner_image_url ? (
                    <Box
                      component="img"
                      src={collection.banner_image_url}
                      alt={collection.name}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      }}
                    />
                  )}

                  {/* Overlay */}
                  <Box
                    className="collection-overlay"
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      bgcolor: alpha("#000", 0.35),
                      transition: "all 0.3s ease",
                    }}
                  />

                  {/* Content */}
                  <Box
                    className="collection-content"
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      p: 3,
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        color: "common.white",
                        fontWeight: 700,
                        mb: 1,
                        textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                      }}
                    >
                      {collection.name}
                    </Typography>

                    {collection.description && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "common.white",
                          opacity: 0.85,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          textShadow: "0 1px 4px rgba(0,0,0,0.2)",
                        }}
                      >
                        {collection.description}
                      </Typography>
                    )}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Load More Button */}
          {hasMore && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 5,
              }}
            >
              <Button
                variant="outlined"
                size="large"
                onClick={handleLoadMore}
                disabled={collectionsLoading}
                startIcon={collectionsLoading ? <CircularProgress size={20} /> : <Iconify icon="eva:arrow-ios-downward-fill" />}
                sx={{
                  minWidth: 200,
                  borderRadius: 2,
                }}
              >
                {collectionsLoading ? "Loading..." : "Load More"}
              </Button>
            </Box>
          )}
        </>
      )}
    </Container>
  );
}

