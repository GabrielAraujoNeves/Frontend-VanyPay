import { useState, useEffect } from "react";
import { 
  ShoppingCart, Table, Sparkles, Wallet, Search, 
  ChevronRight, Plus, Minus, Trash2, X, RefreshCw,
  Users, CreditCard, Tag, DollarSign, User
} from "lucide-react";
import { mesaService, pulseiraService, cartaoService, produtoService } from "../service/api";
import type { Mesa, Pulseira, Cartao, Produto } from "../service/types";

type TipoVenda = "mesa" | "pulseira" | "cartao";

interface ItemPedido {
  produtoId: number;
  nome: string;
  preco: number;
  quantidade: number;
  subtotal: number;
}

interface ClienteComanda {
  id: number;
  nome: string;
  valorTotal: number;
  itens: any[];
}

interface MesaComDados extends Mesa {
  comanda?: {
    comandaId: number;
    numeroComanda: string;
    dataAbertura: string;
    valorTotal: number;
    clientes: ClienteComanda[];
  };
}

export default function VendasManager() {
  const [tipoVenda, setTipoVenda] = useState<TipoVenda>("mesa");
  const [mesas, setMesas] = useState<MesaComDados[]>([]);
  const [pulseiras, setPulseiras] = useState<Pulseira[]>([]);
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [clientes, setClientes] = useState<ClienteComanda[]>([]);
  const [comandaInfo, setComandaInfo] = useState<any>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemPedido[]>([]);
  const [showProdutos, setShowProdutos] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteComanda | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tipoVenda === "mesa") {
        const response = await mesaService.listAll();
        console.log("Mesas carregadas:", response);
        setMesas(response.mesas || []);
      } else if (tipoVenda === "pulseira") {
        const response = await pulseiraService.listAll();
        setPulseiras(response.pulseiras || []);
      } else if (tipoVenda === "cartao") {
        const response = await cartaoService.listAll();
        setCartoes(response.cartoes || []);
      }
      
      // Carregar produtos
      const produtosResponse = await produtoService.listAll();
      setProdutos(produtosResponse.produtos || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tipoVenda]);

  const handleSelectItem = async (item: any) => {
    setSelectedItem(item);
    setShowProdutos(true);
    setClienteSelecionado(null);
    
    if (tipoVenda === "mesa" && item.comanda) {
      // Para mesa, os clientes já vêm no objeto comanda
      setClientes(item.comanda.clientes || []);
      setComandaInfo({
        comandaId: item.comanda.comandaId,
        numeroComanda: item.comanda.numeroComanda,
        valorTotal: item.comanda.valorTotal
      });
    } else {
      setClientes([]);
      setComandaInfo(null);
    }
  };

  const handleSelectCliente = (cliente: ClienteComanda) => {
    setClienteSelecionado(cliente);
    setCarrinho([]); // Limpar carrinho ao trocar de cliente
  };

  const handleAddProduto = (produto: Produto) => {
    const existingItem = carrinho.find(item => item.produtoId === produto.id);
    if (existingItem) {
      setCarrinho(carrinho.map(item =>
        item.produtoId === produto.id
          ? { ...item, quantidade: item.quantidade + 1, subtotal: (item.quantidade + 1) * produto.preco }
          : item
      ));
    } else {
      setCarrinho([...carrinho, {
        produtoId: produto.id,
        nome: produto.nome,
        preco: produto.preco,
        quantidade: 1,
        subtotal: produto.preco
      }]);
    }
  };

  const handleUpdateQuantidade = (produtoId: number, quantidade: number) => {
    if (quantidade <= 0) {
      setCarrinho(carrinho.filter(item => item.produtoId !== produtoId));
    } else {
      setCarrinho(carrinho.map(item =>
        item.produtoId === produtoId
          ? { ...item, quantidade, subtotal: quantidade * item.preco }
          : item
      ));
    }
  };

  const handleRemoveProduto = (produtoId: number) => {
    setCarrinho(carrinho.filter(item => item.produtoId !== produtoId));
  };

  const handleFinalizarPedido = async () => {
    console.log("Finalizando pedido:", { 
      selectedItem, 
      clienteSelecionado, 
      carrinho, 
      comandaInfo 
    });
    
    // Aqui você vai implementar a API para adicionar itens à comanda
    // Por enquanto, apenas simulamos
    alert(`Pedido finalizado para ${clienteSelecionado?.nome || "cliente"}!\nTotal: R$ ${totalCarrinho.toFixed(2)}`);
    
    // Limpar carrinho
    setCarrinho([]);
    setShowProdutos(false);
    setSelectedItem(null);
    setClienteSelecionado(null);
  };

  const totalCarrinho = carrinho.reduce((sum, item) => sum + item.subtotal, 0);

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderItemList = () => {
    if (tipoVenda === "mesa") {
      return mesas.map(mesa => (
        <button
          key={mesa.id}
          onClick={() => handleSelectItem(mesa)}
          className={`w-full p-4 rounded-xl border transition-all text-left ${
            selectedItem?.id === mesa.id
              ? "border-[#7B2CFF] bg-[#7B2CFF]/10"
              : "border-gray-700 bg-[#08080D] hover:border-[#7B2CFF]/50"
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${mesa.isOcupada ? "bg-red-500/20" : "bg-green-500/20"}`}>
                <Table size={20} className={mesa.isOcupada ? "text-red-400" : "text-green-400"} />
              </div>
              <div>
                <h3 className="font-semibold text-[#F5F5FA]">Mesa {mesa.numeroMesa}</h3>
                <p className="text-[#B8B8C8] text-sm">Capacidade: {mesa.capacidade} pessoas</p>
                {mesa.comanda && (
                  <p className="text-[#B8B8C8] text-xs">
                    Comanda: {mesa.comanda.numeroComanda}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs ${
                mesa.isOcupada 
                  ? "bg-red-500/20 text-red-400" 
                  : "bg-green-500/20 text-green-400"
              }`}>
                {mesa.isOcupada ? "OCUPADA" : "LIVRE"}
              </span>
              <ChevronRight size={18} className="text-[#B8B8C8]" />
            </div>
          </div>
        </button>
      ));
    }

    if (tipoVenda === "pulseira") {
      return pulseiras.map(pulseira => (
        <button
          key={pulseira.id}
          onClick={() => handleSelectItem(pulseira)}
          className={`w-full p-4 rounded-xl border transition-all text-left ${
            selectedItem?.id === pulseira.id
              ? "border-[#7B2CFF] bg-[#7B2CFF]/10"
              : "border-gray-700 bg-[#08080D] hover:border-[#7B2CFF]/50"
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-full">
                <Sparkles size={20} className="text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-[#F5F5FA]">Pulseira {pulseira.numeroPulseira}</h3>
                <p className="text-[#B8B8C8] text-sm">{pulseira.nomeCliente}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs ${
                pulseira.isAtivo 
                  ? "bg-green-500/20 text-green-400" 
                  : "bg-gray-500/20 text-gray-400"
              }`}>
                {pulseira.isAtivo ? "ATIVA" : "INATIVA"}
              </span>
              <ChevronRight size={18} className="text-[#B8B8C8]" />
            </div>
          </div>
        </button>
      ));
    }

    return cartoes.map(cartao => (
      <button
        key={cartao.id}
        onClick={() => handleSelectItem(cartao)}
        className={`w-full p-4 rounded-xl border transition-all text-left ${
          selectedItem?.id === cartao.id
            ? "border-[#7B2CFF] bg-[#7B2CFF]/10"
            : "border-gray-700 bg-[#08080D] hover:border-[#7B2CFF]/50"
        }`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-full">
              <CreditCard size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-[#F5F5FA]">Cartão {cartao.numeroCartao}</h3>
              <p className="text-[#B8B8C8] text-sm">{cartao.nomeCliente}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs ${
              cartao.isAtivo 
                ? "bg-green-500/20 text-green-400" 
                : "bg-gray-500/20 text-gray-400"
            }`}>
              {cartao.isAtivo ? "ATIVO" : "INATIVO"}
            </span>
            <ChevronRight size={18} className="text-[#B8B8C8]" />
          </div>
        </div>
      </button>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#F5F5FA] flex items-center gap-2">
            <ShoppingCart size={28} className="text-[#7B2CFF]" />
            Vendas
          </h1>
          <p className="text-[#B8B8C8] mt-1">Selecione o tipo de venda e faça o pedido</p>
        </div>
        
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-[#12121A] border border-gray-700 rounded-xl text-[#B8B8C8] hover:text-white hover:border-[#7B2CFF] transition-all"
        >
          <RefreshCw size={18} />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Tipo de Venda */}
      <div className="flex gap-4">
        <button
          onClick={() => setTipoVenda("mesa")}
          className={`flex-1 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            tipoVenda === "mesa"
              ? "bg-[#7B2CFF] text-white"
              : "bg-[#12121A] text-[#B8B8C8] hover:bg-[#7B2CFF]/20"
          }`}
        >
          <Table size={20} />
          Mesa
        </button>
        <button
          onClick={() => setTipoVenda("pulseira")}
          className={`flex-1 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            tipoVenda === "pulseira"
              ? "bg-[#7B2CFF] text-white"
              : "bg-[#12121A] text-[#B8B8C8] hover:bg-[#7B2CFF]/20"
          }`}
        >
          <Sparkles size={20} />
          Pulseira
        </button>
        <button
          onClick={() => setTipoVenda("cartao")}
          className={`flex-1 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            tipoVenda === "cartao"
              ? "bg-[#7B2CFF] text-white"
              : "bg-[#12121A] text-[#B8B8C8] hover:bg-[#7B2CFF]/20"
          }`}
        >
          <Wallet size={20} />
          Cartão
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7B2CFF]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Itens */}
          <div className="bg-[#12121A] rounded-2xl border border-[#7B2CFF]/20 p-6">
            <h2 className="text-xl font-bold text-[#F5F5FA] mb-4 flex items-center gap-2">
              {tipoVenda === "mesa" && <Table size={20} className="text-[#7B2CFF]" />}
              {tipoVenda === "pulseira" && <Sparkles size={20} className="text-[#7B2CFF]" />}
              {tipoVenda === "cartao" && <Wallet size={20} className="text-[#7B2CFF]" />}
              {tipoVenda === "mesa" && "Mesas"}
              {tipoVenda === "pulseira" && "Pulseiras"}
              {tipoVenda === "cartao" && "Cartões"}
            </h2>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {renderItemList()}
            </div>
          </div>

          {/* Carrinho e Produtos */}
          <div className="bg-[#12121A] rounded-2xl border border-[#7B2CFF]/20 p-6">
            {!showProdutos ? (
              <div className="text-center py-12">
                <ShoppingCart size={48} className="mx-auto text-[#B8B8C8] mb-4" />
                <p className="text-[#B8B8C8]">Selecione um item para começar</p>
              </div>
            ) : (
              <>
                {/* Informações da Comanda */}
                {comandaInfo && (
                  <div className="mb-4 p-3 bg-[#08080D] rounded-xl">
                    <p className="text-[#B8B8C8] text-sm">Comanda</p>
                    <p className="text-[#F5F5FA] font-semibold">{comandaInfo.numeroComanda}</p>
                    <p className="text-[#B8B8C8] text-xs">Total: R$ {comandaInfo.valorTotal.toFixed(2)}</p>
                  </div>
                )}

                {/* Clientes da Mesa */}
                {clientes.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-[#F5F5FA] mb-3 flex items-center gap-2">
                      <Users size={18} className="text-[#7B2CFF]" />
                      Clientes na Mesa
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {clientes.map((cliente) => (
                        <button
                          key={cliente.id}
                          onClick={() => handleSelectCliente(cliente)}
                          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                            clienteSelecionado?.id === cliente.id
                              ? "bg-[#7B2CFF] text-white"
                              : "bg-[#08080D] border border-gray-700 text-[#F5F5FA] hover:border-[#7B2CFF]"
                          }`}
                        >
                          <User size={14} />
                          {cliente.nome}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seleção de Cliente (para pulseira/cartão) */}
                {tipoVenda !== "mesa" && selectedItem && (
                  <div className="mb-6 p-3 bg-[#08080D] rounded-xl">
                    <p className="text-[#B8B8C8] text-sm">Cliente</p>
                    <p className="text-[#F5F5FA] font-semibold">
                      {selectedItem.nomeCliente || selectedItem.nome}
                    </p>
                  </div>
                )}

                {/* Busca de Produtos */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B8B8C8]" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#08080D] border border-gray-700 rounded-xl text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
                  />
                </div>

                {/* Lista de Produtos */}
                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto mb-4">
                  {produtosFiltrados.slice(0, 6).map((produto) => (
                    <button
                      key={produto.id}
                      onClick={() => handleAddProduto(produto)}
                      className="p-3 bg-[#08080D] rounded-xl border border-gray-700 hover:border-[#7B2CFF] transition-all text-left"
                    >
                      <p className="font-semibold text-[#F5F5FA] text-sm">{produto.nome}</p>
                      <p className="text-[#7B2CFF] text-sm font-bold">
                        R$ {produto.preco.toFixed(2)}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Carrinho */}
                <div className="border-t border-gray-800 pt-4">
                  <h3 className="text-lg font-semibold text-[#F5F5FA] mb-3 flex items-center gap-2">
                    <Tag size={18} className="text-[#7B2CFF]" />
                    Pedido para {clienteSelecionado?.nome || (tipoVenda !== "mesa" ? selectedItem?.nomeCliente : "Cliente")}
                  </h3>
                  
                  <div className="space-y-2 max-h-[250px] overflow-y-auto mb-4">
                    {carrinho.length === 0 ? (
                      <p className="text-center text-[#B8B8C8] py-4">Nenhum item adicionado</p>
                    ) : (
                      carrinho.map((item) => (
                        <div key={item.produtoId} className="flex justify-between items-center p-2 bg-[#08080D] rounded-xl">
                          <div className="flex-1">
                            <p className="text-[#F5F5FA] text-sm">{item.nome}</p>
                            <p className="text-[#B8B8C8] text-xs">R$ {item.preco.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateQuantidade(item.produtoId, item.quantidade - 1)}
                              className="p-1 hover:bg-[#7B2CFF]/20 rounded"
                            >
                              <Minus size={14} className="text-[#B8B8C8]" />
                            </button>
                            <span className="text-[#F5F5FA] w-8 text-center">{item.quantidade}</span>
                            <button
                              onClick={() => handleUpdateQuantidade(item.produtoId, item.quantidade + 1)}
                              className="p-1 hover:bg-[#7B2CFF]/20 rounded"
                            >
                              <Plus size={14} className="text-[#B8B8C8]" />
                            </button>
                            <button
                              onClick={() => handleRemoveProduto(item.produtoId)}
                              className="p-1 hover:bg-red-500/20 rounded ml-2"
                            >
                              <Trash2 size={14} className="text-red-400" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {carrinho.length > 0 && (
                    <div className="border-t border-gray-800 pt-4">
                      <div className="flex justify-between mb-4">
                        <span className="text-[#F5F5FA] font-semibold">Total do Pedido:</span>
                        <span className="text-[#7B2CFF] font-bold text-xl">
                          R$ {totalCarrinho.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setCarrinho([]);
                            setShowProdutos(false);
                            setSelectedItem(null);
                            setClienteSelecionado(null);
                          }}
                          className="flex-1 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleFinalizarPedido}
                          disabled={!clienteSelecionado && tipoVenda === "mesa" && clientes.length > 0}
                          className="flex-1 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Finalizar Pedido
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}