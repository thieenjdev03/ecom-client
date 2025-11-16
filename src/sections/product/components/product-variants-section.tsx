import { memo, useRef, useState, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Grid from "@mui/material/Unstable_Grid2";
import InputAdornment from "@mui/material/InputAdornment";
import Iconify from "src/components/iconify";
import { RHFTextField, RHFSelect } from "src/components/hook-form";
import VariantImageUpload from "./variant-image-upload";
import axios from "src/utils/axios";
import { endpoints } from "src/utils/axios";

// ----------------------------------------------------------------------

// Memoized Variant Item Component
const VariantItem = memo(
  ({
    index,
    field,
    variant,
    colors,
    sizes,
    isUploading,
    onUploadStart,
    onUploadEnd,
    onImageUploaded,
    onDeleteImage,
    onRemoveVariant,
    t,
  }: any) => {
    const selectedColor = colors.find((c: any) => c.id === variant?.colorId);
    const selectedSize = sizes.find((s: any) => s.id === variant?.sizeId);

    return (
      <Box
        key={field.id}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1.5,
          p: 2,
          bgcolor: "background.neutral",
        }}
      >
        {/* Variant Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ color: "text.primary" }}>
            {t("productForm.variant")} #{index + 1}
            {(selectedColor || selectedSize) && (
              <Typography component="span" variant="body2" sx={{ color: "text.secondary", ml: 1 }}>
                ({[selectedColor?.name, selectedSize?.name].filter(Boolean).join(" - ")})
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
          {/* Variant Image Upload */}
          <VariantImageUpload
            imageUrl={variant?.imageUrl}
            variantIndex={index}
            isUploading={isUploading}
            onUploadStart={onUploadStart}
            onUploadEnd={onUploadEnd}
            onImageUploaded={onImageUploaded}
            onDeleteImage={onDeleteImage}
            t={t}
          />

          {/* Variant Fields */}
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
                <RHFTextField
                  required
                  name={`variants[${index}].salePrice`}
                  label={t("productForm.salePrice")}
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
  }
);

VariantItem.displayName = "VariantItem";

// ----------------------------------------------------------------------

interface ProductVariantsSectionProps {
  variantFields: any[];
  colors: any[];
  sizes: any[];
  mdUp: boolean;
  productId?: string | number;
  onAppendVariant: (variant: any) => void;
  onRemoveVariant: (index: number) => void;
  onImageMappingSave?: (imageUrl: string, publicId: string) => void;
  imagePublicIdMapRef: React.MutableRefObject<Map<string, string>>;
  t: (key: string, options?: any) => string;
}

export default function ProductVariantsSection({
  variantFields,
  colors,
  sizes,
  mdUp,
  productId,
  onAppendVariant,
  onRemoveVariant,
  onImageMappingSave,
  imagePublicIdMapRef,
  t,
}: ProductVariantsSectionProps) {
  const { getValues, setValue } = useFormContext();
  const bulkVariantImagesInputRef = useRef<HTMLInputElement>(null);
  const [uploadingVariantImages, setUploadingVariantImages] = useState<Map<number, boolean>>(
    new Map()
  );
  const [uploadingBulkVariantImages, setUploadingBulkVariantImages] = useState(false);

  // Handle variant image upload start
  const handleUploadStart = useCallback((index: number) => {
    setUploadingVariantImages((prev) => new Map(prev).set(index, true));
  }, []);

  // Handle variant image upload end
  const handleUploadEnd = useCallback((index: number) => {
    setUploadingVariantImages((prev) => {
      const newMap = new Map(prev);
      newMap.delete(index);
      return newMap;
    });
  }, []);

  // Handle variant image uploaded
  const handleImageUploaded = useCallback(
    (variantIndex: number, uploadedUrls: string[], publicIds: string[]) => {
      // Get current variants - CRITICAL: Get fresh data
      const currentVariants = getValues("variants") || [];

      // Create a deep copy to preserve ALL fields
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

      // Fill images into variants starting from variantIndex
      let imagesAssigned = 0;
      for (let i = 0; i < uploadedUrls.length; i++) {
        const targetIndex = variantIndex + i;
        if (targetIndex < updatedVariants.length) {
          updatedVariants[targetIndex] = {
            ...updatedVariants[targetIndex],
            imageUrl: uploadedUrls[i],
          };
          // Store mapping
          if (publicIds[i]) {
            imagePublicIdMapRef.current.set(uploadedUrls[i], publicIds[i]);
            onImageMappingSave?.(uploadedUrls[i], publicIds[i]);
          }
          imagesAssigned++;
        }
      }

      // Preserve manageVariants state
      const currentManageVariants = getValues("manageVariants");

      // Update variants
      setValue("variants", updatedVariants, {
        shouldValidate: false,
        shouldDirty: true,
        shouldTouch: false,
      });

      // Add all uploaded images to product images array
      const currentImages = (getValues("images") as string[]) || [];
      const newImages = uploadedUrls.filter((url) => !currentImages.includes(url));
      if (newImages.length > 0) {
        const updatedImages = [...currentImages, ...newImages].slice(0, 5);
        setValue("images", updatedImages, { shouldValidate: false, shouldDirty: false });
      }

      // Restore manageVariants state
      if (currentManageVariants !== undefined) {
        setTimeout(() => {
          const currentValue = getValues("manageVariants");
          if (currentValue !== currentManageVariants) {
            setValue("manageVariants", currentManageVariants, { shouldValidate: false });
          }
        }, 0);
      }
    },
    [getValues, setValue, imagePublicIdMapRef, onImageMappingSave]
  );

  // Handle variant image deletion
  const handleDeleteVariantImage = useCallback(
    (variantIndex: number) => {
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
    },
    [getValues, setValue]
  );

  // Handle bulk upload variant images
  const handleBulkUploadVariantImages = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(event.target.files || []);
      if (selectedFiles.length === 0) return;

      const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB

      // Validate all files first
      for (const file of selectedFiles) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          return;
        }
        if (file.size > MAX_SIZE) {
          return;
        }
      }

      setUploadingBulkVariantImages(true);

      try {
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append("files", file));
        formData.append("folder", "products");

        const response = await axios.post(endpoints.files.uploadMultiple, formData);
        const apiResponse = response.data;
        const uploadedFiles = apiResponse?.data?.files || apiResponse?.files || [];

        if (!Array.isArray(uploadedFiles) || uploadedFiles.length === 0) {
          return;
        }

        // Extract URLs and store publicId mapping
        const uploadedUrls: string[] = [];
        uploadedFiles.forEach((file: any) => {
          if (file?.url && file?.success !== false) {
            const imageUrl = file.url;
            uploadedUrls.push(imageUrl);

            if (file.public_id) {
              imagePublicIdMapRef.current.set(imageUrl, file.public_id);
              onImageMappingSave?.(imageUrl, file.public_id);
            }
          }
        });

        if (uploadedUrls.length === 0) return;

        // Get current variants - CRITICAL: Get fresh data
        const currentVariants = getValues("variants") || [];

        // Create a deep copy of variants array
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

        // Fill images into variants sequentially
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

        // If there are remaining images, fill from the beginning
        if (imageIndex < uploadedUrls.length) {
          for (let i = 0; i < updatedVariants.length && imageIndex < uploadedUrls.length; i++) {
            updatedVariants[i] = {
              ...updatedVariants[i],
              imageUrl: uploadedUrls[imageIndex],
            };
            imageIndex++;
          }
        }

        // Preserve manageVariants state
        const currentManageVariants = getValues("manageVariants");

        // Update variants
        setValue("variants", updatedVariants, {
          shouldValidate: false,
          shouldDirty: true,
          shouldTouch: false,
        });

        // Add all uploaded images to product images array
        const currentImages = (getValues("images") as string[]) || [];
        const newImages = uploadedUrls.filter((url) => !currentImages.includes(url));
        if (newImages.length > 0) {
          const updatedImages = [...currentImages, ...newImages].slice(0, 5);
          setValue("images", updatedImages, { shouldValidate: false, shouldDirty: false });
        }

        // Restore manageVariants state
        if (currentManageVariants !== undefined) {
          setTimeout(() => {
            const currentValue = getValues("manageVariants");
            if (currentValue !== currentManageVariants) {
              setValue("manageVariants", currentManageVariants, { shouldValidate: false });
            }
          }, 0);
        }
      } catch (error: any) {
        console.error("Bulk variant images upload error:", error);
      } finally {
        setUploadingBulkVariantImages(false);
        if (event.target) {
          event.target.value = "";
        }
      }
    },
    [getValues, setValue, imagePublicIdMapRef, onImageMappingSave]
  );

  return (
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
            {/* Bulk Upload Button */}
            {variantFields.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2,
                  bgcolor: "background.paper",
                  borderRadius: 1,
                  border: "1px dashed",
                  borderColor: "divider",
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {t("productForm.bulkUploadVariantImages")}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {t("productForm.bulkUploadDescription")}
                  </Typography>
                </Box>
                <Box>
                  <input
                    ref={bulkVariantImagesInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    style={{ display: "none" }}
                    onChange={handleBulkUploadVariantImages}
                    disabled={uploadingBulkVariantImages}
                  />
                  <Button
                    variant="contained"
                    startIcon={
                      <Iconify
                        icon={
                          uploadingBulkVariantImages ? "eos-icons:loading" : "eva:cloud-upload-fill"
                        }
                      />
                    }
                    onClick={() => bulkVariantImagesInputRef.current?.click()}
                    disabled={uploadingBulkVariantImages}
                  >
                    {uploadingBulkVariantImages
                      ? t("productForm.uploading")
                      : t("productForm.uploadMultipleImages")}
                  </Button>
                </Box>
              </Box>
            )}

            {/* Variant Items */}
            {variantFields.map((field, index) => {
              const variants = (getValues("variants") as any[]) || [];
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
                  onUploadStart={handleUploadStart}
                  onUploadEnd={handleUploadEnd}
                  onImageUploaded={handleImageUploaded}
                  onDeleteImage={handleDeleteVariantImage}
                  onRemoveVariant={onRemoveVariant}
                  t={t}
                />
              );
            })}

            {/* Add Variant Button */}
            <Box>
              <Button
                variant="outlined"
                onClick={() =>
                  onAppendVariant({
                    name: "",
                    sku: "",
                    price: 0,
                    stock: 0,
                    colorId: "",
                    sizeId: "",
                    imageUrl: "",
                  })
                }
              >
                {t("productForm.addVariant")}
              </Button>
            </Box>
          </Stack>
        </Card>
      </Grid>
    </>
  );
}

