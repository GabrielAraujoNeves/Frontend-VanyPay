import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { categoriaService } from "../service/api";

interface ModalCategoriaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalCategoria({ isOpen, onClose, onSuccess }: ModalCategoriaProps) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    await categoriaService.create({ nome, descricao });
    setNome("");
    setDescricao("");
    setError("");
    onSuccess(); // Chama onSuccess antes de fechar
    onClose(); // Fecha o modal
  } catch (err: any) {
    console.error(err);
    
    if (err.response?.data?.error === "Categoria ja existe nesta empresa") {
      setError(`A categoria "${nome}" já existe. Por favor, use um nome diferente.`);
    } else if (err.response?.data?.error) {
      setError(err.response.data.error);
    } else {
      setError("Erro ao criar categoria. Tente novamente.");
    }
  } finally {
    setLoading(false);
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#12121A] rounded-2xl w-full max-w-md p-6 border border-[#7B2CFF]/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#F5F5FA]">Nova Categoria</h2>
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
              onChange={(e) => {
                setNome(e.target.value);
                setError(""); // Limpa o erro quando o usuário digita
              }}
              required
              className={`
                w-full bg-[#08080D] border rounded-xl px-4 py-3 text-[#F5F5FA] 
                outline-none transition-all focus:ring-2
                ${error && error.includes("já existe") 
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                  : "border-gray-700 focus:border-[#7B2CFF] focus:ring-[#B47DFF]"
                }
              `}
              placeholder="Ex: Drinks Clássicos"
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
              placeholder="Descrição da categoria"
            />
          </div>

          {error && (
            <div className={`
              flex items-start gap-2 p-3 rounded-xl text-sm
              ${error.includes("já existe") 
                ? "bg-red-500/10 border border-red-500/20 text-red-400" 
                : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"
              }
            `}>
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
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