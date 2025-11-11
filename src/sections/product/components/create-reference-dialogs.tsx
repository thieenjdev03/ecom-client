import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import LoadingButton from '@mui/lab/LoadingButton';
import { useSWRConfig } from 'swr';

import { RHFTextField } from 'src/components/hook-form';
import { useSnackbar } from 'src/components/snackbar';
import { createCategory, createColor, createSize } from 'src/api/reference';
import { endpoints } from 'src/utils/axios';
import { useTranslate } from 'src/locales';

type CreateReferenceDialogsProps = {
  categoryId?: string;
};

/**
 * Dialogs for creating new categories, colors, and sizes
 * Used in product form when user needs to add new reference data
 */
export default function CreateReferenceDialogs({ categoryId }: CreateReferenceDialogsProps) {
  const { t } = useTranslate();
  const { mutate } = useSWRConfig();
  const { enqueueSnackbar } = useSnackbar();

  const [openCreateCategory, setOpenCreateCategory] = useState(false);
  const [openCreateColor, setOpenCreateColor] = useState(false);
  const [openCreateSize, setOpenCreateSize] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('');
  const [newSizeName, setNewSizeName] = useState('');

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    const slugFromName = newCategoryName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    await createCategory({ name: newCategoryName.trim(), slug: slugFromName });
    await mutate(endpoints.refs.categories);
    setNewCategoryName('');
    setOpenCreateCategory(false);
  };

  const handleCreateColor = async () => {
    if (!newColorName.trim()) return;

    const hex = newColorHex.trim();
    if (hex) {
      const isValidHex = /^#?[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/.test(hex);
      if (!isValidHex) {
        enqueueSnackbar('Hex color must be 3 or 6 hex digits (e.g. #FF0000)', { variant: 'error' });
        return;
      }
    }

    const normalizedHex = hex ? (hex.startsWith('#') ? hex : `#${hex}`).toUpperCase() : undefined;
    await createColor({ name: newColorName.trim(), hexCode: normalizedHex });
    await mutate(endpoints.refs.colors);
    setNewColorName('');
    setNewColorHex('');
    setOpenCreateColor(false);
  };

  const handleCreateSize = async () => {
    if (!newSizeName.trim()) return;

    await createSize({ name: newSizeName.trim(), categoryId: categoryId || undefined });
    await mutate([endpoints.refs.sizes, { params: { categoryId } }]);
    setNewSizeName('');
    setOpenCreateSize(false);
  };

  return (
    <>
      {/* Create Category Dialog */}
      <Dialog
        open={openCreateCategory}
        onClose={() => setOpenCreateCategory(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{t('productForm.newCategory')}</DialogTitle>
        <DialogContent>
          <RHFTextField
            name="_newCategoryName"
            label={t('productForm.categoryName')}
            value={newCategoryName}
            onChange={(e: any) => setNewCategoryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateCategory(false)}>{t('productForm.cancel')}</Button>
          <LoadingButton variant="contained" onClick={handleCreateCategory}>
            {t('productForm.create')}
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Create Color Dialog */}
      <Dialog
        open={openCreateColor}
        onClose={() => setOpenCreateColor(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{t('productForm.newColor')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <RHFTextField
              name="_newColorName"
              label={t('productForm.colorName')}
              value={newColorName}
              onChange={(e: any) => setNewColorName(e.target.value)}
            />
            <RHFTextField
              name="_newColorHex"
              label={t('productForm.hexOptional')}
              value={newColorHex}
              onChange={(e: any) => setNewColorHex(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateColor(false)}>{t('productForm.cancel')}</Button>
          <LoadingButton variant="contained" onClick={handleCreateColor}>
            {t('productForm.create')}
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Create Size Dialog */}
      <Dialog
        open={openCreateSize}
        onClose={() => setOpenCreateSize(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{t('productForm.newSize')}</DialogTitle>
        <DialogContent>
          <RHFTextField
            name="_newSizeName"
            label={t('productForm.sizeName')}
            value={newSizeName}
            onChange={(e: any) => setNewSizeName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateSize(false)}>{t('productForm.cancel')}</Button>
          <LoadingButton variant="contained" onClick={handleCreateSize}>
            {t('productForm.create')}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function useCreateReferenceDialogs() {
  const [openCreateCategory, setOpenCreateCategory] = useState(false);
  const [openCreateColor, setOpenCreateColor] = useState(false);
  const [openCreateSize, setOpenCreateSize] = useState(false);

  return {
    openCreateCategory,
    setOpenCreateCategory,
    openCreateColor,
    setOpenCreateColor,
    openCreateSize,
    setOpenCreateSize,
  };
}

