"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Card,
  Table,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableContainer,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import Iconify from "src/components/iconify";
import { useSnackbar } from "src/components/snackbar";
import { useGetSizes, useGetCategories, createSize, updateSize, deleteSize } from "src/api/reference";

// ----------------------------------------------------------------------

type SizeForm = { name: string; categoryId?: string; sortOrder?: number };

export default function AdminSizesView() {
  const { enqueueSnackbar } = useSnackbar();
  const { categories } = useGetCategories();
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const { sizes, sizesLoading, sizesError } = useGetSizes(categoryFilter);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const [form, setForm] = useState<SizeForm>({ name: "", categoryId: undefined, sortOrder: 0 });

  const handleOpenAdd = () => {
    setForm({ name: "", categoryId: undefined, sortOrder: 0 });
    setOpenAdd(true);
  };
  const handleCloseAdd = () => setOpenAdd(false);

  const handleOpenEdit = (row: any) => {
    setSelected(row);
    setForm({ name: row.name || "", categoryId: row.category?.id || undefined, sortOrder: row.sortOrder ?? 0 });
    setOpenEdit(true);
  };
  const handleCloseEdit = () => {
    setSelected(null);
    setOpenEdit(false);
  };

  const handleOpenDelete = (row: any) => {
    setSelected(row);
    setOpenDelete(true);
  };
  const handleCloseDelete = () => {
    setSelected(null);
    setOpenDelete(false);
  };

  const onSubmitAdd = async () => {
    try {
      await createSize({ name: form.name.trim(), categoryId: form.categoryId });
      enqueueSnackbar("Size created", { variant: "success" });
      handleCloseAdd();
    } catch (e: any) {
      if (e?.statusCode === 404) enqueueSnackbar("Category not found", { variant: "error" });
      else enqueueSnackbar("Failed to create size", { variant: "error" });
    }
  };

  const onSubmitEdit = async () => {
    if (!selected?.id) return;
    try {
      await updateSize({ id: selected.id, name: form.name.trim(), categoryId: form.categoryId, sortOrder: form.sortOrder });
      enqueueSnackbar("Size updated", { variant: "success" });
      handleCloseEdit();
    } catch (e: any) {
      if (e?.statusCode === 404) enqueueSnackbar("Category not found", { variant: "error" });
      else enqueueSnackbar("Failed to update size", { variant: "error" });
    }
  };

  const onConfirmDelete = async () => {
    if (!selected?.id) return;
    try {
      await deleteSize(selected.id);
      enqueueSnackbar("Size deleted", { variant: "success" });
      handleCloseDelete();
    } catch {
      enqueueSnackbar("Failed to delete size", { variant: "error" });
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">Manage Sizes</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="size-category-filter">Filter by category</InputLabel>
            <Select
              labelId="size-category-filter"
              label="Filter by category"
              value={categoryFilter || ""}
              onChange={(e) => setCategoryFilter(e.target.value ? String(e.target.value) : undefined)}
            >
              <MenuItem value=""><em>All</em></MenuItem>
              {categories.map((c: any) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<Iconify icon="solar:add-square-bold" />} onClick={handleOpenAdd}>
            Add Size
          </Button>
        </Stack>
      </Stack>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Sort Order</TableCell>
                <TableCell width={120} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sizesLoading && (
                <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>
              )}
              {sizesError && (
                <TableRow><TableCell colSpan={4}>Failed to load</TableCell></TableRow>
              )}
              {!sizesLoading && !sizesError && sizes?.length === 0 && (
                <TableRow><TableCell colSpan={4}>No sizes</TableCell></TableRow>
              )}
              {sizes?.map((row: any) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.category?.name || '-'}</TableCell>
                  <TableCell>{row.sortOrder ?? 0}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpenEdit(row)} aria-label="edit">
                      <Iconify icon="solar:pen-bold" />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleOpenDelete(row)} aria-label="delete">
                      <Iconify icon="solar:trash-bin-minimalistic-bold" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add Dialog */}
      <Dialog open={openAdd} onClose={handleCloseAdd} fullWidth maxWidth="xs">
        <DialogTitle>New Size</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField autoFocus label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} fullWidth />
            <FormControl fullWidth>
              <InputLabel id="add-size-category">Category</InputLabel>
              <Select
                labelId="add-size-category"
                label="Category"
                value={form.categoryId || ""}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: String(e.target.value) || undefined }))}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {categories.map((c: any) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField type="number" label="Sort Order" value={form.sortOrder ?? 0} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAdd}>Cancel</Button>
          <Button variant="contained" onClick={onSubmitAdd} disabled={!form.name.trim()}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onClose={handleCloseEdit} fullWidth maxWidth="xs">
        <DialogTitle>Edit Size</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField autoFocus label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} fullWidth />
            <FormControl fullWidth>
              <InputLabel id="edit-size-category">Category</InputLabel>
              <Select
                labelId="edit-size-category"
                label="Category"
                value={form.categoryId || ""}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: String(e.target.value) || undefined }))}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {categories.map((c: any) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField type="number" label="Sort Order" value={form.sortOrder ?? 0} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancel</Button>
          <Button variant="contained" onClick={onSubmitEdit} disabled={!form.name.trim()}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={openDelete} onClose={handleCloseDelete} fullWidth maxWidth="xs">
        <DialogTitle>Delete Size</DialogTitle>
        <DialogContent>
          <Typography>Are you sure to delete "{selected?.name}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancel</Button>
          <Button color="error" variant="contained" onClick={onConfirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


