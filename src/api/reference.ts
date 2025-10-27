import useSWR, { mutate } from "swr";
import { useMemo } from "react";
import axios, { fetcher, endpoints } from "src/utils/axios";

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

// ----------------------------------------------------------------------

// Category CRUD operations
export async function createCategory(payload: { 
  name: string; 
  slug: string; 
  description?: string;
  image_url?: string;
  parent_id?: number | null;
  display_order?: number;
  is_active?: boolean;
}) {
  const res = await axios.post(endpoints.refs.categories, payload);
  mutate(endpoints.refs.categories); // Revalidate SWR cache
  return res.data;
}

export async function updateCategory({ id, ...payload }: { 
  id: string; 
  name: string; 
  slug: string; 
  description?: string;
  image_url?: string;
  parent_id?: number | null;
  display_order?: number;
  is_active?: boolean;
}) {
  const res = await axios.patch(`${endpoints.refs.categories}/${id}`, payload);
  mutate(endpoints.refs.categories); // Revalidate SWR cache
  return res.data;
}

export async function deleteCategory(id: string) {
  const res = await axios.delete(`${endpoints.refs.categories}/${id}`);
  mutate(endpoints.refs.categories); // Revalidate SWR cache
  return res.data;
}


export async function createColor(payload: { name: string; hexCode?: string }) {
  const res = await axios.post(endpoints.refs.colors, payload);
  return res.data;
}

export async function createSize(payload: { name: string; categoryId?: string }) {
  const res = await axios.post(endpoints.refs.sizes, payload);
  return res.data;
}
