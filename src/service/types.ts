export interface LoginRequest {
  email: string;
  password: string;
}

export interface Categoria {
  id: number;
  nome: string;
  descricao: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoriaResponse {
  total: number;
  categorias: Categoria[];
}

export interface CreateCategoriaRequest {
  nome: string;
  descricao: string;
}

export interface UpdateCategoriaRequest {
  nome: string;
  descricao: string;
}

export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  precoOriginal: number;
  quantidade: number;
  createdAt: string;
  updatedAt: string;
  categoria: Categoria;
}

export interface ProdutoResponse {
  total: number;
  produtos: Produto[];
}

export interface CreateProdutoRequest {
  nome: string;
  descricao: string;
  preco: number;
  quantidade: number;
  categoriaId: number;
}

export interface UpdateProdutoRequest {
  nome: string;
  descricao: string;
  preco: number;
  quantidade: number;
  categoriaId: number;
}


// Happy Hour
export interface HappyHourConfig {
  discountPercent: number;
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
  productIds: number[];
}

// Resposta da configuração ativa (GET /happy-hour/config/active)
export interface ActiveConfigResponse {
  discountPercent: number;
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
  productIds: number[];
}

// Resposta completa da configuração (POST /happy-hour/config)
export interface HappyHourConfigResponse {
  message: string;
  config: {
    id: number;
    isActive: boolean;
    discountPercent: number;
    startTime: string;
    endTime: string;
    daysOfWeek: string[];
    products: Array<{
      productId: number;
      productName: string;
      originalPrice: number;
      discountedPrice: number;
    }>;
  };
}

export interface HappyHourProduct {
  id: number;
  nome: string;
  descricao: string;
  precoOriginal: number;
  precoPromocional: number;
  descontoPercent: number;
  isInHappyHour: boolean;
  quantidade?: number;
  createdAt?: string;
  updatedAt?: string;
  categoria?: {
    id: number;
    nome: string;
    descricao: string;
  };
}

export interface HappyHourProductsResponse {
  total: number;
  produtos: HappyHourProduct[];
  isHappyHourActive: boolean;
}