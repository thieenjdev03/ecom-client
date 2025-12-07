import useSWR, { mutate } from "swr";
import { useMemo } from "react";
import axios, { fetcher, endpoints } from "src/utils/axios";

export function useGetCategories() {
  const URL = `${process.env.NEXT_PUBLIC_API_URL}/categories`;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);
  console.log('data', data);
  const memoized = useMemo(
    () => ({
      categories: (Array.isArray(data?.data?.data) ? data.data.data : data?.data) || [],
      categoriesLoading: isLoading,
      categoriesError: error,
      categoriesValidating: isValidating,
    }),
    [data, error, isLoading, isValidating],
  );
  return memoized;
}

export function useGetCategoryTree() {
  const URL = `${process.env.NEXT_PUBLIC_API_URL}/categories/tree?active=true`;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);
  const memoized = useMemo(
    () => ({
      // Tree endpoint is expected to return an array; support optional { data: [] }
      categoryTree: (Array.isArray(data?.data) ? data.data : data) || [],
      categoryTreeLoading: isLoading,
      categoryTreeError: error,
      categoryTreeValidating: isValidating,
    }),
    [data, error, isLoading, isValidating],
  );
  return memoized;
}

export function useGetColors() {
  const URL = `${process.env.NEXT_PUBLIC_API_URL}/colors`;
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
    ? [`${process.env.NEXT_PUBLIC_API_URL}/sizes`, { params: { categoryId } }]
    : `${process.env.NEXT_PUBLIC_API_URL}/sizes`;
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
  parent_id?: string | null;
  display_order?: number;
  is_active?: boolean;
}) {
  const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/categories`, payload);
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
  const res = await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`, payload);
  mutate(endpoints.refs.categories); // Revalidate SWR cache
  return res.data;
}

export async function deleteCategory(id: string) {
  const res = await axios.delete(`${endpoints.refs.categories}/${id}`);
  mutate(endpoints.refs.categories); // Revalidate SWR cache
  return res.data;
}


// Colors CRUD operations
// NOTE: Backend requires at least one of `hexCode` or `imageUrl`.
// Frontend callers should respect this rule when constructing the payload.
export async function createColor(payload: { name: string; hexCode?: string; imageUrl?: string }) {
  const res = await axios.post(endpoints.refs.colors, payload);
  mutate(endpoints.refs.colors);
  return res.data;
}

export async function createSize(payload: { name: string; categoryId?: string }) {
  const res = await axios.post(endpoints.refs.sizes, payload);
  mutate(endpoints.refs.sizes);
  return res.data;
}

export async function updateColor({ id, ...payload }: { id: string; name?: string; hexCode?: string; imageUrl?: string }) {
  const res = await axios.patch(`${endpoints.refs.colors}/${id}`, payload);
  mutate(endpoints.refs.colors);
  return res.data;
}

export async function deleteColor(id: string) {
  const res = await axios.delete(`${endpoints.refs.colors}/${id}`);
  mutate(endpoints.refs.colors);
  return res.data;
}

export async function updateSize({ id, ...payload }: { id: string; name?: string; categoryId?: string; sortOrder?: number }) {
  const res = await axios.patch(`${endpoints.refs.sizes}/${id}`, payload);
  mutate(endpoints.refs.sizes);
  return res.data;
}

export async function deleteSize(id: string) {
  const res = await axios.delete(`${endpoints.refs.sizes}/${id}`);
  mutate(endpoints.refs.sizes);
  return res.data;
}
