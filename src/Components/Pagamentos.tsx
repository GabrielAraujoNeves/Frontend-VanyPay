import { RefreshCw, Sparkles, Table, Wallet, User, DollarSign, CreditCard, CheckCircle, XCircle, Users, Trash2, Package, Eye, Link, Unlink } from "lucide-react";
import { useState, useEffect } from "react";
import { mesaService, pagamentoService, pulseiraService, pagamentoPulseiraService } from "../service/api";
import type { MesaDetalhada, ClienteComItem, ItemConsumo } from "../service/types";

type TipoPagamento = "mesa" | "pulseira" | "cartao";

// Interface para Cliente (usando os dados da API)
interface ClienteLocal {
  id: number;
  nome: string;
  valorTotal: number;
  pago?: boolean;
  itens?: ItemConsumo[];
}

// Interface para Mesa (convertida de MesaDetalhada)
interface MesaComanda {
  id: number;
  numeroMesa: number;
  capacidade: number;
  isOcupada: boolean;
  comanda: {
    comandaId: number;
    numeroComanda: string;
    valorTotal: number;
    clientes: ClienteLocal[];
  } | null;
}

// Interface para Pulseira (convertida)
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
  const [clientes, setClientes] = useState<ClienteLocal[]>([]);
  const [selectedClientes, setSelectedClientes] = useState<number[]>([]);
  const [clienteDetalhes, setClienteDetalhes] = useState<ClienteLocal | null>(null);

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
        // Converter MesaDetalhada para MesaComanda
        const mesasConvertidas: MesaComanda[] = response.mesas.map((mesa: MesaDetalhada) => ({
          id: mesa.id,
          numeroMesa: mesa.numeroMesa,
          capacidade: mesa.capacidade,
          isOcupada: mesa.isOcupada,
          comanda: mesa.comanda ? {
            comandaId: mesa.comanda.comandaId,
            numeroComanda: mesa.comanda.numeroComanda,
            valorTotal: mesa.comanda.valorTotal,
            clientes: mesa.comanda.clientes.map((cliente: ClienteComItem) => ({
              id: cliente.id,
              nome: cliente.nome,
              valorTotal: cliente.valorTotal,
              pago: cliente.pago,
              itens: cliente.itens
            }))
          } : null
        }));
        setMesas(mesasConvertidas);
      } else if (tipoPagamento === "pulseira") {
        const response = await pulseiraService.listAll();
        console.log("Pulseiras carregadas:", response);
        // Converter Pulseira para PulseiraDetalhada
        const pulseirasConvertidas: PulseiraDetalhada[] = response.pulseiras.map((pulseira: any) => ({
          id: pulseira.id,
          numeroPulseira: pulseira.numeroPulseira,
          nomeCliente: pulseira.nomeCliente,
          valorTotal: 0, // Será atualizado ao selecionar
          isAtivo: pulseira.isAtivo,
          pulseiraAgrupadaCom: pulseira.pulseiraAgrupadaCom,
          itens: []
        }));
        setPulseiras(pulseirasConvertidas);
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
        
        const total = response.clientes.reduce((sum: number, c: ClienteLocal) => sum + (c.valorTotal || 0), 0);
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

  const handleVerItens = (e: React.MouseEvent, cliente: ClienteLocal) => {
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
      
      const estaAgrupada = response.estaAgrupada === true;
      const pulseiraPrincipal = response.pulseiraPrincipal;
      const pulseiraSecundaria = response.pulseiraSecundaria;
      
      let valorTotal = 0;
      if (estaAgrupada) {
        valorTotal = response.valorTotalAgrupado || 0;
      } else {
        valorTotal = response.saldoPrincipal || response.saldoTotal || 0;
      }
      
      // Extrair itens
      let itens = [];
      if (response.itens && response.itens.length > 0) {
        itens = response.itens;
      } else if (response.itensPrincipal && response.itensPrincipal.length > 0) {
        itens = response.itensPrincipal;
      } else if (response.itensSecundaria && response.itensSecundaria.length > 0) {
        itens = response.itensSecundaria;
      }
      
      setPulseiraInfo({
        ...response,
        estaAgrupada,
        pulseiraPrincipal,
        pulseiraSecundaria,
        valorTotal: valorTotal,
        itens: itens,
        clienteNome: response.nomeClientePrincipal || response.nomeCliente || pulseira.nomeCliente
      });
      
      if (estaAgrupada) {
        setMensagem({ 
          type: 'info', 
          text: `🔗 Pulseira agrupada com ${pulseiraSecundaria || pulseiraPrincipal}. Pagamento conjunto de R$ ${valorTotal.toFixed(2)}` 
        });
      }
      
      setValorPago(valorTotal.toFixed(2));
      
    } catch (error) {
      console.error("Erro ao buscar detalhes da pulseira:", error);
      setPulseiraInfo({
        ...pulseira,
        estaAgrupada: false,
        valorTotal: pulseira.valorTotal || 0,
        itens: pulseira.itens || []
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

  // CORRIGIDO: Função para agrupar itens dos clientes selecionados
  const getItensSelecionados = () => {
    const itensMap = new Map<string, { quantidade: number; precoTotal: number; precoUnitario: number }>();
    
    clientes
      .filter(c => selectedClientes.includes(c.id))
      .forEach(cliente => {
        cliente.itens?.forEach(item => {
          // Para itens da mesa, a estrutura é item.produto.nome
          // Para itens da pulseira, pode ser item.produtoNome
          const nome = item.produto?.nome || (item as any).produtoNome || 'Produto';
          if (itensMap.has(nome)) {
            const existing = itensMap.get(nome)!;
            itensMap.set(nome, {
              quantidade: existing.quantidade + item.quantidade,
              precoTotal: existing.precoTotal + item.precoTotal,
              precoUnitario: item.precoUnitario
            });
          } else {
            itensMap.set(nome, {
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
          <div className="text-center py-12 bg-surface rounded-2xl border border-primary/20">
            <Wallet size={48} className="mx-auto text-secondary mb-4" />
            <p className="text-text font-semibold">Pagamento com Cartão</p>
            <p className="text-secondary text-sm mt-2">Funcionalidade em desenvolvimento</p>
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
        <div className="bg-surface rounded-2xl border border-primary/20 p-6 lg:col-span-1">
          <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
            <Table size={20} className="text-primary" />
            Mesas Ocupadas
          </h2>
          
          {mesasOcupadas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-secondary">Nenhuma mesa ocupada</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {mesasOcupadas.map(mesa => (
                <button
                  key={mesa.id}
                  onClick={() => handleSelectMesa(mesa)}
                  className={`w-full p-3 rounded-xl border transition-all text-left ${
                    selectedMesa?.id === mesa.id
                      ? "border-primary bg-primary/10"
                      : "border-gray-700 bg-background hover:border-primary/50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-text">Mesa {mesa.numeroMesa}</h3>
                      <p className="text-secondary text-sm">
                        Total: {formatCurrency(mesa.comanda?.valorTotal || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-secondary text-xs">
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
        <div className="bg-surface rounded-2xl border border-primary/20 p-6 lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-text flex items-center gap-2">
              <Users size={20} className="text-primary" />
              Clientes
            </h2>
            {selectedMesa && clientes.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={selecionarTodosClientes}
                  className="text-xs bg-primary/20 text-primary-light px-2 py-1 rounded-lg hover:bg-primary/30 transition-all"
                >
                  Selecionar Não Pagos
                </button>
                <button
                  onClick={deselecionarTodos}
                  className="text-xs bg-gray-700/20 text-secondary px-2 py-1 rounded-lg hover:bg-gray-700/30 transition-all"
                >
                  Limpar
                </button>
              </div>
            )}
          </div>
          
          {!selectedMesa ? (
            <div className="text-center py-8">
              <p className="text-secondary">Selecione uma mesa</p>
            </div>
          ) : clientes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-secondary">Nenhum cliente nesta mesa</p>
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
                        ? "border-primary bg-primary/10"
                        : isPago
                        ? "border-green-500/30 bg-green-500/5 cursor-default"
                        : "border-gray-700 bg-background hover:border-primary/50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleCheckboxChange(e, cliente.id)}
                          disabled={isPago}
                          className="w-4 h-4 accent-primary disabled:opacity-50 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-text">{cliente.nome}</h3>
                            {isPago && (
                              <span className="text-green-400 text-xs font-semibold">✓ PAGO</span>
                            )}
                            {!isPago && cliente.itens && cliente.itens.length > 0 && (
                              <button
                                onClick={(e) => handleVerItens(e, cliente)}
                                className="p-1 hover:bg-primary/20 rounded-lg transition-all"
                                title="Ver itens"
                              >
                                <Eye size={14} className="text-secondary" />
                              </button>
                            )}
                          </div>
                          <p className="text-secondary text-sm">
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
        <div className="bg-surface rounded-2xl border border-primary/20 p-6 lg:col-span-1">
          <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
            <CreditCard size={20} className="text-primary" />
            Realizar Pagamento
          </h2>

          {!selectedMesa ? (
            <div className="text-center py-8">
              <p className="text-secondary">Selecione uma mesa</p>
            </div>
          ) : selectedClientes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-secondary">Selecione os clientes para pagar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {itensSelecionados.length > 0 && (
                <div className="bg-background rounded-xl p-3 border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Package size={16} className="text-primary" />
                    <p className="text-secondary text-sm font-semibold">Itens para pagar</p>
                    <span className="text-secondary text-xs ml-auto">
                      {selectedClientes.length} cliente(s)
                    </span>
                  </div>
                  <div className="space-y-1 max-h-[150px] overflow-y-auto">
                    {itensSelecionados.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm border-b border-gray-800/50 pb-1">
                        <span className="text-text">
                          {item.nome} 
                          <span className="text-secondary text-xs ml-1">x{item.quantidade}</span>
                        </span>
                        <span className="text-primary font-semibold">
                          {formatCurrency(item.precoTotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-700">
                    <span className="text-text font-semibold">Total</span>
                    <span className="text-primary font-bold">{formatCurrency(totalSelecionado)}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-secondary text-sm mb-1.5">Forma de Pagamento</label>
                <div className="grid grid-cols-2 gap-2">
                  {formasPagamento.map(forma => (
                    <button
                      key={forma.value}
                      onClick={() => setFormaPagamento(forma.value)}
                      className={`p-2 rounded-lg border transition-all flex items-center gap-2 ${
                        formaPagamento === forma.value
                          ? "border-primary bg-primary/10 text-text"
                          : "border-gray-700 bg-background text-secondary hover:border-primary/50"
                      }`}
                    >
                      <forma.icon size={16} />
                      <span className="text-sm">{forma.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-secondary text-sm mb-1.5">Valor a Pagar</label>
                <div className="w-full bg-background border border-gray-700 rounded-xl px-4 py-3 text-text">
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
        <div className="bg-surface rounded-2xl border border-primary/20 p-6 lg:col-span-1">
          <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
            <Sparkles size={20} className="text-primary" />
            Pulseiras Ativas
          </h2>
          
          {pulseirasAtivas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-secondary">Nenhuma pulseira ativa</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {pulseirasAtivas.map(pulseira => (
                <button
                  key={pulseira.id}
                  onClick={() => handleSelectPulseira(pulseira)}
                  className={`w-full p-3 rounded-xl border transition-all text-left ${
                    selectedPulseira?.id === pulseira.id
                      ? "border-primary bg-primary/10"
                      : "border-gray-700 bg-background hover:border-primary/50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-text">#{pulseira.numeroPulseira}</h3>
                      <p className="text-secondary text-sm">{pulseira.nomeCliente}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-primary font-bold">
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
        <div className="bg-surface rounded-2xl border border-primary/20 p-6 lg:col-span-1">
          <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
            <User size={20} className="text-primary" />
            Detalhes da Pulseira
          </h2>
          
          {!selectedPulseira ? (
            <div className="text-center py-8">
              <p className="text-secondary">Selecione uma pulseira</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-background rounded-xl p-3 border border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-secondary text-sm">Pulseira</span>
                  <span className="text-text font-semibold">#{selectedPulseira.numeroPulseira}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-secondary text-sm">Cliente</span>
                  <span className="text-text">{pulseiraInfo?.clienteNome || selectedPulseira.nomeCliente}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-secondary text-sm">Status</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    selectedPulseira.isAtivo 
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {selectedPulseira.isAtivo ? 'ATIVA' : 'INATIVA'}
                  </span>
                </div>
              </div>

              {pulseiraInfo && pulseiraInfo.estaAgrupada && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Link size={16} />
                    <span className="font-semibold">Pulseira Agrupada</span>
                  </div>
                  <p className="text-secondary text-sm mt-1">
                    Principal: <span className="text-text">#{pulseiraInfo.pulseiraPrincipal}</span>
                  </p>
                  <p className="text-secondary text-sm">
                    Secundária: <span className="text-text">#{pulseiraInfo.pulseiraSecundaria}</span>
                  </p>
                  <p className="text-secondary text-sm">
                    Cliente Principal: <span className="text-text">{pulseiraInfo.nomeClientePrincipal}</span>
                  </p>
                  <p className="text-secondary text-sm">
                    Cliente Secundário: <span className="text-text">{pulseiraInfo.nomeClienteSecundaria}</span>
                  </p>
                  <p className="text-secondary text-sm">
                    Valor Total Agrupado: <span className="text-primary font-bold">{formatCurrency(pulseiraInfo.valorTotal)}</span>
                  </p>
                </div>
              )}

              {pulseiraInfo && !pulseiraInfo.estaAgrupada && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Unlink size={16} />
                    <span className="font-semibold">Pulseira Individual</span>
                  </div>
                  <p className="text-secondary text-sm mt-1">
                    Valor total: <span className="text-primary font-bold">{formatCurrency(pulseiraInfo.valorTotal)}</span>
                  </p>
                </div>
              )}

              {/* Itens da Pulseira - CORRIGIDO */}
              {(pulseiraInfo?.itens && pulseiraInfo.itens.length > 0) && (
                <div>
                  <button
                    onClick={() => setMostrarItensPulseira(!mostrarItensPulseira)}
                    className="text-sm text-primary-light hover:text-primary transition-all flex items-center gap-2"
                  >
                    <Package size={14} />
                    {mostrarItensPulseira ? 'Ocultar itens' : 'Ver itens consumidos'}
                  </button>
                  {mostrarItensPulseira && (
                    <div className="mt-2 space-y-1">
                      {pulseiraInfo.itens.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-sm bg-background p-2 rounded-lg">
                          <span className="text-text">
                            {item.produtoNome || item.produto?.nome || 'Produto'} 
                            <span className="text-secondary text-xs ml-1">x{item.quantidade}</span>
                          </span>
                          <span className="text-primary">
                            {formatCurrency(item.precoTotal || (item.quantidade * item.precoUnitario))}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center text-sm font-semibold bg-background p-2 rounded-lg border-t border-gray-700">
                        <span className="text-text">Total</span>
                        <span className="text-primary">{formatCurrency(pulseiraInfo.valorTotal || selectedPulseira.valorTotal)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagamento - Pulseira */}
        <div className="bg-surface rounded-2xl border border-primary/20 p-6 lg:col-span-1">
          <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
            <CreditCard size={20} className="text-primary" />
            Realizar Pagamento
          </h2>

          {!selectedPulseira ? (
            <div className="text-center py-8">
              <p className="text-secondary">Selecione uma pulseira</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-background rounded-xl p-3 border border-gray-700">
                <p className="text-secondary text-sm">Pulseira</p>
                <p className="text-text font-semibold">#{selectedPulseira.numeroPulseira}</p>
                <p className="text-secondary text-sm mt-1">
                  Cliente: <span className="text-text">{pulseiraInfo?.clienteNome || selectedPulseira.nomeCliente}</span>
                </p>
                {pulseiraInfo && (
                  <p className="text-secondary text-sm mt-1">
                    Total a pagar: <span className="text-primary font-bold">{formatCurrency(pulseiraInfo.valorTotal)}</span>
                    {pulseiraInfo.estaAgrupada && (
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
                <label className="block text-secondary text-sm mb-1.5">Forma de Pagamento</label>
                <div className="grid grid-cols-2 gap-2">
                  {formasPagamento.map(forma => (
                    <button
                      key={forma.value}
                      onClick={() => setFormaPagamento(forma.value)}
                      className={`p-2 rounded-lg border transition-all flex items-center gap-2 ${
                        formaPagamento === forma.value
                          ? "border-primary bg-primary/10 text-text"
                          : "border-gray-700 bg-background text-secondary hover:border-primary/50"
                      }`}
                    >
                      <forma.icon size={16} />
                      <span className="text-sm">{forma.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-secondary text-sm mb-1.5">Valor a Pagar</label>
                <input
                  type="number"
                  step="0.01"
                  value={valorPago}
                  onChange={(e) => setValorPago(e.target.value)}
                  className="w-full bg-background border border-gray-700 rounded-xl px-4 py-3 text-text outline-none focus:border-primary"
                  placeholder="0,00"
                />
                {pulseiraInfo && (
                  <p className="text-secondary text-xs mt-1">
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
                    {pulseiraInfo?.estaAgrupada ? 'Pagar Grupo' : 'Pagar Pulseira'}
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
          <h1 className="text-3xl font-bold text-text flex items-center gap-2">
            <DollarSign size={28} className="text-primary" />
            Pagamento
          </h1>
          <p className="text-secondary mt-1">Selecione o tipo de pagamento e realize a operação</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-surface border border-gray-700 rounded-xl text-secondary hover:text-white hover:border-primary transition-all"
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
              ? "bg-primary text-white"
              : "bg-surface text-secondary hover:bg-primary/20"
          }`}
        >
          <Table size={20} />
          Mesa
        </button>
        <button
          onClick={() => setTipoPagamento("pulseira")}
          className={`flex-1 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            tipoPagamento === "pulseira"
              ? "bg-primary text-white"
              : "bg-surface text-secondary hover:bg-primary/20"
          }`}
        >
          <Sparkles size={20} />
          Pulseira
        </button>
        <button
          onClick={() => setTipoPagamento("cartao")}
          className={`flex-1 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            tipoPagamento === "cartao"
              ? "bg-primary text-white"
              : "bg-surface text-secondary hover:bg-primary/20"
          }`}
        >
          <Wallet size={20} />
          Cartão
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        renderizarTipoPagamento()
      )}

      {/* Modal de Detalhes do Cliente - só para Mesa */}
      {tipoPagamento === "mesa" && clienteDetalhes && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-surface rounded-2xl w-full max-w-md p-6 border border-primary/20 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-text flex items-center gap-2">
                  <User size={20} className="text-primary" />
                  {clienteDetalhes.nome}
                </h2>
                <p className="text-secondary text-sm">
                  Total: {formatCurrency(clienteDetalhes.valorTotal)}
                </p>
              </div>
              <button
                onClick={handleFecharDetalhes}
                className="text-secondary hover:text-white transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            {clienteDetalhes.itens && clienteDetalhes.itens.length > 0 ? (
              <div className="space-y-2">
                {clienteDetalhes.itens.map((item, index) => (
                  <div key={index} className="bg-background rounded-xl p-3 border border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-text">{item.produto.nome}</p>
                        <p className="text-secondary text-sm">
                          {item.quantidade} x {formatCurrency(item.precoUnitario)}
                        </p>
                      </div>
                      <p className="text-primary font-semibold">
                        {formatCurrency(item.precoTotal)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="bg-background rounded-xl p-3 border border-primary/20">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-text">Total</span>
                    <span className="text-primary font-bold">{formatCurrency(clienteDetalhes.valorTotal)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-secondary">Nenhum item consumido</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}