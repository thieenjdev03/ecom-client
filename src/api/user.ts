import axios, { endpoints } from "src/utils/axios";

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
};

export type UserListResponse = {
  data: User[];
  total: number;
  page: number;
  limit: number;
};

const base = `${"http://localhost:3000"}/users`;

export const usersApi = {
  async create(data: CreateUserRequest) {
    const res = await axios.post(`${base}`, data);
    return res.data;
  },
  async list(params: Record<string, any>) {
    const res = await axios.get(`${base}`, { params });
    return res.data;
  },
  async getById(id: number | string) {
    const res = await axios.get(`${base}/${id}`);
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
