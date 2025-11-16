// ----------------------------------------------------------------------

import { ProductVariantDto } from "src/types/product-dto";

export type IProductFilterValue = string | string[] | number | number[];

export type IProductFilters = {
  rating: string;
  gender: string[];
  category: string;
  colors: string[];
  priceRange: number[];
};

// ----------------------------------------------------------------------

export type IProductReviewNewForm = {
  rating: number | null;
  review: string;
  name: string;
  email: string;
};

export type IProductReview = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  helpful: number;
  avatarUrl: string;
  isPurchased: boolean;
  attachments?: string[];
  postedAt: Date;
};

export type IProductItem = {
  id: string;
  sku: string;
  name: string;
  modelHeight: number;
  modelSize: number;
  code: string;
  price: number;
  taxes: number;
  tags: string[];
  gender: string;
  sizes: string[];
  publish: string;
  coverUrl: string;
  images: string[];
  colors: string[];
  quantity: number;
  category: string;
  available: number;
  totalSold: number;
  description: string;
  totalRatings: number;
  productPrice: number;
  totalReviews: number;
  inventoryType: string;
  subDescription: string;
  dimensions: { length?: number; width?: number; height?: number } | null;
  isFeatured: boolean;
  is_new: boolean;
  is_sale: boolean;
  priceSale: number | null;
  reviews: IProductReview[];
  createdAt: Date;
  variants: ProductVariantDto[];
  ratings: {
    name: string;
    starCount: number;
    reviewCount: number;
  }[];
  saleLabel: {
    enabled: boolean;
    content: string;
  };
  newLabel: {
    enabled: boolean;
    content: string;
  };
};

// API Product type for new data structure
export type IApiProductItem = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: string;
  sale_price: string | null;
  cost_price: string | null;
  images: string[];
  variants: any[];
  stock_quantity: number;
  sku: string;
  barcode: string | null;
  category_id: number;
  tags: string[];
  status: string;
  is_featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  weight: string | null;
  dimensions: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  category: {
    id: number;
    name: string;
    slug: string;
    description: string;
    image_url: string | null;
    parent_id: number | null;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
};

export type IProductTableFilterValue = string | string[];

export type IProductTableFilters = {
  stock: string[];
  publish: string[];
  category: string;
  search: string;
};
