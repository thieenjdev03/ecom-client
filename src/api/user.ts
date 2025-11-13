import axios from "src/utils/axios";

export type IUserAddress = {
  id: string;
  userId?: string;
  recipientName: string;
  recipientPhone: string;
  label?: string;
  countryCode?: string;
  province?: string;
  district?: string;
  ward?: string;
  streetLine1: string;
  streetLine2?: string | null;
  postalCode?: string;
  latitude?: string | null;
  longitude?: string | null;
  isShipping?: boolean;
  isBilling?: boolean;
  isDefault?: boolean;
  note?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateUserRequest = {
  email: string;
  password: string;
  role: "admin" | "user";
  profile?: string;
  name?: string;
  phoneNumber?: string;
  company?: string;
  status?: string;
};

export type UpdateUserRequest = Partial<CreateUserRequest>;

export type User = {
  id: number | string;
  email: string;
  role: "admin" | "user";
  profile?: string;
  name?: string;
  phoneNumber?: string;
  company?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  // Additional fields from API
  addresses?: IUserAddress[];
  avatarUrl?: string;
  city?: string;
  state?: string;
  address?: string;
  country?: string;
  zipCode?: string;
  isVerified?: boolean;
};

export type UserListResponse = {
  data: User[];
  total: number;
  page: number;
  limit: number;
};

const base = `${process.env.NEXT_PUBLIC_API_BASE_URL}/users`;

export const usersApi = {
  async create(data: CreateUserRequest) {
    const res = await axios.post(`${base}`, data);
    return res.data;
  },
  async list(params: Record<string, any>) {
    // Add include params to get more detailed data
    const queryParams = {
      ...params,
      // include: params.include || "addresses,profile",
    };
    const res = await axios.get(`${base}`, { params: queryParams });
    return res.data;
  },
  async getById(id: number | string) {
    const res = await axios.get(`${base}/${id}`, {
      params: { include: "addresses,profile" },
    });
    return res.data;
  },
  async update(id: number | string, data: UpdateUserRequest) {
    const res = await axios.patch(`${base}/${id}`, data);
    return res.data;
  },
  async remove(id: number | string) {
    const res = await axios.delete(`${base}/${id}`);
    return res.status === 204 ? true : res.data;
  },
};
