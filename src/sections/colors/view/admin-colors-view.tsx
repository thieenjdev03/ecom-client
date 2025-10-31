"use client";

import { useState } from "react";
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
} from "@mui/material";
import Iconify from "src/components/iconify";
import { useSnackbar } from "src/components/snackbar";
import { useGetColors, createColor, updateColor, deleteColor } from "src/api/reference";

// ----------------------------------------------------------------------

type ColorForm = { name: string; hexCode?: string };

export default function AdminColorsView() {
  const { enqueueSnackbar } = useSnackbar();
  const { colors, colorsLoading, colorsError } = useGetColors();

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const [form, setForm] = useState<ColorForm>({ name: "", hexCode: "" });

  const handleOpenAdd = () => {
    setForm({ name: "", hexCode: "" });
    setOpenAdd(true);
  };
  const handleCloseAdd = () => setOpenAdd(false);

  const handleOpenEdit = (row: any) => {
    setSelected(row);
    setForm({ name: row.name || "", hexCode: row.hexCode || "" });
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
      const hex = (form.hexCode || "").trim();
      const hexNorm = hex ? (hex.startsWith("#") ? hex : `#${hex}`).toUpperCase() : undefined;
      await createColor({ name: form.name.trim(), hexCode: hexNorm });
      enqueueSnackbar("Color created", { variant: "success" });
      handleCloseAdd();
    } catch (e: any) {
      if (e?.statusCode === 409) enqueueSnackbar("Color already exists", { variant: "error" });
      else enqueueSnackbar("Failed to create color", { variant: "error" });
    }
  };

  const onSubmitEdit = async () => {
    if (!selected?.id) return;
    try {
      const hex = (form.hexCode || "").trim();
      const hexNorm = hex ? (hex.startsWith("#") ? hex : `#${hex}`).toUpperCase() : undefined;
      await updateColor({ id: selected.id, name: form.name.trim(), hexCode: hexNorm });
      enqueueSnackbar("Color updated", { variant: "success" });
      handleCloseEdit();
    } catch (e: any) {
      if (e?.statusCode === 409) enqueueSnackbar("Color already exists", { variant: "error" });
      else enqueueSnackbar("Failed to update color", { variant: "error" });
    }
  };

  const onConfirmDelete = async () => {
    if (!selected?.id) return;
    try {
      await deleteColor(selected.id);
      enqueueSnackbar("Color deleted", { variant: "success" });
      handleCloseDelete();
    } catch {
      enqueueSnackbar("Failed to delete color", { variant: "error" });
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">Manage Colors</Typography>
        <Button variant="contained" startIcon={<Iconify icon="solar:add-square-bold" />} onClick={handleOpenAdd}>
          Add Color
        </Button>
      </Stack>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Hex</TableCell>
                <TableCell width={120} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {colorsLoading && (
                <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>
              )}
              {colorsError && (
                <TableRow><TableCell colSpan={3}>Failed to load</TableCell></TableRow>
              )}
              {!colorsLoading && !colorsError && colors?.length === 0 && (
                <TableRow><TableCell colSpan={3}>No colors</TableCell></TableRow>
              )}
              {colors?.map((row: any) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    {row.hexCode}
                    {row.hexCode ? (
                      <Box component="span" sx={{ display: "inline-block", ml: 1, width: 16, height: 16, bgcolor: row.hexCode, border: '1px solid rgba(0,0,0,0.1)', verticalAlign: 'middle' }} />
                    ) : null}
                  </TableCell>
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
        <DialogTitle>New Color</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField autoFocus label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} fullWidth />
            <TextField label="Hex (e.g. #000000)" value={form.hexCode || ""} onChange={(e) => setForm((f) => ({ ...f, hexCode: e.target.value }))} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAdd}>Cancel</Button>
          <Button variant="contained" onClick={onSubmitAdd} disabled={!form.name.trim()}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onClose={handleCloseEdit} fullWidth maxWidth="xs">
        <DialogTitle>Edit Color</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField autoFocus label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} fullWidth />
            <TextField label="Hex (e.g. #000000)" value={form.hexCode || ""} onChange={(e) => setForm((f) => ({ ...f, hexCode: e.target.value }))} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancel</Button>
          <Button variant="contained" onClick={onSubmitEdit} disabled={!form.name.trim()}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={openDelete} onClose={handleCloseDelete} fullWidth maxWidth="xs">
        <DialogTitle>Delete Color</DialogTitle>
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


