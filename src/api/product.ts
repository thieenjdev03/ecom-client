import useSWR from "swr";
import { useMemo } from "react";

import axios, { fetcher, endpoints } from "src/utils/axios";

import { IProductItem } from "src/types/product";
import { Product, ProductListResponse } from "src/types/product-dto";
import { adaptProductDtoToItem } from "src/utils/product-adapter";

// ----------------------------------------------------------------------

export function useGetProducts(params?: { page?: number; limit?: number }) {
  const URL = params
    ? [endpoints.product.list, { params }]
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
