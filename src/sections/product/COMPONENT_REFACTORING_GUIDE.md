# Product Form Component Refactoring Guide

## Overview

This document describes the refactored product upload components that have been extracted from the monolithic `product-new-edit-form.tsx` file to improve maintainability, reusability, and code organization.

## New Components Created

### 1. ProductImageUpload Component
**Location:** `src/sections/product/components/product-image-upload.tsx`

**Purpose:** Handles all product image upload functionality including:
- Multiple image file upload
- Image preview with thumbnails
- Image deletion (both UI and server-side via Cloudinary)
- Manual URL input support
- Validation (file type, size, max count)

**Props:**
```typescript
interface ProductImageUploadProps {
  name?: string;                    // Form field name (default: "images")
  maxFiles?: number;                // Maximum files allowed (default: 5)
  uploadingImages: boolean;         // Upload state
  onUploadStart: () => void;        // Callback when upload starts
  onUploadEnd: () => void;          // Callback when upload ends
  onImageMappingSave?: (imageUrl: string, publicId: string) => void;
  imagePublicIdMapRef: React.MutableRefObject<Map<string, string>>;
  t: (key: string, options?: any) => string;  // Translation function
}
```

**Usage Example:**
```tsx
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

---

### 2. VariantImageUpload Component
**Location:** `src/sections/product/components/variant-image-upload.tsx`

**Purpose:** Handles individual variant image uploads:
- Single/multiple image upload per variant
- Click-to-upload interface
- Hover overlay with change/remove actions
- Loading state display

**Props:**
```typescript
interface VariantImageUploadProps {
  imageUrl?: string;                // Current image URL
  variantIndex: number;             // Index of variant in array
  isUploading: boolean;             // Upload state
  onUploadStart: (index: number) => void;
  onUploadEnd: (index: number) => void;
  onImageUploaded: (index: number, urls: string[], publicIds: string[]) => void;
  onDeleteImage: (index: number) => void;
  t: (key: string, options?: any) => string;
}
```

**Features:**
- 120x120px image preview box
- Drag-and-drop placeholder when no image
- Hover overlay with "Change" and "Remove" buttons
- Supports uploading multiple files at once

---

### 3. ReferenceDialogs Component
**Location:** `src/sections/product/components/reference-dialogs.tsx`

**Purpose:** Manages creation dialogs for reference data (categories, colors, sizes):
- Category creation with auto-slug generation
- Color creation with hex code validation
- Size creation with category association

**Props:**
```typescript
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
```

**Usage Example:**
```tsx
const [openCategory, setOpenCategory] = useState(false);
const [openColor, setOpenColor] = useState(false);
const [openSize, setOpenSize] = useState(false);

<ReferenceDialogs
  t={t}
  currentCategoryId={watch("categoryId")}
  openCreateCategory={openCategory}
  openCreateColor={openColor}
  openCreateSize={openSize}
  onCloseCategory={() => setOpenCategory(false)}
  onCloseColor={() => setOpenColor(false)}
  onCloseSize={() => setOpenSize(false)}
/>
```

---

### 4. ProductVariantsSection Component
**Location:** `src/sections/product/components/product-variants-section.tsx`

**Purpose:** Complete variant management section including:
- Variant list with all fields (name, SKU, price, stock, color, size)
- Bulk variant image upload
- Individual variant image upload
- Add/remove variants
- Responsive layout

**Props:**
```typescript
interface ProductVariantsSectionProps {
  variantFields: any[];             // From useFieldArray
  colors: any[];                    // Available colors
  sizes: any[];                     // Available sizes
  mdUp: boolean;                    // Responsive breakpoint
  productId?: string | number;
  onAppendVariant: (variant: any) => void;
  onRemoveVariant: (index: number) => void;
  onImageMappingSave?: (imageUrl: string, publicId: string) => void;
  imagePublicIdMapRef: React.MutableRefObject<Map<string, string>>;
  t: (key: string, options?: any) => string;
}
```

**Features:**
- Bulk upload: Upload multiple images and automatically assign to variants sequentially
- Memoized VariantItem component to prevent unnecessary re-renders
- Preserves form state during image uploads
- Automatic product image merging (variant images added to main product images)

---

## New Hooks Created

### 1. useImageMapping Hook
**Location:** `src/sections/product/hooks/use-image-mapping.ts`

**Purpose:** Manages the mapping between image URLs and Cloudinary publicIds for deletion

**Returns:**
```typescript
{
  imagePublicIdMapRef: React.MutableRefObject<Map<string, string>>;
  loadImageMapping: (pid: string | number | undefined) => void;
  saveImageMapping: (pid: string | number | undefined) => void;
  initializeImageMapping: (images: string[]) => void;
  addImageMapping: (url: string, publicId: string) => void;
  removeImageMapping: (url: string) => void;
  getPublicId: (url: string) => string | null;
  clearMappings: () => void;
  extractPublicIdFromUrl: (url: string) => string | null;
}
```

**Usage Example:**
```tsx
const imageMapping = useImageMapping(productId);

// Initialize from existing images
useEffect(() => {
  imageMapping.loadImageMapping(productId);
  imageMapping.initializeImageMapping(productData.images);
}, [productId, productData]);

// After upload
imageMapping.addImageMapping(imageUrl, publicId);
imageMapping.saveImageMapping(productId);
```

**Features:**
- Persists mapping to localStorage per product
- Auto-extracts publicId from Cloudinary URLs
- Handles both upload response and URL parsing

---

## Integration Guide

### Step 1: Import Components and Hooks

```tsx
import {
  ProductImageUpload,
  VariantImageUpload,
  ReferenceDialogs,
  ProductVariantsSection,
} from './components';

import { useImageMapping } from './hooks';
```

### Step 2: Setup State and Hooks

```tsx
// Image mapping hook
const imageMapping = useImageMapping(productId);

// Upload states
const [uploadingImages, setUploadingImages] = useState(false);

// Reference dialog states
const [openCreateCategory, setOpenCreateCategory] = useState(false);
const [openCreateColor, setOpenCreateColor] = useState(false);
const [openCreateSize, setOpenCreateSize] = useState(false);
```

### Step 3: Replace Existing Code

**Before (Old Code):**
```tsx
// 500+ lines of inline image upload logic
const handleUploadImages = async (event) => {
  // Complex upload logic...
};

// Inline JSX with file input, thumbnails, etc.
<input ref={fileInputRef} type="file" />
<Box>{/* Complex thumbnail grid */}</Box>
```

**After (New Code):**
```tsx
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

---

## Benefits of Refactoring

### 1. **Improved Code Organization**
- Main form reduced from 2600+ lines to ~1500 lines
- Each component has a single responsibility
- Easier to locate and fix bugs

### 2. **Reusability**
- `ProductImageUpload` can be used in other product-related forms
- `VariantImageUpload` can be used anywhere variant images are needed
- `ReferenceDialogs` can be used in any form needing reference data creation

### 3. **Better Performance**
- Memoized components prevent unnecessary re-renders
- Selective watching of form fields (not entire form)
- Optimized state updates

### 4. **Easier Testing**
- Each component can be tested independently
- Props-based API makes mocking easier
- Clear input/output contracts

### 5. **Maintainability**
- Changes to image upload logic only require editing one file
- Consistent API across all image upload features
- Self-documenting through TypeScript interfaces

---

## Migration Checklist

If you're migrating the main form to use these components:

- [ ] Import new components and hooks
- [ ] Setup `useImageMapping` hook
- [ ] Replace image upload section with `<ProductImageUpload />`
- [ ] Replace variant section with `<ProductVariantsSection />`
- [ ] Replace reference dialogs with `<ReferenceDialogs />`
- [ ] Remove old inline handlers (handleUploadImages, handleUploadVariantImage, etc.)
- [ ] Remove old refs (fileInputRef, variantFileInputRefs, etc.)
- [ ] Remove old state (uploadingImages, uploadingVariantImages, etc.)
- [ ] Test all upload scenarios (product images, variant images, bulk upload)
- [ ] Test image deletion
- [ ] Test reference creation dialogs

---

## File Structure

```
src/sections/product/
├── components/
│   ├── index.ts                          # Component exports
│   ├── product-image-upload.tsx         # NEW: Product image upload
│   ├── variant-image-upload.tsx         # NEW: Variant image upload
│   ├── reference-dialogs.tsx            # NEW: Reference creation dialogs
│   ├── product-variants-section.tsx     # NEW: Complete variants section
│   └── create-reference-dialogs.tsx     # OLD: Can be deprecated
├── hooks/
│   ├── index.ts                          # Hook exports
│   ├── use-image-mapping.ts             # NEW: Image mapping hook
│   ├── use-product-images.ts            # Existing
│   └── use-product-draft.ts             # Existing
└── product-new-edit-form.tsx            # Main form (to be updated)
```

---

## API Compatibility

All new components maintain compatibility with:
- Backend API endpoint: `/files/upload-multiple`
- Expected response format: `{ data: { files: [...] } }`
- Cloudinary publicId extraction patterns
- Form validation schema (Yup)
- React Hook Form integration

---

## Future Improvements

### Potential Enhancements:
1. **Image Compression**: Add client-side compression before upload
2. **Progress Indicators**: Show upload progress for large files
3. **Drag & Drop**: Add drag-and-drop support for ProductImageUpload
4. **Image Cropping**: Add image cropping/editing before upload
5. **Lazy Loading**: Implement lazy loading for thumbnail images
6. **Undo/Redo**: Add undo functionality for image deletions

### Performance Optimizations:
1. **Virtual Scrolling**: For large variant lists (100+ variants)
2. **Web Workers**: Offload image processing to Web Workers
3. **Batch Uploads**: Upload multiple images in parallel with concurrency control

---

## Troubleshooting

### Common Issues:

**Issue: Images not uploading**
- Check network tab for API errors
- Verify file type and size constraints
- Check that `endpoints.files.uploadMultiple` is correct

**Issue: Image mapping not persisting**
- Ensure `productId` is passed to `useImageMapping`
- Check localStorage quota (may be full)
- Verify `onImageMappingSave` callback is connected

**Issue: Variant images disappearing**
- Check that `shouldValidate: false` is used in setValue calls
- Verify `manageVariants` state is preserved
- Use React DevTools to track form state changes

**Issue: Performance issues with many variants**
- Ensure VariantItem component is memoized
- Avoid watching entire variants array
- Use `getValues()` instead of `watch()` where possible

---

## Support

For questions or issues:
1. Check this guide first
2. Review component props and usage examples
3. Check the original implementation in `product-new-edit-form.tsx`
4. Refer to `MIGRATION_GUIDE.md` for detailed migration steps

---

## Changelog

### Version 1.0.0 (Initial Refactoring)
- Created ProductImageUpload component
- Created VariantImageUpload component
- Created ReferenceDialogs component
- Created ProductVariantsSection component
- Created useImageMapping hook
- Documented all components and usage patterns

