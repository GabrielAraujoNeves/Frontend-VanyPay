import { RefreshCw, Sparkles, Table, Wallet, User, DollarSign, CreditCard, CheckCircle, XCircle, Users, Trash2, Package, Eye, Link, Unlink } from "lucide-react";
import { useState, useEffect } from "react";
import { mesaService, pagamentoService, pulseiraService, pagamentoPulseiraService } from "../service/api";

type TipoPagamento = "mesa" | "pulseira" | "cartao";

interface ItemConsumo {
  itemId: number;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  precoTotal: number;
}

interface Cliente {
  id: number;
  nome: string;
  valorTotal: number;
  pago?: boolean;
  itens?: ItemConsumo[];
}

interface MesaComanda {
  id: number;
  numeroMesa: number;
  capacidade: number;
  isOcupada: boolean;
  comanda: {
    comandaId: number;
    numeroComanda: string;
    valorTotal: number;
    clientes: Cliente[];
  } | null;
}

interface PulseiraDetalhada {
  id: number;
  numeroPulseira: string;
  nomeCliente: string;
  valorTotal: number;
  isAtivo: boolean;
  pulseiraAgrupadaCom: string | null;
  itens: ItemConsumo[];
}

export default function Pagamentos() {
  const [loading, setLoading] = useState(true);
  const [tipoPagamento, setTipoPagamento] = useState<TipoPagamento>("mesa");
  
  // Estados para Mesa
  const [mesas, setMesas] = useState<MesaComanda[]>([]);
  const [selectedMesa, setSelectedMesa] = useState<MesaComanda | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedClientes, setSelectedClientes] = useState<number[]>([]);
  const [clienteDetalhes, setClienteDetalhes] = useState<Cliente | null>(null);

  // Estados para Pulseira
  const [pulseiras, setPulseiras] = useState<PulseiraDetalhada[]>([]);
  const [selectedPulseira, setSelectedPulseira] = useState<PulseiraDetalhada | null>(null);
  const [pulseiraInfo, setPulseiraInfo] = useState<any>(null);
  const [mostrarItensPulseira, setMostrarItensPulseira] = useState(false);

  // Estados Comuns
  const [formaPagamento, setFormaPagamento] = useState("PIX");
  const [valorPago, setValorPago] = useState("");
  const [processando, setProcessando] = useState(false);
  const [mensagem, setMensagem] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const formasPagamento = [
    { value: "DINHEIRO", label: "Dinheiro", icon: DollarSign },
    { value: "CARTAO_CREDITO", label: "Cartão Crédito", icon: CreditCard },
    { value: "CARTAO_DEBITO", label: "Cartão Débito", icon: CreditCard },
    { value: "PIX", label: "PIX", icon: CreditCard }
  ];

  // ============ LOAD DATA ============
  const loadData = async () => {
    setLoading(true);
    try {
      if (tipoPagamento === "mesa") {
        const response = await mesaService.listDetalhadas();
        console.log("Mesas detalhadas:", response);
        setMesas(response.mesas || []);
      } else if (tipoPagamento === "pulseira") {
        const response = await pulseiraService.listAll();
        console.log("Pulseiras carregadas:", response);
        setPulseiras(response.pulseiras || []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tipoPagamento]);

  // ============ FUNÇÕES PARA MESA ============
  const handleSelectMesa = async (mesa: MesaComanda) => {
    setSelectedMesa(mesa);
    setSelectedClientes([]);
    setValorPago("");
    setMensagem(null);
    setClienteDetalhes(null);
    
    if (mesa.comanda) {
      try {
        const response = await pagamentoService.buscarClientesDetalhes(mesa.comanda.comandaId);
        console.log("Clientes detalhes:", response);
        setClientes(response.clientes || []);
        
        const total = response.clientes.reduce((sum: number, c: Cliente) => sum + (c.valorTotal || 0), 0);
        setValorPago(total.toFixed(2));
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        setClientes(mesa.comanda.clientes || []);
      }
    } else {
      setClientes([]);
    }
  };

  const toggleClienteSelection = (clienteId: number) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (cliente?.pago) return;
    
    setSelectedClientes(prev => {
      const newSelection = prev.includes(clienteId) 
        ? prev.filter(id => id !== clienteId)
        : [...prev, clienteId];
      
      const total = clientes
        .filter(c => newSelection.includes(c.id))
        .reduce((sum, c) => sum + (c.valorTotal || 0), 0);
      setValorPago(total.toFixed(2));
      
      return newSelection;
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, clienteId: number) => {
    e.stopPropagation();
    toggleClienteSelection(clienteId);
  };

  const selecionarTodosClientes = () => {
    const naoPagos = clientes.filter(c => !c.pago).map(c => c.id);
    setSelectedClientes(naoPagos);
    
    const total = clientes
      .filter(c => naoPagos.includes(c.id))
      .reduce((sum, c) => sum + (c.valorTotal || 0), 0);
    setValorPago(total.toFixed(2));
  };

  const deselecionarTodos = () => {
    setSelectedClientes([]);
    setValorPago("0.00");
  };

  const handleRemoverCliente = async (e: React.MouseEvent, clienteId: number) => {
    e.stopPropagation();
    
    if (!selectedMesa?.comanda) return;
    
    if (!confirm("Tem certeza que deseja remover este cliente da comanda?")) return;
    
    setProcessando(true);
    try {
      await pagamentoService.removerCliente(selectedMesa.comanda.comandaId, clienteId);
      setMensagem({ type: 'success', text: 'Cliente removido com sucesso!' });
      
      await handleSelectMesa(selectedMesa);
      await loadData();
      
      setTimeout(() => setMensagem(null), 3000);
    } catch (error: any) {
      console.error("Erro ao remover cliente:", error);
      setMensagem({ type: 'error', text: error.response?.data?.message || 'Erro ao remover cliente' });
    } finally {
      setProcessando(false);
    }
  };

  const handleVerItens = (e: React.MouseEvent, cliente: Cliente) => {
    e.stopPropagation();
    setClienteDetalhes(cliente);
  };

  const handleFecharDetalhes = () => {
    setClienteDetalhes(null);
  };

  const handlePagamentoMesa = async () => {
    if (!selectedMesa?.comanda) {
      setMensagem({ type: 'error', text: 'Selecione uma mesa' });
      return;
    }

    if (selectedClientes.length === 0) {
      setMensagem({ type: 'error', text: 'Selecione pelo menos um cliente para pagar' });
      return;
    }

    if (!valorPago || parseFloat(valorPago) <= 0) {
      setMensagem({ type: 'error', text: 'Informe um valor válido para pagamento' });
      return;
    }

    setProcessando(true);
    setMensagem(null);

    try {
      const response = await pagamentoService.realizarPagamentoConjunto(
        selectedMesa.comanda.comandaId,
        selectedClientes,
        parseFloat(valorPago),
        formaPagamento
      );
      
      console.log("Pagamento conjunto realizado:", response);
      setMensagem({ 
        type: 'success', 
        text: `✅ Pagamento conjunto de R$ ${parseFloat(valorPago).toFixed(2)} realizado com sucesso! ${response.clientesPagos} cliente(s) pagos.` 
      });
      
      await loadData();
      await handleSelectMesa(selectedMesa);
      
      setSelectedClientes([]);
      setValorPago("");
      
      setTimeout(() => {
        setMensagem(null);
      }, 5000);
      
    } catch (error: any) {
      console.error("Erro ao realizar pagamento:", error);
      setMensagem({ 
        type: 'error', 
        text: error.response?.data?.message || "Erro ao realizar pagamento" 
      });
    } finally {
      setProcessando(false);
    }
  };

  // ============ FUNÇÕES PARA PULSEIRA ============
  const handleSelectPulseira = async (pulseira: PulseiraDetalhada) => {
    setSelectedPulseira(pulseira);
    setMostrarItensPulseira(false);
    setMensagem(null);
    setPulseiraInfo(null);
    
    try {
      const response = await pagamentoPulseiraService.buscarPulseiraDetalhes(pulseira.numeroPulseira);
      console.log("Detalhes da pulseira:", response);
      
      const isAgrupada = response.pulseiraAgrupadaCom !== null && response.pulseiraAgrupadaCom !== undefined;
      const pulseiraPrincipal = response.pulseiraAgrupadaCom;
      
      setPulseiraInfo({
        ...response,
        isAgrupada,
        pulseiraPrincipal,
        totalPulseiras: response.totalPulseirasAgrupadas || 1,
        valorTotal: response.valorTotal || 0
      });
      
      if (isAgrupada) {
        setMensagem({ 
          type: 'info', 
          text: `🔗 Esta pulseira está agrupada com a pulseira ${pulseiraPrincipal}. O pagamento será conjunto.` 
        });
      }
      
      setValorPago((response.valorTotal || 0).toFixed(2));
      
    } catch (error) {
      console.error("Erro ao buscar detalhes da pulseira:", error);
      setPulseiraInfo({
        ...pulseira,
        isAgrupada: false,
        totalPulseiras: 1,
        valorTotal: pulseira.valorTotal || 0
      });
      setValorPago((pulseira.valorTotal || 0).toFixed(2));
    }
  };

  const handlePagamentoPulseira = async () => {
    if (!selectedPulseira) {
      setMensagem({ type: 'error', text: 'Selecione uma pulseira' });
      return;
    }

    if (!valorPago || parseFloat(valorPago) <= 0) {
      setMensagem({ type: 'error', text: 'Informe um valor válido para pagamento' });
      return;
    }

    setProcessando(true);
    setMensagem(null);

    try {
      const response = await pagamentoPulseiraService.pagarPulseira(
        selectedPulseira.numeroPulseira,
        parseFloat(valorPago),
        formaPagamento
      );
      
      console.log("Pagamento da pulseira realizado:", response);
      
      const isAgrupado = response.agrupado || false;
      const totalPulseiras = response.totalPulseirasPagas || 1;
      
      setMensagem({ 
        type: 'success', 
        text: `✅ ${isAgrupado ? `Pagamento conjunto de ${totalPulseiras} pulseiras` : 'Pagamento'} de R$ ${parseFloat(valorPago).toFixed(2)} realizado com sucesso!` 
      });
      
      await loadData();
      setSelectedPulseira(null);
      setPulseiraInfo(null);
      setValorPago("");
      
      setTimeout(() => {
        setMensagem(null);
      }, 5000);
      
    } catch (error: any) {
      console.error("Erro ao realizar pagamento:", error);
      setMensagem({ 
        type: 'error', 
        text: error.response?.data?.message || "Erro ao realizar pagamento" 
      });
    } finally {
      setProcessando(false);
    }
  };

  // ============ FUNÇÕES GERAIS ============
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const mesasOcupadas = mesas.filter(m => m.isOcupada && m.comanda);
  const pulseirasAtivas = pulseiras.filter(p => p.isAtivo);
  
  const totalSelecionado = clientes
    .filter(c => selectedClientes.includes(c.id))
    .reduce((sum, c) => sum + (c.valorTotal || 0), 0);

  const getItensSelecionados = () => {
    const itensMap = new Map<string, { quantidade: number; precoTotal: number; precoUnitario: number }>();
    
    clientes
      .filter(c => selectedClientes.includes(c.id))
      .forEach(cliente => {
        cliente.itens?.forEach(item => {
          const key = item.produtoNome;
          if (itensMap.has(key)) {
            const existing = itensMap.get(key)!;
            itensMap.set(key, {
              quantidade: existing.quantidade + item.quantidade,
              precoTotal: existing.precoTotal + item.precoTotal,
              precoUnitario: item.precoUnitario
            });
          } else {
            itensMap.set(key, {
              quantidade: item.quantidade,
              precoTotal: item.precoTotal,
              precoUnitario: item.precoUnitario
            });
          }
        });
      });
    
    return Array.from(itensMap.entries()).map(([nome, data]) => ({
      nome,
      ...data
    }));
  };

  const itensSelecionados = getItensSelecionados();

  // ============ RENDERIZAÇÃO ============
  const renderizarTipoPagamento = () => {
    switch (tipoPagamento) {
      case "pulseira":
        return renderizarPulseira();
      case "cartao":
        return (
          <div className="text-center py-12 bg-[#12121A] rounded-2xl border border-[#7B2CFF]/20">
            <Wallet size={48} className="mx-auto text-[#B8B8C8] mb-4" />
            <p className="text-[#F5F5FA] font-semibold">Pagamento com Cartão</p>
            <p className="text-[#B8B8C8] text-sm mt-2">Funcionalidade em desenvolvimento</p>
          </div>
        );
      case "mesa":
      default:
        return renderizarMesa();
    }
  };

  // ============ RENDERIZAR MESA ============
  const renderizarMesa = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Mesas */}
        <div className="bg-[#12121A] rounded-2xl border border-[#7B2CFF]/20 p-6 lg:col-span-1">
          <h2 className="text-xl font-bold text-[#F5F5FA] mb-4 flex items-center gap-2">
            <Table size={20} className="text-[#7B2CFF]" />
            Mesas Ocupadas
          </h2>
          
          {mesasOcupadas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#B8B8C8]">Nenhuma mesa ocupada</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {mesasOcupadas.map(mesa => (
                <button
                  key={mesa.id}
                  onClick={() => handleSelectMesa(mesa)}
                  className={`w-full p-3 rounded-xl border transition-all text-left ${
                    selectedMesa?.id === mesa.id
                      ? "border-[#7B2CFF] bg-[#7B2CFF]/10"
                      : "border-gray-700 bg-[#08080D] hover:border-[#7B2CFF]/50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-[#F5F5FA]">Mesa {mesa.numeroMesa}</h3>
                      <p className="text-[#B8B8C8] text-sm">
                        Total: {formatCurrency(mesa.comanda?.valorTotal || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[#B8B8C8] text-xs">
                        {mesa.comanda?.clientes.filter(c => !c.pago).length || 0} pendentes
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clientes da Mesa Selecionada */}
        <div className="bg-[#12121A] rounded-2xl border border-[#7B2CFF]/20 p-6 lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#F5F5FA] flex items-center gap-2">
              <Users size={20} className="text-[#7B2CFF]" />
              Clientes
            </h2>
            {selectedMesa && clientes.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={selecionarTodosClientes}
                  className="text-xs bg-[#7B2CFF]/20 text-[#B47DFF] px-2 py-1 rounded-lg hover:bg-[#7B2CFF]/30 transition-all"
                >
                  Selecionar Não Pagos
                </button>
                <button
                  onClick={deselecionarTodos}
                  className="text-xs bg-gray-700/20 text-[#B8B8C8] px-2 py-1 rounded-lg hover:bg-gray-700/30 transition-all"
                >
                  Limpar
                </button>
              </div>
            )}
          </div>
          
          {!selectedMesa ? (
            <div className="text-center py-8">
              <p className="text-[#B8B8C8]">Selecione uma mesa</p>
            </div>
          ) : clientes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#B8B8C8]">Nenhum cliente nesta mesa</p>
            </div>
          ) : (
            <div className="space-y-2">
              {clientes.map(cliente => {
                const isSelected = selectedClientes.includes(cliente.id);
                const isPago = cliente.pago;
                
                return (
                  <div
                    key={cliente.id}
                    onClick={() => toggleClienteSelection(cliente.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected && !isPago
                        ? "border-[#7B2CFF] bg-[#7B2CFF]/10"
                        : isPago
                        ? "border-green-500/30 bg-green-500/5 cursor-default"
                        : "border-gray-700 bg-[#08080D] hover:border-[#7B2CFF]/50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleCheckboxChange(e, cliente.id)}
                          disabled={isPago}
                          className="w-4 h-4 accent-[#7B2CFF] disabled:opacity-50 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-[#F5F5FA]">{cliente.nome}</h3>
                            {isPago && (
                              <span className="text-green-400 text-xs font-semibold">✓ PAGO</span>
                            )}
                            {!isPago && cliente.itens && cliente.itens.length > 0 && (
                              <button
                                onClick={(e) => handleVerItens(e, cliente)}
                                className="p-1 hover:bg-[#7B2CFF]/20 rounded-lg transition-all"
                                title="Ver itens"
                              >
                                <Eye size={14} className="text-[#B8B8C8]" />
                              </button>
                            )}
                          </div>
                          <p className="text-[#B8B8C8] text-sm">
                            {formatCurrency(cliente.valorTotal)} {cliente.itens && cliente.itens.length > 0 && `• ${cliente.itens.length} itens`}
                          </p>
                        </div>
                      </div>
                      {!isPago && (
                        <button
                          onClick={(e) => handleRemoverCliente(e, cliente.id)}
                          className="p-1 hover:bg-red-500/20 rounded-lg transition-all"
                          title="Remover cliente"
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagamento - Mesa */}
        <div className="bg-[#12121A] rounded-2xl border border-[#7B2CFF]/20 p-6 lg:col-span-1">
          <h2 className="text-xl font-bold text-[#F5F5FA] mb-4 flex items-center gap-2">
            <CreditCard size={20} className="text-[#7B2CFF]" />
            Realizar Pagamento
          </h2>

          {!selectedMesa ? (
            <div className="text-center py-8">
              <p className="text-[#B8B8C8]">Selecione uma mesa</p>
            </div>
          ) : selectedClientes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#B8B8C8]">Selecione os clientes para pagar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {itensSelecionados.length > 0 && (
                <div className="bg-[#08080D] rounded-xl p-3 border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Package size={16} className="text-[#7B2CFF]" />
                    <p className="text-[#B8B8C8] text-sm font-semibold">Itens para pagar</p>
                    <span className="text-[#B8B8C8] text-xs ml-auto">
                      {selectedClientes.length} cliente(s)
                    </span>
                  </div>
                  <div className="space-y-1 max-h-[150px] overflow-y-auto">
                    {itensSelecionados.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm border-b border-gray-800/50 pb-1">
                        <span className="text-[#F5F5FA]">
                          {item.nome} 
                          <span className="text-[#B8B8C8] text-xs ml-1">x{item.quantidade}</span>
                        </span>
                        <span className="text-[#7B2CFF] font-semibold">
                          {formatCurrency(item.precoTotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-700">
                    <span className="text-[#F5F5FA] font-semibold">Total</span>
                    <span className="text-[#7B2CFF] font-bold">{formatCurrency(totalSelecionado)}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[#B8B8C8] text-sm mb-1.5">Forma de Pagamento</label>
                <div className="grid grid-cols-2 gap-2">
                  {formasPagamento.map(forma => (
                    <button
                      key={forma.value}
                      onClick={() => setFormaPagamento(forma.value)}
                      className={`p-2 rounded-lg border transition-all flex items-center gap-2 ${
                        formaPagamento === forma.value
                          ? "border-[#7B2CFF] bg-[#7B2CFF]/10 text-[#F5F5FA]"
                          : "border-gray-700 bg-[#08080D] text-[#B8B8C8] hover:border-[#7B2CFF]/50"
                      }`}
                    >
                      <forma.icon size={16} />
                      <span className="text-sm">{forma.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#B8B8C8] text-sm mb-1.5">Valor a Pagar</label>
                <div className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA]">
                  {formatCurrency(parseFloat(valorPago) || 0)}
                </div>
              </div>

              {mensagem && (
                <div className={`p-3 rounded-xl text-sm ${
                  mensagem.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}>
                  {mensagem.text}
                </div>
              )}

              <button
                onClick={handlePagamentoMesa}
                disabled={processando || selectedClientes.length === 0 || !valorPago || parseFloat(valorPago) <= 0}
                className="w-full py-3 rounded-xl font-semibold text-white bg-green-500 hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processando ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Pagar {selectedClientes.length} cliente(s)
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============ RENDERIZAR PULSEIRA ============
  const renderizarPulseira = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Pulseiras */}
        <div className="bg-[#12121A] rounded-2xl border border-[#7B2CFF]/20 p-6 lg:col-span-1">
          <h2 className="text-xl font-bold text-[#F5F5FA] mb-4 flex items-center gap-2">
            <Sparkles size={20} className="text-[#7B2CFF]" />
            Pulseiras Ativas
          </h2>
          
          {pulseirasAtivas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#B8B8C8]">Nenhuma pulseira ativa</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {pulseirasAtivas.map(pulseira => (
                <button
                  key={pulseira.id}
                  onClick={() => handleSelectPulseira(pulseira)}
                  className={`w-full p-3 rounded-xl border transition-all text-left ${
                    selectedPulseira?.id === pulseira.id
                      ? "border-[#7B2CFF] bg-[#7B2CFF]/10"
                      : "border-gray-700 bg-[#08080D] hover:border-[#7B2CFF]/50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-[#F5F5FA]">#{pulseira.numeroPulseira}</h3>
                      <p className="text-[#B8B8C8] text-sm">{pulseira.nomeCliente}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[#7B2CFF] font-bold">
                        {formatCurrency(pulseira.valorTotal || 0)}
                      </span>
                      {pulseira.pulseiraAgrupadaCom && (
                        <div className="text-xs text-yellow-400 flex items-center gap-1">
                          <Link size={12} />
                          Agrupada
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detalhes da Pulseira Selecionada */}
        <div className="bg-[#12121A] rounded-2xl border border-[#7B2CFF]/20 p-6 lg:col-span-1">
          <h2 className="text-xl font-bold text-[#F5F5FA] mb-4 flex items-center gap-2">
            <User size={20} className="text-[#7B2CFF]" />
            Detalhes da Pulseira
          </h2>
          
          {!selectedPulseira ? (
            <div className="text-center py-8">
              <p className="text-[#B8B8C8]">Selecione uma pulseira</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#08080D] rounded-xl p-3 border border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-[#B8B8C8] text-sm">Pulseira</span>
                  <span className="text-[#F5F5FA] font-semibold">#{selectedPulseira.numeroPulseira}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[#B8B8C8] text-sm">Cliente</span>
                  <span className="text-[#F5F5FA]">{selectedPulseira.nomeCliente}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[#B8B8C8] text-sm">Status</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    selectedPulseira.isAtivo 
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {selectedPulseira.isAtivo ? 'ATIVA' : 'INATIVA'}
                  </span>
                </div>
              </div>

              {pulseiraInfo && pulseiraInfo.isAgrupada && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Link size={16} />
                    <span className="font-semibold">Pulseira Agrupada</span>
                  </div>
                  <p className="text-[#B8B8C8] text-sm mt-1">
                    Agrupada com: <span className="text-[#F5F5FA]">#{pulseiraInfo.pulseiraPrincipal}</span>
                  </p>
                  <p className="text-[#B8B8C8] text-sm">
                    Total de pulseiras: <span className="text-[#F5F5FA]">{pulseiraInfo.totalPulseiras}</span>
                  </p>
                  <p className="text-[#B8B8C8] text-sm">
                    Valor total: <span className="text-[#7B2CFF] font-bold">{formatCurrency(pulseiraInfo.valorTotal)}</span>
                  </p>
                </div>
              )}

              {pulseiraInfo && !pulseiraInfo.isAgrupada && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Unlink size={16} />
                    <span className="font-semibold">Pulseira Individual</span>
                  </div>
                  <p className="text-[#B8B8C8] text-sm mt-1">
                    Valor total: <span className="text-[#7B2CFF] font-bold">{formatCurrency(pulseiraInfo.valorTotal)}</span>
                  </p>
                </div>
              )}

              {selectedPulseira.itens && selectedPulseira.itens.length > 0 && (
                <div>
                  <button
                    onClick={() => setMostrarItensPulseira(!mostrarItensPulseira)}
                    className="text-sm text-[#B47DFF] hover:text-[#7B2CFF] transition-all flex items-center gap-2"
                  >
                    <Package size={14} />
                    {mostrarItensPulseira ? 'Ocultar itens' : 'Ver itens consumidos'}
                  </button>
                  {mostrarItensPulseira && (
                    <div className="mt-2 space-y-1">
                      {selectedPulseira.itens.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm bg-[#08080D] p-2 rounded-lg">
                          <span className="text-[#F5F5FA]">
                            {item.produtoNome} 
                            <span className="text-[#B8B8C8] text-xs ml-1">x{item.quantidade}</span>
                          </span>
                          <span className="text-[#7B2CFF]">
                            {formatCurrency(item.precoTotal)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center text-sm font-semibold bg-[#08080D] p-2 rounded-lg border-t border-gray-700">
                        <span className="text-[#F5F5FA]">Total</span>
                        <span className="text-[#7B2CFF]">{formatCurrency(selectedPulseira.valorTotal)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagamento - Pulseira */}
        <div className="bg-[#12121A] rounded-2xl border border-[#7B2CFF]/20 p-6 lg:col-span-1">
          <h2 className="text-xl font-bold text-[#F5F5FA] mb-4 flex items-center gap-2">
            <CreditCard size={20} className="text-[#7B2CFF]" />
            Realizar Pagamento
          </h2>

          {!selectedPulseira ? (
            <div className="text-center py-8">
              <p className="text-[#B8B8C8]">Selecione uma pulseira</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#08080D] rounded-xl p-3 border border-gray-700">
                <p className="text-[#B8B8C8] text-sm">Pulseira</p>
                <p className="text-[#F5F5FA] font-semibold">#{selectedPulseira.numeroPulseira}</p>
                <p className="text-[#B8B8C8] text-sm mt-1">
                  Cliente: <span className="text-[#F5F5FA]">{selectedPulseira.nomeCliente}</span>
                </p>
                {pulseiraInfo && (
                  <p className="text-[#B8B8C8] text-sm mt-1">
                    Total a pagar: <span className="text-[#7B2CFF] font-bold">{formatCurrency(pulseiraInfo.valorTotal)}</span>
                    {pulseiraInfo.isAgrupada && (
                      <span className="text-yellow-400 text-xs ml-2">(Agrupada)</span>
                    )}
                  </p>
                )}
              </div>

              {mensagem && (
                <div className={`p-3 rounded-xl text-sm ${
                  mensagem.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : mensagem.type === 'info'
                    ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}>
                  {mensagem.text}
                </div>
              )}

              <div>
                <label className="block text-[#B8B8C8] text-sm mb-1.5">Forma de Pagamento</label>
                <div className="grid grid-cols-2 gap-2">
                  {formasPagamento.map(forma => (
                    <button
                      key={forma.value}
                      onClick={() => setFormaPagamento(forma.value)}
                      className={`p-2 rounded-lg border transition-all flex items-center gap-2 ${
                        formaPagamento === forma.value
                          ? "border-[#7B2CFF] bg-[#7B2CFF]/10 text-[#F5F5FA]"
                          : "border-gray-700 bg-[#08080D] text-[#B8B8C8] hover:border-[#7B2CFF]/50"
                      }`}
                    >
                      <forma.icon size={16} />
                      <span className="text-sm">{forma.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#B8B8C8] text-sm mb-1.5">Valor a Pagar</label>
                <input
                  type="number"
                  step="0.01"
                  value={valorPago}
                  onChange={(e) => setValorPago(e.target.value)}
                  className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
                  placeholder="0,00"
                />
                {pulseiraInfo && (
                  <p className="text-[#B8B8C8] text-xs mt-1">
                    Total: {formatCurrency(pulseiraInfo.valorTotal)}
                  </p>
                )}
              </div>

              <button
                onClick={handlePagamentoPulseira}
                disabled={processando || !valorPago || parseFloat(valorPago) <= 0}
                className="w-full py-3 rounded-xl font-semibold text-white bg-green-500 hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processando ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    {pulseiraInfo?.isAgrupada ? 'Pagar Grupo' : 'Pagar Pulseira'}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============ MAIN RENDER ============
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#F5F5FA] flex items-center gap-2">
            <DollarSign size={28} className="text-[#7B2CFF]" />
            Pagamento
          </h1>
          <p className="text-[#B8B8C8] mt-1">Selecione o tipo de pagamento e realize a operação</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-[#12121A] border border-gray-700 rounded-xl text-[#B8B8C8] hover:text-white hover:border-[#7B2CFF] transition-all"
        >
          <RefreshCw size={18} />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Tipo de Pagamento */}
      <div className="flex gap-4">
        <button
          onClick={() => setTipoPagamento("mesa")}
          className={`flex-1 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            tipoPagamento === "mesa"
              ? "bg-[#7B2CFF] text-white"
              : "bg-[#12121A] text-[#B8B8C8] hover:bg-[#7B2CFF]/20"
          }`}
        >
          <Table size={20} />
          Mesa
        </button>
        <button
          onClick={() => setTipoPagamento("pulseira")}
          className={`flex-1 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            tipoPagamento === "pulseira"
              ? "bg-[#7B2CFF] text-white"
              : "bg-[#12121A] text-[#B8B8C8] hover:bg-[#7B2CFF]/20"
          }`}
        >
          <Sparkles size={20} />
          Pulseira
        </button>
        <button
          onClick={() => setTipoPagamento("cartao")}
          className={`flex-1 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            tipoPagamento === "cartao"
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
        renderizarTipoPagamento()
      )}

      {/* Modal de Detalhes do Cliente - só para Mesa */}
      {tipoPagamento === "mesa" && clienteDetalhes && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#12121A] rounded-2xl w-full max-w-md p-6 border border-[#7B2CFF]/20 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-[#F5F5FA] flex items-center gap-2">
                  <User size={20} className="text-[#7B2CFF]" />
                  {clienteDetalhes.nome}
                </h2>
                <p className="text-[#B8B8C8] text-sm">
                  Total: {formatCurrency(clienteDetalhes.valorTotal)}
                </p>
              </div>
              <button
                onClick={handleFecharDetalhes}
                className="text-[#B8B8C8] hover:text-white transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            {clienteDetalhes.itens && clienteDetalhes.itens.length > 0 ? (
              <div className="space-y-2">
                {clienteDetalhes.itens.map((item, index) => (
                  <div key={index} className="bg-[#08080D] rounded-xl p-3 border border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-[#F5F5FA]">{item.produtoNome}</p>
                        <p className="text-[#B8B8C8] text-sm">
                          {item.quantidade} x {formatCurrency(item.precoUnitario)}
                        </p>
                      </div>
                      <p className="text-[#7B2CFF] font-semibold">
                        {formatCurrency(item.precoTotal)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="bg-[#08080D] rounded-xl p-3 border border-[#7B2CFF]/20">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[#F5F5FA]">Total</span>
                    <span className="text-[#7B2CFF] font-bold">{formatCurrency(clienteDetalhes.valorTotal)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[#B8B8C8]">Nenhum item consumido</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}