import { useState } from "react";
import { X, User, Plus } from "lucide-react";

interface ModalAdicionarClienteProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (nome: string) => void;
  loading: boolean;
  comandaId: number;
  capacidade: number;
  clientesAtuais: number;
}

export default function ModalAdicionarCliente({
  isOpen,
  onClose,
  onConfirm,
  loading,
  comandaId,
  capacidade,
  clientesAtuais
}: ModalAdicionarClienteProps) {
  const [nome, setNome] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setError("Informe o nome do cliente");
      return;
    }
    if (clientesAtuais >= capacidade) {
      setError(`Capacidade máxima da mesa é ${capacidade} clientes`);
      return;
    }
    setError("");
    onConfirm(nome.trim());
    setNome("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#12121A] rounded-2xl w-full max-w-md p-6 border border-[#7B2CFF]/20">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#7B2CFF]/20 rounded-full">
              <User size={20} className="text-[#7B2CFF]" />
            </div>
            <h2 className="text-xl font-bold text-[#F5F5FA]">Adicionar Cliente</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#B8B8C8] hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 p-3 bg-[#08080D] rounded-xl border border-gray-700">
          <div className="flex justify-between text-sm">
            <span className="text-[#B8B8C8]">Comanda ID: <span className="text-[#F5F5FA]">{comandaId}</span></span>
            <span className="text-[#B8B8C8]">
              Clientes: <span className="text-[#F5F5FA]">{clientesAtuais}/{capacidade}</span>
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#B8B8C8] text-sm mb-1.5">
              Nome do Cliente
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite o nome do cliente"
              className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] text-sm outline-none focus:border-[#7B2CFF]"
              disabled={clientesAtuais >= capacidade}
            />
            {clientesAtuais >= capacidade && (
              <p className="text-red-400 text-xs mt-1">Mesa está com capacidade máxima</p>
            )}
          </div>

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading || clientesAtuais >= capacidade || !nome.trim()}
            className="w-full py-2.5 rounded-xl font-semibold text-white bg-[#7B2CFF] hover:bg-[#9A4DFF] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Adicionando...
              </>
            ) : (
              <>
                <Plus size={16} />
                Adicionar Cliente
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}