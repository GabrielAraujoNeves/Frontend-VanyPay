import axios from "axios";
import type { AbrirComandaCartaoResponse, AbrirComandaResponse, ActiveConfigResponse, AdicionarProdutoRequest, AdicionarProdutoResponse, AgruparPulseiraRequest, CartaoMessageResponse, CartaoResponse, ClienteResponse, ClientesComandaResponse, Comanda, CreateCartaoRequest, CreateCategoriaRequest, CreateMesaRequest, CreateProdutoRequest, CreatePulseiraRequest, DashboardRelatorio, HappyHourConfig, HappyHourConfigResponse, HappyHourProductsResponse, LoginRequest, Mesa, MesaComComanda, MesaDetalhada, MesaResponse, ProdutoResponse, PulseiraMessageResponse, PulseiraResponse, RelatorioDiaResponse, TipoComanda, UpdateCategoriaRequest, UpdateProdutoRequest, VincularCartaoRequest } from "./types";

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
  
  getRelatorioMes: async ():    Promise<any> => {
    const response = await api.get("/comanda/relatorio/mes");
    return response.data;
  }
};

// Adicione no mesaService
export const mesaService = {
  listAll: async (): Promise<MesaResponse> => {
    const response = await api.get("/comanda/mesas");
    return response.data;
  },
  
  listOcupadas: async (): Promise<MesaResponse> => {
    const response = await api.get("/comanda/mesas/ocupadas");
    return response.data;
  },
  
  // Buscar comanda da mesa diretamente
  buscarComandaDaMesa: async (mesaId: number): Promise<Comanda> => {
    const response = await api.get(`/comanda/buscar?identificador=${mesaId}&tipo=MESA`);
    return response.data;
  },
  
  // Buscar mesa com detalhes da comanda
  getMesaComComanda: async (mesaId: number): Promise<MesaComComanda> => {
    const response = await api.get(`/comanda/mesas/${mesaId}/comanda`);
    return response.data;
  },
  
  create: async (data: CreateMesaRequest): Promise<Mesa> => {
    const response = await api.post("/comanda/mesas", data);
    return response.data;
  },
  
  liberar: async (mesaId: number): Promise<any> => {
    const response = await api.put(`/comanda/mesas/${mesaId}/liberar`);
    return response.data;
  },
  
  delete: async (mesaId: number): Promise<any> => {
    const response = await api.delete(`/comanda/mesas/${mesaId}`);
    return response.data;
  }
};

// Serviços para Comanda
export const comandaService = {
  abrirMesa: async (mesaId: number, clientes: string[]): Promise<AbrirComandaResponse> => {
    const response = await api.post(`/comanda/abrir/mesa?mesaId=${mesaId}`, clientes);
    return response.data;
  },
  
  buscar: async (identificador: string, tipo: TipoComanda): Promise<Comanda> => {
    const response = await api.get(`/comanda/buscar?identificador=${identificador}&tipo=${tipo}`);
    return response.data;
  },
  
  fechar: async (comandaId: number): Promise<any> => {
    const response = await api.put(`/comanda/${comandaId}/fechar`);
    return response.data;
  },
  
  cancelar: async (comandaId: number): Promise<any> => {
    const response = await api.put(`/comanda/${comandaId}/cancelar`);
    return response.data;
  }
};



// Adicione no clienteService
export const clienteService = {
  // Listar clientes de uma comanda
  listByComanda: async (comandaId: number): Promise<ClientesComandaResponse> => {
    const response = await api.get(`/comanda/${comandaId}/clientes`);
    return response.data;
  },
  
  // Buscar comanda por ID
  buscarComanda: async (comandaId: number): Promise<Comanda> => {
    const response = await api.get(`/comanda/${comandaId}`);
    return response.data;
  },
  
  // Adicionar produto ao cliente da comanda
  adicionarProduto: async (comandaId: number, clienteId: number, data: AdicionarProdutoRequest): Promise<AdicionarProdutoResponse> => {
    const response = await api.post(`/comanda/${comandaId}/cliente/${clienteId}/adicionar-produto`, data);
    return response.data;
  },
  
  // Remover item do cliente da comanda
  removerItem: async (comandaId: number, clienteId: number, itemId: number, justificativa: string): Promise<any> => {
    const response = await api.delete(`/comanda/${comandaId}/cliente/${clienteId}/item/${itemId}/remover`, {
      data: { justificativa }
    });
    return response.data;
  }
};


// Adicione no pulseiraService
export const pulseiraService = {
  // Criar pulseira
  create: async (data: CreatePulseiraRequest): Promise<any> => {
    const response = await api.post("/comanda/pulseiras", data);
    return response.data;
  },
  
  // Listar todas as pulseiras
  listAll: async (): Promise<PulseiraResponse> => {
    const response = await api.get("/comanda/pulseiras");
    return response.data;
  },
  
  // Listar pulseiras ativas
  listAtivas: async (): Promise<PulseiraResponse> => {
    const response = await api.get("/comanda/pulseiras/ativas");
    return response.data;
  },
  
  // Agrupar pulseiras
  agrupar: async (data: AgruparPulseiraRequest): Promise<PulseiraMessageResponse> => {
    const response = await api.post("/comanda/pulseiras/agrupar", data);
    return response.data;
  },
  
  // Desagrupar pulseira
  desagrupar: async (numeroPulseira: string): Promise<PulseiraMessageResponse> => {
    const response = await api.delete(`/comanda/pulseiras/${numeroPulseira}/desagrupar`);
    return response.data;
  },
  
  // Desativar pulseira
  desativar: async (numeroPulseira: string): Promise<PulseiraMessageResponse> => {
    const response = await api.delete(`/comanda/pulseiras/${numeroPulseira}`);
    return response.data;
  },
  
  // Buscar comanda da pulseira
  buscarComanda: async (numeroPulseira: string): Promise<Comanda> => {
    const response = await api.get(`/comanda/buscar?identificador=${numeroPulseira}&tipo=PULSEIRA`);
    return response.data;
  }
};

// Adicione no cartaoService
export const cartaoService = {
  // Criar cartão
  create: async (data: CreateCartaoRequest): Promise<any> => {
    const response = await api.post("/comanda/cartoes", data);
    return response.data;
  },
  
  // Listar todos os cartões
  listAll: async (): Promise<CartaoResponse> => {
    const response = await api.get("/comanda/cartoes");
    return response.data;
  },
  
  // Listar cartões vinculados a um cartão principal
  listVinculados: async (numeroCartao: string): Promise<CartaoResponse> => {
    const response = await api.get(`/comanda/cartoes/${numeroCartao}/vinculados`);
    return response.data;
  },
  
  // Vincular cartão secundário a um principal
  vincular: async (data: VincularCartaoRequest): Promise<CartaoMessageResponse> => {
    const response = await api.post("/comanda/cartoes/vincular", data);
    return response.data;
  },
  
  // Desvincular cartão
  desvincular: async (numeroCartao: string): Promise<CartaoMessageResponse> => {
    const response = await api.delete(`/comanda/cartoes/${numeroCartao}/desvincular`);
    return response.data;
  },
  
  // Desativar cartão
  desativar: async (numeroCartao: string): Promise<CartaoMessageResponse> => {
    const response = await api.delete(`/comanda/cartoes/${numeroCartao}`);
    return response.data;
  },
  
  // Abrir comanda com cartão
  abrirComanda: async (numeroCartao: string, nomeCliente: string): Promise<AbrirComandaCartaoResponse> => {
    const response = await api.post(`/comanda/abrir/cartao?numeroCartao=${numeroCartao}&nomeCliente=${nomeCliente}`);
    return response.data;
  },
  
  // Buscar comanda do cartão
  buscarComanda: async (numeroCartao: string): Promise<Comanda> => {
    const response = await api.get(`/comanda/buscar?identificador=${numeroCartao}&tipo=CARTAO_EDIFICACAO`);
    return response.data;
  }
};

export const dashboardService = {
  getDashboard: async (): Promise<DashboardRelatorio> => {
    const response = await api.get("/relatorios/dashboard");
    return response.data;
  }
};



export default api;