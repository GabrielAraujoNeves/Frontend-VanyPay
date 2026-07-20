import api from "../../../service/ApiTeste";
import type { 
  EstoqueResponse, 
  EstoqueItem, 
  CreateEstoqueRequest,
  UpdateEstoqueRequest 
} from "../types/estoque";


export const estoqueService = {
  listAll: async (): Promise<EstoqueResponse> => {
    const response = await api.get("/estoque");
    return response.data;
  },
  
  getItem: async (id: number): Promise<EstoqueItem> => {
    const response = await api.get(`/estoque/${id}`);
    return response.data;
  },
  
  create: async (data: CreateEstoqueRequest): Promise<EstoqueItem> => {
    const response = await api.post("/estoque", data);
    return response.data;
  },
  
  update: async (id: number, data: UpdateEstoqueRequest): Promise<EstoqueItem> => {
    const response = await api.put(`/estoque/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/estoque/${id}`);
  }
};

export const categoriaEstoqueService = {
  listAll: async () => {
    const response = await api.get("/categoria/estoque");
    return response.data;
  },
  create: async (data: { nome: string }) => {
    const response = await api.post("/categoria/estoque", data);
    return response.data;
  },
  update: async (id: number, data: { nome: string }) => {
    const response = await api.put(`/categoria/estoque/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/categoria/estoque/${id}`);
    return response.data;
  }
};