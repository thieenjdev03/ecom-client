"use client";

import { useState, useCallback, useRef } from "react";
import {
  Box,
  Card,
  Table,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Container,
  TableContainer,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  alpha,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSnackbar } from "src/components/snackbar";
import Iconify from "src/components/iconify";
import {
  useGetCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  Collection,
} from "src/api/reference";
import { mutate } from "swr";
import axios, { endpoints } from "src/utils/axios";

// ----------------------------------------------------------------------

interface CollectionFormData {
  name: string;
  slug: string;
  description?: string;
  banner_image_url?: string;
  seo_title?: string;
  seo_description?: string;
  is_active?: boolean;
}

const collectionSchema = yup.object({
  name: yup.string().required("Name is required"),
  slug: yup.string().required("Slug is required"),
  description: yup.string().optional(),
  banner_image_url: yup.string().optional(),
  seo_title: yup.string().optional(),
  seo_description: yup.string().optional(),
  is_active: yup.boolean().optional(),
});

// ----------------------------------------------------------------------

export default function AdminCollectionsView() {
  const { enqueueSnackbar } = useSnackbar();
  const [searchQuery, setSearchQuery] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  // Image upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { collections, collectionsLoading, collectionsError } = useGetCollections();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CollectionFormData>({
    resolver: yupResolver(collectionSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      banner_image_url: "",
      seo_title: "",
      seo_description: "",
      is_active: true,
    },
  });

  // Filter collections based on search query
  const filteredCollections = collections?.filter(
    (collection: Collection) =>
      collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.slug.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleOpenAddModal = () => {
    reset();
    setPreviewImage(null);
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
    setPreviewImage(null);
    reset();
  };

  const handleOpenEditModal = (collection: Collection) => {
    setSelectedCollection(collection);
    setValue("name", collection.name);
    setValue("slug", collection.slug);
    setValue("description", collection.description || "");
    setValue("banner_image_url", collection.banner_image_url || "");
    setValue("seo_title", collection.seo_title || "");
    setValue("seo_description", collection.seo_description || "");
    setValue("is_active", collection.is_active ?? true);
    // Set preview image if collection has a banner
    setPreviewImage(collection.banner_image_url || null);
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedCollection(null);
    setPreviewImage(null);
    reset();
  };

  // Handle image upload for collection banner
  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(event.target.files || []);
      if (selectedFiles.length === 0) return;

      const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB

      const file = selectedFiles[0];

      // Validate file type
      if (!ACCEPTED_TYPES.includes(file.type)) {
        enqueueSnackbar("Only JPG, PNG, and WebP images are allowed", { variant: "error" });
        return;
      }

      // Validate file size
      if (file.size > MAX_SIZE) {
        enqueueSnackbar("File size must be less than 5MB", { variant: "error" });
        return;
      }

      setUploadingImage(true);

      try {
        const formData = new FormData();
        formData.append("files", file);
        formData.append("folder", "collections");

        const response = await axios.post(endpoints.files.uploadMultiple, formData);
        const apiResponse = response.data;
        const uploadedFiles = apiResponse?.data?.files || apiResponse?.files || [];

        if (!Array.isArray(uploadedFiles) || uploadedFiles.length === 0) {
          enqueueSnackbar("No image uploaded", { variant: "warning" });
          return;
        }

        const uploadedFile = uploadedFiles[0];
        if (uploadedFile?.url && uploadedFile?.success !== false) {
          const imageUrl = uploadedFile.url;
          setValue("banner_image_url", imageUrl);
          setPreviewImage(imageUrl);
          enqueueSnackbar("Image uploaded successfully", { variant: "success" });
        } else {
          enqueueSnackbar("Failed to upload image", { variant: "error" });
        }
      } catch (error: any) {
        console.error("Upload error:", error);
        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to upload image";
        enqueueSnackbar(errorMessage, { variant: "error" });
      } finally {
        setUploadingImage(false);
        // Reset file input
        if (event.target) {
          event.target.value = "";
        }
      }
    },
    [setValue, enqueueSnackbar]
  );

  // Handle remove image
  const handleRemoveImage = useCallback(() => {
    setValue("banner_image_url", "");
    setPreviewImage(null);
  }, [setValue]);

  const handleOpenDeleteDialog = (collection: Collection) => {
    setSelectedCollection(collection);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedCollection(null);
  };

  const onSubmitAdd = async (data: CollectionFormData) => {
    try {
      await createCollection({
        name: data.name,
        slug: data.slug,
        description: data.description,
        banner_image_url: data.banner_image_url,
        seo_title: data.seo_title,
        seo_description: data.seo_description,
        is_active: data.is_active,
      });
      enqueueSnackbar("Collection created successfully", { variant: "success" });
      handleCloseAddModal();
      mutate(endpoints.collections.list);
    } catch (error: any) {
      if (error.response?.status === 409) {
        enqueueSnackbar("Slug already exists", { variant: "error" });
      } else {
        enqueueSnackbar("Failed to create collection", { variant: "error" });
      }
    }
  };

  const onSubmitEdit = async (data: CollectionFormData) => {
    if (!selectedCollection) return;

    try {
      await updateCollection({
        id: selectedCollection.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        banner_image_url: data.banner_image_url,
        seo_title: data.seo_title,
        seo_description: data.seo_description,
        is_active: data.is_active,
      });
      enqueueSnackbar("Collection updated successfully", { variant: "success" });
      handleCloseEditModal();
      mutate(endpoints.collections.list);
    } catch (error: any) {
      if (error.response?.status === 409) {
        enqueueSnackbar("Slug already exists", { variant: "error" });
      } else {
        enqueueSnackbar("Failed to update collection", { variant: "error" });
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedCollection) return;

    try {
      await deleteCollection(selectedCollection.id);
      enqueueSnackbar("Collection deleted successfully", { variant: "success" });
      handleCloseDeleteDialog();
      mutate(endpoints.collections.list);
    } catch (error: any) {
      if (error.response?.status === 404) {
        enqueueSnackbar("Collection not found", { variant: "error" });
      } else {
        enqueueSnackbar("Failed to delete collection", { variant: "error" });
      }
    }
  };

  const handleRefresh = () => {
    mutate(endpoints.collections.list);
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string, onChange: (value: string) => void) => {
    onChange(name);
    // Generate slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setValue("slug", slug);
  };

  if (collectionsLoading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (collectionsError) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">
          Error loading collections: {collectionsError.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Stack spacing={3}>
        <Card>
          <Box sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <TextField
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300 }}
              />
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="eva:refresh-fill" />}
                  onClick={handleRefresh}
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="eva:plus-fill" />}
                  onClick={handleOpenAddModal}
                >
                  Add Collection
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Card>

        {/* Collections Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Banner</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell>SEO Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCollections.map((collection: Collection) => (
                  <TableRow key={collection.id}>
                    <TableCell>
                      {collection.banner_image_url ? (
                        <Box
                          component="img"
                          src={collection.banner_image_url}
                          alt={collection.name}
                          sx={{
                            width: 80,
                            height: 45,
                            objectFit: "cover",
                            borderRadius: 1,
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 80,
                            height: 45,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 1,
                            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
                          }}
                        >
                          <Iconify icon="eva:image-outline" sx={{ color: "text.disabled" }} />
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{collection.name}</Typography>
                      {collection.description && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {collection.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {collection.slug}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          maxWidth: 150,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {collection.seo_title || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={collection.is_active ? "Active" : "Inactive"}
                        size="small"
                        color={collection.is_active ? "success" : "default"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {collection.created_at
                          ? new Date(collection.created_at).toLocaleDateString()
                          : "-"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton size="small" onClick={() => handleOpenEditModal(collection)}>
                          <Iconify icon="eva:edit-fill" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteDialog(collection)}
                        >
                          <Iconify icon="eva:trash-2-fill" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCollections.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                      <Typography variant="body2" color="text.secondary">
                        No collections found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Add Collection Modal */}
        <Dialog open={openAddModal} onClose={handleCloseAddModal} maxWidth="sm" fullWidth>
          <form onSubmit={handleSubmit(onSubmitAdd)}>
            <DialogTitle>Add New Collection</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      onChange={(e) => handleNameChange(e.target.value, field.onChange)}
                      label="Name"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="slug"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Slug"
                      error={!!errors.slug}
                      helperText={errors.slug?.message || "URL-friendly identifier"}
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Description" multiline rows={3} fullWidth />
                  )}
                />

                {/* Banner Image Upload Section */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Banner Image
                  </Typography>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                  {previewImage ? (
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        height: 200,
                        borderRadius: 1,
                        overflow: "hidden",
                        border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
                      }}
                    >
                      <Box
                        component="img"
                        src={previewImage}
                        alt="Banner preview"
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => fileInputRef.current?.click()}
                          sx={{
                            bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
                            color: "common.white",
                            "&:hover": {
                              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.48),
                            },
                          }}
                        >
                          <Iconify icon="eva:edit-fill" width={16} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={handleRemoveImage}
                          sx={{
                            bgcolor: (theme) => alpha(theme.palette.error.main, 0.72),
                            color: "common.white",
                            "&:hover": {
                              bgcolor: (theme) => alpha(theme.palette.error.main, 0.48),
                            },
                          }}
                        >
                          <Iconify icon="eva:trash-2-fill" width={16} />
                        </IconButton>
                      </Stack>
                    </Box>
                  ) : (
                    <Box
                      onClick={() => !uploadingImage && fileInputRef.current?.click()}
                      sx={{
                        width: "100%",
                        height: 200,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 1,
                        cursor: uploadingImage ? "default" : "pointer",
                        border: (theme) => `dashed 2px ${alpha(theme.palette.grey[500], 0.3)}`,
                        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                        ...(!uploadingImage && {
                          "&:hover": {
                            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                          },
                        }),
                      }}
                    >
                      {uploadingImage ? (
                        <CircularProgress size={32} />
                      ) : (
                        <>
                          <Iconify
                            icon="eva:cloud-upload-fill"
                            width={40}
                            sx={{ color: "text.secondary", mb: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Click to upload banner image
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            JPG, PNG, WebP (max 5MB)
                          </Typography>
                        </>
                      )}
                    </Box>
                  )}
                </Box>

                <Typography variant="subtitle2" sx={{ mt: 2 }}>
                  SEO Settings
                </Typography>
                <Controller
                  name="seo_title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="SEO Title"
                      helperText="Title for search engines (leave empty to use collection name)"
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="seo_description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="SEO Description"
                      multiline
                      rows={2}
                      helperText="Description for search engines"
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                      <Typography>Active (visible on website)</Typography>
                    </Box>
                  )}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseAddModal}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={uploadingImage}>
                Create
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Edit Collection Modal */}
        <Dialog open={openEditModal} onClose={handleCloseEditModal} maxWidth="sm" fullWidth>
          <form onSubmit={handleSubmit(onSubmitEdit)}>
            <DialogTitle>Edit Collection</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Name"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="slug"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Slug"
                      error={!!errors.slug}
                      helperText={errors.slug?.message || "URL-friendly identifier"}
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Description" multiline rows={3} fullWidth />
                  )}
                />

                {/* Banner Image Upload Section */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Banner Image
                  </Typography>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                  {previewImage ? (
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        height: 200,
                        borderRadius: 1,
                        overflow: "hidden",
                        border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
                      }}
                    >
                      <Box
                        component="img"
                        src={previewImage}
                        alt="Banner preview"
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => fileInputRef.current?.click()}
                          sx={{
                            bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
                            color: "common.white",
                            "&:hover": {
                              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.48),
                            },
                          }}
                        >
                          <Iconify icon="eva:edit-fill" width={16} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={handleRemoveImage}
                          sx={{
                            bgcolor: (theme) => alpha(theme.palette.error.main, 0.72),
                            color: "common.white",
                            "&:hover": {
                              bgcolor: (theme) => alpha(theme.palette.error.main, 0.48),
                            },
                          }}
                        >
                          <Iconify icon="eva:trash-2-fill" width={16} />
                        </IconButton>
                      </Stack>
                    </Box>
                  ) : (
                    <Box
                      onClick={() => !uploadingImage && fileInputRef.current?.click()}
                      sx={{
                        width: "100%",
                        height: 200,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 1,
                        cursor: uploadingImage ? "default" : "pointer",
                        border: (theme) => `dashed 2px ${alpha(theme.palette.grey[500], 0.3)}`,
                        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                        ...(!uploadingImage && {
                          "&:hover": {
                            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                          },
                        }),
                      }}
                    >
                      {uploadingImage ? (
                        <CircularProgress size={32} />
                      ) : (
                        <>
                          <Iconify
                            icon="eva:cloud-upload-fill"
                            width={40}
                            sx={{ color: "text.secondary", mb: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Click to upload banner image
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            JPG, PNG, WebP (max 5MB)
                          </Typography>
                        </>
                      )}
                    </Box>
                  )}
                </Box>

                <Typography variant="subtitle2" sx={{ mt: 2 }}>
                  SEO Settings
                </Typography>
                <Controller
                  name="seo_title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="SEO Title"
                      helperText="Title for search engines (leave empty to use collection name)"
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="seo_description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="SEO Description"
                      multiline
                      rows={2}
                      helperText="Description for search engines"
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                      <Typography>Active (visible on website)</Typography>
                    </Box>
                  )}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseEditModal}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={uploadingImage}>
                Update
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Delete Collection</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the collection &quot;{selectedCollection?.name}&quot;?
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
            <Button color="error" variant="contained" onClick={handleDelete}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Container>
  );
}

