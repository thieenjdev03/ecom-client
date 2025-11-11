# Product Form Components

Reusable components for the product creation/editing form.

## Components

### 📸 ProductImageUpload
Handles main product image uploads with preview, deletion, and validation.

```tsx
<ProductImageUpload
  uploadingImages={uploadingImages}
  onUploadStart={() => setUploadingImages(true)}
  onUploadEnd={() => setUploadingImages(false)}
  imagePublicIdMapRef={imageMapping.imagePublicIdMapRef}
  t={t}
/>
```

**Features:**
- Multiple file upload (max 5)
- Image preview with thumbnails
- Server-side deletion
- Manual URL input
- Type & size validation

---

### 🎨 VariantImageUpload
Handles individual variant image uploads.

```tsx
<VariantImageUpload
  imageUrl={variant?.imageUrl}
  variantIndex={index}
  isUploading={isUploading}
  onUploadStart={handleUploadStart}
  onUploadEnd={handleUploadEnd}
  onImageUploaded={handleImageUploaded}
  onDeleteImage={handleDeleteImage}
  t={t}
/>
```

**Features:**
- Click-to-upload interface
- Hover overlay with actions
- Multi-file support
- Loading states

---

### 🗂️ ReferenceDialogs
Manages creation dialogs for categories, colors, and sizes.

```tsx
<ReferenceDialogs
  t={t}
  currentCategoryId={categoryId}
  openCreateCategory={openCategory}
  openCreateColor={openColor}
  openCreateSize={openSize}
  onCloseCategory={() => setOpenCategory(false)}
  onCloseColor={() => setOpenColor(false)}
  onCloseSize={() => setOpenSize(false)}
/>
```

**Features:**
- Category creation with auto-slug
- Color creation with hex validation
- Size creation with category link
- Auto-refresh after creation

---

### 📦 ProductVariantsSection
Complete variant management section with bulk operations.

```tsx
<ProductVariantsSection
  variantFields={variantFields}
  colors={colors}
  sizes={sizes}
  mdUp={mdUp}
  productId={productId}
  onAppendVariant={appendVariant}
  onRemoveVariant={removeVariant}
  imagePublicIdMapRef={imageMapping.imagePublicIdMapRef}
  t={t}
/>
```

**Features:**
- Bulk image upload
- Add/remove variants
- Complete variant form fields
- Memoized rendering
- Responsive layout

---

## Quick Start

```tsx
// 1. Import components and hooks
import {
  ProductImageUpload,
  ReferenceDialogs,
  ProductVariantsSection,
} from './components';
import { useImageMapping } from './hooks';

// 2. Setup hooks
const imageMapping = useImageMapping(productId);
const [uploadingImages, setUploadingImages] = useState(false);

// 3. Use components in your form
<ProductImageUpload {...props} />
<ProductVariantsSection {...props} />
<ReferenceDialogs {...props} />
```

## Documentation

- 📖 **Full API Docs:** `../COMPONENT_REFACTORING_GUIDE.md`
- 💡 **Usage Examples:** `../USAGE_EXAMPLE.md`
- 📊 **Refactoring Summary:** `../REFACTORING_SUMMARY.md`

## Support

For questions or issues, check the documentation files above or review the component source code.

