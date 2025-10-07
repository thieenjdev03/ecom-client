import axios, { AxiosRequestConfig } from 'axios';

import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: `${apiUrl}/auth/me`,
    login: `${apiUrl}/auth/login`,
    register: `${apiUrl}/auth/register`,
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: `${apiUrl}/products`,
    details: (id: string) => `${apiUrl}/products/${id}`,
      create: `${apiUrl}/products`,
    update: (id: string) => `${apiUrl}/products/${id}`,
    delete: (id: string) => `${apiUrl}/products/${id}`,
    // Future: variants/colors/sizes endpoints can be added here as needed
  },
  refs: {
    categories: `${apiUrl}/categories`,
    colors: `${apiUrl}/colors`,
    sizes: `${apiUrl}/sizes`,
  },
};
