import { useState } from "react";
import { X } from "lucide-react";
import { toast } from 'react-toastify';
import { categoriaEstoqueService } from "../services";

interface ModalCategoriaEstoqueProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalCategoriaEstoque({ isOpen, onClose, onSuccess }: ModalCategoriaEstoqueProps) {
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await categoriaEstoqueService.create({ nome });
      
      toast.success(`Categoria "${nome}" criada com sucesso!`, {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });
      
      onSuccess();
      onClose();
      setNome("");
    } catch (err: any) {
      console.error("Erro ao criar categoria:", err);
      const errorMessage = err.response?.data?.message || "Erro ao criar categoria";
      setError(errorMessage);
      
      toast.error(`${errorMessage}`, {
        position: "top-right",
        autoClose: 4000,
        theme: "dark",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#12121A] rounded-2xl w-full max-w-md p-6 border border-[#7B2CFF]/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#F5F5FA]">Nova Categoria de Estoque</h2>
          <button
            onClick={onClose}
            className="text-[#B8B8C8] hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#B8B8C8] mb-2">Nome da Categoria *</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
              placeholder="Ex: Bebidas, Carnes, etc"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-xl">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white bg-[#7B2CFF] transition-all hover:bg-[#9A4DFF] disabled:opacity-50"
          >
            {loading ? "Criando..." : "Criar Categoria"}
          </button>
        </form>
      </div>
    </div>
  );
}