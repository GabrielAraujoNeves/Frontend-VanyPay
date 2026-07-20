import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from 'react-toastify';
import { estoqueService } from "../../../service/api";

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

interface ModalEditarEstoqueProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: EstoqueItem | null;
}

export default function ModalEditarEstoque({ isOpen, onClose, onSuccess, item }: ModalEditarEstoqueProps) {
  const [nomeProduto, setNomeProduto] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [unidadeMedida, setUnidadeMedida] = useState("UN");
  const [pesoVolume, setPesoVolume] = useState("");
  const [precoUnitario, setPrecoUnitario] = useState("");
  const [precoCompra, setPrecoCompra] = useState("");
  const [estoqueMinimo, setEstoqueMinimo] = useState("");
  const [estoqueMaximo, setEstoqueMaximo] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [dataValidade, setDataValidade] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Carregar dados do item quando o modal abrir
  useEffect(() => {
    if (item && isOpen) {
      setNomeProduto(item.nomeProduto || "");
      setQuantidade(item.quantidade?.toString() || "");
      setUnidadeMedida(item.unidadeMedida || "UN");
      setPesoVolume(item.pesoVolume?.toString() || "");
      setPrecoUnitario(item.precoUnitario?.toString() || "");
      setPrecoCompra(item.precoCompra?.toString() || "");
      setEstoqueMinimo(item.estoqueMinimo?.toString() || "");
      setEstoqueMaximo(item.estoqueMaximo?.toString() || "");
      setLocalizacao(item.localizacao || "");
      setFornecedor(item.fornecedor || "");
      setDataValidade(item.dataValidade ? item.dataValidade.split('T')[0] : "");
      setObservacoes(item.observacoes || "");
    }
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setLoading(true);
    setError("");

    try {
      const data = {
        nomeProduto,
        precoUnitario: parseFloat(precoUnitario),
        precoCompra: parseFloat(precoCompra) || 0,
        estoqueMinimo: parseInt(estoqueMinimo) || 0,
        estoqueMaximo: parseInt(estoqueMaximo) || 0,
        localizacao,
        observacoes
      };

      await estoqueService.update(item.id, data);
      
      // Toast de sucesso
      toast.success(`"${nomeProduto}" atualizado com sucesso!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Erro ao atualizar item:", err);
      const errorMessage = err.response?.data?.message || "Erro ao atualizar item no estoque";
      setError(errorMessage);
      
      //Toast de erro
      toast.error(` ${errorMessage}`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#12121A] rounded-2xl w-full max-w-2xl p-6 border border-[#7B2CFF]/20 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#F5F5FA]">Editar Item no Estoque</h2>
          <button
            onClick={onClose}
            className="text-[#B8B8C8] hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome do Produto - Somente leitura */}
            <div className="col-span-2">
              <label className="block text-[#B8B8C8] mb-2">Nome do Produto</label>
              <input
                type="text"
                value={nomeProduto}
                disabled
                className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none opacity-50 cursor-not-allowed"
              />
            </div>

            {/* Quantidade - Somente leitura */}
            <div>
              <label className="block text-[#B8B8C8] mb-2">Quantidade</label>
              <input
                type="number"
                value={quantidade}
                disabled
                className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none opacity-50 cursor-not-allowed"
              />
            </div>

            {/* Unidade de Medida - Somente leitura */}
            <div>
              <label className="block text-[#B8B8C8] mb-2">Unidade de Medida</label>
              <input
                type="text"
                value={unidadeMedida}
                disabled
                className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none opacity-50 cursor-not-allowed"
              />
            </div>

            {/* Peso/Volume - Somente leitura */}
            <div>
              <label className="block text-[#B8B8C8] mb-2">Peso/Volume</label>
              <input
                type="text"
                value={pesoVolume}
                disabled
                className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none opacity-50 cursor-not-allowed"
              />
            </div>

            {/* Preço Unitário */}
            <div>
              <label className="block text-[#B8B8C8] mb-2">Preço Unitário (R$) *</label>
              <input
                type="number"
                step="0.01"
                value={precoUnitario}
                onChange={(e) => setPrecoUnitario(e.target.value)}
                required
                min="0"
                className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
                placeholder="150.00"
              />
            </div>

            {/* Preço de Compra */}
            <div>
              <label className="block text-[#B8B8C8] mb-2">Preço de Compra (R$)</label>
              <input
                type="number"
                step="0.01"
                value={precoCompra}
                onChange={(e) => setPrecoCompra(e.target.value)}
                min="0"
                className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
                placeholder="120.00"
              />
            </div>

            {/* Estoque Mínimo */}
            <div>
              <label className="block text-[#B8B8C8] mb-2">Estoque Mínimo</label>
              <input
                type="number"
                value={estoqueMinimo}
                onChange={(e) => setEstoqueMinimo(e.target.value)}
                min="0"
                className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
                placeholder="5"
              />
            </div>

            {/* Estoque Máximo */}
            <div>
              <label className="block text-[#B8B8C8] mb-2">Estoque Máximo</label>
              <input
                type="number"
                value={estoqueMaximo}
                onChange={(e) => setEstoqueMaximo(e.target.value)}
                min="0"
                className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
                placeholder="50"
              />
            </div>

            {/* Localização */}
            <div>
              <label className="block text-[#B8B8C8] mb-2">Localização</label>
              <input
                type="text"
                value={localizacao}
                onChange={(e) => setLocalizacao(e.target.value)}
                className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
                placeholder="Ex: Prateleira A1"
              />
            </div>

            {/* Fornecedor */}
            <div>
              <label className="block text-[#B8B8C8] mb-2">Fornecedor</label>
              <input
                type="text"
                value={fornecedor}
                onChange={(e) => setFornecedor(e.target.value)}
                className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
                placeholder="Ex: Distribuidora Premium"
              />
            </div>

            {/* Data de Validade - Somente leitura */}
            <div>
              <label className="block text-[#B8B8C8] mb-2">Data de Validade</label>
              <input
                type="date"
                value={dataValidade}
                disabled
                className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none opacity-50 cursor-not-allowed"
              />
            </div>

            {/* Observações - Linha completa */}
            <div className="col-span-2">
              <label className="block text-[#B8B8C8] mb-2">Observações</label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
                className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
                placeholder="Observações adicionais sobre o item..."
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-xl">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white bg-[#7B2CFF] transition-all hover:bg-[#9A4DFF] disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>
      </div>
    </div>
  );
}