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