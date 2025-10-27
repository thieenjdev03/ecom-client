"use client";

import { useState, useCallback } from "react";
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
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSnackbar } from "src/components/snackbar";
import Iconify from "src/components/iconify";
import { useGetCategories, createCategory, updateCategory, deleteCategory } from "src/api/reference";
import { mutate } from "swr";
import { endpoints } from "src/utils/axios";

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
  const filteredCategories = categories?.filter((category: any) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Get parent categories for dropdown
  const parentCategories = categories?.filter((category: any) => !category.parent) || [];

  const handleOpenAddModal = () => {
    reset();
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
    reset();
  };

  const handleOpenEditModal = (category: any) => {
    setSelectedCategory(category);
    setValue("name", category.name);
    setValue("slug", category.slug);
    setValue("description", category.description || "");
    setValue("image_url", category.image_url || "");
    setValue("parent_id", category.parent?.id || "");
    setValue("display_order", category.display_order || 0);
    setValue("is_active", category.is_active ?? true);
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedCategory(null);
    reset();
  };

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
        parent_id: data.parent_id ? parseInt(data.parent_id) : null,
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
        {/* Header */}
        <Box>
          <Typography variant="h4" gutterBottom>
            Manage Categories
          </Typography>
        </Box>

        {/* Search and Actions */}
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
                  <TableCell>Children Count</TableCell>
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
                      {category.parent ? (
                        <Chip label={category.parent.name} size="small" variant="outlined" />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Root Category
                        </Typography>
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
                      <Typography variant="body2">
                        {category.children?.length || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(category.createdAt).toLocaleDateString()}
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
                <Controller
                  name="image_url"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Image URL"
                      error={!!errors.image_url}
                      helperText={errors.image_url?.message}
                      fullWidth
                    />
                  )}
                />
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
                <Controller
                  name="image_url"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Image URL"
                      error={!!errors.image_url}
                      helperText={errors.image_url?.message}
                      fullWidth
                    />
                  )}
                />
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
              Are you sure you want to delete the category "{selectedCategory?.name}"?
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
