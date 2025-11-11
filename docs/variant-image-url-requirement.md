# 🎨 Product Variant Image URL + Weight/Dimensions - Backend Implementation Requirement

## 📋 Overview

This document specifies the requirements to add:
1. `image_url` field to product variants
2. `weight` and `dimensions` fields to products

These additions support the frontend product upload/edit flow with shipping calculation capabilities.

**Related Documents:**
- `docs/product_data_structure.md` - Main product API documentation
- `docs/product-upload-ui-requirements.md` - Frontend UI requirements

---

## 🎯 Business Need

### Current Problem
- Frontend has implemented UI for uploading and managing individual images for each product variant
- Users can upload different images for variants (e.g., Red-M variant shows red shirt, Blue-L variant shows blue shirt)
- **Backend `ProductVariant` structure does not have `image_url` field**, causing uploaded images to be lost or only saved to the main product's `images` array
- This creates poor UX where variant-specific images cannot be properly stored and retrieved

### Expected Outcome
- Each variant can have its own representative image
- Variant images are persisted to the backend and retrieved correctly
- Better product presentation with variant-specific visuals

---

## 🔧 Technical Changes Required

### 1. Database Schema Update - Product Variants

**Entity:** `Product` (variants field - JSONB array)

**Current ProductVariant Structure:**
```typescript
{
  name: string;          // e.g., "M - Black"
  color_id: string;      // UUID reference to colors table
  size_id: string;       // UUID reference to sizes table
  sku: string;           // Unique SKU for this variant
  price: number;         // Price in smallest currency unit
  stock: number;         // Stock quantity
  barcode?: string;      // Optional barcode
}
```

**Required ProductVariant Structure:**
```typescript
{
  name: string;
  color_id: string;
  size_id: string;
  sku: string;
  price: number;
  stock: number;
  barcode?: string;
  image_url?: string;    // 🆕 NEW FIELD - Cloudinary or CDN URL
}
```

### 2. Database Schema Update - Product Weight & Dimensions

**Entity:** `Product` (main product fields)

**Current Structure:**
```typescript
{
  // ... existing fields ...
  weight?: number;  // May already exist as decimal(8,2)
  dimensions?: string; // May exist as string/text
}
```

**Required Structure:**
```typescript
{
  // ... existing fields ...
  weight?: number;        // decimal(10,2) - weight in kg
  dimensions?: {          // JSONB object
    length?: number;      // in cm
    width?: number;       // in cm  
    height?: number;      // in cm
  };
}
```

**Migration Note:** If `dimensions` is currently stored as string, it needs to be migrated to JSONB type.

### 3. DTO Updates

**File:** `src/modules/products/dto/product-variant.dto.ts`

```typescript
// ❌ Current
export class ProductVariantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsString()
  @IsOptional()
  color_id?: string;

  @IsString()
  @IsOptional()
  size_id?: string;

  @IsString()
  @IsOptional()
  barcode?: string;
}

// ✅ Required
export class ProductVariantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsString()
  @IsOptional()
  color_id?: string;

  @IsString()
  @IsOptional()
  size_id?: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsString()
  @IsUrl()           // 🔒 Validate URL format
  @IsOptional()
  image_url?: string; // 🆕 NEW FIELD
}
```

**File:** `src/modules/products/dto/create-product.dto.ts`

```typescript
// ✅ Required
export class CreateProductDto {
  // ... existing fields ...
  
  @IsNumber()
  @IsOptional()
  @Min(0)
  weight?: number; // Weight in kg
  
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions?: DimensionsDto;
  
  // ... other fields ...
}

// 🆕 NEW DTO
export class DimensionsDto {
  @IsNumber()
  @IsOptional()
  @Min(0)
  length?: number; // cm
  
  @IsNumber()
  @IsOptional()
  @Min(0)
  width?: number; // cm
  
  @IsNumber()
  @IsOptional()
  @Min(0)
  height?: number; // cm
}
```

### 4. Entity Updates

**File:** `src/modules/products/entities/product.entity.ts`

Update the interface/type definition for `ProductVariant` and `Product`:

```typescript
// Product Variant
export interface ProductVariant {
  name: string;
  color_id: string;
  size_id: string;
  sku: string;
  price: number;
  stock: number;
  barcode?: string;
  image_url?: string; // 🆕 NEW FIELD
}

// Product entity
@Entity('products')
export class Product {
  // ... existing fields ...
  
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  weight?: number; // 🆕 Weight in kg
  
  @Column('jsonb', { nullable: true })
  dimensions?: {    // 🆕 Dimensions object
    length?: number;  // cm
    width?: number;   // cm
    height?: number;  // cm
  };
  
  // ... other fields ...
}
```

### 5. API Response Updates

All endpoints returning products should include `image_url` in variants, plus `weight` and `dimensions`:

- `GET /products` - List products
- `GET /products/:id` - Get product details
- `GET /products/slug/:slug` - Get product by slug
- `POST /products` - Create product (response)
- `PATCH /products/:id` - Update product (response)

**Example Response:**
```json
{
  "id": 123,
  "name": "Premium Polo Shirt",
  "slug": "premium-polo-shirt",
  "price": 399000,
  "weight": 0.5,           // 🆕 Weight in kg
  "dimensions": {          // 🆕 Dimensions in cm
    "length": 30,
    "width": 25,
    "height": 5
  },
  "variants": [
    {
      "name": "M - Black",
      "color_id": "uuid-color-black",
      "size_id": "uuid-size-m",
      "sku": "POLO-M-BLACK",
      "price": 399000,
      "stock": 10,
      "image_url": "https://res.cloudinary.com/xxx/image/upload/v1234/polo-black.jpg" // 🆕
    },
    {
      "name": "L - Blue",
      "color_id": "uuid-color-blue",
      "size_id": "uuid-size-l",
      "sku": "POLO-L-BLUE",
      "price": 399000,
      "stock": 5,
      "image_url": "https://res.cloudinary.com/xxx/image/upload/v1234/polo-blue.jpg" // 🆕
    }
  ]
}
```

---

## 📝 Validation Rules

### Variant Image URL
| Rule | Description |
|------|-------------|
| **Optional** | `image_url` is optional - variants without images are valid |
| **URL Format** | Must be a valid URL if provided |
| **Max Length** | Recommended max 500 characters (typical CDN URL length) |
| **Allowed Domains** | Should accept Cloudinary, AWS S3, or other CDN URLs |
| **No Validation** | Do not validate image file existence (FE handles upload) |

### Weight & Dimensions
| Rule | Description |
|------|-------------|
| **Optional** | Both `weight` and `dimensions` are optional |
| **Weight Format** | Number >= 0, stored as decimal(10,2) |
| **Weight Unit** | Kilograms (kg) |
| **Dimensions Format** | Object with `length`, `width`, `height` (all optional) |
| **Dimensions Unit** | Centimeters (cm) |
| **Min Value** | All numeric values must be >= 0 |
| **Partial Dimensions** | OK to have only some dimension fields (e.g., only length) |

---

## 🔄 Migration Strategy

### Variant Image URL
```sql
-- No SQL migration needed for JSONB field
-- Backend simply starts accepting and returning image_url in variants array
-- Existing variants without image_url will have null/undefined value
```

### Weight Field
```sql
-- If weight column doesn't exist
ALTER TABLE products ADD COLUMN weight DECIMAL(10,2) NULL;

-- If weight exists but wrong type, no migration needed
-- Just ensure it accepts decimal values
```

### Dimensions Field
```sql
-- If dimensions is currently string/text type
ALTER TABLE products 
  ALTER COLUMN dimensions TYPE JSONB 
  USING 
    CASE 
      WHEN dimensions IS NULL THEN NULL
      WHEN dimensions = '' THEN NULL
      ELSE NULL  -- Existing string data cannot be auto-converted
    END;

-- If dimensions column doesn't exist
ALTER TABLE products ADD COLUMN dimensions JSONB NULL;
```

**Data Loss Warning:** If `dimensions` currently contains string data, it will be lost during migration. Coordinate with team before running migration.

---

## 🧪 Testing Requirements

### Unit Tests - Variant Images
- ✅ Accept valid `image_url` in variant creation
- ✅ Accept variant without `image_url`
- ✅ Reject invalid URL format
- ✅ Handle very long URLs gracefully

### Unit Tests - Weight & Dimensions
- ✅ Accept valid `weight` value
- ✅ Accept product without `weight` (null/undefined)
- ✅ Reject negative weight
- ✅ Accept valid `dimensions` object
- ✅ Accept partial dimensions (e.g., only length)
- ✅ Accept product without `dimensions`
- ✅ Reject negative dimension values

### Integration Tests
- ✅ Create product with variants having `image_url`
- ✅ Create product with `weight` and `dimensions`
- ✅ Update product variant `image_url`
- ✅ Update product `weight` and `dimensions`
- ✅ Retrieve product and verify all new fields are returned
- ✅ Update variant stock via `PATCH /products/:id/variants/:sku/stock` should preserve `image_url`
- ✅ Partial update (only weight, or only dimensions) works correctly

### Manual Testing Scenarios
1. **Create product with variant images**
   - Upload images via FE
   - Submit product creation with variant `image_url` values
   - Verify variant images are saved correctly

2. **Create product with shipping info**
   - Enter weight: 1.5 kg
   - Enter dimensions: 30 x 20 x 10 cm
   - Submit and verify data is saved

3. **Edit product and update variant images**
   - Change variant image in FE
   - Submit update
   - Verify new image URL replaces old one

4. **Edit product and update shipping info**
   - Change weight to 2.0 kg
   - Change dimensions to 35 x 25 x 12 cm
   - Verify updates are saved

5. **Delete variant image**
   - Remove image from variant in FE
   - Submit with `image_url: null` or omit field
   - Verify variant image is cleared

6. **Clear shipping info**
   - Set weight to null
   - Set dimensions to null
   - Verify fields are cleared

---

## 📊 Impact Analysis

### Backend Changes
- **Complexity:** 🟡 Medium (3 optional fields: variant image_url, product weight, product dimensions)
- **Breaking Changes:** 🟢 None (backward compatible)
- **Migration Required:** 🟡 Maybe (if dimensions exists as string type)
- **Estimated Effort:** 3-4 hours (including migration)

### Frontend Changes
- **Status:** ✅ Already implemented
- **Files:** `src/sections/product/product-new-edit-form.tsx`
- **Type Updates:** `src/types/product-dto.ts` (will add `image_url?` to `ProductVariantDto`)

---

## 📚 API Examples

### Create Product with Variant Images + Shipping Info

**Request:** `POST /products`
```json
{
  "name": "Classic T-Shirt",
  "slug": "classic-tshirt-2025",
  "price": 199000,
  "category_id": 2,
  "weight": 0.3,              // 🆕 Weight in kg
  "dimensions": {             // 🆕 Dimensions in cm
    "length": 28,
    "width": 20,
    "height": 2
  },
  "variants": [
    {
      "name": "S - Red",
      "sku": "TSHIRT-S-RED",
      "color_id": "uuid-red",
      "size_id": "uuid-s",
      "price": 199000,
      "stock": 20,
      "image_url": "https://res.cloudinary.com/shop/image/upload/v1/tshirt-red.jpg"
    },
    {
      "name": "M - Blue",
      "sku": "TSHIRT-M-BLUE",
      "color_id": "uuid-blue",
      "size_id": "uuid-m",
      "price": 199000,
      "stock": 30,
      "image_url": "https://res.cloudinary.com/shop/image/upload/v1/tshirt-blue.jpg"
    },
    {
      "name": "L - Green",
      "sku": "TSHIRT-L-GREEN",
      "color_id": "uuid-green",
      "size_id": "uuid-l",
      "price": 199000,
      "stock": 15
      // No image_url - this is valid
    }
  ],
  "status": "active"
}
```

**Response:** `201 Created`
```json
{
  "id": 456,
  "name": "Classic T-Shirt",
  "slug": "classic-tshirt-2025",
  "price": "199000",
  "weight": 0.3,              // 🆕
  "dimensions": {             // 🆕
    "length": 28,
    "width": 20,
    "height": 2
  },
  "variants": [
    {
      "name": "S - Red",
      "sku": "TSHIRT-S-RED",
      "color_id": "uuid-red",
      "size_id": "uuid-s",
      "price": 199000,
      "stock": 20,
      "image_url": "https://res.cloudinary.com/shop/image/upload/v1/tshirt-red.jpg"
    },
    {
      "name": "M - Blue",
      "sku": "TSHIRT-M-BLUE",
      "color_id": "uuid-blue",
      "size_id": "uuid-m",
      "price": 199000,
      "stock": 30,
      "image_url": "https://res.cloudinary.com/shop/image/upload/v1/tshirt-blue.jpg"
    },
    {
      "name": "L - Green",
      "sku": "TSHIRT-L-GREEN",
      "color_id": "uuid-green",
      "size_id": "uuid-l",
      "price": 199000,
      "stock": 15,
      "image_url": null
    }
  ],
  "status": "active",
  "created_at": "2025-11-11T10:00:00Z",
  "updated_at": "2025-11-11T10:00:00Z"
}
```

### Update Variant Images + Shipping Info

**Request:** `PATCH /products/456`
```json
{
  "weight": 0.35,           // 🆕 Updated weight
  "dimensions": {           // 🆕 Updated dimensions
    "length": 30,
    "width": 22,
    "height": 2
  },
  "variants": [
    {
      "name": "S - Red",
      "sku": "TSHIRT-S-RED",
      "color_id": "uuid-red",
      "size_id": "uuid-s",
      "price": 199000,
      "stock": 20,
      "image_url": "https://res.cloudinary.com/shop/image/upload/v2/tshirt-red-new.jpg"
    },
    {
      "name": "M - Blue",
      "sku": "TSHIRT-M-BLUE",
      "color_id": "uuid-blue",
      "size_id": "uuid-m",
      "price": 199000,
      "stock": 30,
      "image_url": "https://res.cloudinary.com/shop/image/upload/v1/tshirt-blue.jpg"
    },
    {
      "name": "L - Green",
      "sku": "TSHIRT-L-GREEN",
      "color_id": "uuid-green",
      "size_id": "uuid-l",
      "price": 199000,
      "stock": 15,
      "image_url": "https://res.cloudinary.com/shop/image/upload/v1/tshirt-green.jpg" // Now has image
    }
  ]
}
```

### Update Only Weight (Partial Update)

**Request:** `PATCH /products/456`
```json
{
  "weight": 0.4
}
```

### Update Only Dimensions (Partial Update)

**Request:** `PATCH /products/456`
```json
{
  "dimensions": {
    "length": 32,
    "width": 24,
    "height": 3
  }
}
```

### Clear Shipping Info

**Request:** `PATCH /products/456`
```json
{
  "weight": null,
  "dimensions": null
}
```

---

## ✅ Acceptance Criteria

### Backend - Variant Images
- [ ] `ProductVariantDto` includes optional `image_url` field with URL validation
- [ ] `ProductVariant` entity/interface includes `image_url` field
- [ ] All product endpoints return `image_url` in variant objects
- [ ] Creating product with variant `image_url` values persists correctly
- [ ] Updating product preserves existing variant `image_url` if not changed
- [ ] Updating variant stock endpoint preserves `image_url`
- [ ] Setting `image_url: null` or omitting it removes the variant image

### Backend - Weight & Dimensions
- [ ] `CreateProductDto` includes optional `weight` field (decimal validation, >= 0)
- [ ] `CreateProductDto` includes optional `dimensions` object with `length`, `width`, `height`
- [ ] `DimensionsDto` created with validation for each dimension field
- [ ] `Product` entity includes `weight` column (decimal 10,2)
- [ ] `Product` entity includes `dimensions` column (JSONB)
- [ ] Database migration created (if needed)
- [ ] All product endpoints return `weight` and `dimensions`
- [ ] Creating product with `weight` and `dimensions` persists correctly
- [ ] Updating product preserves existing `weight`/`dimensions` if not changed
- [ ] Partial updates work (can update only weight, or only dimensions)
- [ ] Setting `weight: null` or `dimensions: null` clears the values

### Testing
- [ ] Unit tests cover all scenarios (variant images, weight, dimensions)
- [ ] Integration tests pass
- [ ] API documentation updated

### Frontend (Already Done)
- [x] Upload UI for individual variant images
- [x] Bulk upload for all variant images
- [x] Preview variant images
- [x] Delete variant images
- [x] Weight input field (kg)
- [x] Dimensions input fields (length, width, height in cm)
- [x] Auto-save variant images to localStorage
- [x] Type definitions updated

---

## 🔗 Related Issues

- Frontend PR: [Implement variant image upload functionality]
- Backend Issue: [Add image_url field to ProductVariant] (to be created)

---

## 📅 Timeline

| Phase | Task | Duration |
|-------|------|----------|
| 1 | Database migration (if needed for dimensions) | 30 min |
| 2 | Backend code changes (DTOs, Entity) | 2 hours |
| 3 | Unit tests | 1.5 hours |
| 4 | Integration tests | 1.5 hours |
| 5 | Frontend type update | Already done ✅ |
| 6 | E2E testing | 45 min |
| **Total** | | **~6 hours** |

---

## 🎯 Success Metrics

- ✅ Users can upload and see different images for each product variant
- ✅ Users can enter and save weight/dimensions for shipping calculation
- ✅ Variant images persist correctly across page refreshes and edits
- ✅ Weight and dimensions persist correctly
- ✅ No breaking changes to existing products
- ✅ API response time remains acceptable (<200ms for product details)
- ✅ Shipping info can be used for logistics/shipping cost calculation

---

## 📞 Contact

**Frontend Team:** Already implemented UI  
**Backend Team:** Awaiting implementation  
**Document Owner:** Product Team  
**Last Updated:** 2025-11-11

---

## Appendix A: TypeScript Type Definition (Frontend) ✅ DONE

Frontend types already updated in `src/types/product-dto.ts`:

```typescript
export interface Product {
  // ... existing fields ...
  weight?: number | null;  // ✅ Already added
  dimensions?: { 
    length?: number; 
    width?: number; 
    height?: number;
  } | null;  // ✅ Already added
  // ... other fields ...
}

export interface ProductVariantDto {
  sku: string;
  name: string;
  price: number;
  stock: number;
  size_id?: string | null;
  color_id?: string | null;
  barcode?: string | null;
  image_url?: string | null; // ✅ Already added
}
```

## Appendix B: Backend Service Layer Example

```typescript
// src/modules/products/products.service.ts

async updateVariantStock(id: number, sku: string, newStock: number): Promise<Product> {
  const product = await this.findOne(id);
  
  if (!product.variants || product.variants.length === 0) {
    throw new BadRequestException('Product has no variants');
  }
  
  const variantIndex = product.variants.findIndex((v) => v.sku === sku);
  if (variantIndex === -1) {
    throw new NotFoundException(`Variant with SKU "${sku}" not found`);
  }
  
  // ✅ Preserve image_url when updating stock
  product.variants[variantIndex] = {
    ...product.variants[variantIndex],
    stock: newStock,
    // image_url is preserved automatically
  };
  
  return this.productsRepository.save(product);
}
```

---

**End of Document**

