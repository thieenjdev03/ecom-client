# Migration Guide - Sử dụng Refactored Hooks & Utils

## 🎯 Mục tiêu

File `product-new-edit-form.tsx` hiện tại có 2723 dòng với nhiều logic inline. Chúng ta đã tách ra các hooks và utilities có thể tái sử dụng. Tài liệu này hướng dẫn cách áp dụng chúng vào component chính.

## ✅ Đã hoàn thành

1. ✅ Import các refactored modules
2. ✅ Thay thế validation schema inline
3. ✅ Thay thế defaultValues inline
4. ✅ Initialize hooks (useProductImages, useProductDraft)

## 🔄 Cần thay thế

### 1. Thay thế Image Upload Functions

#### Trước (Inline):
```typescript
// Inline trong component (khoảng dòng 500-650)
const extractPublicIdFromUrl = useCallback((url: string): string | null => {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
    // ...
  } catch {
    return null;
  }
}, []);

const initializeImageMapping = useCallback((images: string[]) => {
  images.forEach((url) => {
    const publicId = extractPublicIdFromUrl(url);
    if (publicId && !imagePublicIdMapRef.current.has(url)) {
      imagePublicIdMapRef.current.set(url, publicId);
    }
  });
}, [extractPublicIdFromUrl]);

// ... more inline functions
```

#### Sau (Using Hook):
```typescript
// Đã import ở đầu file
const productImages = useProductImages();

// Sử dụng trong code:
productImages.initializeImageMapping(images);
productImages.loadImageMapping(productId);
productImages.saveImageMapping(productId);
```

### 2. Thay thế LocalStorage Draft Functions

#### Trước (Inline - dòng 660-720):
```typescript
const getDraftStorageKey = useCallback(() => {
  const key = productId ? `product_draft_${productId}` : 'product_draft_new';
  return key;
}, [productId]);

const saveDraftToLocalStorage = useCallback((formData: any) => {
  try {
    const storageKey = getDraftStorageKey();
    // ...
  } catch (error) {
    console.warn('Failed to save...');
  }
}, [getDraftStorageKey, productId]);

// ... more functions
```

#### Sau (Using Hook):
```typescript
// Đã initialize ở đầu component
const {
  saveDraftToLocalStorage,
  loadDraftFromLocalStorage,
  clearDraftFromLocalStorage,
} = useProductDraft(currentProduct?.id);

// Sử dụng trực tiếp
saveDraftToLocalStorage(formData);
const draft = loadDraftFromLocalStorage();
clearDraftFromLocalStorage();
```

### 3. Thay thế Slug Generation

#### Trước (Inline - dòng 407-428):
```typescript
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
  // ...
}, [name, slug, setValue]);
```

#### Sau (Using Utility):
```typescript
import { generateSlugFromName } from "./utils/slug-utils";

useEffect(() => {
  const prevName = prevNameRef.current;
  const nameSlug = generateSlugFromName(name || "");
  const prevNameSlug = generateSlugFromName(prevName || "");
  // ...
}, [name, slug, setValue]);
```

### 4. Thay thế Product Mapping

#### Trước (Inline - dòng 630-701):
```typescript
const mapProductToFormValues = useCallback((product: Product | undefined): any => {
  if (!product) return defaultValues;
  
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
  
  return {
    ...defaultValues,
    status: product.status || 'active',
    // ... 70+ dòng mapping logic
  };
}, [defaultValues]);
```

#### Sau (Using Utility):
```typescript
// Already imported
import { mapProductToFormValues, mapFormValuesToPayload } from "./utils/product-mapper";

// Use directly
const formValues = mapProductToFormValues(productData as Product, defaultValues);
reset(formValues);

// When submitting
const payload = mapFormValuesToPayload(formData);
```

### 5. Thay thế Upload Images Function

#### Trước (Inline - dòng 1265-1330):
```typescript
const handleUploadImages = useCallback(async (files: File[]) => {
  const validFiles = files.filter((file) => {
    // validation logic...
  });
  
  if (validFiles.length === 0) return;
  
  try {
    const formData = new FormData();
    validFiles.forEach((file) => {
      formData.append('images', file);
    });
    
    const response = await axios.post(endpoints.files.uploadImages, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    const uploadedUrls = response.data?.urls || [];
    // ... more logic
  } catch (error) {
    // ...
  }
}, [enqueueSnackbar, extractPublicIdFromUrl]);
```

#### Sau (Using Hook):
```typescript
const handleUploadImages = useCallback(async (files: File[]) => {
  setUploadingImages(true);
  
  const uploadedUrls = await productImages.uploadImages(files);
  
  if (uploadedUrls.length > 0) {
    const currentImages = getValues("images") as string[];
    const newImages = [...currentImages, ...uploadedUrls].slice(0, 5);
    setValue("images", newImages, { shouldTouch: false });
    enqueueSnackbar(`Uploaded ${uploadedUrls.length} image(s)`, { variant: "success" });
  }
  
  setUploadingImages(false);
}, [productImages, getValues, setValue, enqueueSnackbar]);
```

### 6. Thay thế Delete Image Function

#### Trước (Inline - dòng 1370-1397):
```typescript
const handleDeleteImage = async (imageUrl: string) => {
  try {
    const publicId = imagePublicIdMapRef.current.get(imageUrl);
    if (publicId) {
      await axios.delete(endpoints.files.deleteImage, {
        data: { publicId },
      });
    }
    
    // Remove from map
    imagePublicIdMapRef.current.delete(imageUrl);
    
    // Update localStorage
    saveImageMapping(productId);
  } catch (error) {
    // Silent fail
  }
};
```

#### Sau (Using Hook):
```typescript
const handleDeleteImage = async (imageUrl: string) => {
  const currentImages = getValues("images") as string[];
  const filtered = currentImages.filter((img) => img !== imageUrl);
  setValue("images", filtered, { shouldTouch: false });
  
  // Delete from server (handled by hook)
  await productImages.deleteImage(imageUrl, productId);
};
```

### 7. Update Form Initialization

#### Trước (dòng 704-774):
```typescript
useEffect(() => {
  if (formInitializedRef.current) {
    return;
  }

  if (currentProduct && rawProductData) {
    const productData = (rawProductData as any)?.data || rawProductData;
    const formValues = mapProductToFormValues(productData as Product);
    reset(formValues);
    
    // Load mapping from localStorage first
    loadImageMapping(productId);
    
    // Initialize mapping for existing images
    const images = formValues.images || [];
    initializeImageMapping(images);
    
    // ... more initialization
  }
}, [currentProduct, rawProductData, ...]);
```

#### Sau (Using Refactored Utils):
```typescript
useEffect(() => {
  if (formInitializedRef.current) {
    return;
  }

  if (currentProduct && rawProductData) {
    const productData = (rawProductData as any)?.data || rawProductData;
    
    // Use imported mapper
    const formValues = mapProductToFormValues(productData as Product, defaultValues);
    reset(formValues);
    
    // Use hook methods
    productImages.loadImageMapping(productId);
    productImages.initializeImageMapping(formValues.images || []);
    
    // Initialize variant images
    (formValues.variants || []).forEach((variant: any) => {
      if (variant?.imageUrl) {
        productImages.initializeImageMapping([variant.imageUrl]);
      }
    });
    
    productImages.saveImageMapping(productId);
    formInitializedRef.current = true;
  } else if (!currentProduct) {
    const draft = loadDraftFromLocalStorage();
    if (draft) {
      reset(draft);
      if (draft.images) {
        productImages.initializeImageMapping(draft.images);
      }
      enqueueSnackbar(t("productForm.draftRestored"), { variant: "info" });
    }
    formInitializedRef.current = true;
  }
}, [currentProduct, rawProductData, mapProductToFormValues, reset, defaultValues, 
    productImages, productId, loadDraftFromLocalStorage, enqueueSnackbar, t]);
```

### 8. Update Submit Handler

#### Trước (dòng 1410-1550):
```typescript
const onSubmit = handleSubmit(
  async (data) => {
    try {
      // Manual payload building (~140 lines)
      const basePrice = Number(data.price) || 0;
      const sale = data.salePrice != null ? Number(data.salePrice) : undefined;
      
      const payload: any = {
        name: data.name,
        slug: data.slug,
        // ... 100+ lines of manual mapping
      };
      
      if (data.manageVariants) {
        payload.variants = (data.variants || []).map((v: any) => ({
          name: v.name,
          // ... more manual mapping
        }));
      }
      
      // ... submit logic
    } catch (error) {
      // ...
    }
  },
  onError
);
```

#### Sau (Using Mapper Utility):
```typescript
const onSubmit = handleSubmit(
  async (data) => {
    try {
      // Use refactored mapper
      const payload = mapFormValuesToPayload(data);
      
      if (currentProduct?.id) {
        // Update
        await updateProduct(currentProduct.id, payload);
        productImages.saveImageMapping(currentProduct.id);
        clearDraftFromLocalStorage();
        enqueueSnackbar(t("productForm.updateSuccess"));
        router.push(paths.dashboard.product.details(currentProduct.id));
      } else {
        // Create
        const created = await createProduct(payload);
        enqueueSnackbar(t("productForm.createSuccess"));
        const newId = created?.id || created?.data?.id;
        if (newId) {
          productImages.saveImageMapping(newId);
          clearDraftFromLocalStorage();
          router.push(paths.dashboard.product.details(newId));
        }
      }
    } catch (error) {
      // Error handling...
    }
  },
  onError
);
```

## 📊 Tổng kết

| Thay thế | Dòng code cũ | Dòng code mới | Giảm |
|----------|--------------|---------------|------|
| Validation Schema | ~110 lines | 1 line | -99% |
| Default Values | ~25 lines | 1 line | -96% |
| Image Upload Logic | ~200 lines | ~10 lines | -95% |
| LocalStorage Logic | ~80 lines | 3 lines | -96% |
| Slug Generation | ~15 lines | 1 line | -93% |
| Product Mapping | ~140 lines | 1 line | -99% |
| Submit Payload | ~140 lines | 1 line | -99% |

**Tổng giảm**: ~700 lines → ~20 lines (**-97%**)

## 🎯 Lợi ích sau khi refactor

1. **Dễ đọc hơn**: Logic phức tạp được ẩn đi trong hooks
2. **Dễ test hơn**: Mỗi hook/util có thể test riêng
3. **Dễ maintain hơn**: Thay đổi logic ở một chỗ, apply everywhere
4. **Reusable**: Các hooks có thể dùng ở components khác

## ⚠️ Lưu ý quan trọng

1. **Không delete code cũ ngay**: Comment out và test kỹ trước
2. **Test từng phần**: Refactor và test từng function một
3. **Keep backup**: Commit trước khi refactor
4. **Update imports**: Đảm bảo tất cả imports đúng

## 🚀 Next Steps

1. ✅ Đã import hooks và utils
2. ✅ Đã thay validation schema
3. ✅ Đã thay default values
4. ⏳ Replace inline image functions với hook
5. ⏳ Replace inline mapper với utils
6. ⏳ Replace inline slug generation
7. ⏳ Test toàn bộ functionality
8. ⏳ Remove commented code

---

**Status**: 🔄 In Progress  
**Estimated Time**: 2-3 hours for complete migration  
**Priority**: Medium (code works, refactor improves maintainability)

