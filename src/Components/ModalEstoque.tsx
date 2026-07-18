import { useState } from "react";
import { X } from "lucide-react";
import { estoqueService } from "../service/api";

interface ModalEstoqueProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalEstoque({ isOpen, onClose, onSuccess }: ModalEstoqueProps) {
  const [nomeProduto, setNomeProduto] = useState("");
  const [categoria, setCategoria] = useState("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = {
        nomeProduto,
        categoria,
        quantidade: parseInt(quantidade),
        unidadeMedida,
        pesoVolume: parseFloat(pesoVolume) || 0,
        precoUnitario: parseFloat(precoUnitario),
        precoCompra: parseFloat(precoCompra),
        estoqueMinimo: parseInt(estoqueMinimo) || 0,
        estoqueMaximo: parseInt(estoqueMaximo) || 0,
        localizacao,
        fornecedor,
        dataValidade: dataValidade ? `${dataValidade}T23:59:59` : null,
        observacoes
      };

      await estoqueService.create(data);
      onSuccess();
      onClose();
      resetForm();
    } catch (err: any) {
      console.error("Erro ao criar item:", err);
      setError(err.response?.data?.message || "Erro ao criar item no estoque");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNomeProduto("");
    setCategoria("");
    setQuantidade("");
    setUnidadeMedida("UN");
    setPesoVolume("");
    setPrecoUnitario("");
    setPrecoCompra("");
    setEstoqueMinimo("");
    setEstoqueMaximo("");
    setLocalizacao("");
    setFornecedor("");
    setDataValidade("");
    setObservacoes("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#12121A] rounded-2xl w-full max-w-2xl p-6 border border-[#7B2CFF]/20 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#F5F5FA]">Novo Item no Estoque</h2>
          <button
            onClick={onClose}
            className="text-[#B8B8C8] hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome do Produto */}
            <div className="col-span-2">
              <label className="block text-[#B8B8C8] mb-2">Nome do Produto *</label>
              <input
                type="text"
                value={nomeProduto}
                onChange={(e) => setNomeProduto(e.target.value)}
                required
                className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
                placeholder="Ex: Whisky Jack Daniels"
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-[#B8B8C8] mb-2">Categoria *</label>
              <input
                type="text"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                required
                className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
                placeholder="Ex: Bebidas Alcoólicas"
              />
            </div>

            {/* Unidade de Medida */}
            <div>
              <label className="block text-[#B8B8C8] mb-2">Unidade de Medida *</label>
              <select
                value={unidadeMedida}
                onChange={(e) => setUnidadeMedida(e.target.value)}
                required
                className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
              >
                <option value="UN">Unidade (UN)</option>
                <option value="KG">Quilograma (KG)</option>
                <option value="G">Grama (G)</option>
                <option value="L">Litro (L)</option>
                <option value="ML">Mililitro (ML)</option>
                <option value="CX">Caixa (CX)</option>
                <option value="PCT">Pacote (PCT)</option>
              </select>
            </div>

            {/* Quantidade */}
            <div>
              <label className="block text-[#B8B8C8] mb-2">Quantidade *</label>
              <input
                type="number"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                required
                min="0"
                className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
                placeholder="20"
              />
            </div>

            {/* Peso/Volume */}
            <div>
              <label className="block text-[#B8B8C8] mb-2">Peso/Volume</label>
              <input
                type="number"
                step="0.01"
                value={pesoVolume}
                onChange={(e) => setPesoVolume(e.target.value)}
                className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
                placeholder="1.0"
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

            {/* Data de Validade */}
            <div>
              <label className="block text-[#B8B8C8] mb-2">Data de Validade</label>
              <input
                type="date"
                value={dataValidade}
                onChange={(e) => setDataValidade(e.target.value)}
                className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
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
            {loading ? "Criando..." : "Adicionar ao Estoque"}
          </button>
        </form>
      </div>
    </div>
  );
}