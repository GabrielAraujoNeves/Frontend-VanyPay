export interface EstoqueItem {
  id: number;
  nomeProduto: string;
  categoriaId: number | null;
  categoriaNome: string | null;
  quantidade: number;
  unidadeMedida: string;
  pesoVolume: number;
  precoUnitario: number;
  precoCompra: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  localizacao: string;
  fornecedor: string;
  dataValidade: string;
  dataCadastro: string;
  dataAtualizacao: string;
  observacoes: string;
  valorTotal: number;
  isEstoqueBaixo: boolean;
  isEstoqueAlto: boolean;
  isVencido: boolean;
  isProximoVencer: boolean;
}

export interface EstoqueResponse {
  itens: EstoqueItem[];
  totalItens: number;
  valorTotalEstoque: number;
}

export interface CreateEstoqueRequest {
  nomeProduto: string;
  categoria: string;
  quantidade: number;
  unidadeMedida: string;
  pesoVolume: number;
  precoUnitario: number;
  precoCompra: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  localizacao: string;
  fornecedor: string;
  dataValidade: string | null;
  observacoes: string;
}

export interface UpdateEstoqueRequest {
  nomeProduto: string;
  precoUnitario: number;
  precoCompra: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  localizacao: string;
  observacoes: string;
}