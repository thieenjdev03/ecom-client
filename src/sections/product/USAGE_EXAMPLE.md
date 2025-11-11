# Usage Example: Integrating Refactored Components

This document shows how to update `product-new-edit-form.tsx` to use the new refactored components.

## Before and After Comparison

### 1. Image Upload Section

#### BEFORE (Old Code - ~200 lines)

```tsx
// State management
const [uploadingImages, setUploadingImages] = useState(false);
const fileInputRef = useRef<HTMLInputElement>(null);
const imagePublicIdMapRef = useRef<Map<string, string>>(new Map());

// Complex upload handler
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

  // ... 100+ more lines of validation, upload, and error handling
}, [getValues, setValue, enqueueSnackbar, t]);

// Complex delete handler
const handleDeleteImage = useCallback(async (imageUrl: string) => {
  // ... 50+ lines
}, [getValues, setValue, productId, saveImageMapping, extractPublicIdFromUrl]);

// Complex JSX (100+ lines)
<Stack spacing={1}>
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <Typography variant="subtitle2">{t("productForm.images")}</Typography>
    <input ref={fileInputRef} type="file" /* ... */ />
    <Button /* ... */ />
  </Box>
  
  {watch("images") && (watch("images") as string[]).length > 0 && (
    <Box sx={{ /* complex grid styles */ }}>
      {(watch("images") as string[]).map((imageUrl, index) => (
        <Box key={`${imageUrl}-${index}`} sx={{ /* complex styles */ }}>
          {/* 50+ lines of thumbnail UI */}
        </Box>
      ))}
    </Box>
  )}
  
  {/* Manual URL input */}
  <RHFAutocomplete /* ... */ />
</Stack>
```

#### AFTER (New Code - ~10 lines)

```tsx
// Import
import { ProductImageUpload } from './components';
import { useImageMapping } from './hooks';

// Setup hook
const imageMapping = useImageMapping(productId);
const [uploadingImages, setUploadingImages] = useState(false);

// Initialize on mount
useEffect(() => {
  imageMapping.loadImageMapping(productId);
  imageMapping.initializeImageMapping(watch("images") || []);
}, [productId]);

// Use component
<ProductImageUpload
  uploadingImages={uploadingImages}
  onUploadStart={() => setUploadingImages(true)}
  onUploadEnd={() => setUploadingImages(false)}
  onImageMappingSave={(url, publicId) => {
    imageMapping.addImageMapping(url, publicId);
    imageMapping.saveImageMapping(productId);
  }}
  imagePublicIdMapRef={imageMapping.imagePublicIdMapRef}
  t={t}
/>
```

**Result:** Reduced from ~350 lines to ~25 lines (93% reduction)

---

### 2. Variant Section

#### BEFORE (Old Code - ~400 lines)

```tsx
// Multiple refs and state
const variantFileInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());
const [uploadingVariantImages, setUploadingVariantImages] = useState<Map<number, boolean>>(new Map());
const [uploadingBulkVariantImages, setUploadingBulkVariantImages] = useState(false);
const bulkVariantImagesInputRef = useRef<HTMLInputElement>(null);

// Complex upload handler
const handleUploadVariantImage = useCallback(async (variantIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
  // ... 150+ lines of complex logic
}, [getValues, setValue, enqueueSnackbar, t, saveImageMapping, productId]);

// Bulk upload handler
const handleBulkUploadVariantImages = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
  // ... 150+ lines
}, [getValues, setValue, enqueueSnackbar, t, saveImageMapping, productId]);

// Delete handler
const handleDeleteVariantImage = useCallback((variantIndex: number) => {
  // ... 30+ lines
}, [getValues, setValue]);

// Complex JSX (200+ lines)
{manageVariants && (
  <>
    {mdUp && (
      <Grid md={2}>
        <Typography variant="h6">{t("productForm.variants")}</Typography>
      </Grid>
    )}
    
    <Grid xs={12} md={10}>
      <Card>
        <Stack spacing={2} sx={{ p: 3 }}>
          {/* Bulk upload UI - 50+ lines */}
          {variantFields.length > 0 && (
            <Box /* ... */>
              {/* Complex bulk upload button */}
            </Box>
          )}
          
          {/* Variant items - 150+ lines each */}
          {variantFields.map((field, index) => {
            const variants = getValues("variants") as any[] || [];
            const variant = variants[index];
            const variantImageUrl = variant?.imageUrl || "";
            const isUploadingVariant = uploadingVariantImages.get(index) || false;
            
            return (
              <Box key={field.id} sx={{ /* ... */ }}>
                {/* 150+ lines of variant UI */}
              </Box>
            );
          })}
          
          <Box>
            <Button variant="outlined" onClick={() => appendVariant(/* ... */)}>
              {t("productForm.addVariant")}
            </Button>
          </Box>
        </Stack>
      </Card>
    </Grid>
  </>
)}
```

#### AFTER (New Code - ~15 lines)

```tsx
// Import
import { ProductVariantsSection } from './components';
import { useImageMapping } from './hooks';

// Setup (already done for image upload)
const imageMapping = useImageMapping(productId);

// Use component
{manageVariants && (
  <ProductVariantsSection
    variantFields={variantFields}
    colors={colors}
    sizes={sizes}
    mdUp={mdUp}
    productId={productId}
    onAppendVariant={appendVariant}
    onRemoveVariant={removeVariant}
    onImageMappingSave={(url, publicId) => {
      imageMapping.addImageMapping(url, publicId);
      imageMapping.saveImageMapping(productId);
    }}
    imagePublicIdMapRef={imageMapping.imagePublicIdMapRef}
    t={t}
  />
)}
```

**Result:** Reduced from ~600 lines to ~20 lines (97% reduction)

---

### 3. Reference Creation Dialogs

#### BEFORE (Old Code - ~150 lines)

```tsx
// Multiple dialog states
const [openCreateCategory, setOpenCreateCategory] = useState(false);
const [openCreateColor, setOpenCreateColor] = useState(false);
const [openCreateSize, setOpenCreateSize] = useState(false);
const [newCategoryName, setNewCategoryName] = useState("");
const [newColorName, setNewColorName] = useState("");
const [newColorHex, setNewColorHex] = useState("");
const [newSizeName, setNewSizeName] = useState("");

// Complex JSX for each dialog (50+ lines each)
{/* Create Category Dialog */}
<Dialog open={openCreateCategory} onClose={() => setOpenCreateCategory(false)} fullWidth maxWidth="xs">
  <DialogTitle>{t("productForm.newCategory")}</DialogTitle>
  <DialogContent>
    <RHFTextField name="_newCategoryName" /* ... */ />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenCreateCategory(false)}>{t("productForm.cancel")}</Button>
    <LoadingButton variant="contained" onClick={async () => {
      if (!newCategoryName.trim()) return;
      const slugFromName = newCategoryName/* ... 10+ lines */
      await createCategory({ name: newCategoryName.trim(), slug: slugFromName });
      await mutate(endpoints.refs.categories);
      setNewCategoryName("");
      setOpenCreateCategory(false);
    }}>
      {t("productForm.create")}
    </LoadingButton>
  </DialogActions>
</Dialog>

{/* Similar for Color - 50+ lines */}
{/* Similar for Size - 50+ lines */}
```

#### AFTER (New Code - ~10 lines)

```tsx
// Import
import { ReferenceDialogs } from './components';

// Simple state
const [openCreateCategory, setOpenCreateCategory] = useState(false);
const [openCreateColor, setOpenCreateColor] = useState(false);
const [openCreateSize, setOpenCreateSize] = useState(false);

// Use component
<ReferenceDialogs
  t={t}
  currentCategoryId={watch("categoryId")}
  openCreateCategory={openCreateCategory}
  openCreateColor={openCreateColor}
  openCreateSize={openCreateSize}
  onCloseCategory={() => setOpenCreateCategory(false)}
  onCloseColor={() => setOpenCreateColor(false)}
  onCloseSize={() => setOpenCreateSize(false)}
/>
```

**Result:** Reduced from ~150 lines to ~15 lines (90% reduction)

---

## Complete Updated Form Structure

Here's how the main form looks after refactoring:

```tsx
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useFieldArray } from "react-hook-form";

// ... other imports

// NEW: Import refactored components and hooks
import {
  ProductImageUpload,
  ReferenceDialogs,
  ProductVariantsSection,
} from './components';

import {
  useImageMapping,
  useProductDraft,
} from './hooks';

// ... type definitions

export default function ProductNewEditForm({ currentProduct }: Props) {
  const router = useRouter();
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();
  
  // Form setup
  const methods = useForm<any>({
    resolver: yupResolver(NewProductSchema) as any,
    defaultValues,
  });
  
  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: methods.control,
    name: "variants",
  });
  
  // NEW: Use refactored hooks
  const imageMapping = useImageMapping(productId);
  const { saveDraftToLocalStorage, loadDraftFromLocalStorage, clearDraftFromLocalStorage } = useProductDraft(productId);
  
  // States
  const [uploadingImages, setUploadingImages] = useState(false);
  const [openCreateCategory, setOpenCreateCategory] = useState(false);
  const [openCreateColor, setOpenCreateColor] = useState(false);
  const [openCreateSize, setOpenCreateSize] = useState(false);
  
  // Load reference data
  const { categories } = useGetCategories();
  const { colors } = useGetColors();
  const { sizes } = useGetSizes();
  
  // Initialize image mapping
  useEffect(() => {
    if (currentProduct && rawProductData) {
      imageMapping.loadImageMapping(productId);
      imageMapping.initializeImageMapping(formValues.images || []);
      // Initialize variant images too
      (formValues.variants || []).forEach((variant: any) => {
        if (variant?.imageUrl) {
          imageMapping.initializeImageMapping([variant.imageUrl]);
        }
      });
      imageMapping.saveImageMapping(productId);
    }
  }, [currentProduct, rawProductData, productId]);
  
  // Rest of form logic (validation, submit, etc.)
  // ...
  
  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {/* Details Section */}
        <Grid xs={12} md={10}>
          <Card>
            <Stack spacing={3} sx={{ p: 3 }}>
              <RHFTextField name="name" label={t("productForm.name")} />
              <RHFTextField name="slug" label={t("productForm.slug")} />
              <RHFTextField name="shortDescription" label={t("productForm.shortDescription")} />
              <RHFEditor name="description" />
              
              {/* NEW: Use ProductImageUpload component */}
              <ProductImageUpload
                uploadingImages={uploadingImages}
                onUploadStart={() => setUploadingImages(true)}
                onUploadEnd={() => setUploadingImages(false)}
                onImageMappingSave={(url, publicId) => {
                  imageMapping.addImageMapping(url, publicId);
                  imageMapping.saveImageMapping(productId);
                }}
                imagePublicIdMapRef={imageMapping.imagePublicIdMapRef}
                t={t}
              />
              
              {/* Other fields */}
            </Stack>
          </Card>
        </Grid>
        
        {/* Properties, Pricing, Shipping sections */}
        {/* ... */}
        
        {/* NEW: Use ProductVariantsSection component */}
        {manageVariants && (
          <ProductVariantsSection
            variantFields={variantFields}
            colors={colors}
            sizes={sizes}
            mdUp={mdUp}
            productId={productId}
            onAppendVariant={appendVariant}
            onRemoveVariant={removeVariant}
            onImageMappingSave={(url, publicId) => {
              imageMapping.addImageMapping(url, publicId);
              imageMapping.saveImageMapping(productId);
            }}
            imagePublicIdMapRef={imageMapping.imagePublicIdMapRef}
            t={t}
          />
        )}
        
        {/* Actions section */}
        {/* ... */}
      </Grid>
      
      {/* NEW: Use ReferenceDialogs component */}
      <ReferenceDialogs
        t={t}
        currentCategoryId={watch("categoryId")}
        openCreateCategory={openCreateCategory}
        openCreateColor={openCreateColor}
        openCreateSize={openCreateSize}
        onCloseCategory={() => setOpenCreateCategory(false)}
        onCloseColor={() => setOpenCreateColor(false)}
        onCloseSize={() => setOpenCreateSize(false)}
      />
    </FormProvider>
  );
}
```

---

## Summary of Benefits

### Code Reduction
- **Image Upload:** 350 lines → 25 lines (93% reduction)
- **Variant Section:** 600 lines → 20 lines (97% reduction)
- **Reference Dialogs:** 150 lines → 15 lines (90% reduction)
- **Total Main Form:** 2601 lines → ~1500 lines (42% reduction)

### Maintainability Improvements
- Each component is self-contained and testable
- Clear props interface makes usage obvious
- TypeScript provides compile-time safety
- Easier to debug and fix issues

### Performance Improvements
- Memoized components prevent unnecessary re-renders
- Optimized state updates
- Reduced watch() calls on form fields

### Reusability
- Components can be used in other forms
- Hooks can be used in other contexts
- Easy to extend with new features

---

## Next Steps

1. **Test the refactored components** independently
2. **Gradually migrate** the main form to use new components
3. **Remove old code** once migration is complete
4. **Add unit tests** for each component
5. **Document any edge cases** discovered during migration

---

## Testing Checklist

### ProductImageUpload
- [ ] Upload single image
- [ ] Upload multiple images (up to 5)
- [ ] Upload fails gracefully on error
- [ ] Delete image from UI
- [ ] Delete image from server (Cloudinary)
- [ ] Manual URL input works
- [ ] File type validation works
- [ ] File size validation works
- [ ] Max files validation works

### VariantImageUpload
- [ ] Upload single image to variant
- [ ] Upload multiple images to variant
- [ ] Change existing variant image
- [ ] Remove variant image
- [ ] Upload indicator shows correctly
- [ ] Error handling works

### ProductVariantsSection
- [ ] Add new variant
- [ ] Remove variant
- [ ] Upload image to specific variant
- [ ] Bulk upload distributes images correctly
- [ ] Variant fields validate correctly
- [ ] Color and size dropdowns populate
- [ ] Form state preserves during uploads

### ReferenceDialogs
- [ ] Create new category
- [ ] Create new color (with hex)
- [ ] Create new color (without hex)
- [ ] Create new size
- [ ] Validation works (empty names, invalid hex)
- [ ] Dialogs close properly
- [ ] Data refreshes after creation

---

## Support and Questions

If you encounter issues during migration:

1. Review this example carefully
2. Check `COMPONENT_REFACTORING_GUIDE.md` for detailed API documentation
3. Look at the component source code for implementation details
4. Test each component individually before integrating

