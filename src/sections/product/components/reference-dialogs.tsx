import { useState } from "react";
import { useSWRConfig } from "swr";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";
import Stack from "@mui/material/Stack";
import { useSnackbar } from "src/components/snackbar";
import { endpoints } from "src/utils/axios";
import { createCategory, createColor, createSize } from "src/api/reference";

// ----------------------------------------------------------------------

interface ReferenceDialogsProps {
  t: (key: string, options?: any) => string;
  currentCategoryId?: string;
  openCreateCategory: boolean;
  openCreateColor: boolean;
  openCreateSize: boolean;
  onCloseCategory: () => void;
  onCloseColor: () => void;
  onCloseSize: () => void;
}

export default function ReferenceDialogs({
  t,
  currentCategoryId,
  openCreateCategory,
  openCreateColor,
  openCreateSize,
  onCloseCategory,
  onCloseColor,
  onCloseSize,
}: ReferenceDialogsProps) {
  const { mutate } = useSWRConfig();
  const { enqueueSnackbar } = useSnackbar();

  // Category Dialog State
  const [newCategoryName, setNewCategoryName] = useState("");

  // Color Dialog State
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("");

  // Size Dialog State
  const [newSizeName, setNewSizeName] = useState("");

  // Handle Create Category
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    const slugFromName = newCategoryName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    await createCategory({ name: newCategoryName.trim(), slug: slugFromName });
    await mutate(endpoints.refs.categories);
    setNewCategoryName("");
    onCloseCategory();
    enqueueSnackbar(t("productForm.categoryCreated"), { variant: "success" });
  };

  // Handle Create Color
  const handleCreateColor = async () => {
    if (!newColorName.trim()) return;

    const hex = newColorHex.trim();
    if (hex) {
      const isValidHex = /^#?[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/.test(hex);
      if (!isValidHex) {
        enqueueSnackbar("Hex color must be 3 or 6 hex digits (e.g. #FF0000)", {
          variant: "error",
        });
        return;
      }
    }

    const normalizedHex = hex
      ? (hex.startsWith("#") ? hex : `#${hex}`).toUpperCase()
      : undefined;
    await createColor({ name: newColorName.trim(), hexCode: normalizedHex });
    await mutate(endpoints.refs.colors);
    setNewColorName("");
    setNewColorHex("");
    onCloseColor();
    enqueueSnackbar(t("productForm.colorCreated"), { variant: "success" });
  };

  // Handle Create Size
  const handleCreateSize = async () => {
    if (!newSizeName.trim()) return;

    await createSize({
      name: newSizeName.trim(),
      categoryId: currentCategoryId || undefined,
    });
    await mutate([endpoints.refs.sizes, { params: { categoryId: currentCategoryId } }]);
    setNewSizeName("");
    onCloseSize();
    enqueueSnackbar(t("productForm.sizeCreated"), { variant: "success" });
  };

  return (
    <>
      {/* Create Category Dialog */}
      <Dialog open={openCreateCategory} onClose={onCloseCategory} fullWidth maxWidth="xs">
        <DialogTitle>{t("productForm.newCategory")}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label={t("productForm.categoryName")}
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseCategory}>{t("productForm.cancel")}</Button>
          <LoadingButton variant="contained" onClick={handleCreateCategory}>
            {t("productForm.create")}
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Create Color Dialog */}
      <Dialog open={openCreateColor} onClose={onCloseColor} fullWidth maxWidth="xs">
        <DialogTitle>{t("productForm.newColor")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label={t("productForm.colorName")}
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              autoFocus
            />
            <TextField
              fullWidth
              label={t("productForm.hexOptional")}
              value={newColorHex}
              onChange={(e) => setNewColorHex(e.target.value)}
              placeholder="#FF0000"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseColor}>{t("productForm.cancel")}</Button>
          <LoadingButton variant="contained" onClick={handleCreateColor}>
            {t("productForm.create")}
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Create Size Dialog */}
      <Dialog open={openCreateSize} onClose={onCloseSize} fullWidth maxWidth="xs">
        <DialogTitle>{t("productForm.newSize")}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label={t("productForm.sizeName")}
            value={newSizeName}
            onChange={(e) => setNewSizeName(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseSize}>{t("productForm.cancel")}</Button>
          <LoadingButton variant="contained" onClick={handleCreateSize}>
            {t("productForm.create")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

