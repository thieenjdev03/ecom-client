import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

import {
  _tags,
  PRODUCT_SIZE_OPTIONS,
  PRODUCT_GENDER_OPTIONS,
  PRODUCT_COLOR_NAME_OPTIONS,
  PRODUCT_CATEGORY_GROUP_OPTIONS,
} from 'src/_mock';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSelect,
  RHFEditor,
  RHFUpload,
  RHFSwitch,
  RHFTextField,
  RHFMultiSelect,
  RHFAutocomplete,
  RHFMultiCheckbox,
} from 'src/components/hook-form';

import { IProductItem } from 'src/types/product';
import { useGetCategories, useGetColors, useGetSizes } from 'src/api/reference';
import { createProduct } from 'src/api/product';

// ----------------------------------------------------------------------

type Props = {
  currentProduct?: IProductItem;
};

export default function ProductNewEditForm({ currentProduct }: Props) {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const [includeTaxes, setIncludeTaxes] = useState(false);

  const NewProductSchema = Yup.object().shape({
    productCode: Yup.string().required('Product code is required'),
    productSku: Yup.string().nullable(),
    categoryId: Yup.string().required('Category is required'),
    quantity: Yup.number().min(0).required('Quantity is required'),
    tags: Yup.array().of(Yup.string()),
    gender: Yup.array().of(Yup.string()),
    saleLabel: Yup.string().nullable(),
    newLabel: Yup.string().nullable(),
    isSale: Yup.boolean(),
    isNew: Yup.boolean(),
    colorIds: Yup.array().of(Yup.string()).min(1, 'Select at least 1 color').required(),
    sizeIds: Yup.array().of(Yup.string()).min(1, 'Select at least 1 size').required(),
  });

  const defaultValues = useMemo(
    () => ({
      productCode: '',
      productSku: '',
      categoryId: '',
      quantity: 0,
      tags: [] as string[],
      gender: [] as string[],
      saleLabel: '',
      newLabel: '',
      isSale: false,
      isNew: false,
      colorIds: [] as string[],
      sizeIds: [] as string[],
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const { categories } = useGetCategories();
  const { colors } = useGetColors();
  const { sizes } = useGetSizes(values.categoryId);

  useEffect(() => {
    if (currentProduct) {
      reset(defaultValues);
    }
  }, [currentProduct, defaultValues, reset]);

  // no taxes in backend DTO; remove taxes toggling

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        productCode: data.productCode,
        productSku: data.productSku || undefined,
        categoryId: data.categoryId,
        quantity: Number(data.quantity) || 0,
        tags: data.tags || [],
        gender: data.gender || [],
        saleLabel: data.saleLabel || undefined,
        newLabel: data.newLabel || undefined,
        isSale: !!data.isSale,
        isNew: !!data.isNew,
        colorIds: data.colorIds,
        sizeIds: data.sizeIds,
      };

      const created = await createProduct(payload);
      enqueueSnackbar('Create success!');
      const newId = created?.id || created?.data?.id;
      if (newId) {
        router.push(paths.dashboard.product.details(newId));
      } else {
        router.push(paths.dashboard.product.root);
      }
    } catch (error) {
      console.error(error);
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const files = values.images || [];

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      setValue('images', [...files, ...newFiles], { shouldValidate: true });
    },
    [setValue, values.images]
  );

  const handleRemoveFile = useCallback(
    (inputFile: File | string) => {
      const filtered = values.images && values.images?.filter((file) => file !== inputFile);
      setValue('images', filtered);
    },
    [setValue, values.images]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValue('images', []);
  }, [setValue]);

  const handleChangeIncludeTaxes = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeTaxes(event.target.checked);
  }, []);

  const renderDetails = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Details
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Title, short description, image...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField name="productCode" label="Product Code" />
            <RHFTextField name="productSku" label="Product SKU" />
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderProperties = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Properties
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Additional functions and attributes...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Properties" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Box
              columnGap={2}
              rowGap={3}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                md: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField
                name="quantity"
                label="Quantity"
                placeholder="0"
                type="number"
                InputLabelProps={{ shrink: true }}
              />

              <RHFSelect native name="categoryId" label="Category" InputLabelProps={{ shrink: true }}>
                <option value="" />
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </RHFSelect>

              <RHFMultiSelect
                checkbox
                name="colorIds"
                label="Colors"
                options={colors.map((c: any) => ({ label: c.name, value: c.id }))}
              />

              <RHFMultiSelect
                checkbox
                name="sizeIds"
                label="Sizes"
                options={sizes.map((s: any) => ({ label: s.name, value: s.id }))}
              />
            </Box>

            <RHFAutocomplete
              name="tags"
              label="Tags"
              placeholder="+ Tags"
              multiple
              freeSolo
              options={_tags.map((option) => option)}
              getOptionLabel={(option) => option}
              renderOption={(props, option) => (
                <li {...props} key={option}>
                  {option}
                </li>
              )}
              renderTags={(selected, getTagProps) =>
                selected.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    label={option}
                    size="small"
                    color="info"
                    variant="soft"
                  />
                ))
              }
            />

            <Stack spacing={1}>
              <Typography variant="subtitle2">Gender</Typography>
              <RHFMultiCheckbox row name="gender" spacing={2} options={PRODUCT_GENDER_OPTIONS} />
            </Stack>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Stack direction="row" alignItems="center" spacing={3}>
              <RHFSwitch name="isSale" label={null} sx={{ m: 0 }} />
              <RHFTextField name="saleLabel" label="Sale Label" fullWidth disabled={!values.isSale} />
            </Stack>

            <Stack direction="row" alignItems="center" spacing={3}>
              <RHFSwitch name="isNew" label={null} sx={{ m: 0 }} />
              <RHFTextField name="newLabel" label="New Label" fullWidth disabled={!values.isNew} />
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderPricing = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Pricing
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Price related inputs
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Pricing" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Variant pricing will be added per-variant after product creation.
            </Typography>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      {mdUp && <Grid md={4} />}
      <Grid xs={12} md={8} sx={{ display: 'flex', alignItems: 'center' }}>
        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Publish"
          sx={{ flexGrow: 1, pl: 3 }}
        />

        <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
          {!currentProduct ? 'Create Product' : 'Save Changes'}
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderDetails}

        {renderProperties}

        {renderPricing}

        {renderActions}
      </Grid>
    </FormProvider>
  );
}
