# 🧩 Product Data Structure for Frontend

## 1️⃣ Overview

The backend returns product data in this structure:

``` json
{
  "data": {
    "data": [ /* array of products */ ],
    "meta": { /* pagination info */ }
  },
  "message": "Success",
  "success": true
}
```

Frontend should focus on `data.data` (the list of products) and
`data.meta` (pagination info).

------------------------------------------------------------------------

## 2️⃣ TypeScript Interfaces

``` ts
export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  short_description?: string | null;
  price: string;
  sale_price?: string | null;
  cost_price?: string | null;
  images: string[];
  variants: ProductVariant[];
  stock_quantity: number;
  sku?: string | null;
  barcode?: string | null;
  category_id: number;
  category: Category;
  tags: string[];
  status: "active" | "inactive";
  is_featured: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
  weight?: number | null;
  dimensions?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ProductVariant {
  sku: string;
  name: string;
  price: number;
  stock: number;
  size_id?: string | null;
  color_id?: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  parent_id?: number | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductListResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
  success: boolean;
}
```

------------------------------------------------------------------------

## 3️⃣ Display Logic in Frontend

### Price

-   If `sale_price` exists and differs from `price`, show discount.
-   Else, show `price`.

### Variants

-   Use `variants` array for size/color options.
-   Use `stock` and `price` to render dynamic state.

### Stock

-   `stock_quantity > 0` → "In stock"
-   `stock_quantity == 0` → "Out of stock"

### Category

-   `category.name` → used in breadcrumbs or category labels.

------------------------------------------------------------------------

## 4️⃣ Mapping Function

``` ts
function mapProduct(raw: any): Product {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description,
    short_description: raw.short_description,
    price: raw.price,
    sale_price: raw.sale_price,
    images: raw.images ?? [],
    variants: raw.variants ?? [],
    stock_quantity: raw.stock_quantity ?? 0,
    sku: raw.sku,
    category_id: raw.category_id,
    category: raw.category,
    tags: raw.tags ?? [],
    status: raw.status,
    is_featured: raw.is_featured,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
}
```

------------------------------------------------------------------------

## 5️⃣ Quick Field Summary

  Field              Type          Description
  ------------------ ------------- -------------------------------
  `id`               number        Product ID
  `name`             string        Product name
  `slug`             string        SEO slug
  `price`            string        Base price
  `sale_price`       string/null   Discounted price
  `images`           string\[\]    Product images
  `variants`         array         Variants (size, color, stock)
  `stock_quantity`   number        Total stock
  `tags`             string\[\]    Tags
  `category`         object        Category info
  `status`           string        Active/inactive
  `is_featured`      boolean       Featured flag
  `created_at`       string        Created time
  `updated_at`       string        Updated time

------------------------------------------------------------------------

## 6️⃣ Example UI Usage

``` tsx
<ProductCard
  name={product.name}
  image={product.images[0]}
  price={product.sale_price || product.price}
  isDiscount={!!product.sale_price && product.sale_price !== product.price}
  category={product.category.name}
/>
```
