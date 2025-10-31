import * as Yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useFieldArray } from "react-hook-form";
import { useSWRConfig } from "swr";
import axios from "src/utils/axios";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Unstable_Grid2";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import InputAdornment from "@mui/material/InputAdornment";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Paper from "@mui/material/Paper";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { useResponsive } from "src/hooks/use-responsive";
import { useDebounce } from "src/hooks/use-debounce";


import { useSnackbar } from "src/components/snackbar";
import FormProvider, {
  RHFSelect,
  RHFEditor,
  RHFUpload,
  RHFSwitch,
  RHFTextField,
  RHFMultiSelect,
  RHFAutocomplete,
  RHFMultiCheckbox,
} from "src/components/hook-form";

import { IProductItem } from "src/types/product";
import { useGetCategories, useGetColors, useGetSizes, createCategory, createColor, createSize } from "src/api/reference";
import { createProduct } from "src/api/product";
import { endpoints } from "src/utils/axios";

// ----------------------------------------------------------------------

type Props = {
  currentProduct?: IProductItem;
};

export default function ProductNewEditForm({ currentProduct }: Props) {
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const mdUp = useResponsive("up", "md");

  const { enqueueSnackbar } = useSnackbar();

  const [includeTaxes, setIncludeTaxes] = useState(false);
  const [openAttributes, setOpenAttributes] = useState(true);

  const NewProductSchema = Yup.object().shape({
    status: Yup.string().oneOf(["active", "draft", "out_of_stock", "discontinued"]).required("Status is required"),
    isFeatured: Yup.boolean(),
    price: Yup.number().typeError("Price must be a number").min(0).required("Price is required"),
    salePrice: Yup.number()
      .nullable()
      .typeError("Sale price must be a number")
      .min(0)
      .test("lte-price", "Sale price cannot be greater than regular price", function (value) {
        const { price } = this.parent as any;
        if (value == null) return true;
        return Number(value) <= Number(price || 0);
      }),
    name: Yup.string().required("Name is required"),
    slug: Yup.string().required("Slug is required"),
    description: Yup.string().nullable(),
    shortDescription: Yup.string().nullable(),
    productCode: Yup.string().required("Product code is required"),
    productSku: Yup.string().nullable(),
    categoryId: Yup.string().required("Category is required"),
    quantity: Yup.number().min(0).required("Quantity is required"),
    saleLabel: Yup.string().nullable(),
    newLabel: Yup.string().nullable(),
    isSale: Yup.boolean(),
    colorIds: Yup.array()
      .of(Yup.string())
      .min(1, "Select at least 1 color")
      .required(),
    sizeIds: Yup.array()
      .of(Yup.string())
      .min(1, "Select at least 1 size")
      .required(),
    images: Yup.array().of(Yup.string().url("Must be a valid URL")).max(5, "Max 5 images"),
    manageVariants: Yup.boolean(),
    sku: Yup.string().when("manageVariants", {
      is: false,
      then: (schema) => schema.required("SKU is required for simple product"),
      otherwise: (schema) => schema.optional(),
    }),
    stockQuantity: Yup.number()
      .typeError("Stock must be a number")
      .when("manageVariants", {
        is: false,
        then: (schema) => schema.min(0).required("Stock is required for simple product"),
        otherwise: (schema) => schema.optional(),
      }),
    variants: Yup.array()
      .of(
        Yup.object({
          name: Yup.string().required("Variant name is required"),
          sku: Yup.string().required("Variant SKU is required"),
          price: Yup.number().typeError("Price must be a number").min(0).required("Price is required"),
          stock: Yup.number().typeError("Stock must be a number").min(0).required("Stock is required"),
          colorId: Yup.string().required("Color is required"),
          sizeId: Yup.string().required("Size is required"),
        }),
      )
      .when("manageVariants", {
        is: true,
        then: (schema) =>
          schema
            .min(1, "Add at least 1 variant")
            .test("unique-sku", "Variant SKU must be unique", (list) => {
              if (!list) return true;
              const skus = list.map((v: any) => (v?.sku || "").trim()).filter(Boolean);
              return new Set(skus).size === skus.length;
            }),
        otherwise: (schema) => schema.optional(),
      }),
  });

  const defaultValues = useMemo(
    () => ({
      status: "active",
      isFeatured: false,
      price: 0,
      salePrice: undefined as number | undefined,
      name: "",
      slug: "",
      description: "",
      shortDescription: "",
      productCode: "",
      productSku: "",
      categoryId: "",
      quantity: 0,
      saleLabel: "",
      newLabel: "",
      isSale: false,
      isNew: false,
      images: [] as string[],
      manageVariants: false,
      sku: "",
      stockQuantity: 0,
      variants: [] as { name: string; sku: string; price: number; stock: number; colorId: string; sizeId: string }[],
    }),
    [],
  );

  const methods = useForm<any>({
    resolver: yupResolver(NewProductSchema) as any,
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    setError,
    clearErrors,
    formState: { isSubmitting },
  } = methods;

  const values = watch();
  const name = watch("name");
  const slug = watch("slug");
  const prevNameRef = useRef<string>("");
  const debouncedSlug = useDebounce(slug || "", 500);

  useEffect(() => {
    let active = true;
    const check = async () => {
      const s = (debouncedSlug || "").trim();
      if (!s) {
        clearErrors("slug");
        return;
      }
      try {
        const res = await axios.get(endpoints.product.list, { params: { slug: s, limit: 1 } });
        const items = (res?.data?.data as any[]) || (Array.isArray(res?.data) ? (res.data as any[]) : []);
        const exists = Array.isArray(items) && items.length > 0;
        if (!active) return;
        if (exists) {
          setError("slug", { type: "validate", message: "Slug already exists" });
        } else {
          clearErrors("slug");
        }
      } catch (e) {
        if (!active) return;
        clearErrors("slug");
      }
    };
    check();
    return () => {
      active = false;
    };
  }, [debouncedSlug, clearErrors, setError]);

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: (methods as any).control,
    name: "variants",
  });

  // Auto-generate slug from name when slug is empty or was previously derived from name
  useEffect(() => {
    const generateSlug = (input: string) =>
      input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

    const prevName = prevNameRef.current;
    const nameSlug = generateSlug(name || "");
    const prevNameSlug = generateSlug(prevName || "");

    const slugWasDerivedFromPrevName = slug === prevNameSlug;
    const shouldDerive = !slug || slugWasDerivedFromPrevName;

    if (shouldDerive && slug !== nameSlug) {
      setValue("slug", nameSlug);
    }

    prevNameRef.current = name || "";
  }, [name, slug, setValue]);

  const { categories } = useGetCategories();
  const { colors } = useGetColors();
  // Fetch all sizes (unfiltered) so size lists always show every size
  const { sizes } = useGetSizes();

  const [openCreateCategory, setOpenCreateCategory] = useState(false);
  const [openCreateColor, setOpenCreateColor] = useState(false);
  const [openCreateSize, setOpenCreateSize] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("");
  const [newSizeName, setNewSizeName] = useState("");

  useEffect(() => {
    if (currentProduct) {
      reset(defaultValues);
    }
  }, [currentProduct, defaultValues, reset]);

  // no taxes in backend DTO; remove taxes toggling

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Build payload with snake_case keys to match sample and mock API
      const payload: any = {
        name: data.name,
        slug: data.slug,
        description: data.description || undefined,
        short_description: data.shortDescription || undefined,
        images: (data.images as string[])?.slice(0, 5) || [],
        price: Number(data.price) || 0,
        sale_price: data.salePrice != null ? Number(data.salePrice) : undefined,
        // Optional fields if present in the form (map to snake_case)
        cost_price: (data as any).costPrice != null ? Number((data as any).costPrice) : undefined,
        barcode: (data as any).barcode || undefined,
        status: data.status,
        is_featured: !!data.isFeatured,
        meta_title: (data as any).metaTitle || undefined,
        meta_description: (data as any).metaDescription || undefined,
        weight: (data as any).weight != null ? Number((data as any).weight) : undefined,
        // Keep category for backend linkage if available
        category_id: data.categoryId || undefined,
      };

      if (data.manageVariants) {
        payload.variants = (data.variants || []).map((v: any) => ({
          name: v.name,
          sku: v.sku,
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 0,
          color_id: v.colorId,
          size_id: v.sizeId,
        }));
      } else {
        // Simple product: include base sku and stock quantity
        payload.sku = data.sku || undefined;
        payload.stock_quantity = Number(data.stockQuantity) || 0;
      }

      const created = await createProduct(payload);
      enqueueSnackbar("Create success!");
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

  // const handleDrop = useCallback(
  //   (acceptedFiles: File[]) => {
  //     const files = values.images || [];

  //     const newFiles = acceptedFiles.map((file) =>
  //       Object.assign(file, {
  //         preview: URL.createObjectURL(file),
  //       })
  //     );

  //     setValue('images', [...files, ...newFiles], { shouldValidate: true });
  //   },
  //   [setValue, values.images]
  // );

  // const handleRemoveFile = useCallback(
  //   (inputFile: File | string) => {
  //     const filtered = values.images && values.images?.filter((file) => file !== inputFile);
  //     setValue('images', filtered);
  //   },
  //   [setValue, values.images]
  // );

  // const handleRemoveAllFiles = useCallback(() => {
  //   setValue('images', []);
  // }, [setValue]);

  // const handleChangeIncludeTaxes = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
  //   setIncludeTaxes(event.target.checked);
  // }, []);

  const renderDetails = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Details
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Title, short description, images
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField name="name" label="Name" placeholder="Enter product name" />
            <RHFTextField name="slug" label="Slug" helperText="Slug is used for SEO. Auto-generated from name and editable." placeholder="auto-generated-from-name" />
            <RHFTextField name="shortDescription" label="Short Description" placeholder="A short summary shown in listings" multiline minRows={2} />
            <RHFEditor name="description" />
            <Stack spacing={1}>
              <Typography variant="subtitle2">Images (URLs)</Typography>
              <RHFAutocomplete
                name="images"
                placeholder="Paste image URL and press Enter"
                multiple
                freeSolo
                options={[]}
                getOptionLabel={(option) => option as unknown as string}
                renderTags={(selected, getTagProps) =>
                  selected.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option as unknown as string}
                      label={option as unknown as string}
                      size="small"
                      color="primary"
                      variant="soft"
                    />
                  ))
                }
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Up to 5 images. Paste an image URL and press Enter to add.
              </Typography>
            </Stack>
            <RHFTextField name="productCode" label="Product Code" placeholder="Enter internal product code" />
            <RHFTextField name="productSku" label="Product SKU" placeholder="Enter SKU code" />
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
            Product Meta
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Category, status
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Product Meta" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Box columnGap={2} rowGap={3} display="grid" gridTemplateColumns={{ xs: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RHFSelect native name="categoryId" label="Category" InputLabelProps={{ shrink: true }}>
                  <option value="" />
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </RHFSelect>
                <IconButton size="small" color="primary" onClick={() => setOpenCreateCategory(true)} aria-label="add category">
                  +
                </IconButton>
              </Box>

              <RHFSelect native name="status" label="Status" InputLabelProps={{ shrink: true }}>
                <option value="active">active</option>
                <option value="draft">draft</option>
                <option value="out_of_stock">out_of_stock</option>
                <option value="discontinued">discontinued</option>
              </RHFSelect>

            </Box>
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
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Price related inputs
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Pricing" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Box
              columnGap={2}
              rowGap={3}
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                md: "repeat(2, 1fr)",
              }}
            >
              <RHFTextField
                name="price"
                label="Price"
                type="number"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₫</InputAdornment>,
                }}
              />
              <RHFTextField
                name="salePrice"
                label="Sale Price"
                type="number"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₫</InputAdornment>,
                }}
              />
            </Box>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderVariants = (
    <>
      {values.manageVariants && (
        <>
          {mdUp && (
            <Grid md={4}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                Variants
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Add and manage product variants
              </Typography>
            </Grid>
          )}

          <Grid xs={12} md={8}>
            <Card>
              {!mdUp && <CardHeader title="Variants" />}

              <Stack spacing={2} sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} sx={{ px: 1, color: "text.secondary", typography: "caption" }}>
                  <Box sx={{ flex: 2 }}>Variant name</Box>
                  <Box sx={{ flex: 1 }}>SKU</Box>
                  <Box sx={{ flex: 1 }}>Price</Box>
                  <Box sx={{ flex: 1 }}>Stock</Box>
                  <Box sx={{ flex: 1 }}>Color</Box>
                  <Box sx={{ flex: 1 }}>Size</Box>
                  <Box sx={{ width: 64 }} />
                </Stack>

                {variantFields.map((field, index) => (
                  <Stack key={field.id} direction="row" spacing={2} alignItems="center">
                    <Box sx={{ flex: 2 }}>
                      <RHFTextField name={`variants[${index}].name`} label=" " placeholder="Variant name" />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <RHFTextField name={`variants[${index}].sku`} label=" " placeholder="SKU" />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <RHFTextField name={`variants[${index}].price`} label=" " type="number" placeholder="0" />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <RHFTextField name={`variants[${index}].stock`} label=" " type="number" placeholder="0" />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <RHFSelect native name={`variants[${index}].colorId`} label=" ">
                        <option value="" />
                        {colors.map((c: any) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </RHFSelect>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <RHFSelect native name={`variants[${index}].sizeId`} label=" ">
                        <option value="" />
                        {sizes.map((s: any) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </RHFSelect>
                    </Box>
                    <Box sx={{ width: 64 }}>
                      <Button color="error" onClick={() => removeVariant(index)}>Delete</Button>
                    </Box>
                  </Stack>
                ))}

                <Box>
                  <Button variant="outlined" onClick={() => appendVariant({ name: "", sku: "", price: 0, stock: 0, colorId: "", sizeId: "" })}>
                    + Add variant
                  </Button>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </>
      )}
    </>
  );

  const renderActions = (
    <>
      {mdUp && <Grid md={4} />}
      <Grid xs={12} md={8}>
        <Paper
          elevation={3}
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: { md: "sticky" },
            bottom: 0,
            zIndex: 10,
          }}
        >
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Publish"
            sx={{ pl: 1 }}
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button color="inherit" variant="outlined" onClick={() => router.push(paths.dashboard.product.root)}>
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              size="large"
              loading={isSubmitting}
            >
              {!currentProduct ? "Create Product" : "Save Changes"}
            </LoadingButton>
          </Box>
        </Paper>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderDetails}

        {renderProperties}

        {renderPricing}
        {/* Attributes (collapsible) */}
        <Grid xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Attributes
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Colors, sizes and labels
          </Typography>
        </Grid>
        <Grid xs={12} md={8}>
          <Card>
            <Stack sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider' }} direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle1" sx={{ pl: 2 }}>Attributes</Typography>
              <Button size="small" onClick={() => setOpenAttributes((v) => !v)}>{openAttributes ? 'Hide' : 'Show'}</Button>
            </Stack>
            <Collapse in={openAttributes} timeout="auto" unmountOnExit>
              <Stack spacing={3} sx={{ p: 3 }}>
                <Box columnGap={2} rowGap={3} display="grid" gridTemplateColumns={{ xs: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}>
                   <Stack direction="row" spacing={2} width="100%" alignItems="center">  
                   <RHFMultiSelect
                      sx={{ width: "80%" }}
                      checkbox
                      name="colorIds"
                      label="Colors"
                      options={colors.map((c: any) => ({ label: c.name, value: c.id }))}
                    />
                    <IconButton sx={{ width: "30px", height: "30px" }} size="small" color="primary" onClick={() => setOpenCreateColor(true)} aria-label="add color">
                      +
                    </IconButton>
                   </Stack>
                   <Stack direction="row" spacing={2} width="100%" alignItems="center">
                   <RHFMultiSelect
                      sx={{ width: "80%" }}
                      checkbox
                      name="sizeIds"
                      label="Sizes"
                      options={sizes.map((s: any) => ({ label: s.name, value: s.id }))}
                    />
                    <IconButton size="small" color="primary" onClick={() => setOpenCreateSize(true)} aria-label="add size">
                      +
                    </IconButton>
                   </Stack>
                </Box>
              </Stack>
            </Collapse>
          </Card>
        </Grid>

        {/* Inventory */}
        <Grid md={4} sx={{ display: { xs: 'none', md: 'block' } }} />
        <Grid xs={12} md={8}>
          <Card sx={{ mt: 3 }}>
            <CardHeader title="Inventory" />
            <Stack spacing={3} sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Typography variant="subtitle2">Stock Management</Typography>
                <FormControlLabel
                  control={<Switch checked={values.manageVariants} onChange={(e) => setValue("manageVariants", e.target.checked)} />}
                  label="Enable variant-based stock tracking"
                />
              </Stack>

              {!values.manageVariants && (
                <Box columnGap={2} rowGap={3} display="grid" gridTemplateColumns={{ xs: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}>
                  <RHFTextField name="sku" label="SKU" placeholder="Enter SKU or leave blank to auto-generate" />
                  <RHFTextField name="stockQuantity" label="Stock quantity" type="number" InputLabelProps={{ shrink: true }} />
                </Box>
              )}

              <RHFTextField name="quantity" label="Quantity" placeholder="0" type="number" InputLabelProps={{ shrink: true }} />
            </Stack>
          </Card>
        </Grid>

        {/* Marketing */}
        <Grid md={4} sx={{ display: { xs: 'none', md: 'block' } }} />
        <Grid xs={12} md={8}>
          <Card sx={{ mt: 3 }}>
            <CardHeader title="Marketing Options" />
            <Stack spacing={3} sx={{ p: 3 }}>
              <FormControlLabel control={<Switch checked={values.isFeatured} onChange={(e) => setValue("isFeatured", e.target.checked)} />} label="Featured product – shown on homepage" />

              <Stack spacing={1}>
                <FormControlLabel control={<RHFSwitch name="isSale" label={null} sx={{ m: 0 }} />} label="Enable Sale Label" />
                {values.isSale && (
                  <RHFTextField name="saleLabel" label="Sale Label" fullWidth />
                )}
              </Stack>

              <Stack spacing={1}>
                <FormControlLabel control={<RHFSwitch name="isNew" label={null} sx={{ m: 0 }} />} label="Enable Custom Label" />
                {values.isNew && (
                  <RHFTextField name="newLabel" label="Custom Label" fullWidth />
                )}
              </Stack>
            </Stack>
          </Card>
        </Grid>

        {renderVariants}

        {renderActions}
      </Grid>

      {/* Create Category Dialog */}
      <Dialog open={openCreateCategory} onClose={() => setOpenCreateCategory(false)} fullWidth maxWidth="xs">
        <DialogTitle>New Category</DialogTitle>
        <DialogContent>
          <RHFTextField name="_newCategoryName" label="Category name" value={newCategoryName} onChange={(e: any) => setNewCategoryName(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateCategory(false)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            onClick={async () => {
              if (!newCategoryName.trim()) return;
              // Create category via API, then refresh category list
              const slugFromName = newCategoryName
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-");
              await createCategory({ name: newCategoryName.trim(), slug: slugFromName });
              await mutate(endpoints.refs.categories);
              setNewCategoryName("");
              setOpenCreateCategory(false);
            }}
          >
            Create
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Create Color Dialog */}
      <Dialog open={openCreateColor} onClose={() => setOpenCreateColor(false)} fullWidth maxWidth="xs">
        <DialogTitle>New Color</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <RHFTextField name="_newColorName" label="Color name" value={newColorName} onChange={(e: any) => setNewColorName(e.target.value)} />
            <RHFTextField name="_newColorHex" label="Hex (optional)" value={newColorHex} onChange={(e: any) => setNewColorHex(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateColor(false)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            onClick={async () => {
              if (!newColorName.trim()) return;
              const hex = newColorHex.trim();
              if (hex) {
                const isValidHex = /^#?[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/.test(hex);
                if (!isValidHex) {
                  enqueueSnackbar("Hex color must be 3 or 6 hex digits (e.g. #FF0000)", { variant: "error" });
                  return;
                }
              }
              const normalizedHex = hex ? (hex.startsWith("#") ? hex : `#${hex}`).toUpperCase() : undefined;
              const created = await createColor({ name: newColorName.trim(), hexCode: normalizedHex });
              await mutate(endpoints.refs.colors);
              setNewColorName("");
              setNewColorHex("");
              setOpenCreateColor(false);
            }}
          >
            Create
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Create Size Dialog */}
      <Dialog open={openCreateSize} onClose={() => setOpenCreateSize(false)} fullWidth maxWidth="xs">
        <DialogTitle>New Size</DialogTitle>
        <DialogContent>
          <RHFTextField name="_newSizeName" label="Size name" value={newSizeName} onChange={(e: any) => setNewSizeName(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateSize(false)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            onClick={async () => {
              if (!newSizeName.trim()) return;
              const created = await createSize({ name: newSizeName.trim(), categoryId: values.categoryId || undefined });
              await mutate([endpoints.refs.sizes, { params: { categoryId: values.categoryId } }]);
              setNewSizeName("");
              setOpenCreateSize(false);
            }}
          >
            Create
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </FormProvider>
  );
}
