"use client";

import { useState, useMemo } from "react";
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
import { endpoints } from "src/utils/axios";

// ----------------------------------------------------------------------

interface ColorFormData {
  name: string;
  hexCode?: string;
}

const colorSchema = yup.object({
  name: yup.string().required("Name is required"),
  hexCode: yup
    .string()
    .optional()
    .matches(/^#?[0-9A-Fa-f]{6}$/, "Hex code must be in format #RRGGBB (e.g., #000000)"),
});

// ----------------------------------------------------------------------

export default function AdminColorsView() {
  const { enqueueSnackbar } = useSnackbar();
  const [searchQuery, setSearchQuery] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedColor, setSelectedColor] = useState<any>(null);

  const { colors, colorsLoading, colorsError } = useGetColors();
  const skeletonRows = useMemo(() => Array.from({ length: 5 }, (_, idx) => idx), []);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ColorFormData>({
    resolver: yupResolver(colorSchema),
    defaultValues: {
      name: "",
      hexCode: "",
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

  const normalizeHexCode = (hex?: string): string | undefined => {
    if (!hex || !hex.trim()) return undefined;
    const trimmed = hex.trim();
    const normalized = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
    return normalized.toUpperCase();
  };

  const onSubmitAdd = async (data: ColorFormData) => {
    try {
      await createColor({
        name: data.name.trim(),
        hexCode: normalizeHexCode(data.hexCode),
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
                        {color.hexCode ? (
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
                      helperText={errors.hexCode?.message || "Optional: Format #RRGGBB"}
                      fullWidth
                    />
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
                      helperText={errors.hexCode?.message || "Optional: Format #RRGGBB"}
                      fullWidth
                    />
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


