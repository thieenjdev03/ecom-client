import useSWR from "swr";
import { useMemo } from "react";

import axios, { fetcher, endpoints } from "src/utils/axios";

import { IProductItem } from "src/types/product";
import { ProductDto } from "src/types/product-dto";
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
        ? (data as ProductDto[]).map(adaptProductDtoToItem)
        : (data?.data?.data as ProductDto[] | undefined)?.map(
            adaptProductDtoToItem,
          ) || [],
      productsLoading: isLoading,
      productsError: error,
      productsValidating: isValidating,
      meta: (data?.data?.meta as any) || (data?.meta as any) || undefined,
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

export function useGetProduct(productId: string) {
  const URL = productId ? endpoints.product.details(productId) : "";

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      product: data
        ? adaptProductDtoToItem(
            (data?.data as ProductDto) ?? (data as ProductDto),
          )
        : (undefined as unknown as IProductItem),
      productLoading: isLoading,
      productError: error,
      productValidating: isValidating,
    }),
    [data, error, isLoading, isValidating],
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
