"use client";

import { useState, useCallback, useMemo, useRef } from "react";
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
import { useGetCategories, createCategory, updateCategory, deleteCategory } from "src/api/reference";
import { mutate } from "swr";
import axios, { endpoints } from "src/utils/axios";

// ----------------------------------------------------------------------

interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  display_order?: number;
  is_active?: boolean;
}

const categorySchema = yup.object({
  name: yup.string().required("Name is required"),
  slug: yup.string().required("Slug is required"),
  description: yup.string().optional(),
  // image_url: yup.string().url("Must be a valid URL").optional(),
  parent_id: yup.string().optional(),
  display_order: yup.number().optional(),
  is_active: yup.boolean().optional(),
});

// ----------------------------------------------------------------------

export default function AdminCategoriesView() {
  const { enqueueSnackbar } = useSnackbar();
  const [searchQuery, setSearchQuery] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  
  // Image upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { categories, categoriesLoading, categoriesError } = useGetCategories();
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: yupResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      image_url: "",
      parent_id: "",
      display_order: 0,
      is_active: true,
    },
  });

  // Filter categories based on search query
  const filteredCategories = categories && categories.length > 0 ? categories?.filter((category: any) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  // Get parent categories for dropdown (flat response uses parent_id)
  const parentCategories = categories && categories.length > 0 ? categories?.filter((category: any) => !category.parent_id) : [];
  // Precompute children count by parent id when API does not provide children_count
  const _childrenCountByParentId = useMemo(() => {
    const map = new Map<number, number>();
    (categories && categories.length > 0 ? categories : []).forEach((c: any) => {
      if (c.parent_id) {
        map.set(c.parent_id, (map.get(c.parent_id) || 0) + 1);
      }
    });
    return map;
  }, [categories]);

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

  const handleOpenEditModal = (category: any) => {
    setSelectedCategory(category);
    setValue("name", category.name);
    setValue("slug", category.slug);
    setValue("description", category.description || "");
    setValue("image_url", category.image_url || "");
    setValue("parent_id", category.parent_id ?? "");
    setValue("display_order", category.display_order || 0);
    setValue("is_active", category.is_active ?? true);
    // Set preview image if category has an image
    setPreviewImage(category.image_url || null);
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedCategory(null);
    setPreviewImage(null);
    reset();
  };

  // Handle image upload for category
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
        formData.append("folder", "categories");

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
          setValue("image_url", imageUrl);
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
    setValue("image_url", "");
    setPreviewImage(null);
  }, [setValue]);

  const handleOpenDeleteDialog = (category: any) => {
    setSelectedCategory(category);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedCategory(null);
  };

  const onSubmitAdd = async (data: CategoryFormData) => {
    try {
      await createCategory({
        name: data.name,
        slug: data.slug,
        description: data.description,
        image_url: data.image_url,
        parent_id: data.parent_id,
        display_order: data.display_order,
        is_active: data.is_active,
      });
      enqueueSnackbar("Category created successfully", { variant: "success" });
      handleCloseAddModal();
      mutate(endpoints.refs.categories);
    } catch (error: any) {
      if (error.response?.status === 409) {
        enqueueSnackbar("Slug already exists", { variant: "error" });
      } else if (error.response?.status === 404) {
        enqueueSnackbar("Parent category not found", { variant: "error" });
      } else {
        enqueueSnackbar("Failed to create category", { variant: "error" });
      }
    }
  };

  const onSubmitEdit = async (data: CategoryFormData) => {
    if (!selectedCategory) return;

    try {
      await updateCategory({
        id: selectedCategory.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        image_url: data.image_url,
        parent_id: data.parent_id ? parseInt(data.parent_id) : null,
        display_order: data.display_order,
        is_active: data.is_active,
      });
      enqueueSnackbar("Category updated successfully", { variant: "success" });
      handleCloseEditModal();
      mutate(endpoints.refs.categories);
    } catch (error: any) {
      if (error.response?.status === 409) {
        enqueueSnackbar("Slug already exists", { variant: "error" });
      } else if (error.response?.status === 404) {
        enqueueSnackbar("Parent category not found", { variant: "error" });
      } else {
        enqueueSnackbar("Failed to update category", { variant: "error" });
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      await deleteCategory(selectedCategory.id);
      enqueueSnackbar("Category deleted successfully", { variant: "success" });
      handleCloseDeleteDialog();
      mutate(endpoints.refs.categories);
    } catch (error: any) {
      if (error.response?.status === 404) {
        enqueueSnackbar("Category not found", { variant: "error" });
      } else {
        enqueueSnackbar("Failed to delete category", { variant: "error" });
      }
    }
  };

  const handleRefresh = () => {
    mutate(endpoints.refs.categories);
  };

  if (categoriesLoading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (categoriesError) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">
          Error loading categories: {categoriesError.message}
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
                placeholder="Search categories..."
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
                  Add Category
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Card>

        {/* Categories Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell>Parent</TableCell>
                  <TableCell>Display Order</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCategories.map((category: any) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{category.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {category.slug}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {category.parent_name === 'Root Category' ? (
                        <Chip
                          label="Root Category"
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: "#4caf50", // green border for parent
                          }}
                        />
                      ) : (
                        <Chip
                          label={category.parent_name}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: "#2196f3", // blue border for child without name
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {category.display_order || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={category.is_active ? "Active" : "Inactive"} 
                        size="small" 
                        color={category.is_active ? "success" : "default"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {category.created_at ? new Date(category.created_at).toLocaleDateString() : "-"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEditModal(category)}
                        >
                          <Iconify icon="eva:edit-fill" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteDialog(category)}
                        >
                          <Iconify icon="eva:trash-2-fill" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Add Category Modal */}
        <Dialog open={openAddModal} onClose={handleCloseAddModal} maxWidth="sm" fullWidth>
          <form onSubmit={handleSubmit(onSubmitAdd)}>
            <DialogTitle>Add New Category</DialogTitle>
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
                      helperText={errors.slug?.message}
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
                      multiline
                      rows={3}
                      fullWidth
                    />
                  )}
                />
                
                {/* Image Upload Section */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Category Image
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
                        alt="Category preview"
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
                          <Iconify icon="eva:cloud-upload-fill" width={40} sx={{ color: "text.secondary", mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Click to upload image
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            JPG, PNG, WebP (max 5MB)
                          </Typography>
                        </>
                      )}
                    </Box>
                  )}
                </Box>

                <Controller
                  name="parent_id"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Parent Category"
                      SelectProps={{ native: true }}
                      fullWidth
                    >
                      <option value="">No Parent</option>
                      {parentCategories.map((category: any) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </TextField>
                  )}
                />
                <Controller
                  name="display_order"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Display Order"
                      type="number"
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                      <Typography>Active</Typography>
                    </Box>
                  )}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseAddModal}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={uploadingImage}
              >
                Create
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Edit Category Modal */}
        <Dialog open={openEditModal} onClose={handleCloseEditModal} maxWidth="sm" fullWidth>
          <form onSubmit={handleSubmit(onSubmitEdit)}>
            <DialogTitle>Edit Category</DialogTitle>
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
                      helperText={errors.slug?.message}
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
                      multiline
                      rows={3}
                      fullWidth
                    />
                  )}
                />
                
                {/* Image Upload Section */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Category Image
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
                        alt="Category preview"
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
                          <Iconify icon="eva:cloud-upload-fill" width={40} sx={{ color: "text.secondary", mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Click to upload image
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            JPG, PNG, WebP (max 5MB)
                          </Typography>
                        </>
                      )}
                    </Box>
                  )}
                </Box>

                <Controller
                  name="parent_id"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Parent Category"
                      SelectProps={{ native: true }}
                      fullWidth
                    >
                      <option value="">No Parent</option>
                      {parentCategories
                        .filter((category: any) => category.id !== selectedCategory?.id)
                        .map((category: any) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </TextField>
                  )}
                />
                <Controller
                  name="display_order"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Display Order"
                      type="number"
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                      <Typography>Active</Typography>
                    </Box>
                  )}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseEditModal}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={uploadingImage}
              >
                Update
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Delete Category</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the category &quot;{selectedCategory?.name}&quot;?
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
            <Button
              color="error"
              variant="contained"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Container>
  );
}
