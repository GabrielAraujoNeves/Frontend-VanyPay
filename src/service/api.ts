import axios from "axios";
import type { ActiveConfigResponse, CreateCategoriaRequest, CreateProdutoRequest, HappyHourConfig, HappyHourConfigResponse, HappyHourProductsResponse, LoginRequest, ProdutoResponse, RelatorioDiaResponse, UpdateCategoriaRequest, UpdateProdutoRequest } from "./types";

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
export const authService = {
  login: async (credentials: LoginRequest) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },
  
  validateToken: async () => {
    const response = await api.get("/auth/validate-token");
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("lastTokenValidation");
  }
};

// Interceptor para tratar erros 401 (token expirado)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log("Token expirado ou inválido");
      
      // Limpar dados do localStorage
      authService.logout();
      
      // Redirecionar para login
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

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
  // Criar/atualizar configuração
  configure: async (config: HappyHourConfig): Promise<HappyHourConfigResponse> => {
    const response = await api.post("/happy-hour/config", config);
    return response.data;
  },
  
  // Buscar configuração ativa (usando o mesmo endpoint GET)
  getActiveConfig: async (): Promise<ActiveConfigResponse> => {
    const response = await api.get("/happy-hour/config");
    return response.data;
  },
  
  // Listar produtos com desconto
  getProducts: async (): Promise<HappyHourProductsResponse> => {
    const response = await api.get("/happy-hour/products");
    return response.data;
  },
  
  // Desativar Happy Hour
  deactivate: async () => {
    const response = await api.delete("/happy-hour/deactivate");
    return response.data;
  },
  
  // Forçar ativação (teste)
  forceActive: async () => {
    const response = await api.post("/happy-hour/test/force-active");
    return response.data;
  }
};

export const relatorioService = {
  getRelatorioDia: async (): Promise<RelatorioDiaResponse> => {
    const response = await api.get("/comanda/relatorio/dia");
    return response.data;
  },
  
  getRelatorioSemana: async (): Promise<any> => {
    const response = await api.get("/comanda/relatorio/semana");
    return response.data;
  },
  
  getRelatorioMes: async (): Promise<any> => {
    const response = await api.get("/comanda/relatorio/mes");
    return response.data;
  }
};


export default api;