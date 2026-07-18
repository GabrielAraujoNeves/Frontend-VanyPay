import { useState, useEffect } from "react";
import { Search, Package, Plus, Edit2, Trash2 } from "lucide-react";
import { estoqueService } from "../service/api";
import ModalEstoque from "./ModalEstoque";

interface EstoqueItem {
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

interface EstoqueListProps {
  refreshTrigger?: number;
}

export default function EstoqueList({ refreshTrigger = 0 }: EstoqueListProps) {
  const [itens, setItens] = useState<EstoqueItem[]>([]);
  const [totalItens, setTotalItens] = useState(0);
  const [valorTotalEstoque, setValorTotalEstoque] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [showModal, setShowModal] = useState(false);

  const loadEstoque = async () => {
    setLoading(true);
    try {
      const response = await estoqueService.listAll();
      setItens(response.itens || []);
      setTotalItens(response.totalItens || 0);
      setValorTotalEstoque(response.valorTotalEstoque || 0);
    } catch (error) {
      console.error("Erro ao carregar estoque:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEstoque();
  }, [refreshTrigger]);

  // Filtrar itens
  const filteredItens = itens.filter(item => {
    const matchSearch = item.nomeProduto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "todos" || 
      (filterStatus === "baixo" && item.isEstoqueBaixo) ||
      (filterStatus === "alto" && item.isEstoqueAlto) ||
      (filterStatus === "vencido" && item.isVencido) ||
      (filterStatus === "proximo" && item.isProximoVencer);
    return matchSearch && matchStatus;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (item: EstoqueItem) => {
    if (item.isVencido) {
      return <span className="px-2 py-1 bg-red-500/20 text-red-500 rounded-full text-xs">Vencido</span>;
    }
    if (item.isEstoqueBaixo) {
      return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs">Estoque Baixo</span>;
    }
    if (item.isProximoVencer) {
      return <span className="px-2 py-1 bg-orange-500/20 text-orange-500 rounded-full text-xs">Próximo ao Vencimento</span>;
    }
    if (item.isEstoqueAlto) {
      return <span className="px-2 py-1 bg-blue-500/20 text-blue-500 rounded-full text-xs">Estoque Alto</span>;
    }
    return <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs">Normal</span>;
  };

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#F5F5FA]">Estoque</h2>
          <p className="text-[#B8B8C8] mt-1">
            Total: {totalItens} itens | Valor Total: {formatPrice(valorTotalEstoque)}
          </p>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#7B2CFF] hover:bg-[#9A4DFF] rounded-xl transition-all"
        >
          <Plus size={20} />
          <span>Novo Item</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B8B8C8]" size={20} />
            <input
              type="text"
              placeholder="Buscar item por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#12121A] border border-gray-700 rounded-xl text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
            />
          </div>
        </div>

        <div className="w-64">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2 bg-[#12121A] border border-gray-700 rounded-xl text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
          >
            <option value="todos">Todos os itens</option>
            <option value="baixo">Estoque Baixo</option>
            <option value="alto">Estoque Alto</option>
            <option value="proximo">Próximo ao Vencimento</option>
            <option value="vencido">Vencidos</option>
          </select>
        </div>
      </div>

      {/* Loading / Lista */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7B2CFF]"></div>
        </div>
      ) : filteredItens.length === 0 ? (
        <div className="text-center py-12 bg-[#12121A] rounded-2xl">
          <Package size={48} className="mx-auto text-[#B8B8C8] mb-4" />
          <p className="text-[#B8B8C8]">Nenhum item encontrado no estoque</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItens.map((item) => (
            <div key={item.id} className="bg-[#12121A] rounded-2xl border border-[#7B2CFF]/20 p-6 hover:border-[#7B2CFF]/50 transition-all group">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-[#F5F5FA] flex-1">{item.nomeProduto}</h3>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="p-2 bg-[#08080D] rounded-lg text-[#B47DFF] hover:bg-[#7B2CFF]/20 transition-all"
                    title="Editar item"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="p-2 bg-[#08080D] rounded-lg text-red-500 hover:bg-red-500/20 transition-all"
                    title="Deletar item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-3">
                <span className="text-2xl font-bold text-[#7B2CFF]">{formatPrice(item.precoUnitario)}</span>
                <span className="text-sm text-[#B8B8C8]">
                  Quantidade: <span className="text-[#F5F5FA] font-bold">{item.quantidade}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-[#B8B8C8]">Unidade: {item.unidadeMedida}</span>
                {getStatusBadge(item)}
              </div>
              
              <p className="text-[#B8B8C8] text-sm mb-3 line-clamp-2">{item.observacoes || "Sem observações"}</p>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-[#B8B8C8]">Fornecedor:</span>
                  <p className="text-[#F5F5FA] truncate">{item.fornecedor || "N/A"}</p>
                </div>
                <div>
                  <span className="text-[#B8B8C8]">Localização:</span>
                  <p className="text-[#F5F5FA] truncate">{item.localizacao || "N/A"}</p>
                </div>
                <div>
                  <span className="text-[#B8B8C8]">Validade:</span>
                  <p className="text-[#F5F5FA]">{formatDate(item.dataValidade)}</p>
                </div>
                <div>
                  <span className="text-[#B8B8C8]">Valor Total:</span>
                  <p className="text-[#F5F5FA]">{formatPrice(item.valorTotal)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para adicionar item */}
      <ModalEstoque
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          loadEstoque();
        }}
      />
    </div>
  );
}