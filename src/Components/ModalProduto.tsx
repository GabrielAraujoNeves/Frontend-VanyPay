import { useState } from "react";
import { X } from "lucide-react";
import { produtoService } from "../service/api";
import type { Categoria } from "../service/types";

interface ModalProdutoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categorias: Categoria[];
}

export default function ModalProduto({ isOpen, onClose, onSuccess, categorias }: ModalProdutoProps) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await produtoService.create({
        nome,
        descricao,
        preco: parseFloat(preco),
        quantidade: parseInt(quantidade),
        categoriaId: parseInt(categoriaId)
      });
      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      setError("Erro ao criar produto");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNome("");
    setDescricao("");
    setPreco("");
    setQuantidade("");
    setCategoriaId("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#12121A] rounded-2xl w-full max-w-md p-6 border border-[#7B2CFF]/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#F5F5FA]">Novo Produto</h2>
          <button
            onClick={onClose}
            className="text-[#B8B8C8] hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#B8B8C8] mb-2">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF] focus:ring-2 focus:ring-[#B47DFF]"
              placeholder="Ex: Moscow Mule"
            />
          </div>

          <div>
            <label className="block text-[#B8B8C8] mb-2">Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
              rows={3}
              className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF] focus:ring-2 focus:ring-[#B47DFF]"
              placeholder="Descrição do produto"
            />
          </div>

          <div>
            <label className="block text-[#B8B8C8] mb-2">Preço (R$)</label>
            <input
              type="number"
              step="0.01"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              required
              className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF] focus:ring-2 focus:ring-[#B47DFF]"
              placeholder="27.90"
            />
          </div>

          <div>
            <label className="block text-[#B8B8C8] mb-2">Quantidade</label>
            <input
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              required
              className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF] focus:ring-2 focus:ring-[#B47DFF]"
              placeholder="45"
            />
          </div>

          <div>
            <label className="block text-[#B8B8C8] mb-2">Categoria</label>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              required
              className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF] focus:ring-2 focus:ring-[#B47DFF]"
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white bg-[#7B2CFF] transition-all hover:bg-[#9A4DFF] disabled:opacity-50"
          >
            {loading ? "Criando..." : "Criar Produto"}
          </button>
        </form>
      </div>
    </div>
  );
}