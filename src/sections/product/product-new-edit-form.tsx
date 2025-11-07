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

// ----------------------------------------------------------------------

type Props = {
  currentProduct?: IProductItem;
};

export default function ProductNewEditForm({ currentProduct }: Props) {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { t } = useTranslate();

  const mdUp = useResponsive("up", "md");

  const { enqueueSnackbar } = useSnackbar();

  const [includeTaxes, setIncludeTaxes] = useState(false);
  const [openAttributes, setOpenAttributes] = useState(true);

  const NewProductSchema = useMemo(
    () =>
      Yup.object().shape({
        status: Yup.string()
          .oneOf(["active", "inactive"]) // Align with API accepted values
          .required(t("productForm.statusRequired")),
        isFeatured: Yup.boolean(),
        price: Yup.number()
          .typeError(t("productForm.priceMustBeNumber"))
          .min(0)
          .required(t("productForm.priceRequired")),
        salePrice: Yup.number()
          .nullable()
          .typeError(t("productForm.priceMustBeNumber"))
          .min(0)
          .test("lte-price", t("productForm.salePriceCannotBeGreater"), function (value) {
            const { price } = this.parent as any;
            if (value == null) return true;
            return Number(value) <= Number(price || 0);
          }),
        name: Yup.string().required(t("productForm.nameRequired")),
        slug: Yup.string().required(t("productForm.slugRequired")),
        description: Yup.string().nullable(),
        shortDescription: Yup.string().nullable(),
        productCode: Yup.string().required(t("productForm.productCodeRequired")),
        productSku: Yup.string().nullable(),
        categoryId: Yup.string().required(t("productForm.categoryRequired")),
        quantity: Yup.number().min(0).required(t("productForm.quantityRequired")),
        saleLabel: Yup.string().nullable(),
        newLabel: Yup.string().nullable(),
        isSale: Yup.boolean(),
        colorIds: Yup.array()
          .of(Yup.string())
          .min(1, t("productForm.selectAtLeastOneColor"))
          .required(),
        sizeIds: Yup.array()
          .of(Yup.string())
          .min(1, t("productForm.selectAtLeastOneSize"))
          .required(),
        images: Yup.array()
          .of(Yup.string().url(t("productForm.mustBeValidUrl")))
          .max(5, t("productForm.maxFiveImages")),
        manageVariants: Yup.boolean(),
        sku: Yup.string().when("manageVariants", {
          is: false,
          then: (schema) => schema.required(t("productForm.skuRequiredForSimple")),
          otherwise: (schema) => schema.optional(),
        }),
        stockQuantity: Yup.number()
          .typeError(t("productForm.priceMustBeNumber"))
          .when("manageVariants", {
            is: false,
            then: (schema) =>
              schema.min(0).required(t("productForm.stockRequiredForSimple")),
            otherwise: (schema) => schema.optional(),
          }),
        variants: Yup.array()
          .of(
            Yup.object({
              name: Yup.string().required(t("productForm.variantNameRequired")),
              sku: Yup.string().required(t("productForm.variantSkuRequired")),
              price: Yup.number()
                .typeError(t("productForm.priceMustBeNumber"))
                .min(0)
                .required(t("productForm.variantPriceRequired")),
              stock: Yup.number()
                .typeError(t("productForm.priceMustBeNumber"))
                .min(0)
                .required(t("productForm.variantStockRequired")),
              colorId: Yup.string().required(t("productForm.variantColorRequired")),
              sizeId: Yup.string().required(t("productForm.variantSizeRequired")),
              imageUrl: Yup.string().nullable().url(t("productForm.mustBeValidUrl")),
            }),
          )
          .when("manageVariants", {
            is: true,
            then: (schema) =>
              schema
                .min(1, t("productForm.addAtLeastOneVariant"))
                .test("unique-sku", t("productForm.variantSkuMustBeUnique"), (list) => {
                  if (!list) return true;
                  const skus = list.map((v: any) => (v?.sku || "").trim()).filter(Boolean);
                  return new Set(skus).size === skus.length;
                }),
            otherwise: (schema) => schema.optional(),
          }),
      }),
    [t],
  );

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
      colorIds: [] as string[],
      sizeIds: [] as string[],
      manageVariants: false,
      sku: "",
      stockQuantity: 0,
      variants: [] as { name: string; sku: string; price: number; stock: number; colorId: string; sizeId: string; imageUrl?: string }[],
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
    getValues,
    setValue,
    handleSubmit,
    setError,
    clearErrors,
    formState: { isSubmitting, errors },
  } = methods;

  const values = watch();
  const name = watch("name");
  const slug = watch("slug");
  const images = watch("images") as string[] || [];
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
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Store mapping between image URL and publicId for deletion
  const imagePublicIdMapRef = useRef<Map<string, string>>(new Map());
  // Store file input refs for variant image uploads
  const variantFileInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());
  const [uploadingVariantImages, setUploadingVariantImages] = useState<Map<number, boolean>>(new Map());

  // Fetch raw Product data for editing (to get all fields including snake_case ones)
  const productId = currentProduct?.id;
  const { data: rawProductData } = useSWR<Product>(
    productId ? endpoints.product.details(productId) : null,
    fetcher,
  );

  // Helper function to extract publicId from Cloudinary URL
  // Cloudinary URL format: https://res.cloudinary.com/{cloudName}/image/upload/v{version}/{publicId}.{format}
  const extractPublicIdFromUrl = useCallback((url: string): string | null => {
    if (!url) return null;
    try {
      // Try to extract from Cloudinary URL pattern
      const cloudinaryPattern = /\/image\/upload\/v\d+\/(.+?)(?:\.[^.]+)?$/;
      const match = url.match(cloudinaryPattern);
      if (match && match[1]) {
        // Decode URL-encoded characters
        return decodeURIComponent(match[1]);
      }
      // Alternative pattern: /image/upload/{publicId}
      const altPattern = /\/image\/upload\/(.+?)(?:\.[^.]+)?$/;
      const altMatch = url.match(altPattern);
      if (altMatch && altMatch[1]) {
        return decodeURIComponent(altMatch[1]);
      }
      return null;
    } catch (error) {
      console.warn("Failed to extract publicId from URL:", url, error);
      return null;
    }
  }, []);

  // Load image publicId mapping from localStorage
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
      console.warn("Failed to load image mapping from localStorage:", error);
    }
  }, []);

  // Save image publicId mapping to localStorage
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
      console.warn("Failed to save image mapping to localStorage:", error);
    }
  }, []);

  // Initialize mapping for existing images (extract publicId from URLs)
  const initializeImageMapping = useCallback((images: string[]) => {
    images.forEach((url) => {
      // Only add if not already in map
      if (!imagePublicIdMapRef.current.has(url)) {
        const publicId = extractPublicIdFromUrl(url);
        if (publicId) {
          imagePublicIdMapRef.current.set(url, publicId);
        }
      }
    });
  }, [extractPublicIdFromUrl]);

  // Auto-extract publicId from image URLs when images change (e.g., user adds URL manually)
  useEffect(() => {
    if (images && images.length > 0) {
      images.forEach((url) => {
        // Only extract if not already in map
        if (!imagePublicIdMapRef.current.has(url)) {
          const publicId = extractPublicIdFromUrl(url);
          if (publicId) {
            imagePublicIdMapRef.current.set(url, publicId);
            // Save to localStorage if we have productId
            if (productId) {
              saveImageMapping(productId);
            }
          }
        }
      });
    }
  }, [images, extractPublicIdFromUrl, productId, saveImageMapping]);

  // Map raw Product DTO to form values
  const mapProductToFormValues = useCallback((product: Product | undefined): any => {
    if (!product) return defaultValues;

    const hasVariants = product.variants && product.variants.length > 0;

    // Extract unique colorIds and sizeIds from variants
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
      categoryId: product.category_id ? String(product.category_id) : "",
      // Attributes extracted from variants
      colorIds: Array.from(colorIdsSet),
      sizeIds: Array.from(sizeIdsSet),
      // Inventory fields
      manageVariants: hasVariants,
      sku: hasVariants ? "" : (product.sku || ""),
      stockQuantity: hasVariants ? 0 : (product.stock_quantity || 0),
      quantity: product.stock_quantity || 0,
      // Variants
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
      // Marketing fields (extract from tags or use defaults)
      isSale: Boolean(product.sale_price),
      saleLabel: "",
      isNew: false,
      newLabel: "",
      // Optional fields
      productCode: "",
      productSku: product.sku || "",
      costPrice: product.cost_price ? Number(product.cost_price) : undefined,
      barcode: product.barcode || undefined,
      metaTitle: product.meta_title || undefined,
      metaDescription: product.meta_description || undefined,
      weight: product.weight ? Number(product.weight) : undefined,
    };
  }, [defaultValues]);

  // Populate form when editing
  useEffect(() => {
    if (currentProduct && rawProductData) {
      // Handle both { data: Product } and direct Product formats
      const productData = (rawProductData as any)?.data || rawProductData;
      const formValues = mapProductToFormValues(productData as Product);
      reset(formValues);
      
      // Load mapping from localStorage first
      loadImageMapping(productId);
      
      // Initialize mapping for existing images (extract publicId from URLs)
      const images = formValues.images || [];
      initializeImageMapping(images);
      
      // Also initialize variant images
      const variants = formValues.variants || [];
      variants.forEach((variant: any) => {
        if (variant?.imageUrl) {
          initializeImageMapping([variant.imageUrl]);
        }
      });
      
      // Save mapping after initialization
      saveImageMapping(productId);
    } else if (!currentProduct) {
      // Reset to defaults when creating new product
      reset(defaultValues);
      // Clear publicId mapping for new product
      imagePublicIdMapRef.current.clear();
    }
  }, [currentProduct, rawProductData, mapProductToFormValues, reset, defaultValues, productId, loadImageMapping, initializeImageMapping, saveImageMapping]);

  // no taxes in backend DTO; remove taxes toggling

  // Handle image upload - Upload via backend to /files/upload-multiple
  const handleUploadImages = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    const MAX_FILES = 5;
    const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    const currentImages = (getValues("images") as string[]) || [];
    if (currentImages.length + selectedFiles.length > MAX_FILES) {
      enqueueSnackbar(t("productForm.maximumFiveImagesAllowed"), { variant: "warning" });
      return;
    }

    // Validate file types and sizes
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
      // Create FormData as per API spec
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("files", file));
      formData.append("folder", "products");

      // Upload via backend - don't set Content-Type header, let browser set it with boundary
      const response = await axios.post(endpoints.files.uploadMultiple, formData, {
        headers: {
          // Don't set Content-Type, let browser set it with proper boundary for multipart/form-data
        },
      });

      // Handle response format from backend:
      // { data: { success: true, files: [{ success, public_id, url, format, bytes, width, height }] }, message, success }
      // Axios wraps response in { data: ... }, so response.data contains the actual API response
      const apiResponse = response.data;
      
      // Extract files from response.data.data.files (actual API response structure)
      const uploadedFiles = apiResponse?.data?.files || apiResponse?.files || [];
      
      // Validate response structure
      if (!Array.isArray(uploadedFiles) || uploadedFiles.length === 0) {
        console.error("Invalid response format or no files uploaded:", apiResponse);
        enqueueSnackbar(t("productForm.noImagesUploaded"), { variant: "warning" });
        return;
      }

      // Extract URLs and store publicId mapping
      const uploadedUrls: string[] = [];
      uploadedFiles.forEach((file: any) => {
        if (file?.url && file?.success !== false) {
          const imageUrl = file.url;
          uploadedUrls.push(imageUrl);
          
          // Store mapping between URL and publicId for deletion
          if (file.public_id) {
            imagePublicIdMapRef.current.set(imageUrl, file.public_id);
          }
        }
      });
      
      if (uploadedUrls.length > 0) {
        const updatedImages = [...currentImages, ...uploadedUrls];
        setValue("images", updatedImages, { shouldValidate: true });
        // Save mapping to localStorage after upload
        saveImageMapping(productId);
        enqueueSnackbar(
          t("productForm.successfullyUploaded", { count: uploadedUrls.length }),
          { variant: "success" }
        );
      } else {
        enqueueSnackbar(t("productForm.noImagesUploaded"), { variant: "warning" });
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      
      // Handle different error formats
      const errorMessage = 
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        t("productForm.uploadFailed");
      
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setUploadingImages(false);
      // Reset file input to allow selecting same file again
      if (event.target) {
        event.target.value = "";
      }
    }
  }, [getValues, setValue, enqueueSnackbar, t]);

  // Handle variant image upload
  const handleUploadVariantImage = useCallback(async (variantIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) {
      console.warn("No files selected for variant image upload");
      return;
    }

    const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    // Validate file type and size
    const file = selectedFiles[0];
    if (!ACCEPTED_TYPES.includes(file.type)) {
      enqueueSnackbar(t("productForm.onlyJpgPngWebpAllowed"), { variant: "error" });
      return;
    }
    if (file.size > MAX_SIZE) {
      enqueueSnackbar(t("productForm.fileExceedsLimit", { fileName: file.name }), { variant: "error" });
      return;
    }

    // Set uploading state for this variant
    setUploadingVariantImages(prev => new Map(prev).set(variantIndex, true));

    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("folder", "products");

      console.log("Uploading variant image for index:", variantIndex);

      const response = await axios.post(endpoints.files.uploadMultiple, formData, {
        headers: {
          // Don't set Content-Type, let browser set it with proper boundary for multipart/form-data
        },
      });

      const apiResponse = response.data;
      const uploadedFiles = apiResponse?.data?.files || apiResponse?.files || [];

      if (uploadedFiles.length === 0 || !uploadedFiles[0]?.url) {
        console.error("No files in upload response:", apiResponse);
        enqueueSnackbar(t("productForm.noImagesUploaded"), { variant: "warning" });
        return;
      }

      const uploadedFile = uploadedFiles[0];
      const imageUrl = uploadedFile.url;

      console.log("Uploaded variant image URL:", imageUrl);

      // Store publicId mapping
      if (uploadedFile.public_id) {
        imagePublicIdMapRef.current.set(imageUrl, uploadedFile.public_id);
      }

      // Get current variants from form - use getValues to ensure we have latest data
      const currentVariants = getValues("variants") || [];
      console.log("Current variants before update:", JSON.parse(JSON.stringify(currentVariants)), "Index:", variantIndex);
      
      // Create a deep copy of variants array to avoid mutation issues
      const updatedVariants = currentVariants.map((variant: any) => ({
        name: variant?.name || "",
        sku: variant?.sku || "",
        price: variant?.price || 0,
        stock: variant?.stock || 0,
        colorId: variant?.colorId || "",
        sizeId: variant?.sizeId || "",
        imageUrl: variant?.imageUrl || "",
      }));
      
      // Ensure array has enough elements
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
      
      // Update ONLY the specific variant at variantIndex, preserving all other variants and their imageUrl
      updatedVariants[variantIndex] = {
        ...updatedVariants[variantIndex],
        imageUrl: imageUrl,
      };
      
      console.log("Updated variants after image upload:", JSON.parse(JSON.stringify(updatedVariants)));
      console.log(`Variant ${variantIndex} now has imageUrl:`, imageUrl);
      console.log("All variant imageUrls:", updatedVariants.map((v: any, i: number) => `[${i}]: ${v.imageUrl}`));
      
      // Preserve manageVariants state BEFORE updating variants to prevent reset
      const currentManageVariants = getValues("manageVariants");
      
      // Use shouldDirty and shouldTouch to ensure form updates
      // Don't validate to avoid resetting manageVariants state
      setValue("variants", updatedVariants, { 
        shouldValidate: false,
        shouldDirty: true,
        shouldTouch: true 
      });

      // Also add to product images array if not already present
      const currentImages = (getValues("images") as string[]) || [];
      if (!currentImages.includes(imageUrl)) {
        const updatedImages = [...currentImages, imageUrl].slice(0, 5); // Max 5 images
        setValue("images", updatedImages, { shouldValidate: false });
      }
      
      // Restore manageVariants state after all updates to ensure it's preserved
      if (currentManageVariants !== undefined) {
        // Use setTimeout to ensure this runs after all setValue calls
        setTimeout(() => {
          const currentValue = getValues("manageVariants");
          if (currentValue !== currentManageVariants) {
            setValue("manageVariants", currentManageVariants, { shouldValidate: false });
          }
        }, 0);
      }

      // Save mapping to localStorage after upload
      saveImageMapping(productId);

      enqueueSnackbar(t("productForm.variantImageUploaded"), { variant: "success" });
    } catch (error: any) {
      console.error("Variant image upload error:", error);
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
      // Reset file input to allow selecting same file again
      if (event.target) {
        event.target.value = "";
      }
    }
  }, [getValues, setValue, enqueueSnackbar, t]);

  // Handle variant image deletion
  const handleDeleteVariantImage = useCallback((variantIndex: number) => {
    const currentVariants = getValues("variants") || [];
    const updatedVariants = [...currentVariants];
    const variant = updatedVariants[variantIndex];
    
    if (variant?.imageUrl) {
      const imageUrl = variant.imageUrl;
      // Remove imageUrl from variant
      updatedVariants[variantIndex] = {
        ...variant,
        imageUrl: "",
      };
      setValue("variants", updatedVariants, { shouldValidate: true });

      // Optionally remove from product images if it was only used by this variant
      // (For now, we keep it in product images - can be enhanced later)
      
      // Note: We don't delete from server here as the image might still be in product images
      // If you want to delete from server, uncomment below:
      // const publicId = imagePublicIdMapRef.current.get(imageUrl);
      // if (publicId) {
      //   axios.delete(endpoints.files.delete(publicId), { data: { resourceType: "image" } })
      //     .catch(err => console.warn("Failed to delete variant image:", err));
      // }
    }
  }, [getValues, setValue]);

  // Handle image deletion (both from form state and from server)
  const handleDeleteImage = useCallback(async (imageUrl: string) => {
    const currentImages = (getValues("images") as string[]) || [];
    
    // Remove from form state immediately for better UX
    const updatedImages = currentImages.filter((url) => url !== imageUrl);
    setValue("images", updatedImages, { shouldValidate: true });
    
    // Get publicId from mapping and delete from server
    const publicId = imagePublicIdMapRef.current.get(imageUrl);
    if (publicId) {
      try {
        await axios.delete(endpoints.files.delete(publicId), {
          data: { resourceType: "image" },
        });
        // Remove from mapping after successful deletion
        imagePublicIdMapRef.current.delete(imageUrl);
        // Update localStorage
        saveImageMapping(productId);
      } catch (error) {
        // Silent fail - image already removed from form, server cleanup is optional
        console.warn("Failed to delete image from server:", error);
        // Still remove from mapping to avoid stale data
        imagePublicIdMapRef.current.delete(imageUrl);
        // Update localStorage
        saveImageMapping(productId);
      }
    } else {
      // If no publicId in mapping, try to extract from URL and delete
      const extractedPublicId = extractPublicIdFromUrl(imageUrl);
      if (extractedPublicId) {
        try {
          await axios.delete(endpoints.files.delete(extractedPublicId), {
            data: { resourceType: "image" },
          });
        } catch (error) {
          console.warn("Failed to delete image from server using extracted publicId:", error);
        }
      }
    }
  }, [getValues, setValue, productId, saveImageMapping, extractPublicIdFromUrl]);

  // Handle validation errors on submit
  const onError = useCallback((errors: any) => {
    // Helper function to find first error field (including nested fields)
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
      // Show alert with error message
      enqueueSnackbar(
        `${t("productForm.validationFailed")}: ${firstError.message}`,
        { variant: "error", autoHideDuration: 5000 }
      );
      
      // Scroll to first error field
      setTimeout(() => {
        // Convert path like "variants.0.name" to field name "variants[0].name"
        const fieldName = firstError.path.replace(/\.(\d+)\./g, "[$1].").replace(/\.(\d+)$/g, "[$1]");
        const element = document.querySelector(`[name="${fieldName}"]`) as HTMLElement;
        
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          // Focus on the element if it's focusable
          if (element.focus) {
            element.focus();
          }
        } else {
          // If exact match not found, try to find by partial name
          const fallbackElement = document.querySelector(`[name*="${fieldName.split(".")[0]}"]`) as HTMLElement;
          if (fallbackElement) {
            fallbackElement.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      }, 100);
    } else {
      // Fallback message if no specific error found
      enqueueSnackbar(
        t("productForm.pleaseFillRequiredFields"),
        { variant: "error", autoHideDuration: 5000 }
      );
    }
  }, [enqueueSnackbar, t]);

  const onSubmit = handleSubmit(
    async (data) => {
    try {
      // FE-side guard rails per BE rules
      const basePrice = Number(data.price) || 0;
      const sale = data.salePrice != null ? Number(data.salePrice) : undefined;
      if (sale != null && sale > basePrice) {
        setError("salePrice", { type: "validate", message: t("productForm.salePriceCannotBeGreater") });
        enqueueSnackbar(t("productForm.salePriceCannotBeGreater"), { variant: "error" });
        return;
      }

      // Build payload with snake_case keys to match sample and mock API
      const payload: any = {
        name: data.name,
        slug: data.slug,
        description: data.description || undefined,
        short_description: data.shortDescription || undefined,
        images: (data.images as string[])?.slice(0, 5) || [],
        price: basePrice,
        sale_price: sale != null ? sale : undefined,
        // Optional fields if present in the form (map to snake_case)
        cost_price: (data as any).costPrice != null ? Number((data as any).costPrice) : undefined,
        barcode: (data as any).barcode || undefined,
        status: data.status === 'active' ? 'active' : 'inactive',
        is_featured: !!data.isFeatured,
        meta_title: (data as any).metaTitle || undefined,
        meta_description: (data as any).metaDescription || undefined,
        weight: (data as any).weight != null ? Number((data as any).weight) : undefined,
        // Keep category for backend linkage if available
        category_id: data.categoryId ? Number(data.categoryId) : undefined,
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
        
        // Collect all variant image URLs and merge with product images (avoid duplicates)
        const variantImageUrls = (data.variants || [])
          .map((v: any) => v.imageUrl)
          .filter((url: string) => url && url.trim());
        const productImageUrls = (data.images as string[]) || [];
        const imageSet = new Set<string>([...productImageUrls, ...variantImageUrls]);
        const allImageUrls = Array.from(imageSet).slice(0, 5);
        
        // Update images array to include variant images
        payload.images = allImageUrls;
        // Ensure base-level SKU/stock are not set when variants exist
        if ((payload.variants as any[]).length > 0) {
          delete payload.sku;
          delete payload.stock_quantity;
        }
      } else {
        // Simple product: include base sku and stock quantity
        payload.sku = data.sku || undefined;
        payload.stock_quantity = Number(data.stockQuantity) || 0;
      }

      if (currentProduct?.id) {
        // Update existing product
        const updated = await updateProduct(currentProduct.id, payload);
        // Save image mapping to localStorage after update
        saveImageMapping(currentProduct.id);
        enqueueSnackbar(t("productForm.updateSuccess"));
        router.push(paths.dashboard.product.details(currentProduct.id));
      } else {
        // Create new product
      const created = await createProduct(payload);
      enqueueSnackbar(t("productForm.createSuccess"));
      const newId = created?.id || created?.data?.id;
      if (newId) {
        // Save image mapping to localStorage with new productId
        saveImageMapping(newId);
        router.push(paths.dashboard.product.details(newId));
      } else {
        router.push(paths.dashboard.product.root);
        }
      }
    } catch (error) {
      // Map BE validation messages to inline field errors for better UX
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
          // If BE points to negative stock, highlight a generic error; detailed per-row handling would need BE field mapping
          setError("variants", { type: "server", message: "Stock cannot be negative" });
        } else {
          setError("stockQuantity", { type: "server", message: "Stock cannot be negative" });
        }
      }
      
      // Show general error alert
      const errorMsg = message || t("productForm.pleaseFillRequiredFields");
      enqueueSnackbar(errorMsg, { variant: "error", autoHideDuration: 5000 });
      console.error(error);
    }
  },
  onError
  );

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

              {/* Image thumbnails preview */}
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
                        paddingTop: '100%', // Square aspect ratio
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
                          // Fallback nếu ảnh lỗi
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                        }}
                      />
                      {/* Image index badge */}
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
                      {/* Delete button */}
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
                      {/* Hover overlay */}
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

              {/* Manual URL input (optional) - visible as secondary option */}
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

  const renderVariants = (
    <>
      {values.manageVariants && (
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
                <Stack direction="row" spacing={2} sx={{ px: 1, color: "text.secondary", typography: "caption" }}>
                  <Box sx={{ flex: 2 }}>{t("productForm.variantName")}</Box>
                  <Box sx={{ flex: 1 }}>{t("productForm.sku")}</Box>
                  <Box sx={{ flex: 1 }}>{t("productForm.price")}</Box>
                  <Box sx={{ flex: 1 }}>{t("productForm.stockQuantity")}</Box>
                  <Box sx={{ flex: 1 }}>{t("productForm.colors")}</Box>
                  <Box sx={{ flex: 1 }}>{t("productForm.sizes")}</Box>
                  <Box sx={{ width: 64 }} />
                </Stack>

                {variantFields.map((field, index) => {
                  // Watch variants to ensure re-render when imageUrl changes
                  const variants = watch("variants") as any[] || [];
                  const variant = variants[index];
                  const variantImageUrl = variant?.imageUrl || "";
                  const isUploadingVariant = uploadingVariantImages.get(index) || false;
                  
                  // Debug: log variant data
                  if (process.env.NODE_ENV === 'development' && variantImageUrl) {
                    console.log(`Variant ${index} imageUrl:`, variantImageUrl);
                  }
                  
                  return (
                    <Box key={field.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ flex: 2 }}>
                          <RHFTextField required name={`variants[${index}].name`} label=" " placeholder={t("productForm.variantName")} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <RHFTextField required name={`variants[${index}].sku`} label=" " placeholder={t("productForm.sku")} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <RHFTextField required name={`variants[${index}].price`} label=" " type="number" placeholder="0" />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <RHFTextField required name={`variants[${index}].stock`} label=" " type="number" placeholder="0" />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <RHFSelect required native name={`variants[${index}].colorId`} label=" ">
                            <option value="" />
                            {colors.map((c: any) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </RHFSelect>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <RHFSelect required native name={`variants[${index}].sizeId`} label=" ">
                            <option value="" />
                            {sizes.map((s: any) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </RHFSelect>
                        </Box>
                        <Box sx={{ width: 64 }}>
                          <Button color="error" onClick={() => removeVariant(index)}>{t("productForm.delete")}</Button>
                        </Box>
                      </Stack>

                      {/* Variant Image Upload */}
                      <Stack spacing={1} sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {t("productForm.variantImage")}:
                          </Typography>
                          <input
                            ref={(el) => {
                              if (el) {
                                variantFileInputRefs.current.set(index, el);
                              } else {
                                variantFileInputRefs.current.delete(index);
                              }
                            }}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            style={{ display: 'none' }}
                            onChange={(e) => handleUploadVariantImage(index, e)}
                            disabled={isUploadingVariant}
                          />
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Iconify icon="eva:image-fill" width={16} />}
                            onClick={() => variantFileInputRefs.current.get(index)?.click()}
                            disabled={isUploadingVariant}
                          >
                            {isUploadingVariant ? t("productForm.uploading") : t("productForm.uploadImage")}
                          </Button>
                          {variantImageUrl && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteVariantImage(index)}
                            >
                              <Iconify icon="eva:close-fill" width={16} />
                            </IconButton>
                          )}
                        </Box>

                        {/* Variant Image Preview */}
                        {variantImageUrl && (
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: 1,
                              overflow: 'hidden',
                              border: '1px solid',
                              borderColor: 'divider',
                              position: 'relative',
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
                          </Box>
                        )}
                      </Stack>
                    </Box>
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
  );

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
          <FormControlLabel
            control={<Switch defaultChecked />}
            label={t("productForm.publish")}
            sx={{ pl: 1 }}
          />
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
        {/* Attributes (collapsible) */}
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

        {/* Inventory */}
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

              {!values.manageVariants && (
                <Box columnGap={2} rowGap={3} display="grid" gridTemplateColumns={{ xs: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}>
                  <RHFTextField required={!values.manageVariants} name="sku" label={t("productForm.sku")} placeholder={t("productForm.skuPlaceholder")} />
                  <RHFTextField required={!values.manageVariants} name="stockQuantity" label={t("productForm.stockQuantity")} type="number" InputLabelProps={{ shrink: true }} />
                </Box>
              )}

              <RHFTextField required name="quantity" label={t("productForm.quantity")} placeholder={t("productForm.quantityPlaceholder")} type="number" InputLabelProps={{ shrink: true }} />
            </Stack>
          </Card>
        </Grid>

        {renderVariants}

        {/* Marketing */}
        <Grid md={2} sx={{ display: { xs: 'none', md: 'block' } }} />
        <Grid xs={12} md={10}>
          <Card sx={{ mt: 3 }}>
            <CardHeader title={t("productForm.marketingOptions")} />
            <Stack spacing={3} sx={{ p: 3 }}>
              <FormControlLabel control={<Switch checked={values.isFeatured} onChange={(e) => setValue("isFeatured", e.target.checked)} />} label={t("productForm.featuredProduct")} />

              <Stack spacing={1}>
                <FormControlLabel control={<RHFSwitch name="isSale" label={null} sx={{ m: 0 }} />} label={t("productForm.enableSaleLabel")} />
                {values.isSale && (
                  <RHFTextField name="saleLabel" label={t("productForm.saleLabel")} fullWidth />
                )}
              </Stack>

              <Stack spacing={1}>
                <FormControlLabel control={<RHFSwitch name="isNew" label={null} sx={{ m: 0 }} />} label={t("productForm.enableCustomLabel")} />
                {values.isNew && (
                  <RHFTextField name="newLabel" label={t("productForm.customLabel")} fullWidth />
                )}
              </Stack>
            </Stack>
          </Card>
        </Grid>

        {renderActions}
      </Grid>

      {/* Create Category Dialog */}
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
            {t("productForm.create")}
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Create Color Dialog */}
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

      {/* Create Size Dialog */}
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
              const created = await createSize({ name: newSizeName.trim(), categoryId: values.categoryId || undefined });
              await mutate([endpoints.refs.sizes, { params: { categoryId: values.categoryId } }]);
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
