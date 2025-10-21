// Product data structures aligned with docs/product_data_structure.md
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

export interface ProductVariantDto {
  sku: string;
  name: string;
  price: number;
  stock: number;
  size_id?: string | null;
  color_id?: string | null;
}

export interface ProductVariant extends ProductVariantDto {
  id: string;
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
