import axios from "axios";
import type { CreateCategoriaRequest, CreateProdutoRequest, HappyHourConfig, HappyHourProductsResponse, LoginRequest, ProdutoResponse, UpdateCategoriaRequest, UpdateProdutoRequest } from "./types";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");  // ← mesma chave que você salvou
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authService = async (credentials: LoginRequest) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

// Categorias
export const categoriaService = {
  listAll: async () => {
    const response = await api.get("/produtos/categorias");
    return response.data;
  },
  create: async (data: CreateCategoriaRequest) => {
    const response = await api.post("/produtos/categorias", data);
    return response.data;
  },
  update: async (categoriaId: number, data: UpdateCategoriaRequest) => {
    const response = await api.put(`/categorias/${categoriaId}`, data);
    return response.data;
  },
  delete: async (categoriaId: number) => {
    const response = await api.delete(`/categorias/${categoriaId}`);
    return response.data;
  }
};

// Produtos
export const produtoService = {
  create: async (data: CreateProdutoRequest) => {
    const response = await api.post("/produtos", data);
    return response.data;
  },
  update: async (produtoId: number, data: UpdateProdutoRequest) => {
    const response = await api.put(`/produtos/${produtoId}`, data);
    return response.data;
  },
  delete: async (produtoId: number) => {
    const response = await api.delete(`/produtos/${produtoId}`);
    return response.data;
  },
  listAll: async (): Promise<ProdutoResponse> => {
    const response = await api.get("/produtos");
    return response.data;
  },
  listByCategoria: async (categoriaId: number): Promise<ProdutoResponse> => {
    const response = await api.get(`/produtos/categoria/${categoriaId}`);
    return response.data;
  },
  searchByName: async (nome: string): Promise<ProdutoResponse> => {
    const response = await api.get(`/produtos/search?nome=${nome}`);
    return response.data;
  }
};


export const happyHourService = {
  configure: async (config: HappyHourConfig) => {
    const response = await api.post("/happy-hour/config", config);
    return response.data;
  },
  getProducts: async (): Promise<HappyHourProductsResponse> => {
    const response = await api.get("/happy-hour/products");
    return response.data;
  },
  deactivate: async () => {
    const response = await api.delete("/happy-hour/deactivate");
    return response.data;
  }
};

export default api;