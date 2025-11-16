// Product data structures aligned with docs/product_data_structure.md
// Multi-language support: fields can be either string (from API with locale) or object (for admin/form)
export type MultiLangField = string | Record<string, string>;

export interface Product {
  id: number;
  // Multi-language fields: can be string (when fetched with locale) or object (in admin/form)
  name: MultiLangField;
  slug: MultiLangField;
  description?: MultiLangField | null;
  short_description?: MultiLangField | null;
  meta_title?: MultiLangField | null;
  meta_description?: MultiLangField | null;
  // Non-multi-language fields
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
  weight?: number | null;
  dimensions?: { length?: number; width?: number; height?: number } | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ProductVariantDto {
  sku: string;
  name: MultiLangField; // Multi-language support
  price: number;
  stock: number;
  size_id?: string | null;
  color_id?: string | null;
  barcode?: string | null;
  image_url?: string | null; // Variant-specific image URL (Cloudinary or CDN)
}

export interface ProductVariant extends ProductVariantDto {
  id: string;
}
export interface Category {
  id: number;
  name: MultiLangField; // Multi-language support
  slug: MultiLangField; // Multi-language support
  description?: MultiLangField | null; // Multi-language support
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
