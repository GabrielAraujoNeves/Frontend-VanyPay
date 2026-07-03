import { useState } from "react";
import { X, Plus, Users, User } from "lucide-react";
import { comandaService } from "../service/api";

interface ModalAbrirComandaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mesaId: number | null;
  capacidade: number;
  numeroMesa: number;
}

export default function ModalAbrirComanda({
  isOpen,
  onClose,
  onSuccess,
  mesaId,
  capacidade,
  numeroMesa
}: ModalAbrirComandaProps) {
  const [clientes, setClientes] = useState<string[]>([]);
  const [clienteInput, setClienteInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const adicionarCliente = () => {
    if (clienteInput.trim() && clientes.length < capacidade) {
      setClientes([...clientes, clienteInput.trim()]);
      setClienteInput("");
    }
  };

  const removerCliente = (index: number) => {
    setClientes(clientes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mesaId) {
      setError("Nenhuma mesa selecionada");
      return;
    }
    
    if (clientes.length === 0) {
      setError("Adicione pelo menos um cliente");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await comandaService.abrirMesa(mesaId, clientes);
      onSuccess();
      onClose();
      setClientes([]);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao abrir comanda");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#12121A] rounded-2xl w-full max-w-md p-6 border border-[#7B2CFF]/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#F5F5FA] flex items-center gap-2">
            <Users size={24} className="text-[#7B2CFF]" />
            Abrir Comanda - Mesa {numeroMesa}
          </h2>
          <button onClick={onClose} className="text-[#B8B8C8] hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#B8B8C8] mb-2">
              Clientes <span className="text-[#B8B8C8] text-xs">(max. {capacidade})</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={clienteInput}
                onChange={(e) => setClienteInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarCliente())}
                placeholder="Digite o nome do cliente"
                className="flex-1 bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
              />
              <button
                type="button"
                onClick={adicionarCliente}
                disabled={clientes.length >= capacidade}
                className="px-4 py-2 bg-[#7B2CFF]/20 rounded-xl text-[#B47DFF] hover:bg-[#7B2CFF]/30 disabled:opacity-50 transition-all"
              >
                <Plus size={20} />
              </button>
            </div>
            <p className="text-[#B8B8C8] text-xs mt-1">
              Pressione Enter para adicionar
            </p>
          </div>

          {clientes.length > 0 && (
            <div className="bg-[#08080D] rounded-xl p-3">
              <p className="text-[#B8B8C8] text-sm mb-2 flex items-center gap-2">
                <User size={14} />
                Clientes adicionados ({clientes.length}/{capacidade}):
              </p>
              <div className="space-y-1">
                {clientes.map((cliente, index) => (
                  <div key={index} className="flex justify-between items-center text-[#F5F5FA]">
                    <span className="text-sm">{cliente}</span>
                    <button
                      type="button"
                      onClick={() => removerCliente(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || clientes.length === 0}
            className="w-full py-3 rounded-xl font-semibold text-white bg-green-500 hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Abrindo...
              </span>
            ) : (
              "Abrir Comanda"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}