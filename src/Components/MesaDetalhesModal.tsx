import { useState, useEffect } from "react";
import { X, User, ShoppingBag, DollarSign, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { clienteService, mesaService } from "../service/api";
import type { ClienteComItem, Mesa, MesaComComanda } from "../service/types";

interface MesaDetalhesModalProps {
  isOpen: boolean;
  onClose: () => void;
  mesa: Mesa | null;
}

export default function MesaDetalhesModal({ isOpen, onClose, mesa }: MesaDetalhesModalProps) {
  const [clientes, setClientes] = useState<ClienteComItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMesa, setTotalMesa] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [comandaId, setComandaId] = useState<number | null>(null);
  const [numeroComanda, setNumeroComanda] = useState<string>("");

  // Função para buscar a comanda da mesa
  const buscarComandaDaMesa = async (mesaId: number) => {
    try {
      const response = await mesaService.getMesaComComanda(mesaId);
      console.log("Resposta comanda da mesa:", response);
      
      if (response && response.comanda) {
        setComandaId(response.comanda.comandaId);
        setNumeroComanda(response.comanda.numeroComanda);
        return response.comanda.comandaId;
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar comanda da mesa:", error);
      return null;
    }
  };

  // Função para carregar os clientes da comanda
  const carregarClientes = async () => {
    if (!mesa || !mesa.isOcupada) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log("Buscando comanda para a mesa:", mesa.id);
      
      // Primeiro, buscar a comanda da mesa
      const comandaIdEncontrado = await buscarComandaDaMesa(mesa.id);
      
      if (!comandaIdEncontrado) {
        setError("Esta mesa não possui uma comanda ativa");
        setClientes([]);
        setTotalMesa(0);
        setLoading(false);
        return;
      }
      
      console.log("Comanda encontrada ID:", comandaIdEncontrado);
      
      // Agora buscar os clientes da comanda
      const response = await clienteService.listByComanda(comandaIdEncontrado);
      
      console.log("Resposta clientes:", response);
      
      if (response && response.clientes) {
        setClientes(response.clientes);
        
        // Calcular total da mesa
        const total = response.clientes.reduce((sum, c) => sum + (c.valorTotal || 0), 0);
        setTotalMesa(total);
      } else {
        setClientes([]);
        setTotalMesa(0);
        setError("Nenhum cliente encontrado para esta mesa");
      }
    } catch (err: any) {
      console.error("Erro ao carregar clientes:", err);
      
      if (err.response?.status === 404) {
        setError("Comanda não encontrada para esta mesa");
      } else if (err.response?.status === 403) {
        setError("Você não tem permissão para ver os dados desta mesa");
      } else {
        setError(err.response?.data?.message || "Erro ao carregar clientes da mesa");
      }
      
      setClientes([]);
      setTotalMesa(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && mesa) {
      carregarClientes();
    }
  }, [isOpen, mesa]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !mesa) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#12121A] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 border border-[#7B2CFF]/20">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#12121A] z-10 pb-4 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-[#F5F5FA] flex items-center gap-2">
              Mesa {mesa.numeroMesa}
              <span className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold ${
                mesa.isOcupada 
                  ? "bg-red-500/20 text-red-400" 
                  : "bg-green-500/20 text-green-400"
              }`}>
                {mesa.isOcupada ? "OCUPADA" : "LIVRE"}
              </span>
            </h2>
            {numeroComanda && (
              <p className="text-[#B8B8C8] text-sm mt-1">
                Comanda: <span className="text-[#7B2CFF] font-semibold">{numeroComanda}</span>
              </p>
            )}
            <p className="text-[#B8B8C8] text-sm">
              Capacidade: {mesa.capacidade} pessoas
              {clientes.length > 0 && (
                <> | Total: <span className="text-[#7B2CFF] font-semibold">{formatCurrency(totalMesa)}</span></>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={carregarClientes}
              className="p-2 text-[#B8B8C8] hover:text-white transition-colors rounded-lg hover:bg-[#7B2CFF]/10"
              title="Atualizar dados"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#B8B8C8] hover:text-white transition-colors rounded-lg hover:bg-[#7B2CFF]/10"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7B2CFF]"></div>
            <p className="text-[#B8B8C8] mt-2">Carregando dados da mesa...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-500/10 rounded-full p-4 inline-block mb-4">
              <XCircle size={48} className="text-red-400" />
            </div>
            <p className="text-red-400 font-semibold text-lg">{error}</p>
            <p className="text-[#B8B8C8] mt-2">Tente atualizar a página ou verifique se a mesa está realmente ocupada</p>
          </div>
        ) : clientes.length === 0 ? (
          <div className="text-center py-12">
            <User size={48} className="mx-auto text-[#B8B8C8] mb-4" />
            <p className="text-[#B8B8C8]">Nenhum cliente encontrado nesta mesa</p>
            <p className="text-[#B8B8C8] text-sm mt-1">A mesa pode estar vazia ou não ter comanda aberta</p>
          </div>
        ) : (
          <div className="space-y-6">
            {clientes.map((cliente) => (
              <div
                key={cliente.id}
                className="bg-[#08080D] rounded-xl p-4 border border-gray-800 hover:border-[#7B2CFF]/30 transition-all"
              >
                {/* Cliente Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#7B2CFF]/10 rounded-full">
                      <User size={20} className="text-[#7B2CFF]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#F5F5FA]">{cliente.nome}</h3>
                      <div className="flex items-center gap-3 text-sm text-[#B8B8C8]">
                        <span>Total: <span className="text-[#7B2CFF] font-semibold">{formatCurrency(cliente.valorTotal)}</span></span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          {cliente.pago ? (
                            <>
                              <CheckCircle size={14} className="text-green-400" />
                              <span className="text-green-400">Pago</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={14} className="text-yellow-400" />
                              <span className="text-yellow-400">Pendente</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-xs text-[#B8B8C8]">
                    <Clock size={14} className="inline mr-1" />
                    {formatDate(cliente.createdAt)}
                  </div>
                </div>

                {/* Itens do Cliente */}
                {cliente.itens && cliente.itens.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left py-2 text-[#B8B8C8] font-medium text-sm">Produto</th>
                          <th className="text-center py-2 text-[#B8B8C8] font-medium text-sm">Qtd</th>
                          <th className="text-right py-2 text-[#B8B8C8] font-medium text-sm">Preço Unit.</th>
                          <th className="text-right py-2 text-[#B8B8C8] font-medium text-sm">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cliente.itens.map((item) => (
                          <tr key={item.id} className="border-b border-gray-800/50 hover:bg-[#7B2CFF]/5 transition-all">
                            <td className="py-2 text-[#F5F5FA]">{item.produto.nome}</td>
                            <td className="py-2 text-center text-[#F5F5FA]">{item.quantidade}</td>
                            <td className="py-2 text-right text-[#B8B8C8]">{formatCurrency(item.precoUnitario)}</td>
                            <td className="py-2 text-right text-[#7B2CFF] font-semibold">{formatCurrency(item.precoTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={3} className="py-2 text-right font-semibold text-[#F5F5FA]">Total do Cliente</td>
                          <td className="py-2 text-right text-[#7B2CFF] font-bold">{formatCurrency(cliente.valorTotal)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <p className="text-[#B8B8C8] text-sm text-center py-4">Nenhum item consumido</p>
                )}
              </div>
            ))}

            {/* Total Geral da Mesa */}
            <div className="bg-gradient-to-r from-[#7B2CFF]/10 to-transparent rounded-xl p-4 border border-[#7B2CFF]/20">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-[#F5F5FA]">Total Geral da Mesa</span>
                <span className="text-2xl font-bold text-[#7B2CFF]">{formatCurrency(totalMesa)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}