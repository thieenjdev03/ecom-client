"use client";

import { useState, useMemo, useCallback, useRef } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSnackbar } from "src/components/snackbar";
import Iconify from "src/components/iconify";
import { useGetColors, createColor, updateColor, deleteColor } from "src/api/reference";
import { mutate } from "swr";
import axios, { endpoints } from "src/utils/axios";

// ----------------------------------------------------------------------

interface ColorFormData {
  name: string;
  hexCode?: string | null;
  imageUrl?: string | null;
}

const colorSchema = yup
  .object({
    name: yup.string().required("Name is required"),
    hexCode: yup
      .string()
      .optional()
      .matches(/^#?[0-9A-Fa-f]{6}$/, "Hex code must be in format #RRGGBB (e.g., #000000)")
      .nullable(),
    imageUrl: yup
      .string()
      .url("Image URL must be a valid URL")
      .nullable()
      .optional(),
  })
  .test("hex-or-image-required", "Either Hex code or Image URL is required", (value) => {
    const hasHex = !!value?.hexCode && value.hexCode.trim().length > 0;
    const hasImage = !!value?.imageUrl && value.imageUrl.trim().length > 0;
    return hasHex || hasImage;
  });

// ----------------------------------------------------------------------

export default function AdminColorsView() {
  const { enqueueSnackbar } = useSnackbar();
  const [searchQuery, setSearchQuery] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { colors, colorsLoading, colorsError } = useGetColors();
  const skeletonRows = useMemo(() => Array.from({ length: 5 }, (_, idx) => idx), []);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ColorFormData>({
    resolver: yupResolver(colorSchema),
    defaultValues: {
      name: "",
      hexCode: "",
      imageUrl: "",
    },
  });

  // Filter colors based on search query
  const filteredColors = colors && colors.length > 0 ? colors.filter((color: any) =>
    color.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (color.hexCode && color.hexCode.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : [];

  const handleOpenAddModal = () => {
    reset();
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
    reset();
  };

  const handleOpenEditModal = (color: any) => {
    setSelectedColor(color);
    setValue("name", color.name);
    setValue("hexCode", color.hexCode || "");
    setValue("imageUrl", color.imageUrl || "");
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedColor(null);
    reset();
  };

  const handleOpenDeleteDialog = (color: any) => {
    setSelectedColor(color);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedColor(null);
  };

  const normalizeHexCode = (hex?: string | null): string | undefined => {
    if (!hex || !hex.trim()) return undefined;
    const trimmed = hex.trim();
    const normalized = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
    return normalized.toUpperCase();
  };

  const handleUploadImage = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      const MAX_SIZE = 5 * 1024 * 1024;

      if (!ACCEPTED_TYPES.includes(file.type)) {
        enqueueSnackbar("Only JPG, PNG and WEBP images are allowed", { variant: "error" });
        return;
      }

      if (file.size > MAX_SIZE) {
        enqueueSnackbar("Image file size must be less than 5MB", { variant: "error" });
        return;
      }

      setUploadingImage(true);

      try {
        const formData = new FormData();
        formData.append("files", file);
        formData.append("folder", "colors");

        const response = await axios.post(endpoints.files.uploadMultiple, formData, {
          headers: {},
        });

        const apiResponse = response.data;
        const uploadedFiles = apiResponse?.data?.files || apiResponse?.files || [];
        const firstFile = Array.isArray(uploadedFiles) ? uploadedFiles[0] : null;

        if (!firstFile?.url || firstFile?.success === false) {
          enqueueSnackbar("Failed to upload color image", { variant: "error" });
          return;
        }

        setValue("imageUrl", firstFile.url, { shouldValidate: true });
        enqueueSnackbar("Color image uploaded successfully", { variant: "success" });
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to upload color image";
        enqueueSnackbar(message, { variant: "error" });
      } finally {
        setUploadingImage(false);
        if (event.target) {
          event.target.value = "";
        }
      }
    },
    [enqueueSnackbar, setValue],
  );

  const onSubmitAdd = async (data: ColorFormData) => {
    try {
      await createColor({
        name: data.name.trim(),
        hexCode: normalizeHexCode(data.hexCode),
        imageUrl: data.imageUrl?.trim() || undefined,
      });
      enqueueSnackbar("Color created successfully", { variant: "success" });
      handleCloseAddModal();
      mutate(endpoints.refs.colors);
    } catch (error: any) {
      if (error.response?.status === 409) {
        enqueueSnackbar("Color already exists", { variant: "error" });
      } else {
        enqueueSnackbar("Failed to create color", { variant: "error" });
      }
    }
  };

  const onSubmitEdit = async (data: ColorFormData) => {
    if (!selectedColor) return;

    try {
      await updateColor({
        id: selectedColor.id,
        name: data.name.trim(),
        hexCode: normalizeHexCode(data.hexCode),
        imageUrl: data.imageUrl?.trim() || undefined,
      });
      enqueueSnackbar("Color updated successfully", { variant: "success" });
      handleCloseEditModal();
      mutate(endpoints.refs.colors);
    } catch (error: any) {
      if (error.response?.status === 409) {
        enqueueSnackbar("Color already exists", { variant: "error" });
      } else if (error.response?.status === 400) {
        enqueueSnackbar("Unable to update color", { variant: "error" });
      } else {
        enqueueSnackbar("Failed to update color", { variant: "error" });
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedColor) return;

    try {
      await deleteColor(selectedColor.id);
      enqueueSnackbar("Color deleted successfully", { variant: "success" });
      handleCloseDeleteDialog();
      mutate(endpoints.refs.colors);
    } catch (error: any) {
      if (error.response?.status === 404) {
        enqueueSnackbar("Color not found", { variant: "error" });
      } else {
        enqueueSnackbar("Failed to delete color", { variant: "error" });
      }
    }
  };

  const handleRefresh = () => {
    mutate(endpoints.refs.colors);
  };

  if (colorsLoading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (colorsError) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">
          Error loading colors: {colorsError.message}
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
                placeholder="Search colors..."
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
                  Add Color
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Card>

        {/* Colors Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Hex Code</TableCell>
                  <TableCell>Preview</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {colorsLoading ? (
                  skeletonRows.map((row) => (
                    <TableRow key={`color-skeleton-${row}`}>
                      <TableCell>
                        <Skeleton width="70%" />
                      </TableCell>
                      <TableCell>
                        <Skeleton width="40%" />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: 1 }} />
                      </TableCell>
                      <TableCell>
                        <Skeleton width="60%" />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Skeleton variant="circular" width={32} height={32} />
                          <Skeleton variant="circular" width={32} height={32} />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredColors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No colors found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredColors.map((color: any) => (
                    <TableRow key={color.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{color.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {color.hexCode || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {color.imageUrl ? (
                          <Box
                            component="img"
                            src={color.imageUrl}
                            alt={color.name}
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 1,
                              border: "1px solid",
                              borderColor: "divider",
                              objectFit: "cover",
                              bgcolor: "background.paper",
                            }}
                            onError={(e) => {
                              // Hide broken image preview and rely on hex fallback if available
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : color.hexCode ? (
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: color.hexCode,
                              border: "1px solid",
                              borderColor: "divider",
                              borderRadius: 1,
                            }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {color.createdAt ? new Date(color.createdAt).toLocaleDateString() : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEditModal(color)}
                          >
                            <Iconify icon="eva:edit-fill" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(color)}
                          >
                            <Iconify icon="eva:trash-2-fill" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Add Color Modal */}
        <Dialog open={openAddModal} onClose={handleCloseAddModal} maxWidth="sm" fullWidth>
          <form onSubmit={handleSubmit(onSubmitAdd)}>
            <DialogTitle>Add New Color</DialogTitle>
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
                      required
                    />
                  )}
                />
                <Controller
                  name="hexCode"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Hex Code (e.g., #000000)"
                      placeholder="#000000"
                      error={!!errors.hexCode}
                      helperText={
                        errors.hexCode?.message ||
                        "Optional if image is provided. Format #RRGGBB (e.g. #000000)"
                      }
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="imageUrl"
                  control={control}
                  render={({ field }) => (
                    <Stack spacing={1}>
                      <TextField
                        {...field}
                        label="Image URL"
                        placeholder="https://cdn.example.com/colors/black.png"
                        error={!!errors.imageUrl}
                        helperText={
                          errors.imageUrl?.message ||
                          "Optional if hex code is provided. You can paste URL or upload an image."
                        }
                        fullWidth
                      />
                      <Stack direction="row" spacing={1} alignItems="center">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          style={{ display: "none" }}
                          onChange={handleUploadImage}
                          disabled={uploadingImage}
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                        >
                          {uploadingImage ? "Uploading..." : "Upload image"}
                        </Button>
                        {field.value && field.value.trim() && (
                          <Box
                            component="img"
                            src={field.value}
                            alt="Color preview"
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 1,
                              border: "1px solid",
                              borderColor: "divider",
                              objectFit: "cover",
                            }}
                          />
                        )}
                      </Stack>
                    </Stack>
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

        {/* Edit Color Modal */}
        <Dialog open={openEditModal} onClose={handleCloseEditModal} maxWidth="sm" fullWidth>
          <form onSubmit={handleSubmit(onSubmitEdit)}>
            <DialogTitle>Edit Color</DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 1 }}>
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
                      required
                    />
                  )}
                />

                {/* Current Preview Section */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Current Preview
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Controller
                      name="imageUrl"
                      control={control}
                      render={({ field }) => (
                        <>
                          {field.value && field.value.trim() ? (
                            <Box
                              sx={{
                                position: "relative",
                                width: 80,
                                height: 80,
                                borderRadius: 1,
                                border: "2px solid",
                                borderColor: "divider",
                                overflow: "hidden",
                                bgcolor: "background.paper",
                              }}
                            >
                              <Box
                                component="img"
                                src={field.value}
                                alt="Color preview"
                                sx={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+";
                                }}
                              />
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  field.onChange("");
                                  setValue("imageUrl", "", { shouldValidate: true });
                                }}
                                sx={{
                                  position: "absolute",
                                  top: 4,
                                  right: 4,
                                  bgcolor: "error.main",
                                  color: "common.white",
                                  "&:hover": {
                                    bgcolor: "error.darker",
                                  },
                                }}
                              >
                                <Iconify icon="eva:close-fill" width={16} />
                              </IconButton>
                            </Box>
                          ) : null}
                        </>
                      )}
                    />
                    <Controller
                      name="hexCode"
                      control={control}
                      render={({ field }) => (
                        <>
                          {field.value && field.value.trim() ? (
                            <Stack spacing={0.5} alignItems="center">
                              <Box
                                sx={{
                                  width: 80,
                                  height: 80,
                                  bgcolor: field.value,
                                  border: "2px solid",
                                  borderColor: "divider",
                                  borderRadius: 1,
                                }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {field.value}
                              </Typography>
                            </Stack>
                          ) : null}
                        </>
                      )}
                    />
                    {(!watch("imageUrl") || !watch("imageUrl")?.trim()) &&
                      (!watch("hexCode") || !watch("hexCode")?.trim()) && (
                        <Typography variant="body2" color="text.secondary">
                          No preview available. Please add hex code or image.
                        </Typography>
                      )}
                  </Stack>
                </Box>

                {/* Hex Code Input */}
                <Controller
                  name="hexCode"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Hex Code (e.g., #000000)"
                      placeholder="#000000"
                      error={!!errors.hexCode}
                      helperText={
                        errors.hexCode?.message ||
                        "Optional if image is provided. Format #RRGGBB (e.g. #000000)"
                      }
                      fullWidth
                    />
                  )}
                />

                {/* Image URL Input */}
                <Controller
                  name="imageUrl"
                  control={control}
                  render={({ field }) => (
                    <Stack spacing={1}>
                      <TextField
                        {...field}
                        label="Image URL"
                        placeholder="https://cdn.example.com/colors/black.png"
                        error={!!errors.imageUrl}
                        helperText={
                          errors.imageUrl?.message ||
                          "Optional if hex code is provided. You can paste URL or upload an image."
                        }
                        fullWidth
                      />
                      <Stack direction="row" spacing={1} alignItems="center">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          style={{ display: "none" }}
                          onChange={handleUploadImage}
                          disabled={uploadingImage}
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Iconify icon="eva:cloud-upload-fill" />}
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                        >
                          {uploadingImage ? "Uploading..." : "Upload new image"}
                        </Button>
                        {field.value && field.value.trim() && (
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            startIcon={<Iconify icon="eva:trash-2-outline" />}
                            onClick={() => {
                              field.onChange("");
                              setValue("imageUrl", "", { shouldValidate: true });
                            }}
                          >
                            Remove image
                          </Button>
                        )}
                      </Stack>
                    </Stack>
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
          <DialogTitle>Delete Color</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the color &quot;{selectedColor?.name}&quot;?
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


