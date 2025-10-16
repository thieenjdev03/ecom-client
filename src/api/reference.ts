import useSWR from "swr";
import { useMemo } from "react";
import { fetcher, endpoints } from "src/utils/axios";

export function useGetCategories() {
  const URL = endpoints.refs.categories;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);
  const memoized = useMemo(
    () => ({
      categories: (Array.isArray(data?.data) ? data.data : data) || [],
      categoriesLoading: isLoading,
      categoriesError: error,
      categoriesValidating: isValidating,
    }),
    [data, error, isLoading, isValidating],
  );
  return memoized;
}

export function useGetColors() {
  const URL = endpoints.refs.colors;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);
  const memoized = useMemo(
    () => ({
      colors: (Array.isArray(data?.data) ? data.data : data) || [],
      colorsLoading: isLoading,
      colorsError: error,
      colorsValidating: isValidating,
    }),
    [data, error, isLoading, isValidating],
  );
  return memoized;
}

export function useGetSizes(categoryId?: string) {
  const URL = categoryId
    ? [endpoints.refs.sizes, { params: { categoryId } }]
    : endpoints.refs.sizes;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);
  const memoized = useMemo(
    () => ({
      sizes: (Array.isArray(data?.data) ? data.data : data) || [],
      sizesLoading: isLoading,
      sizesError: error,
      sizesValidating: isValidating,
    }),
    [data, error, isLoading, isValidating],
  );
  return memoized;
}
