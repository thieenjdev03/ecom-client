# Product Section - Refactored Structure

This document explains the refactored product form architecture for better maintainability and reusability.

## 📁 Directory Structure

```
src/sections/product/
├── components/
│   ├── create-reference-dialogs.tsx    # Dialogs for creating categories/colors/sizes
│   └── ...
├── hooks/
│   ├── use-product-images.ts           # Image upload/delete/mapping logic
│   ├── use-product-draft.ts            # LocalStorage draft management
│   └── index.ts                         # Barrel export
├── schemas/
│   └── product-validation.schema.ts    # Yup validation schema + default values
├── utils/
│   ├── slug-utils.ts                   # Slug generation and validation
│   ├── product-mapper.ts               # API ↔ Form data mapping
│   └── index.ts                         # Barrel export
├── product-new-edit-form.tsx           # Main form component (refactored)
└── README.md                            # This file
```

## 🎯 Refactoring Goals

1. **Separation of Concerns**: Logic is separated from UI components
2. **Reusability**: Hooks and utilities can be used in other components
3. **Testability**: Isolated functions are easier to unit test
4. **Maintainability**: Smaller, focused files are easier to understand and modify
5. **Type Safety**: Proper TypeScript types throughout

---

## 📦 Hooks

### `useProductImages`

Manages product and variant image uploads/deletions with Cloudinary integration.

**Features:**
- Multi-file upload with validation (type, size)
- Cloudinary public ID extraction and mapping
- Server-side image deletion
- LocalStorage persistence of image mappings

**Usage:**
```typescript
import { useProductImages } from './hooks';

const {
  uploadImages,
  deleteImage,
  initializeImageMapping,
  loadImageMapping,
  saveImageMapping,
} = useProductImages();

// Upload images
const urls = await uploadImages(files);

// Delete image
await deleteImage(imageUrl, productId);
```

### `useProductDraft`

Manages form draft persistence in localStorage to prevent data loss.

**Features:**
- Auto-save form state to localStorage
- Load draft on component mount
- Clear draft after successful submission
- 24-hour expiration for drafts

**Usage:**
```typescript
import { useProductDraft } from './hooks';

const {
  saveDraftToLocalStorage,
  loadDraftFromLocalStorage,
  clearDraftFromLocalStorage,
} = useProductDraft(productId);

// Save draft
saveDraftToLocalStorage(formData);

// Load draft
const draft = loadDraftFromLocalStorage();
```

---

## 🛠️ Utilities

### Slug Utils (`utils/slug-utils.ts`)

Helper functions for URL-friendly slug generation and validation.

**Functions:**
- `generateSlugFromName(name)` - Convert product name to URL-friendly slug
- `isValidSlug(slug)` - Check if slug format is valid
- `sanitizeSlug(slug)` - Clean up slug to ensure URL-friendliness

**Usage:**
```typescript
import { generateSlugFromName, isValidSlug } from './utils';

const slug = generateSlugFromName("Premium T-Shirt 2024!");
// Result: "premium-t-shirt-2024"

const valid = isValidSlug(slug); // true
```

### Product Mapper (`utils/product-mapper.ts`)

Handles data transformation between API format (snake_case) and form format (camelCase).

**Functions:**
- `mapProductToFormValues(product, defaultValues)` - API → Form
- `mapFormValuesToPayload(formData)` - Form → API
- `validatePricing(price, salePrice)` - Validate sale price <= price

**Usage:**
```typescript
import { mapProductToFormValues, mapFormValuesToPayload } from './utils';

// When editing a product
const formValues = mapProductToFormValues(apiProduct, defaultValues);

// When submitting
const payload = mapFormValuesToPayload(formData);
```

---

## 📋 Schemas

### Product Validation Schema (`schemas/product-validation.schema.ts`)

Centralized Yup validation schema for product forms.

**Exports:**
- `createProductValidationSchema(t)` - Main validation schema
- `getDefaultProductFormValues()` - Default form values

**Usage:**
```typescript
import { createProductValidationSchema, getDefaultProductFormValues } from './schemas';

const schema = useMemo(() => createProductValidationSchema(t), [t]);
const defaultValues = useMemo(() => getDefaultProductFormValues(), []);
```

**Validation Rules:**
- Required fields: name, slug, price, category, etc.
- Conditional validation based on `manageVariants` toggle
- Sale price must be ≤ regular price
- Unique SKU validation for variants
- Weight and dimensions must be ≥ 0

---

## 🧩 Components

### Create Reference Dialogs (`components/create-reference-dialogs.tsx`)

Reusable dialogs for creating new reference data (categories, colors, sizes).

**Features:**
- Inline creation without leaving product form
- SWR cache invalidation after creation
- Form validation and error handling

**Usage:**
```typescript
import CreateReferenceDialogs, { useCreateReferenceDialogs } from './components/create-reference-dialogs';

const {
  openCreateCategory,
  setOpenCreateCategory,
  openCreateColor,
  setOpenCreateColor,
  openCreateSize,
  setOpenCreateSize,
} = useCreateReferenceDialogs();

// In JSX
<CreateReferenceDialogs categoryId={currentCategoryId} />
```

---

## 🔄 Migration Guide

### Before (Old Code)
All logic was in one 2700+ line file:
- Image upload functions inline
- LocalStorage logic scattered throughout
- Slug generation duplicated
- Validation schema in component
- No reusability

### After (Refactored)
Modular architecture:
- ✅ Hooks for stateful logic
- ✅ Pure utils for transformations
- ✅ Separate schema file
- ✅ Reusable components
- ✅ Clear separation of concerns

### How to Use in Main Form

```typescript
// Import refactored pieces
import { useProductImages } from './hooks/use-product-images';
import { useProductDraft } from './hooks/use-product-draft';
import { generateSlugFromName, mapProductToFormValues, mapFormValuesToPayload } from './utils';
import { createProductValidationSchema, getDefaultProductFormValues } from './schemas';
import CreateReferenceDialogs from './components/create-reference-dialogs';

export default function ProductNewEditForm({ currentProduct }: Props) {
  // Use hooks
  const { uploadImages, deleteImage, loadImageMapping } = useProductImages();
  const { saveDraftToLocalStorage, loadDraftFromLocalStorage } = useProductDraft(productId);
  
  // Use validation schema
  const schema = useMemo(() => createProductValidationSchema(t), [t]);
  const defaultValues = useMemo(() => getDefaultProductFormValues(), []);
  
  // Use mappers
  const formValues = mapProductToFormValues(currentProduct, defaultValues);
  
  // ... rest of form logic
}
```

---

## 🧪 Testing

### Unit Tests (Recommended)

Each utility and hook can be tested independently:

```typescript
// slug-utils.test.ts
import { generateSlugFromName, isValidSlug } from './slug-utils';

test('generateSlugFromName converts name to slug', () => {
  expect(generateSlugFromName('Premium T-Shirt!')).toBe('premium-t-shirt');
});

test('isValidSlug validates correct format', () => {
  expect(isValidSlug('valid-slug-123')).toBe(true);
  expect(isValidSlug('Invalid Slug!')).toBe(false);
});
```

```typescript
// product-mapper.test.ts
import { validatePricing } from './product-mapper';

test('validatePricing checks sale price', () => {
  expect(validatePricing(100, 80)).toBe(true);
  expect(validatePricing(100, 120)).toBe(false);
});
```

---

## 📝 Benefits

### Developer Experience
- **Faster Development**: Reuse existing hooks and utilities
- **Easier Debugging**: Smaller, focused files
- **Better IDE Support**: Clear imports and exports
- **Type Safety**: Full TypeScript support

### Code Quality
- **Reduced Duplication**: Shared logic in one place
- **Consistent Behavior**: Same validation/mapping everywhere
- **Easier Refactoring**: Change one file, not scattered logic
- **Better Testing**: Unit test individual pieces

### Maintenance
- **Clear Dependencies**: Easy to see what depends on what
- **Modular Updates**: Update one piece without touching others
- **Documentation**: Each file has clear purpose
- **Onboarding**: New developers understand structure faster

---

## 🚀 Future Improvements

1. **Add Unit Tests**: Test each utility and hook
2. **Extract More Components**: Consider extracting variant form section
3. **Add Storybook Stories**: Document components visually
4. **Performance Optimization**: Memoize expensive operations
5. **Error Boundaries**: Add error handling around each section

---

## 📚 Related Documentation

- [Product Data Structure](../../../docs/product_data_structure.md)
- [Product Upload Requirements](../../../docs/product-upload-ui-requirements.md)
- [Variant Image URL Requirement](../../../docs/variant-image-url-requirement.md)

---

**Last Updated:** 2025-11-11  
**Maintained By:** Frontend Team

