import { useState, useEffect } from "react";
import {
  ShoppingCart, Table, Sparkles, Wallet, Search,
  ChevronRight, Plus, Minus, Trash2, X, RefreshCw,
  Users, CreditCard, Tag, DollarSign, User, CheckCircle,
  Package, History
} from "lucide-react";
import { mesaService, pulseiraService, cartaoService, produtoService, clienteService, comandaService } from "../service/api";
import type { Mesa, Pulseira, Cartao, Produto, ClienteComItem, Comanda } from "../service/types";
import ModalRemoverItem from "./ModalRemoverItem";
import ModalAdicionarCliente from "./ModalAdicionarCliente";

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
  pago?: boolean;
}

export default function VendasManager() {
  const [tipoVenda, setTipoVenda] = useState<TipoVenda>("mesa");
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [pulseiras, setPulseiras] = useState<Pulseira[]>([]);
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [clientes, setClientes] = useState<ClienteComanda[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemPedido[]>([]);
  const [showProdutos, setShowProdutos] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteComanda | null>(null);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [errorMensagem, setErrorMensagem] = useState<string | null>(null);
  const [comandaIdAtual, setComandaIdAtual] = useState<number | null>(null);
  const [adicionandoProduto, setAdicionandoProduto] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [showRemoverModal, setShowRemoverModal] = useState(false);
  const [itemParaRemover, setItemParaRemover] = useState<any>(null);
  const [removendoItem, setRemovendoItem] = useState(false);
  const [showAdicionarClienteModal, setShowAdicionarClienteModal] = useState(false);
  const [adicionandoCliente, setAdicionandoCliente] = useState(false);
  const [capacidadeMesa, setCapacidadeMesa] = useState(4);
  const [comandaInfo, setComandaInfo] = useState<any>(null);
  const [pulseiraSelecionada, setPulseiraSelecionada] = useState<string>("");

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

  const buscarClientesDaComanda = async (comandaId: number) => {
    setLoadingClientes(true);
    setErrorMensagem(null);
    try {
      console.log(`🔍 Buscando clientes para comanda ID: ${comandaId}`);

      const response = await clienteService.listByComanda(comandaId);
      console.log(" Clientes da comanda:", response);

      if (response && response.clientes) {
        setClientes(response.clientes);
        setComandaIdAtual(comandaId);

        if (clienteSelecionado) {
          const clienteAtualizado = response.clientes.find(c => c.id === clienteSelecionado.id);
          if (clienteAtualizado) {
            setClienteSelecionado(clienteAtualizado);
          }
        }
      } else {
        setClientes([]);
        setErrorMensagem("Nenhum cliente encontrado para esta comanda");
      }
    } catch (error: any) {
      console.error("❌ Erro ao buscar clientes:", error);
      setClientes([]);
      setErrorMensagem(error.response?.data?.message || "Erro ao carregar clientes");
    } finally {
      setLoadingClientes(false);
    }
  };

  const buscarComandaDaMesa = async (mesaId: number) => {
    setLoadingClientes(true);
    setErrorMensagem(null);
    try {
      console.log(` Buscando comanda para mesa ID: ${mesaId}`);

      const response = await mesaService.listDetalhadas();
      console.log(" Mesas detalhadas:", response);

      const mesaDetalhada = response.mesas.find((m: any) => m.id === mesaId);

      if (mesaDetalhada && mesaDetalhada.comanda) {
        setComandaIdAtual(mesaDetalhada.comanda.comandaId);
        setClientes(mesaDetalhada.comanda.clientes || []);
        setCapacidadeMesa(mesaDetalhada.capacidade || 4);
        setComandaInfo({
          comandaId: mesaDetalhada.comanda.comandaId,
          numeroComanda: mesaDetalhada.comanda.numeroComanda,
          valorTotal: mesaDetalhada.comanda.valorTotal || 0
        });
        console.log("Comanda encontrada:", mesaDetalhada.comanda);
      } else {
        setClientes([]);
        setComandaInfo(null);
        setErrorMensagem("Esta mesa não possui uma comanda ativa");
        console.log(" Nenhuma comanda encontrada para esta mesa");
      }
    } catch (error: any) {
      console.error("Erro ao buscar comanda da mesa:", error);
      setClientes([]);
      setComandaInfo(null);
      setErrorMensagem(error.response?.data?.message || "Erro ao carregar dados da mesa");
    } finally {
      setLoadingClientes(false);
    }
  };

  // NOVA FUNÇÃO: Buscar detalhes da pulseira pelo número
const buscarPulseiraDetalhes = async (numeroPulseira: string) => {
  setLoadingClientes(true);
  setErrorMensagem(null);
  try {
    console.log(`🔍 Buscando detalhes da pulseira: ${numeroPulseira}`);
    
    const response = await pulseiraService.buscarPorNumero(numeroPulseira);
    console.log("✅ Detalhes da pulseira:", response);
    
    setPulseiraSelecionada(numeroPulseira);
    
    // Verificar se a pulseira está agrupada
    if (response.estaAgrupada === true) {
      // Pulseira agrupada - mostrar informações de ambas
      const itensPrincipal = response.itensPrincipal || [];
      const itensSecundaria = response.itensSecundaria || [];
      const todosItens = [...itensPrincipal, ...itensSecundaria];
      
      // Criar cliente virtual com o nome do principal e os itens de ambos
      const clienteVirtual = {
        id: 0, // id fictício
        nome: `${response.nomeClientePrincipal} (Agrupado)`,
        valorTotal: response.valorTotalAgrupado || 0,
        itens: todosItens.map((item: any) => ({
          id: item.itemId,
          produto: { nome: item.produtoNome },
          nome: item.produtoNome,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
          precoTotal: item.precoTotal
        })),
        pago: false
      };
      
      setClientes([clienteVirtual]);
      setClienteSelecionado(clienteVirtual);
      setMostrarHistorico(true);
      
      // Mensagem informativa sobre o agrupamento
      setErrorMensagem(
        `🔗 Pulseira agrupada: Principal ${response.pulseiraPrincipal} (${response.nomeClientePrincipal}) + Secundária ${response.pulseiraSecundaria} (${response.nomeClienteSecundaria}) | Total: R$ ${response.valorTotalAgrupado?.toFixed(2) || '0,00'}`
      );
      
      // Armazenar informações adicionais para exibição
      setComandaInfo({
        agrupado: true,
        principal: {
          numero: response.pulseiraPrincipal,
          nome: response.nomeClientePrincipal,
          saldo: response.saldoPrincipal,
          itens: itensPrincipal
        },
        secundaria: {
          numero: response.pulseiraSecundaria,
          nome: response.nomeClienteSecundaria,
          saldo: response.saldoSecundaria,
          itens: itensSecundaria
        },
        valorTotal: response.valorTotalAgrupado
      });
      
    } else {
      // Pulseira individual (não agrupada)
      const itens = response.itens || [];
      
      const clienteVirtual = {
        id: response.id,
        nome: response.nomeCliente,
        valorTotal: response.saldoTotal || 0,
        itens: itens.map((item: any) => ({
          id: item.itemId,
          produto: { nome: item.produtoNome },
          nome: item.produtoNome,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
          precoTotal: item.precoTotal
        })),
        pago: false
      };
      
      setClientes([clienteVirtual]);
      setClienteSelecionado(clienteVirtual);
      setMostrarHistorico(true);
      
      setErrorMensagem(`✅ Pulseira ${numeroPulseira} selecionada. Adicione produtos.`);
      setComandaInfo({
        agrupado: false,
        numero: numeroPulseira,
        nome: response.nomeCliente,
        saldo: response.saldoTotal,
        itens: itens
      });
    }
    
  } catch (error) {
    console.error("Erro ao buscar detalhes da pulseira:", error);
    setPulseiraSelecionada(numeroPulseira);
    setClientes([]);
    setClienteSelecionado(null);
    setMostrarHistorico(false);
    setErrorMensagem(`Pulseira ${numeroPulseira} selecionada. Adicione produtos diretamente.`);
  } finally {
    setLoadingClientes(false);
  }
};

  const buscarComandaCartao = async (numeroCartao: string) => {
    setLoadingClientes(true);
    setErrorMensagem(null);
    try {
      console.log(`🔍 Buscando comanda para cartão: ${numeroCartao}`);

      const response = await cartaoService.buscarComanda(numeroCartao);
      console.log("Comanda do cartão:", response);

      if (response && response.id) {
        setComandaIdAtual(response.id);
        await buscarClientesDaComanda(response.id);
      } else {
        setClientes([]);
        setErrorMensagem("Nenhuma comanda encontrada para este cartão");
      }
    } catch (error) {
      console.error("Erro ao buscar comanda do cartão:", error);
      setClientes([]);
      setErrorMensagem("Erro ao carregar dados do cartão");
    } finally {
      setLoadingClientes(false);
    }
  };

  const handleAdicionarCliente = async (nome: string) => {
    if (!comandaIdAtual) return;

    setAdicionandoCliente(true);
    try {
      const response = await comandaService.adicionarCliente(comandaIdAtual, nome);
      console.log("Cliente adicionado:", response);

      setMensagemSucesso(`Cliente "${nome}" adicionado com sucesso!`);

      await buscarClientesDaComanda(comandaIdAtual);

      setShowAdicionarClienteModal(false);

      setTimeout(() => {
        setMensagemSucesso(null);
      }, 3000);

    } catch (error: any) {
      console.error(" Erro ao adicionar cliente:", error);
      setErrorMensagem(error.response?.data?.message || "Erro ao adicionar cliente");
    } finally {
      setAdicionandoCliente(false);
    }
  };

  const handleSelectItem = async (item: any) => {
    console.log(`🖱️ Selecionando item:`, item);

    setSelectedItem(item);
    setShowProdutos(true);
    setClienteSelecionado(null);
    setCarrinho([]);
    setErrorMensagem(null);
    setClientes([]);
    setComandaIdAtual(null);
    setMensagemSucesso(null);
    setMostrarHistorico(false);
    setShowRemoverModal(false);
    setItemParaRemover(null);
    setComandaInfo(null);
    setCapacidadeMesa(4);
    setPulseiraSelecionada("");

    if (tipoVenda === "mesa") {
      if (item.isOcupada) {
        await buscarComandaDaMesa(item.id);
      } else {
        setErrorMensagem("Esta mesa está livre");
        console.log("Mesa está livre");
      }
    } else if (tipoVenda === "pulseira") {
      if (item.isAtivo) {
        await buscarPulseiraDetalhes(item.numeroPulseira);
      } else {
        setErrorMensagem("Esta pulseira está inativa");
      }
    } else if (tipoVenda === "cartao") {
      if (item.isAtivo) {
        await buscarComandaCartao(item.numeroCartao);
      } else {
        setErrorMensagem("Este cartão está inativo");
      }
    }
  };

  const handleSelectCliente = (cliente: ClienteComanda) => {
    console.log(`👤 Selecionando cliente: ${cliente.nome} (ID: ${cliente.id})`);
    setClienteSelecionado(cliente);
    setCarrinho([]);
    setMensagemSucesso(null);
    setMostrarHistorico(true);
    setShowRemoverModal(false);
    setItemParaRemover(null);
  };

  const handleAddProduto = async (produto: Produto) => {
    console.log(`📦 Adicionando produto: ${produto.nome} (R$ ${produto.preco.toFixed(2)})`);

    // Se for pulseira, adicionar diretamente via API
    if (tipoVenda === "pulseira" && pulseiraSelecionada) {
      await handleAddProdutoPulseira(produto);
      return;
    }

    // Se for mesa, adicionar ao carrinho
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

  // Função para adicionar produto diretamente à pulseira (usando novo endpoint)
  const handleAddProdutoPulseira = async (produto: Produto) => {
    console.log(`📦 Adicionando produto à pulseira ${pulseiraSelecionada}: ${produto.nome}`);

    setAdicionandoProduto(true);
    setErrorMensagem(null);
    try {
      const response = await pulseiraService.adicionarProduto(
        pulseiraSelecionada,
        produto.id,
        1 // quantidade padrão
      );
      console.log("✅ Produto adicionado à pulseira:", response);

      setMensagemSucesso(`✅ Produto "${produto.nome}" adicionado à pulseira ${pulseiraSelecionada}!`);

      // Recarregar os detalhes da pulseira para atualizar os itens
      await buscarPulseiraDetalhes(pulseiraSelecionada);

      setTimeout(() => {
        setMensagemSucesso(null);
      }, 3000);

    } catch (error: any) {
      console.error("❌ Erro ao adicionar produto à pulseira:", error);
      setErrorMensagem(error.response?.data?.message || "Erro ao adicionar produto à pulseira");
    } finally {
      setAdicionandoProduto(false);
    }
  };

  const handleUpdateQuantidade = (produtoId: number, quantidade: number) => {
    console.log(`🔄 Atualizando quantidade do produto ${produtoId} para ${quantidade}`);

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
    console.log(`Removendo produto ${produtoId} do carrinho`);
    setCarrinho(carrinho.filter(item => item.produtoId !== produtoId));
  };

  const handleAbrirRemoverItem = (item: any) => {
    setItemParaRemover(item);
    setShowRemoverModal(true);
  };

  const handleConfirmarRemocao = async (justificativa: string) => {
    if (!comandaIdAtual || !clienteSelecionado || !itemParaRemover) return;

    setRemovendoItem(true);
    try {
      console.log(`🗑️ Removendo item ${itemParaRemover.id} do cliente ${clienteSelecionado.id}`);

      const response = await clienteService.removerItem(
        comandaIdAtual,
        clienteSelecionado.id,
        itemParaRemover.id,
        justificativa
      );

      console.log("Item removido:", response);

      setMensagemSucesso(`Item "${itemParaRemover.nome}" removido com sucesso!`);

      await buscarClientesDaComanda(comandaIdAtual);

      setShowRemoverModal(false);
      setItemParaRemover(null);

      setTimeout(() => {
        setMensagemSucesso(null);
      }, 5000);

    } catch (error: any) {
      console.error("Erro ao remover item:", error);
      setErrorMensagem(error.response?.data?.message || "Erro ao remover item");
    } finally {
      setRemovendoItem(false);
    }
  };

  const handleFinalizarPedido = async () => {
    console.log("📝 Finalizando pedido...");
    console.log("  - Comanda ID:", comandaIdAtual);
    console.log("  - Cliente:", clienteSelecionado);
    console.log("  - Itens:", carrinho);
    console.log("  - Total:", totalCarrinho);

    if (!comandaIdAtual || !clienteSelecionado) {
      console.error("❌ Erro: Cliente ou comanda não selecionados");
      alert("Selecione um cliente para finalizar o pedido");
      return;
    }

    if (carrinho.length === 0) {
      console.error("❌ Erro: Carrinho vazio");
      alert("Adicione pelo menos um produto ao pedido");
      return;
    }

    setAdicionandoProduto(true);
    setMensagemSucesso(null);
    setErrorMensagem(null);

    try {
      console.log(`🔄 Adicionando ${carrinho.length} itens à comanda...`);

      for (const item of carrinho) {
        console.log(`  - Adicionando: ${item.nome} (${item.quantidade}x R$ ${item.preco.toFixed(2)})`);

        const response = await clienteService.adicionarProduto(
          comandaIdAtual,
          clienteSelecionado.id,
          {
            produtoId: item.produtoId,
            quantidade: item.quantidade
          }
        );
        console.log(`  ✅ Produto adicionado:`, response);
      }

      console.log("✅ Pedido finalizado com sucesso!");
      setMensagemSucesso(`Pedido finalizado para ${clienteSelecionado.nome}! Total: R$ ${totalCarrinho.toFixed(2)}`);

      console.log("🔄 Recarregando clientes da comanda...");
      await buscarClientesDaComanda(comandaIdAtual);

      setCarrinho([]);

      setTimeout(() => {
        setMensagemSucesso(null);
      }, 5000);

    } catch (error: any) {
      console.error("❌ Erro ao adicionar produtos:", error);
      setErrorMensagem(error.response?.data?.message || "Erro ao adicionar produtos à comanda");
    } finally {
      setAdicionandoProduto(false);
    }
  };

  const totalCarrinho = carrinho.reduce((sum, item) => sum + item.subtotal, 0);

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderItemList = () => {
    if (tipoVenda === "mesa") {
      if (mesas.length === 0) {
        return (
          <div className="text-center py-12 bg-[#12121A] rounded-2xl border border-gray-700">
            <Table size={48} className="mx-auto text-[#B8B8C8] mb-4" />
            <p className="text-[#F5F5FA] font-semibold">Nenhuma mesa cadastrada</p>
            <p className="text-[#B8B8C8] text-sm mt-2">Cadastre mesas para começar a vender</p>
          </div>
        );
      }

      return (
        <div className="flex flex-wrap gap-3">
          {mesas.map(mesa => (
            <button
              key={mesa.id}
              onClick={() => handleSelectItem(mesa)}
              className={`
              relative w-[100px] h-[100px] rounded-xl border-2 transition-all text-center flex flex-col items-center justify-center p-2
              ${selectedItem?.id === mesa.id
                  ? "border-[#7B2CFF] bg-[#7B2CFF]/10 shadow-[0_0_20px_rgba(123,44,255,0.3)]"
                  : "border-gray-700 bg-[#08080D] hover:border-[#7B2CFF]/50 hover:bg-[#12121A]"
                }
              ${mesa.isOcupada ? 'border-red-500/30' : 'border-green-500/30'}
              hover:scale-105 transition-all duration-200
            `}
            >
              <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${mesa.isOcupada ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                }`} />
              <div className="text-4xl font-bold text-[#F5F5FA]">
                {mesa.numeroMesa}
              </div>
              <div className="flex items-center gap-1 text-[#B8B8C8] text-xs mt-1">
                <Users size={12} />
                <span>{mesa.capacidade}</span>
              </div>
              <div className={`mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${mesa.isOcupada
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-green-500/20 text-green-400'
                }`}>
                {mesa.isOcupada ? 'OCUPADA' : 'LIVRE'}
              </div>
            </button>
          ))}
        </div>
      );
    }

    if (tipoVenda === "pulseira") {
      if (pulseiras.length === 0) {
        return (
          <div className="text-center py-12 bg-[#12121A] rounded-2xl border border-gray-700">
            <Sparkles size={48} className="mx-auto text-[#B8B8C8] mb-4" />
            <p className="text-[#F5F5FA] font-semibold">Nenhuma pulseira cadastrada</p>
            <p className="text-[#B8B8C8] text-sm mt-2">Cadastre pulseiras para começar a vender</p>
          </div>
        );
      }

      return (
        <div className="flex flex-wrap gap-3">
          {pulseiras.map(pulseira => (
            <button
              key={pulseira.id}
              onClick={() => handleSelectItem(pulseira)}
              className={`
                relative w-[100px] h-[100px] rounded-xl border-2 transition-all text-center flex flex-col items-center justify-center p-2
                ${selectedItem?.id === pulseira.id
                  ? "border-[#7B2CFF] bg-[#7B2CFF]/10 shadow-[0_0_20px_rgba(123,44,255,0.3)]"
                  : "border-gray-700 bg-[#08080D] hover:border-[#7B2CFF]/50 hover:bg-[#12121A]"
                }
                ${pulseira.isAtivo ? 'border-purple-500/30' : 'border-gray-500/30'}
                hover:scale-105 transition-all duration-200
              `}
            >
              <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${pulseira.isAtivo ? 'bg-purple-500 animate-pulse' : 'bg-gray-500'
                }`} />
              <div className="text-2xl font-bold text-[#F5F5FA]">
                #{pulseira.numeroPulseira}
              </div>
              <div className="text-[#B8B8C8] text-xs mt-1 truncate max-w-[80px]">
                {pulseira.nomeCliente}
              </div>
              <div className={`mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${pulseira.isAtivo
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-gray-500/20 text-gray-400'
                }`}>
                {pulseira.isAtivo ? 'ATIVA' : 'INATIVA'}
              </div>
            </button>
          ))}
        </div>
      );
    }

    if (tipoVenda === "cartao") {
      if (cartoes.length === 0) {
        return (
          <div className="text-center py-12 bg-[#12121A] rounded-2xl border border-gray-700">
            <Wallet size={48} className="mx-auto text-[#B8B8C8] mb-4" />
            <p className="text-[#F5F5FA] font-semibold">Nenhum cartão cadastrado</p>
            <p className="text-[#B8B8C8] text-sm mt-2">Cadastre cartões para começar a vender</p>
          </div>
        );
      }

      return cartoes.map(cartao => (
        <button
          key={cartao.id}
          onClick={() => handleSelectItem(cartao)}
          className={`w-full p-4 rounded-xl border transition-all text-left ${selectedItem?.id === cartao.id
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
              <span className={`px-2 py-1 rounded-full text-xs ${cartao.isAtivo
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
    }

    return null;
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
          className={`flex-1 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${tipoVenda === "mesa"
            ? "bg-[#7B2CFF] text-white"
            : "bg-[#12121A] text-[#B8B8C8] hover:bg-[#7B2CFF]/20"
            }`}
        >
          <Table size={20} />
          Mesa
        </button>
        <button
          onClick={() => setTipoVenda("pulseira")}
          className={`flex-1 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${tipoVenda === "pulseira"
            ? "bg-[#7B2CFF] text-white"
            : "bg-[#12121A] text-[#B8B8C8] hover:bg-[#7B2CFF]/20"
            }`}
        >
          <Sparkles size={20} />
          Pulseira
        </button>
        <button
          onClick={() => setTipoVenda("cartao")}
          className={`flex-1 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${tipoVenda === "cartao"
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

            <div>
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
                {mensagemSucesso && (
                  <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-2">
                    <CheckCircle size={16} />
                    {mensagemSucesso}
                  </div>
                )}

                {errorMensagem && (
                  <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-sm">
                    {errorMensagem}
                  </div>
                )}

                {loadingClientes ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#7B2CFF]"></div>
                    <p className="text-[#B8B8C8] text-sm mt-2">Carregando clientes...</p>
                  </div>
                ) : (
                  <>
                    {(clientes.length > 0 || comandaIdAtual) && (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-sm font-semibold text-[#F5F5FA] flex items-center gap-2">
                            <Users size={16} className="text-[#7B2CFF]" />
                            {clientes.length > 0 ? "Clientes da Comanda" : "Comanda"}
                            {clientes.length > 0 && (
                              <span className="text-[#B8B8C8] text-xs ml-1">
                                ({clientes.length}/{capacidadeMesa})
                              </span>
                            )}
                          </h3>
                          {comandaIdAtual && (
                            <button
                              onClick={() => {
                                console.log("📝 Abrindo modal para adicionar cliente");
                                setShowAdicionarClienteModal(true);
                              }}
                              className="flex items-center gap-1 text-xs bg-[#7B2CFF] text-white px-3 py-1.5 rounded-lg hover:bg-[#9A4DFF] transition-all"
                            >
                              <Plus size={14} />
                              Adicionar Cliente
                            </button>
                          )}
                        </div>

                        {clientes.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {clientes.map((cliente) => (
                              <button
                                key={cliente.id}
                                onClick={() => handleSelectCliente(cliente)}
                                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-sm ${clienteSelecionado?.id === cliente.id
                                  ? "bg-[#7B2CFF] text-white"
                                  : "bg-[#08080D] border border-gray-700 text-[#F5F5FA] hover:border-[#7B2CFF]"
                                  }`}
                              >
                                <User size={12} />
                                {cliente.nome}
                                {cliente.valorTotal > 0 && (
                                  <span className={`text-xs ${clienteSelecionado?.id === cliente.id
                                    ? "text-white/80"
                                    : "text-[#7B2CFF]"
                                    }`}>
                                    R$ {cliente.valorTotal.toFixed(2)}
                                  </span>
                                )}
                                {cliente.itens && cliente.itens.length > 0 && (
                                  <span className={`text-xs ${clienteSelecionado?.id === cliente.id
                                    ? "text-white/60"
                                    : "text-[#B8B8C8]"
                                    }`}>
                                    ({cliente.itens.length})
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        ) : (
                          comandaIdAtual && (
                            <div className="text-center py-4 bg-[#08080D] rounded-lg border border-gray-700">
                              <p className="text-[#B8B8C8] text-sm">Nenhum cliente na comanda</p>
                              <p className="text-[#B8B8C8] text-xs mt-1">Clique em "Adicionar Cliente" para começar</p>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {tipoVenda !== "mesa" && selectedItem && clientes.length === 0 && !errorMensagem && (
                      <div className="mb-4 p-2 bg-[#08080D] rounded-lg">
                        <p className="text-[#B8B8C8] text-sm">Cliente</p>
                        <p className="text-[#F5F5FA] font-semibold">
                          {selectedItem.nomeCliente || selectedItem.nome}
                        </p>
                      </div>
                    )}

                    {clienteSelecionado && mostrarHistorico && clienteSelecionado.itens && clienteSelecionado.itens.length > 0 && (
                      <div className="mb-4 p-3 bg-[#08080D] rounded-xl border border-gray-700">
                        <h4 className="text-sm font-semibold text-[#F5F5FA] mb-2 flex items-center gap-2">
                          <History size={14} className="text-[#7B2CFF]" />
                          Itens já consumidos por {clienteSelecionado.nome}
                          <span className="text-[#B8B8C8] text-xs ml-auto">
                            {clienteSelecionado.itens.length} itens
                          </span>
                        </h4>
                        <div className="space-y-1">
                          {clienteSelecionado.itens.map((item: any, index: number) => {
                            const itemId = item.id || index;
                            const produtoNome = item.produto?.nome || item.nome || 'Produto';
                            const quantidade = item.quantidade || 0;
                            const precoUnitario = item.precoUnitario || item.preco || 0;
                            const precoTotal = item.precoTotal || (quantidade * precoUnitario);

                            return (
                              <div key={index} className="flex justify-between items-center text-sm group">
                                <span className="text-[#B8B8C8]">
                                  {produtoNome}
                                  <span className="text-[#F5F5FA] ml-1">x{quantidade}</span>
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[#7B2CFF]">
                                    R$ {precoTotal.toFixed(2)}
                                  </span>
                                  <button
                                    onClick={() => handleAbrirRemoverItem({
                                      id: itemId,
                                      nome: produtoNome,
                                      quantidade: quantidade,
                                      precoUnitario: precoUnitario,
                                      precoTotal: precoTotal
                                    })}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded-lg transition-all"
                                    title="Remover item"
                                  >
                                    <Trash2 size={14} className="text-red-400" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                          <div className="border-t border-gray-700 pt-1 mt-1">
                            <div className="flex justify-between items-center font-semibold text-[#F5F5FA]">
                              <span>Total consumido</span>
                              <span className="text-[#7B2CFF]">R$ {clienteSelecionado.valorTotal.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto mb-3">
                  {produtosFiltrados.length === 0 ? (
                    <div className="col-span-2 text-center py-4 text-[#B8B8C8] text-sm">
                      {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto disponível'}
                    </div>
                  ) : (
                    produtosFiltrados.slice(0, 8).map((produto) => (
                      <button
                        key={produto.id}
                        onClick={() => handleAddProduto(produto)}
                        className="p-2 bg-[#08080D] rounded-lg border border-gray-700 hover:border-[#7B2CFF] transition-all text-left group"
                      >
                        <div className="flex justify-between items-start">
                          <p className="font-semibold text-[#F5F5FA] text-xs flex-1">{produto.nome}</p>
                          <span className="text-[#7B2CFF] text-xs font-bold ml-1">
                            R$ {produto.preco.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-[#B8B8C8] text-[10px] truncate">{produto.categoria?.nome || 'Sem categoria'}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[#B8B8C8] text-[10px]">Estoque: {produto.quantidade}</span>
                          {produto.isInHappyHour && (
                            <span className="text-green-400 text-[10px]">🎉 Promoção</span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div className="border-t border-gray-800 pt-3">
                  <h3 className="text-sm font-semibold text-[#F5F5FA] mb-2 flex items-center gap-2">
                    <Tag size={14} className="text-[#7B2CFF]" />
                    {clienteSelecionado ? `Adicionando para ${clienteSelecionado.nome}` : "Novos Itens"}
                  </h3>

                  <div className="space-y-1.5 max-h-[150px] overflow-y-auto mb-3">
                    {carrinho.length === 0 ? (
                      <p className="text-center text-[#B8B8C8] text-sm py-2">
                        {clienteSelecionado ? "Selecione produtos para adicionar" : "Nenhum item adicionado"}
                      </p>
                    ) : (
                      carrinho.map((item) => (
                        <div key={item.produtoId} className="flex justify-between items-center p-2 bg-[#08080D] rounded-lg">
                          <div className="flex-1">
                            <p className="text-[#F5F5FA] text-xs">{item.nome}</p>
                            <p className="text-[#B8B8C8] text-xs">R$ {item.preco.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleUpdateQuantidade(item.produtoId, item.quantidade - 1)}
                              className="p-1 hover:bg-[#7B2CFF]/20 rounded"
                            >
                              <Minus size={12} className="text-[#B8B8C8]" />
                            </button>
                            <span className="text-[#F5F5FA] w-6 text-center text-sm">{item.quantidade}</span>
                            <button
                              onClick={() => handleUpdateQuantidade(item.produtoId, item.quantidade + 1)}
                              className="p-1 hover:bg-[#7B2CFF]/20 rounded"
                            >
                              <Plus size={12} className="text-[#B8B8C8]" />
                            </button>
                            <button
                              onClick={() => handleRemoveProduto(item.produtoId)}
                              className="p-1 hover:bg-red-500/20 rounded ml-1"
                            >
                              <Trash2 size={12} className="text-red-400" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {carrinho.length > 0 && (
                    <div className="border-t border-gray-800 pt-3">
                      <div className="flex justify-between mb-3">
                        <span className="text-[#F5F5FA] text-sm font-semibold">Total:</span>
                        <span className="text-[#7B2CFF] font-bold text-lg">
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
                            setMostrarHistorico(false);
                          }}
                          className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all text-sm"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleFinalizarPedido}
                          disabled={!clienteSelecionado || carrinho.length === 0 || adicionandoProduto}
                          className="flex-1 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {adicionandoProduto ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Adicionando...
                            </span>
                          ) : (
                            "Adicionar ao Pedido"
                          )}
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

      <ModalRemoverItem
        isOpen={showRemoverModal}
        onClose={() => {
          setShowRemoverModal(false);
          setItemParaRemover(null);
        }}
        onConfirm={handleConfirmarRemocao}
        item={itemParaRemover}
        clienteNome={clienteSelecionado?.nome || ""}
        loading={removendoItem}
      />

      <ModalAdicionarCliente
        isOpen={showAdicionarClienteModal}
        onClose={() => {
          setShowAdicionarClienteModal(false);
        }}
        onConfirm={handleAdicionarCliente}
        loading={adicionandoCliente}
        comandaId={comandaIdAtual || 0}
        capacidade={capacidadeMesa}
        clientesAtuais={clientes.length}
      />
    </div>
  );
}