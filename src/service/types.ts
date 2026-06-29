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

export interface ActiveConfigResponse {
  discountPercent: number;
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
  productIds: number[];
}

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

export interface RelatorioDiaResponse {
  data: string;
  quantidadeComandas: number;
  totalVendas: number;
  comandas: Comanda[];
}

export interface Comanda {
  id: number;
  numeroComanda: string;
  dataAbertura: string;
  dataFechamento: string | null;
  status: 'ABERTA' | 'FECHADA' | 'CANCELADA';
  valorTotal: number;
  tipoComanda: string;
  identificadorComanda: string;
  mesaId: number | null;
  cliente: string | null;
  mesa?: string;
  items?: ComandaItem[];
}

export interface ComandaItem {
  id: number;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

// Tipos para Mesas
export interface Mesa {
  id: number;
  numeroMesa: number;
  capacidade: number;
  isOcupada: boolean;
  comandaId?: number; // Adicionar campo comandaId
  createdAt: string;
}

export interface MesaResponse {
  total: number;
  mesas: Mesa[];
}

export interface CreateMesaRequest {
  numeroMesa: number;
  capacidade: number;
}

export type TipoComanda = 'MESA' | 'PULSEIRA' | 'CARTAO';

export interface AbrirComandaResponse {
  numeroComanda: string;
  tipoComanda: TipoComanda;
  message: string;
  identificador: string;
  dataAbertura: string;
}

export interface Pulseira {
  id: number;
  numeroPulseira: string;
  nomeCliente: string;
  pulseiraAgrupadaCom: string | null;
  isAtivo: boolean;
  createdAt: string;
}

export interface PulseiraResponse {
  total: number;
  pulseiras: Pulseira[];
}

export interface CreatePulseiraRequest {
  numeroPulseira: string;
  nomeCliente: string;
}

export interface AgruparPulseiraRequest {
  pulseiraPrincipal: string;
  pulseiraSecundaria: string;
}

export interface PulseiraMessageResponse {
  message: string;
}

// Tipos para Cartões
export interface Cartao {
  id: number;
  numeroCartao: string;
  nomeCliente: string;
  cartaoVinculado: string | null;
  isAtivo: boolean;
  createdAt: string;
}

export interface CartaoResponse {
  total: number;
  cartoes: Cartao[];
}

export interface CreateCartaoRequest {
  numeroCartao: string;
  nomeCliente: string;
}

export interface VincularCartaoRequest {
  cartaoPrincipal: string;
  cartaoSecundario: string;
}

export interface CartaoMessageResponse {
  message: string;
}

export interface AbrirComandaCartaoResponse {
  numeroComanda: string;
  tipoComanda: string;
  message: string;
  identificador: string;
  dataAbertura: string;
}


// Tipos para Cliente
export interface Cliente {
  id: number;
  nome: string;
  valorTotal: number;
  comanda: Comanda;
  createdAt: string;
}

export interface ClienteResponse {
  total: number;
  clientes: Cliente[];
}


// Adicione no final do arquivo types.ts

// Tipos para Cliente com itens
export interface ClienteComItem {
  id: number;
  nome: string;
  valorTotal: number;
  pago: boolean;
  dataPagamento: string | null;
  itens: ItemConsumo[];
  createdAt: string;
  updatedAt: string;
}

export interface ItemConsumo {
  id: number;
  produto: {
    id: number;
    nome: string;
    descricao: string;
    preco: number;
    quantidade: number;
    createdAt: string;
    updatedAt: string;
  };
  quantidade: number;
  precoUnitario: number;
  precoTotal: number;
}

export interface ClientesComandaResponse {
  total: number;
  clientes: ClienteComItem[];
}

export interface MesaDetalhada extends Mesa {
  comanda: {
    comandaId: number;
    numeroComanda: string;
    dataAbertura: string;
    valorTotal: number;
    clientes: ClienteComItem[];
  } | null;
}

export interface ClienteComItem {
  id: number;
  nome: string;
  valorTotal: number;
  pago: boolean;
  dataPagamento: string | null;
  itens: ItemConsumo[];
  createdAt: string;
  updatedAt: string;
}

export interface ItemConsumo {
  id: number;
  produto: {
    id: number;
    nome: string;
    descricao: string;
    preco: number;
    quantidade: number;
    createdAt: string;
    updatedAt: string;
  };
  quantidade: number;
  precoUnitario: number;
  precoTotal: number;
}

export interface ClientesComandaResponse {
  total: number;
  clientes: ClienteComItem[];
}

export interface MesaComComanda extends Mesa {
  comanda: {
    comandaId: number;
    numeroComanda: string;
    dataAbertura: string;
    valorTotal: number;
  } | null;
}

export interface AdicionarProdutoRequest {
  produtoId: number;
  quantidade: number;
}

export interface AdicionarProdutoResponse {
  produto: string;
  message: string;
  quantidade: number;
  precoTotal: number;
}

export interface DashboardRelatorio {
  itensPerdidosHoje: number;
  dataAtual: string;
  vendasMes: number;
  vendasAno: number;
  comandasAbertas: number;
  vendasHoje: number;
}

