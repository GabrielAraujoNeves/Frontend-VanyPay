import { useState } from "react";
import { X, AlertTriangle, Trash2, User, Package } from "lucide-react";

interface ModalRemoverItemProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (justificativa: string) => void;
  item: {
    id: number;
    nome: string;
    quantidade: number;
    precoUnitario: number;
    precoTotal: number;
  };
  clienteNome: string;
  loading: boolean;
}

export default function ModalRemoverItem({
  isOpen,
  onClose,
  onConfirm,
  item,
  clienteNome,
  loading
}: ModalRemoverItemProps) {
  const [justificativa, setJustificativa] = useState("");

  const handleConfirm = () => {
    if (justificativa.trim()) {
      onConfirm(justificativa);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#12121A] rounded-2xl w-full max-w-md p-6 border border-red-500/20">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-500/20 rounded-full">
              <Trash2 size={20} className="text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-[#F5F5FA]">Remover Item</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#B8B8C8] hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Aviso */}
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
          <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">
            Esta ação irá remover o item da comanda do cliente. Esta operação não pode ser desfeita.
          </p>
        </div>

        {/* Informações do Item */}
        <div className="mb-4 p-3 bg-[#08080D] rounded-xl border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <User size={14} className="text-[#7B2CFF]" />
            <span className="text-[#B8B8C8] text-sm">Cliente: <span className="text-[#F5F5FA]">{clienteNome}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Package size={14} className="text-[#7B2CFF]" />
            <span className="text-[#B8B8C8] text-sm">Produto: <span className="text-[#F5F5FA]">{item.nome}</span></span>
          </div>
          <div className="flex justify-between mt-2 pt-2 border-t border-gray-700">
            <span className="text-[#B8B8C8] text-sm">Quantidade: <span className="text-[#F5F5FA]">{item.quantidade}</span></span>
            <span className="text-[#B8B8C8] text-sm">Total: <span className="text-red-400 font-semibold">R$ {item.precoTotal.toFixed(2)}</span></span>
          </div>
        </div>

        {/* Justificativa */}
        <div className="mb-4">
          <label className="block text-[#B8B8C8] text-sm mb-1.5">
            Justificativa para remoção <span className="text-red-400">*</span>
          </label>
          <textarea
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            placeholder="Ex: Cliente pediu para cancelar o produto, não gostou do sabor."
            rows={3}
            className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] text-sm outline-none focus:border-[#7B2CFF] resize-none"
          />
          <p className="text-[#B8B8C8] text-xs mt-1">Descreva o motivo da remoção do item</p>
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-[#B8B8C8] border border-gray-700 hover:bg-[#1a1a24] transition-all text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!justificativa.trim() || loading}
            className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Removendo...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Remover Item
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}