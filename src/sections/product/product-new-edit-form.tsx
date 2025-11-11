import * as Yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo, useState, useEffect, useCallback, useRef, memo } from "react";
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

import { useTranslate } from "src/locales";

import { useResponsive } from "src/hooks/use-responsive";
import { useDebounce } from "src/hooks/use-debounce";


import { useSnackbar } from "src/components/snackbar";
import Iconify from "src/components/iconify";
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
import { Product } from "src/types/product-dto";
import { useGetCategories, useGetColors, useGetSizes, createCategory, createColor, createSize } from "src/api/reference";
import { createProduct, updateProduct } from "src/api/product";
import { endpoints, fetcher } from "src/utils/axios";
import useSWR from "swr";

import { useProductImages } from "./hooks/use-product-images";
import { useProductDraft } from "./hooks/use-product-draft";
import { generateSlugFromName } from "./utils/slug-utils";
import { mapProductToFormValues, mapFormValuesToPayload } from "./utils/product-mapper";
import { createProductValidationSchema, getDefaultProductFormValues } from "./schemas/product-validation.schema";

type Props = {
  currentProduct?: IProductItem;
};

const VariantItem = memo(({ 
  index, 
  field,
  variant,
  colors,
  sizes,
  isUploading,
  variantFileInputRef,
  onUploadImage,
  onDeleteImage,
  onRemoveVariant,
  t
}: any) => {
  const variantImageUrl = variant?.imageUrl || "";
  const selectedColor = colors.find((c: any) => c.id === variant?.colorId);
  const selectedSize = sizes.find((s: any) => s.id === variant?.sizeId);

  return (
    <Box key={field.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 2, bgcolor: 'background.neutral' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
          {t("productForm.variant")} #{index + 1}
          {(selectedColor || selectedSize) && (
            <Typography component="span" variant="body2" sx={{ color: 'text.secondary', ml: 1 }}>
              ({[selectedColor?.name, selectedSize?.name].filter(Boolean).join(' - ')})
            </Typography>
          )}
        </Typography>
        <Button 
          size="small" 
          color="error" 
          startIcon={<Iconify icon="eva:trash-2-outline" width={16} />}
          onClick={() => onRemoveVariant(index)}
        >
          {t("productForm.delete")}
        </Button>
      </Stack>

      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box sx={{ minWidth: 120 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
            {t("productForm.variantImage")}
          </Typography>
          
          {variantImageUrl ? (
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: 1.5,
                overflow: 'hidden',
                border: '2px solid',
                borderColor: 'primary.main',
                position: 'relative',
                bgcolor: 'background.paper',
                '&:hover .image-overlay': {
                  opacity: 1,
                },
              }}
            >
              <Box
                component="img"
                src={variantImageUrl}
                alt={`Variant ${index + 1} image`}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                }}
              />
              <Box
                className="image-overlay"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  bgcolor: 'rgba(0, 0, 0, 0.6)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  opacity: 0,
                  transition: 'opacity 0.2s',
                }}
              >
                <input
                  ref={variantFileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => onUploadImage(index, e)}
                  disabled={isUploading}
                />
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Iconify icon="eva:refresh-fill" width={16} />}
                  onClick={() => variantFileInputRef?.current?.click()}
                  disabled={isUploading}
                  sx={{ minWidth: 100 }}
                >
                  {t("productForm.change")}
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  startIcon={<Iconify icon="eva:trash-2-outline" width={16} />}
                  onClick={() => onDeleteImage(index)}
                  sx={{ minWidth: 100 }}
                >
                  {t("productForm.remove")}
                </Button>
              </Box>
            </Box>
          ) : (
            <Box
              onClick={() => !isUploading && variantFileInputRef?.current?.click()}
              sx={{
                width: 120,
                height: 120,
                borderRadius: 1.5,
                border: '2px dashed',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isUploading ? 'default' : 'pointer',
                bgcolor: 'background.paper',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: isUploading ? 'divider' : 'primary.main',
                  bgcolor: isUploading ? 'background.paper' : 'action.hover',
                },
              }}
            >
              <input
                ref={variantFileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => onUploadImage(index, e)}
                disabled={isUploading}
              />
              <Iconify 
                icon={isUploading ? "eos-icons:loading" : "eva:cloud-upload-fill"} 
                width={32} 
                sx={{ color: 'text.disabled', mb: 1 }} 
              />
              <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', px: 1 }}>
                {isUploading ? t("productForm.uploading") : t("productForm.clickToUpload")}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ flex: 1 }}>
          <Stack spacing={2}>
            <RHFTextField 
              required 
              name={`variants[${index}].name`} 
              label={t("productForm.variantName")} 
              placeholder={t("productForm.variantNamePlaceholder")}
              size="small"
            />
            
            <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
              <RHFTextField 
                required 
                name={`variants[${index}].sku`} 
                label={t("productForm.sku")} 
                placeholder="SKU-001"
                size="small"
              />
              <RHFTextField 
                required 
                name={`variants[${index}].price`} 
                label={t("productForm.price")} 
                type="number" 
                placeholder="0"
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₫</InputAdornment>,
                }}
              />
            </Box>

            <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2}>
              <RHFTextField 
                required 
                name={`variants[${index}].stock`} 
                label={t("productForm.stockQuantity")} 
                type="number" 
                placeholder="0"
                size="small"
              />
              <RHFSelect 
                required 
                native 
                name={`variants[${index}].colorId`} 
                label={t("productForm.color")}
                size="small"
              >
                <option value="">{t("productForm.selectColor")}</option>
                {colors.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </RHFSelect>
              <RHFSelect 
                required 
                native 
                name={`variants[${index}].sizeId`} 
                label={t("productForm.size")}
                size="small"
              >
                <option value="">{t("productForm.selectSize")}</option>
                {sizes.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </RHFSelect>
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
});

VariantItem.displayName = 'VariantItem';

export default function ProductNewEditForm({ currentProduct }: Props) {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { t } = useTranslate();

  const mdUp = useResponsive("up", "md");

  const { enqueueSnackbar } = useSnackbar();

  const productImages = useProductImages();
  const {
    saveDraftToLocalStorage,
    loadDraftFromLocalStorage,
    clearDraftFromLocalStorage,
  } = useProductDraft(currentProduct?.id);

  const [includeTaxes, setIncludeTaxes] = useState(false);
  const [openAttributes, setOpenAttributes] = useState(true);

  const NewProductSchema = useMemo(() => createProductValidationSchema(t), [t]);
  
  const defaultValues = useMemo(() => getDefaultProductFormValues(), []);

  const methods = useForm<any>({
    resolver: yupResolver(NewProductSchema) as any,
    defaultValues,
  });

  const {
    reset,
    watch,
    getValues,
    setValue,
    handleSubmit,
    setError,
    clearErrors,
    formState: { isSubmitting, errors },
  } = methods;

  const name = watch("name");
  const slug = watch("slug");
  const prevNameRef = useRef<string>("");
  const debouncedSlug = useDebounce(slug || "", 500);
  
  const debouncedFormValuesRef = useRef<any>(null);
  
  const [autoSaveTrigger, setAutoSaveTrigger] = useState(0);
  const debouncedAutoSaveTrigger = useDebounce(autoSaveTrigger.toString(), 1000);

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
          setError("slug", { type: "validate", message: t("productForm.slugAlreadyExists") });
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
  const { sizes } = useGetSizes();

  const [openCreateCategory, setOpenCreateCategory] = useState(false);
  const [openCreateColor, setOpenCreateColor] = useState(false);
  const [openCreateSize, setOpenCreateSize] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("");
  const [newSizeName, setNewSizeName] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagePublicIdMapRef = useRef<Map<string, string>>(new Map());
  const variantFileInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());
  const [uploadingVariantImages, setUploadingVariantImages] = useState<Map<number, boolean>>(new Map());
  const bulkVariantImagesInputRef = useRef<HTMLInputElement>(null);
  const [uploadingBulkVariantImages, setUploadingBulkVariantImages] = useState(false);
  
  const formInitializedRef = useRef(false);
  const lastProductIdRef = useRef<string | number | undefined>(undefined);
  
  const productId = currentProduct?.id;
  
  useEffect(() => {
    if (productId !== lastProductIdRef.current) {
      formInitializedRef.current = false;
      lastProductIdRef.current = productId;
    }
  }, [productId]);
  const { data: rawProductData } = useSWR<Product>(
    productId ? endpoints.product.details(productId) : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
    }
  );

  const extractPublicIdFromUrl = useCallback((url: string): string | null => {
    if (!url) return null;
    try {
      const cloudinaryPattern = /\/image\/upload\/v\d+\/(.+?)(?:\.[^.]+)?$/;
      const match = url.match(cloudinaryPattern);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
      const altPattern = /\/image\/upload\/(.+?)(?:\.[^.]+)?$/;
      const altMatch = url.match(altPattern);
      if (altMatch && altMatch[1]) {
        return decodeURIComponent(altMatch[1]);
      }
      return null;
    } catch (error) {
      return null;
    }
  }, []);

  const loadImageMapping = useCallback((productId: string | number | undefined) => {
    if (!productId) return;
    try {
      const storageKey = `product_image_map_${productId}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const mapping = JSON.parse(stored) as Record<string, string>;
        Object.entries(mapping).forEach(([url, publicId]) => {
          imagePublicIdMapRef.current.set(url, publicId);
        });
      }
    } catch (error) {
    }
  }, []);

  const saveImageMapping = useCallback((productId: string | number | undefined) => {
    if (!productId) return;
    try {
      const storageKey = `product_image_map_${productId}`;
      const mapping: Record<string, string> = {};
      imagePublicIdMapRef.current.forEach((publicId, url) => {
        mapping[url] = publicId;
      });
      localStorage.setItem(storageKey, JSON.stringify(mapping));
    } catch (error) {
    }
  }, []);

  const getDraftStorageKey = useCallback(() => {
    const key = productId ? `product_draft_${productId}` : 'product_draft_new';
    return key;
  }, [productId]);

  const initializeImageMapping = useCallback((images: string[]) => {
    images.forEach((url) => {
      if (!imagePublicIdMapRef.current.has(url)) {
        const publicId = extractPublicIdFromUrl(url);
        if (publicId) {
          imagePublicIdMapRef.current.set(url, publicId);
        }
      }
    });
  }, [extractPublicIdFromUrl]);

  const watchedImages = watch("images") as string[] || [];
  useEffect(() => {
    if (watchedImages && watchedImages.length > 0) {
      watchedImages.forEach((url: string) => {
        if (!imagePublicIdMapRef.current.has(url)) {
          const publicId = extractPublicIdFromUrl(url);
          if (publicId) {
            imagePublicIdMapRef.current.set(url, publicId);
            if (productId) {
              saveImageMapping(productId);
            }
          }
        }
      });
    }
  }, [watchedImages, extractPublicIdFromUrl, productId, saveImageMapping]);

  const mapProductToFormValues = useCallback((product: Product | undefined): any => {
    if (!product) return defaultValues;

    const hasVariants = product.variants && product.variants.length > 0;

    const colorIdsSet = new Set<string>();
    const sizeIdsSet = new Set<string>();
    if (hasVariants && product.variants) {
      product.variants.forEach((v) => {
        if (v.color_id) colorIdsSet.add(v.color_id);
        if (v.size_id) sizeIdsSet.add(v.size_id);
      });
    }

    return {
      name: product.name || "",
      slug: product.slug || "",
      description: product.description || "",
      shortDescription: product.short_description || "",
      images: product.images || [],
      price: product.price ? Number(product.price) : 0,
      salePrice: product.sale_price ? Number(product.sale_price) : undefined,
      status: product.status || "active",
      isFeatured: product.is_featured || false,
      categoryId: product.category_id,
      colorIds: Array.from(colorIdsSet),
      sizeIds: Array.from(sizeIdsSet),
      manageVariants: hasVariants,
      sku: hasVariants ? "" : (product.sku || ""),
      stockQuantity: hasVariants ? 0 : (product.stock_quantity || 0),
      quantity: product.stock_quantity || 0,
      variants: hasVariants && product.variants
        ? product.variants.map((v: any) => ({
            name: v.name || "",
            sku: v.sku || "",
            price: typeof v.price === "number" ? v.price : (typeof v.price === "string" ? Number(v.price) : 0),
            stock: typeof v.stock === "number" ? v.stock : (typeof v.stock === "string" ? Number(v.stock) : 0),
            colorId: v.color_id || "",
            sizeId: v.size_id || "",
            imageUrl: v.image_url || v.imageUrl || "",
          }))
        : [],
      isSale: Boolean(product.sale_price),
      saleLabel: "",
      isNew: false,
      newLabel: "",
      productCode: "",
      productSku: product.sku || "",
      costPrice: product.cost_price ? Number(product.cost_price) : undefined,
      barcode: product.barcode || undefined,
      metaTitle: product.meta_title || undefined,
      metaDescription: product.meta_description || undefined,
      weight: product.weight ? Number(product.weight) : undefined,
      dimensions: product.dimensions 
        ? {
            length: product.dimensions.length ? Number(product.dimensions.length) : undefined,
            width: product.dimensions.width ? Number(product.dimensions.width) : undefined,
            height: product.dimensions.height ? Number(product.dimensions.height) : undefined,
          }
        : {
            length: undefined,
            width: undefined,
            height: undefined,
          },
    };
  }, [defaultValues]);

  useEffect(() => {
    if (formInitializedRef.current) {
      return;
    }

    if (currentProduct && rawProductData) {
      const productData = (rawProductData as any)?.data || rawProductData;
      const formValues = mapProductToFormValues(productData as Product);
      reset(formValues);
      
      loadImageMapping(productId);
      
      const images = formValues.images || [];
      initializeImageMapping(images);
      
      const variants = formValues.variants || [];
      variants.forEach((variant: any) => {
        if (variant?.imageUrl) {
          initializeImageMapping([variant.imageUrl]);
        }
      });
      
      saveImageMapping(productId);
      
      formInitializedRef.current = true;
    } else if (!currentProduct) {
      const draft = loadDraftFromLocalStorage();
      if (draft) {
        reset(draft);
        if (draft.images) {
          initializeImageMapping(draft.images);
        }
        if (draft.variants) {
          draft.variants.forEach((variant: any) => {
            if (variant?.imageUrl) {
              initializeImageMapping([variant.imageUrl]);
            }
          });
        }
        enqueueSnackbar(t("productForm.draftRestored"), { variant: "info" });
      } else {
        reset(defaultValues);
      }
      imagePublicIdMapRef.current.clear();
      
      formInitializedRef.current = true;
    }
  }, [currentProduct, rawProductData, mapProductToFormValues, reset, defaultValues, productId, loadImageMapping, initializeImageMapping, saveImageMapping, loadDraftFromLocalStorage, enqueueSnackbar, t]);

  useEffect(() => {
    const subscription = methods.watch(() => {
      setAutoSaveTrigger(prev => prev + 1);
    });
    return () => subscription.unsubscribe();
  }, [methods]);

  useEffect(() => {
    const isAnyVariantUploading = Array.from(uploadingVariantImages.values()).some(v => v);
    
    const formData = getValues();
    const hasData = formData?.name || 
                    formData?.slug || 
                    (formData?.images && formData.images.length > 0) ||
                    (formData?.variants && formData.variants.length > 0);
    
    if (hasData && !isSubmitting && !isAnyVariantUploading && !uploadingBulkVariantImages) {
      saveDraftToLocalStorage(formData);
    }
  }, [debouncedAutoSaveTrigger, isSubmitting, uploadingVariantImages, uploadingBulkVariantImages, saveDraftToLocalStorage, getValues]);

  const handleUploadImages = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    const MAX_FILES = 5;
    const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const MAX_SIZE = 5 * 1024 * 1024;

    const currentImages = (getValues("images") as string[]) || [];
    if (currentImages.length + selectedFiles.length > MAX_FILES) {
      enqueueSnackbar(t("productForm.maximumFiveImagesAllowed"), { variant: "warning" });
      return;
    }

    for (const file of selectedFiles) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        enqueueSnackbar(t("productForm.onlyJpgPngWebpAllowed"), { variant: "error" });
        return;
      }
      if (file.size > MAX_SIZE) {
        enqueueSnackbar(t("productForm.fileExceedsLimit", { fileName: file.name }), { variant: "error" });
        return;
      }
    }

    setUploadingImages(true);
    
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("files", file));
      formData.append("folder", "products");

      const response = await axios.post(endpoints.files.uploadMultiple, formData, {
        headers: {},
      });

      const apiResponse = response.data;
      
      const uploadedFiles = apiResponse?.data?.files || apiResponse?.files || [];
      
      if (!Array.isArray(uploadedFiles) || uploadedFiles.length === 0) {
        enqueueSnackbar(t("productForm.noImagesUploaded"), { variant: "warning" });
        return;
      }

      const uploadedUrls: string[] = [];
      uploadedFiles.forEach((file: any) => {
        if (file?.url && file?.success !== false) {
          const imageUrl = file.url;
          uploadedUrls.push(imageUrl);
          
          if (file.public_id) {
            imagePublicIdMapRef.current.set(imageUrl, file.public_id);
          }
        }
      });
      
      if (uploadedUrls.length > 0) {
        const updatedImages = [...currentImages, ...uploadedUrls];
        setValue("images", updatedImages, { shouldValidate: true });
        saveImageMapping(productId);
        enqueueSnackbar(
          t("productForm.successfullyUploaded", { count: uploadedUrls.length }),
          { variant: "success" }
        );
      } else {
        enqueueSnackbar(t("productForm.noImagesUploaded"), { variant: "warning" });
      }
    } catch (error: any) {
      const errorMessage = 
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        t("productForm.uploadFailed");
      
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setUploadingImages(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  }, [getValues, setValue, enqueueSnackbar, t, saveImageMapping, productId]);

  const handleUploadVariantImage = useCallback(async (variantIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) {
      return;
    }

    const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const MAX_SIZE = 5 * 1024 * 1024;

    for (const file of selectedFiles) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        enqueueSnackbar(t("productForm.onlyJpgPngWebpAllowed"), { variant: "error" });
        return;
      }
      if (file.size > MAX_SIZE) {
        enqueueSnackbar(t("productForm.fileExceedsLimit", { fileName: file.name }), { variant: "error" });
        return;
      }
    }

    setUploadingVariantImages(prev => new Map(prev).set(variantIndex, true));

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("files", file));
      formData.append("folder", "products");

      const response = await axios.post(endpoints.files.uploadMultiple, formData, {
        headers: {},
      });

      const apiResponse = response.data;
      const uploadedFiles = apiResponse?.data?.files || apiResponse?.files || [];

      if (!Array.isArray(uploadedFiles) || uploadedFiles.length === 0) {
        enqueueSnackbar(t("productForm.noImagesUploaded"), { variant: "warning" });
        return;
      }

      const uploadedUrls: string[] = [];
      uploadedFiles.forEach((file: any) => {
        if (file?.url && file?.success !== false) {
          const imageUrl = file.url;
          uploadedUrls.push(imageUrl);
          
          if (file.public_id) {
            imagePublicIdMapRef.current.set(imageUrl, file.public_id);
          }
        }
      });

      if (uploadedUrls.length === 0) {
        enqueueSnackbar(t("productForm.noImagesUploaded"), { variant: "warning" });
        return;
      }

      const currentVariants = getValues("variants") || [];
      
      const updatedVariants = currentVariants.map((variant: any) => {
        return {
          ...variant,
          name: variant?.name || "",
          sku: variant?.sku || "",
          price: variant?.price || 0,
          stock: variant?.stock || 0,
          colorId: variant?.colorId || "",
          sizeId: variant?.sizeId || "",
          imageUrl: variant?.imageUrl || "",
        };
      });
      
      while (updatedVariants.length <= variantIndex) {
        updatedVariants.push({
          name: "",
          sku: "",
          price: 0,
          stock: 0,
          colorId: "",
          sizeId: "",
          imageUrl: "",
        });
      }
      
      let imagesAssigned = 0;
      for (let i = 0; i < uploadedUrls.length; i++) {
        const targetIndex = variantIndex + i;
        if (targetIndex < updatedVariants.length) {
          updatedVariants[targetIndex] = {
            ...updatedVariants[targetIndex],
            imageUrl: uploadedUrls[i],
          };
          imagesAssigned++;
        }
      }
      
      const currentManageVariants = getValues("manageVariants");
      
      setValue("variants", updatedVariants, { 
        shouldValidate: false,
        shouldDirty: true,
        shouldTouch: false
      });

      const currentImages = (getValues("images") as string[]) || [];
      const newImages = uploadedUrls.filter(url => !currentImages.includes(url));
      if (newImages.length > 0) {
        const updatedImages = [...currentImages, ...newImages].slice(0, 5);
        setValue("images", updatedImages, { shouldValidate: false, shouldDirty: false });
      }
      
      if (currentManageVariants !== undefined) {
        setTimeout(() => {
          const currentValue = getValues("manageVariants");
          if (currentValue !== currentManageVariants) {
            setValue("manageVariants", currentManageVariants, { shouldValidate: false });
          }
        }, 0);
      }

      saveImageMapping(productId);

      const successMsg = uploadedUrls.length === 1
        ? t("productForm.variantImageUploaded")
        : t("productForm.successfullyUploaded", { count: uploadedUrls.length });
      enqueueSnackbar(successMsg, { variant: "success" });
    } catch (error: any) {
      const errorMessage = 
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        t("productForm.uploadFailed");
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setUploadingVariantImages(prev => {
        const newMap = new Map(prev);
        newMap.delete(variantIndex);
        return newMap;
      });
      if (event.target) {
        event.target.value = "";
      }
    }
  }, [getValues, setValue, enqueueSnackbar, t, saveImageMapping, productId]);

  const handleBulkUploadVariantImages = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const MAX_SIZE = 5 * 1024 * 1024;

    for (const file of selectedFiles) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        enqueueSnackbar(t("productForm.onlyJpgPngWebpAllowed"), { variant: "error" });
        return;
      }
      if (file.size > MAX_SIZE) {
        enqueueSnackbar(t("productForm.fileExceedsLimit", { fileName: file.name }), { variant: "error" });
        return;
      }
    }

    setUploadingBulkVariantImages(true);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("files", file));
      formData.append("folder", "products");

      const response = await axios.post(endpoints.files.uploadMultiple, formData, {
        headers: {},
      });

      const apiResponse = response.data;
      const uploadedFiles = apiResponse?.data?.files || apiResponse?.files || [];

      if (!Array.isArray(uploadedFiles) || uploadedFiles.length === 0) {
        enqueueSnackbar(t("productForm.noImagesUploaded"), { variant: "warning" });
        return;
      }

      const uploadedUrls: string[] = [];
      uploadedFiles.forEach((file: any) => {
        if (file?.url && file?.success !== false) {
          const imageUrl = file.url;
          uploadedUrls.push(imageUrl);
          
          if (file.public_id) {
            imagePublicIdMapRef.current.set(imageUrl, file.public_id);
          }
        }
      });

      if (uploadedUrls.length === 0) {
        enqueueSnackbar(t("productForm.noImagesUploaded"), { variant: "warning" });
        return;
      }

      const currentVariants = getValues("variants") || [];
      
      const updatedVariants = currentVariants.map((variant: any) => ({
        ...variant,
        name: variant?.name || "",
        sku: variant?.sku || "",
        price: variant?.price || 0,
        stock: variant?.stock || 0,
        colorId: variant?.colorId || "",
        sizeId: variant?.sizeId || "",
        imageUrl: variant?.imageUrl || "",
      }));
      
      let imageIndex = 0;
      for (let i = 0; i < updatedVariants.length && imageIndex < uploadedUrls.length; i++) {
        if (!updatedVariants[i].imageUrl) {
          updatedVariants[i] = {
            ...updatedVariants[i],
            imageUrl: uploadedUrls[imageIndex],
          };
          imageIndex++;
        }
      }
      
      if (imageIndex < uploadedUrls.length) {
        for (let i = 0; i < updatedVariants.length && imageIndex < uploadedUrls.length; i++) {
          updatedVariants[i] = {
            ...updatedVariants[i],
            imageUrl: uploadedUrls[imageIndex],
          };
          imageIndex++;
        }
      }
      
      const currentManageVariants = getValues("manageVariants");
      
      setValue("variants", updatedVariants, { 
        shouldValidate: false,
        shouldDirty: true,
        shouldTouch: false 
      });

      const currentImages = (getValues("images") as string[]) || [];
      const newImages = uploadedUrls.filter(url => !currentImages.includes(url));
      if (newImages.length > 0) {
        const updatedImages = [...currentImages, ...newImages].slice(0, 5);
        setValue("images", updatedImages, { shouldValidate: false, shouldDirty: false });
      }
      
      if (currentManageVariants !== undefined) {
        setTimeout(() => {
          const currentValue = getValues("manageVariants");
          if (currentValue !== currentManageVariants) {
            setValue("manageVariants", currentManageVariants, { shouldValidate: false });
          }
        }, 0);
      }

      saveImageMapping(productId);

      const unusedCount = uploadedUrls.length - imageIndex;
      let successMsg = t("productForm.successfullyUploaded", { count: uploadedUrls.length });
      if (unusedCount > 0) {
        successMsg += ` (${unusedCount} ${t("productForm.imagesNotAssigned")})`;
      }
      enqueueSnackbar(successMsg, { variant: "success" });
    } catch (error: any) {
      const errorMessage = 
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        t("productForm.uploadFailed");
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setUploadingBulkVariantImages(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  }, [getValues, setValue, enqueueSnackbar, t, saveImageMapping, productId]);

  const handleDeleteVariantImage = useCallback((variantIndex: number) => {
    const currentVariants = getValues("variants") || [];
    const updatedVariants = [...currentVariants];
    const variant = updatedVariants[variantIndex];
    
    if (variant?.imageUrl) {
      updatedVariants[variantIndex] = {
        ...variant,
        imageUrl: "",
      };
      setValue("variants", updatedVariants, { shouldValidate: true });
    }
  }, [getValues, setValue]);

  const handleDeleteImage = useCallback(async (imageUrl: string) => {
    const currentImages = (getValues("images") as string[]) || [];
    
    const updatedImages = currentImages.filter((url) => url !== imageUrl);
    setValue("images", updatedImages, { shouldValidate: true });
    
    const publicId = imagePublicIdMapRef.current.get(imageUrl);
    if (publicId) {
      try {
        await axios.delete(endpoints.files.delete(publicId), {
          data: { resourceType: "image" },
        });
        imagePublicIdMapRef.current.delete(imageUrl);
        saveImageMapping(productId);
      } catch (error) {
        imagePublicIdMapRef.current.delete(imageUrl);
        saveImageMapping(productId);
      }
    } else {
      const extractedPublicId = extractPublicIdFromUrl(imageUrl);
      if (extractedPublicId) {
        try {
          await axios.delete(endpoints.files.delete(extractedPublicId), {
            data: { resourceType: "image" },
          });
        } catch (error) {
        }
      }
    }
  }, [getValues, setValue, productId, saveImageMapping, extractPublicIdFromUrl]);

  const onError = useCallback((errors: any) => {
    const findFirstError = (err: any, path = ""): { path: string; message: string } | null => {
      for (const key in err) {
        const currentPath = path ? `${path}.${key}` : key;
        const value = err[key];
        
        if (value?.message) {
          return { path: currentPath, message: value.message };
        }
        
        if (typeof value === "object" && value !== null) {
          const nested = findFirstError(value, currentPath);
          if (nested) return nested;
        }
      }
      return null;
    };
    
    const firstError = findFirstError(errors);
    
    if (firstError) {
      enqueueSnackbar(
        `${t("productForm.validationFailed")}: ${firstError.message}`,
        { variant: "error", autoHideDuration: 5000 }
      );
      
      setTimeout(() => {
        const fieldName = firstError.path.replace(/\.(\d+)\./g, "[$1].").replace(/\.(\d+)$/g, "[$1]");
        const element = document.querySelector(`[name="${fieldName}"]`) as HTMLElement;
        
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          if (element.focus) {
            element.focus();
          }
        } else {
          const fallbackElement = document.querySelector(`[name*="${fieldName.split(".")[0]}"]`) as HTMLElement;
          if (fallbackElement) {
            fallbackElement.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      }, 100);
    } else {
      enqueueSnackbar(
        t("productForm.pleaseFillRequiredFields"),
        { variant: "error", autoHideDuration: 5000 }
      );
    }
  }, [enqueueSnackbar, t]);

  const onSubmit = handleSubmit(
    async (data) => {
    try {
      const basePrice = Number(data.price) || 0;
      const sale = data.salePrice != null ? Number(data.salePrice) : undefined;
      if (sale != null && sale > basePrice) {
        setError("salePrice", { type: "validate", message: t("productForm.salePriceCannotBeGreater") });
        enqueueSnackbar(t("productForm.salePriceCannotBeGreater"), { variant: "error" });
        return;
      }

      const payload: any = {
        name: data.name,
        slug: data.slug,
        description: data.description || undefined,
        short_description: data.shortDescription || undefined,
        images: (data.images as string[])?.slice(0, 5) || [],
        price: basePrice,
        sale_price: sale != null ? sale : undefined,
        cost_price: (data as any).costPrice != null ? Number((data as any).costPrice) : undefined,
        barcode: (data as any).barcode || undefined,
        status: data.status === 'active' ? 'active' : 'inactive',
        is_featured: !!data.isFeatured,
        meta_title: (data as any).metaTitle || undefined,
        meta_description: (data as any).metaDescription || undefined,
        weight: data.weight != null ? Number(data.weight) : undefined,
        dimensions: data.dimensions && (data.dimensions.length != null || data.dimensions.width != null || data.dimensions.height != null) 
          ? {
              length: data.dimensions.length != null ? Number(data.dimensions.length) : undefined,
              width: data.dimensions.width != null ? Number(data.dimensions.width) : undefined,
              height: data.dimensions.height != null ? Number(data.dimensions.height) : undefined,
            }
          : undefined,
        category_id: data.categoryId,
      };

      if (data.manageVariants) {
        payload.variants = (data.variants || []).map((v: any) => ({
          name: v.name,
          sku: v.sku,
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 0,
          color_id: v.colorId,
          size_id: v.sizeId,
          image_url: v.imageUrl || undefined,
        }));
        
        const variantImageUrls = (data.variants || [])
          .map((v: any) => v.imageUrl)
          .filter((url: string) => url && url.trim());
        const productImageUrls = (data.images as string[]) || [];
        const imageSet = new Set<string>([...productImageUrls, ...variantImageUrls]);
        const allImageUrls = Array.from(imageSet).slice(0, 5);
        
        payload.images = allImageUrls;
        if ((payload.variants as any[]).length > 0) {
          delete payload.sku;
          delete payload.stock_quantity;
        }
      } else {
        payload.sku = data.sku || undefined;
        payload.stock_quantity = Number(data.stockQuantity) || 0;
      }

      if (currentProduct?.id) {
        const updated = await updateProduct(currentProduct.id, payload);
        saveImageMapping(currentProduct.id);
        clearDraftFromLocalStorage();
        enqueueSnackbar(t("productForm.updateSuccess"));
        router.push(paths.dashboard.product.details(currentProduct.id));
      } else {
      const created = await createProduct(payload);
      enqueueSnackbar(t("productForm.createSuccess"));
      const newId = created?.id || created?.data?.id;
      if (newId) {
        saveImageMapping(newId);
        clearDraftFromLocalStorage();
        router.push(paths.dashboard.product.details(newId));
      } else {
        clearDraftFromLocalStorage();
        router.push(paths.dashboard.product.root);
        }
      }
    } catch (error) {
      const message = (error as any)?.response?.data?.message || (error as any)?.message || "";
      const lower = String(message).toLowerCase();
      if (lower.includes("sale price") && lower.includes("greater")) {
        setError("salePrice", { type: "server", message: t("productForm.salePriceCannotBeGreater") });
      }
      if (lower.includes("variants") && lower.includes("sku") && lower.includes("should not")) {
        setError("sku", { type: "server", message: t("productForm.skuRequiredForSimple") });
      }
      if (lower.includes("variants") && lower.includes("stock") && lower.includes("should not")) {
        setError("stockQuantity", { type: "server", message: t("productForm.stockRequiredForSimple") });
      }
      if (lower.includes("slug") && lower.includes("exists")) {
        setError("slug", { type: "server", message: t("productForm.slugAlreadyExists") });
      }
      if (lower.includes("invalid") && lower.includes("category")) {
        setError("categoryId", { type: "server", message: "Invalid category_id" });
      }
      if (lower.includes("stock") && lower.includes("negative")) {
        if (data.manageVariants) {
          setError("variants", { type: "server", message: "Stock cannot be negative" });
        } else {
          setError("stockQuantity", { type: "server", message: "Stock cannot be negative" });
        }
      }
      
      const errorMsg = message || t("productForm.pleaseFillRequiredFields");
      enqueueSnackbar(errorMsg, { variant: "error", autoHideDuration: 5000 });
    }
  },
  onError
  );

  const renderDetails = (
    <>
      {mdUp && (
        <Grid md={2}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            {t("productForm.details")}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("productForm.detailsDescription")}
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={10}>
        <Card>
          {!mdUp && <CardHeader title={t("productForm.details")} />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField required name="name" label={t("productForm.name")} placeholder={t("productForm.namePlaceholder")} />
            <RHFTextField required name="slug" label={t("productForm.slug")} helperText={t("productForm.slugHelperText")} placeholder={t("productForm.slugPlaceholder")} />
            <RHFTextField name="shortDescription" label={t("productForm.shortDescription")} placeholder={t("productForm.shortDescriptionPlaceholder")} multiline minRows={2} />
            <RHFEditor name="description" />
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2">{t("productForm.images")}</Typography>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleUploadImages}
                  disabled={uploadingImages}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Iconify icon="eva:cloud-upload-fill" />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImages || (watch("images") as string[] || []).length >= 5}
                  sx={{ minWidth: 120 }}
                >
                  {uploadingImages ? t("productForm.uploading") : t("productForm.uploadImages")}
                </Button>
              </Box>

              {watch("images") && (watch("images") as string[]).length > 0 && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(5, 1fr)' },
                    gap: 2,
                    mt: 2,
                  }}
                >
                  {(watch("images") as string[]).map((imageUrl, index) => {
                    const publicId = imagePublicIdMapRef.current.get(imageUrl);
                    return (
                    <Box
                      key={`${imageUrl}-${index}`}
                      sx={{
                        position: 'relative',
                        width: '100%',
                        paddingTop: '100%',
                        borderRadius: 1.5,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.neutral',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: (theme) => `0 4px 12px ${theme.palette.primary.lighter}`,
                          '& .delete-button': {
                            opacity: 1,
                          },
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src={imageUrl}
                        alt={`Product image ${index + 1}`}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 4,
                          left: 4,
                          bgcolor: 'rgba(0, 0, 0, 0.6)',
                          color: 'common.white',
                          borderRadius: '50%',
                          width: 24,
                          height: 24,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {index + 1}
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteImage(imageUrl)}
                        className="delete-button"
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'error.main',
                          color: 'common.white',
                          opacity: 0.9,
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: 'error.darker',
                            opacity: 1,
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        <Iconify icon="eva:close-fill" width={18} />
                      </IconButton>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          bgcolor: 'transparent',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.05)',
                          },
                        }}
                      />
                    </Box>
                  );
                  })}
                </Box>
              )}

              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  {t("productForm.orAddUrlManually")}
                </Typography>
              <RHFAutocomplete
                name="images"
                placeholder={t("productForm.pasteImageUrl")}
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
              </Box>

              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {t("productForm.imagesHelperText")}
              </Typography>
            </Stack>
            <RHFTextField required name="productCode" label={t("productForm.productCode")} placeholder={t("productForm.productCodePlaceholder")} />
            <RHFTextField name="productSku" label={t("productForm.productSku")} placeholder={t("productForm.productSkuPlaceholder")} />
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderProperties = (
    <>
      {mdUp && (
        <Grid md={2}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            {t("productForm.productMeta")}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("productForm.productMetaDescription")}
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={10}>
        <Card>
          {!mdUp && <CardHeader title={t("productForm.productMeta")} />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Box columnGap={2} rowGap={3} display="grid" gridTemplateColumns={{ xs: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RHFSelect required native name="categoryId" label={t("productForm.category")} InputLabelProps={{ shrink: true }}>
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

              <RHFSelect required native name="status" label={t("productForm.status")} InputLabelProps={{ shrink: true }}>
                <option value="active">{t("productForm.statusActive")}</option>
                <option value="inactive">{t("productForm.statusInactive")}</option>
              </RHFSelect>

            </Box>

            {/* <Stack spacing={1}>
              <Typography variant="subtitle2">Tags</Typography>
              <RHFAutocomplete
                name="tags"
                placeholder="Enter tag and press Enter"
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
                Add tags for better organization and searchability
              </Typography>
            </Stack> */}
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderPricing = (
    <>
      {mdUp && (
        <Grid md={2}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            {t("productForm.pricing")}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("productForm.pricingDescription")}
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={10}>
        <Card>
          {!mdUp && <CardHeader title={t("productForm.pricing")} />}

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
                label={t("productForm.price")}
                type="number"
                required
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₫</InputAdornment>,
                }}
              />
              <RHFTextField
                name="salePrice"
                label={t("productForm.salePrice")}
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

  const renderShipping = (
    <>
      {mdUp && (
        <Grid md={2}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            {t("productForm.shipping")}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("productForm.shippingDescription")}
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={10}>
        <Card>
          {!mdUp && <CardHeader title={t("productForm.shipping")} />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Box>
              <RHFTextField
                name="weight"
                label={t("productForm.weight")}
                type="number"
                placeholder="0"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                }}
                helperText={t("productForm.weightHelper")}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                {t("productForm.dimensions")}
              </Typography>
              <Box
                columnGap={2}
                rowGap={3}
                display="grid"
                gridTemplateColumns={{
                  xs: "repeat(1, 1fr)",
                  md: "repeat(3, 1fr)",
                }}
              >
                <RHFTextField
                  name="dimensions.length"
                  label={t("productForm.length")}
                  type="number"
                  placeholder="0"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                  }}
                />
                <RHFTextField
                  name="dimensions.width"
                  label={t("productForm.width")}
                  type="number"
                  placeholder="0"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                  }}
                />
                <RHFTextField
                  name="dimensions.height"
                  label={t("productForm.height")}
                  type="number"
                  placeholder="0"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 1 }}>
                {t("productForm.dimensionsHelper")}
              </Typography>
            </Box>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const manageVariants = watch("manageVariants");
  const isFeatured = watch("isFeatured");
  const isSale = watch("isSale");
  const isNew = watch("isNew");
  
  const renderVariants = useMemo(() => (
    <>
      {manageVariants && (
        <>
          {mdUp && (
            <Grid md={2}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                {t("productForm.variants")}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {t("productForm.variantsDescription")}
              </Typography>
            </Grid>
          )}

          <Grid xs={12} md={10}>
            <Card>
              {!mdUp && <CardHeader title={t("productForm.variants")} />}

              <Stack spacing={2} sx={{ p: 3 }}>
                {variantFields.length > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px dashed', borderColor: 'divider' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        {t("productForm.bulkUploadVariantImages")}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {t("productForm.bulkUploadDescription")}
                      </Typography>
                    </Box>
                    <Box>
                      <input
                        ref={bulkVariantImagesInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        multiple
                        style={{ display: 'none' }}
                        onChange={handleBulkUploadVariantImages}
                        disabled={uploadingBulkVariantImages}
                      />
                      <Button
                        variant="contained"
                        startIcon={<Iconify icon={uploadingBulkVariantImages ? "eos-icons:loading" : "eva:cloud-upload-fill"} />}
                        onClick={() => bulkVariantImagesInputRef.current?.click()}
                        disabled={uploadingBulkVariantImages}
                      >
                        {uploadingBulkVariantImages ? t("productForm.uploading") : t("productForm.uploadMultipleImages")}
                      </Button>
                    </Box>
                  </Box>
                )}

                {variantFields.map((field, index) => {
                  const variants = getValues("variants") as any[] || [];
                  const variant = variants[index];
                  const isUploadingVariant = uploadingVariantImages.get(index) || false;
                  
                  return (
                    <VariantItem
                      key={field.id}
                      index={index}
                      field={field}
                      variant={variant}
                      colors={colors}
                      sizes={sizes}
                      isUploading={isUploadingVariant}
                      variantFileInputRef={{
                        current: variantFileInputRefs.current.get(index) || null,
                      }}
                      onUploadImage={handleUploadVariantImage}
                      onDeleteImage={handleDeleteVariantImage}
                      onRemoveVariant={removeVariant}
                      t={t}
                    />
                  );
                })}

                <Box>
                  <Button variant="outlined" onClick={() => appendVariant({ name: "", sku: "", price: 0, stock: 0, colorId: "", sizeId: "", imageUrl: "" })}>
                    {t("productForm.addVariant")}
                  </Button>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </>
      )}
    </>
  ), [manageVariants, variantFields, colors, sizes, uploadingVariantImages, uploadingBulkVariantImages, mdUp, t, handleUploadVariantImage, handleDeleteVariantImage, handleBulkUploadVariantImages, removeVariant, appendVariant, getValues]);

  const renderActions = (
    <>
      {mdUp && <Grid md={2} />}
      <Grid xs={12} md={10}>
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label={t("productForm.publish")}
            />
            {!currentProduct && (
              <Button
                size="small"
                color="warning"
                variant="outlined"
                startIcon={<Iconify icon="eva:trash-2-outline" />}
                onClick={() => {
                  if (window.confirm(t("productForm.confirmClearDraft"))) {
                    clearDraftFromLocalStorage();
                    reset(defaultValues);
                    enqueueSnackbar(t("productForm.draftCleared"), { variant: "success" });
                  }
                }}
              >
                {t("productForm.clearDraft")}
              </Button>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button color="inherit" variant="outlined" onClick={() => router.push(paths.dashboard.product.root)}>
              {t("productForm.cancel")}
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              size="large"
              loading={isSubmitting}
            >
              {!currentProduct ? t("productForm.createProduct") : t("productForm.saveChanges")}
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

        {renderShipping}

        <Grid xs={12} md={2}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            {t("productForm.attributes")}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("productForm.attributesDescription")}
          </Typography>
        </Grid>
        <Grid xs={12} md={10}>
          <Card>
            <Stack sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider' }} direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle1" sx={{ pl: 2 }}>{t("productForm.attributes")}</Typography>
              <Button size="small" onClick={() => setOpenAttributes((v) => !v)}>{openAttributes ? t("productForm.hide") : t("productForm.show")}</Button>
            </Stack>
            <Collapse in={openAttributes} timeout="auto" unmountOnExit>
              <Stack spacing={3} sx={{ p: 3 }}>
                <Box columnGap={2} rowGap={3} display="grid" gridTemplateColumns={{ xs: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}>
                   <Stack direction="row" spacing={2} width="100%" alignItems="center">  
                   <RHFMultiSelect
                      sx={{ width: "80%" }}
                      checkbox
                      name="colorIds"
                      label={t("productForm.colors")}
                      required
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
                      label={t("productForm.sizes")}
                      required
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

        <Grid md={2} sx={{ display: { xs: 'none', md: 'block' } }} />
        <Grid xs={12} md={10}>
          <Card sx={{ mt: 3 }}>
            <CardHeader title={t("productForm.inventory")} />
            <Stack spacing={3} sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Typography variant="subtitle2">{t("productForm.stockManagement")}</Typography>
                <Controller
                  name="manageVariants"
                  control={methods.control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value || false} />}
                      label={t("productForm.enableVariantTracking")}
                    />
                  )}
                />
              </Stack>

              {!manageVariants && (
                <Box columnGap={2} rowGap={3} display="grid" gridTemplateColumns={{ xs: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}>
                  <RHFTextField required={!manageVariants} name="sku" label={t("productForm.sku")} placeholder={t("productForm.skuPlaceholder")} />
                  <RHFTextField required={!manageVariants} name="stockQuantity" label={t("productForm.stockQuantity")} type="number" InputLabelProps={{ shrink: true }} />
                </Box>
              )}

              <RHFTextField required name="quantity" label={t("productForm.quantity")} placeholder={t("productForm.quantityPlaceholder")} type="number" InputLabelProps={{ shrink: true }} />
            </Stack>
          </Card>
        </Grid>

        {renderVariants}

        <Grid md={2} sx={{ display: { xs: 'none', md: 'block' } }} />
        <Grid xs={12} md={10}>
          <Card sx={{ mt: 3 }}>
            <CardHeader title={t("productForm.marketingOptions")} />
            <Stack spacing={3} sx={{ p: 3 }}>
              <FormControlLabel control={<Switch checked={isFeatured} onChange={(e) => setValue("isFeatured", e.target.checked)} />} label={t("productForm.featuredProduct")} />

              <Stack spacing={1}>
                <FormControlLabel control={<RHFSwitch name="isSale" label={null} sx={{ m: 0 }} />} label={t("productForm.enableSaleLabel")} />
                {isSale && (
                  <RHFTextField name="saleLabel" label={t("productForm.saleLabel")} fullWidth />
                )}
              </Stack>

              <Stack spacing={1}>
                <FormControlLabel control={<RHFSwitch name="isNew" label={null} sx={{ m: 0 }} />} label={t("productForm.enableCustomLabel")} />
                {isNew && (
                  <RHFTextField name="newLabel" label={t("productForm.customLabel")} fullWidth />
                )}
              </Stack>
            </Stack>
          </Card>
        </Grid>

        {renderActions}
      </Grid>

      <Dialog open={openCreateCategory} onClose={() => setOpenCreateCategory(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t("productForm.newCategory")}</DialogTitle>
        <DialogContent>
          <RHFTextField name="_newCategoryName" label={t("productForm.categoryName")} value={newCategoryName} onChange={(e: any) => setNewCategoryName(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateCategory(false)}>{t("productForm.cancel")}</Button>
          <LoadingButton
            variant="contained"
            onClick={async () => {
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
              setOpenCreateCategory(false);
            }}
          >
            {t("productForm.create")}
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={openCreateColor} onClose={() => setOpenCreateColor(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t("productForm.newColor")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <RHFTextField name="_newColorName" label={t("productForm.colorName")} value={newColorName} onChange={(e: any) => setNewColorName(e.target.value)} />
            <RHFTextField name="_newColorHex" label={t("productForm.hexOptional")} value={newColorHex} onChange={(e: any) => setNewColorHex(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateColor(false)}>{t("productForm.cancel")}</Button>
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
            {t("productForm.create")}
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={openCreateSize} onClose={() => setOpenCreateSize(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t("productForm.newSize")}</DialogTitle>
        <DialogContent>
          <RHFTextField name="_newSizeName" label={t("productForm.sizeName")} value={newSizeName} onChange={(e: any) => setNewSizeName(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateSize(false)}>{t("productForm.cancel")}</Button>
          <LoadingButton
            variant="contained"
            onClick={async () => {
              if (!newSizeName.trim()) return;
              const currentCategoryId = getValues("categoryId");
              const created = await createSize({ name: newSizeName.trim(), categoryId: currentCategoryId || undefined });
              await mutate([endpoints.refs.sizes, { params: { categoryId: currentCategoryId } }]);
              setNewSizeName("");
              setOpenCreateSize(false);
            }}
          >
            {t("productForm.create")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </FormProvider>
  );
}
