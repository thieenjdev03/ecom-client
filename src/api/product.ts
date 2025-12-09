import useSWR from "swr";
import { useMemo } from "react";

import axios, { fetcher, endpoints } from "src/utils/axios";

import { IProductItem } from "src/types/product";
import { Product, ProductListResponse } from "src/types/product-dto";
import { adaptProductDtoToItem } from "src/utils/product-adapter";

// ----------------------------------------------------------------------

export type ProductQueryParams = {
  // Pagination
  page?: number;
  limit?: number;
  // Filter parameters (API supported)
  category_id?: string;
  collection_id?: string; // Filter by collection
  status?: "active" | "draft" | "out_of_stock" | "discontinued";
  is_featured?: boolean;
  enable_sale_tag?: boolean;
  // Search parameter
  search?: string;
  // Sort parameters
  sort_by?: "created_at" | "updated_at" | "name" | "price" | "status";
  sort_order?: "ASC" | "DESC";
  // Locale
  locale?: string;
  // Client-side only filters (not supported by API, will be filtered after fetch)
  gender?: string | string[];
  colors?: string | string[];
  price_min?: number;
  price_max?: number;
  rating?: string;
};

export function useGetProducts(params?: ProductQueryParams) {
  // Get locale from i18n if not provided
  const getLocale = () => {
    if (params?.locale) return params.locale;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("i18nextLng");
      return stored || "en";
    }
    return "en";
  };

  // Build query params object for API, filtering out undefined values
  const queryParams: Record<string, any> = {};
  
  if (params) {
    // Pagination
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.limit !== undefined) queryParams.limit = params.limit;
    
    // API supported filters
    if (params.category_id) queryParams.category_id = params.category_id;
    if (params.collection_id) queryParams.collection_id = params.collection_id;
    if (params.status) queryParams.status = params.status;
    if (params.is_featured !== undefined) queryParams.is_featured = params.is_featured;
    if (params.enable_sale_tag !== undefined) queryParams.enable_sale_tag = params.enable_sale_tag;
    if (params.search) queryParams.search = params.search;
    
    // Sort parameters
    if (params.sort_by) queryParams.sort_by = params.sort_by;
    if (params.sort_order) queryParams.sort_order = params.sort_order;
    
    // Locale
    const locale = getLocale();
    if (locale) queryParams.locale = locale;
  } else {
    // Default locale if no params provided
    const locale = getLocale();
    if (locale) queryParams.locale = locale;
  }

  const URL = Object.keys(queryParams).length > 0
    ? [endpoints.product.list, { params: queryParams }]
    : endpoints.product.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      products: Array.isArray(data)
        ? (data as Product[]).map((dto) => adaptProductDtoToItem(dto))
        : (data?.data?.data as Product[] | undefined)?.map(
            (dto) => adaptProductDtoToItem(dto),
          ) || [],
      productsLoading: isLoading,
      productsError: error,
      productsValidating: isValidating,
      meta: (data?.data?.meta as ProductListResponse["meta"]) || (data?.meta as ProductListResponse["meta"]) || undefined,
      productsEmpty:
        !isLoading &&
        ((Array.isArray(data) && data.length === 0) ||
          (Array.isArray(data?.data) && data.data.length === 0)),
      mutateProducts: mutate,
    }),
    [data, error, isLoading, isValidating, mutate],
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetProduct(productId: string, locale?: string) {
  // Get locale from i18n if not provided
  const getLocale = () => {
    if (locale) return locale;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("i18nextLng");
      return stored || "en";
    }
    return "en";
  };

  const currentLocale = getLocale();
  const URL = productId 
    ? [endpoints.product.details(productId), { params: { locale: currentLocale } }]
    : "";

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      product: data
        ? adaptProductDtoToItem(
            (data?.data as Product) ?? (data as Product),
            currentLocale,
          )
        : (undefined as unknown as IProductItem),
      productLoading: isLoading,
      productError: error,
      productValidating: isValidating,
    }),
    [data, error, isLoading, isValidating, currentLocale],
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useSearchProducts(query: string) {
  const URL = query ? [endpoints.product.list, { params: { query } }] : "";
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);
  return { data, isLoading, error, isValidating };
}

export async function createProduct(payload: any) {
  const res = await axios.post(endpoints.product.create, payload);
  return res.data;
}

export async function updateProduct(id: string, payload: any) {
  const res = await axios.patch(endpoints.product.update(id), payload);
  return res.data;
}

export async function deleteProduct(id: string) {
  const res = await axios.delete(endpoints.product.delete(id));
  return res.data;
}

export async function searchProducts(query: string) {
  const res = await axios.get(endpoints.product.list, { params: { query } });
  return res.data;
}

// Get product by ID (for validation)
export async function getProductById(productId: string, locale?: string) {
  const currentLocale = locale || (typeof window !== "undefined" ? localStorage.getItem("i18nextLng") || "en" : "en");
  const res = await axios.get(endpoints.product.details(productId), {
    params: { locale: currentLocale },
  });
  const product = res.data?.data || res.data;
  return product ? adaptProductDtoToItem(product as Product, currentLocale) : null;
}
