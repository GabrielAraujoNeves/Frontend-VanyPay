import { X, AlertTriangle } from "lucide-react";

interface ModalConfirmarDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
}

export default function ModalConfirmarDelete({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  loading = false
}: ModalConfirmarDeleteProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#12121A] rounded-2xl w-full max-w-md p-6 border border-red-500/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-red-500">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#B8B8C8] hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-red-500/10 rounded-full">
            <AlertTriangle size={32} className="text-red-500" />
          </div>
          <p className="text-[#F5F5FA]">{message}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-semibold text-[#B8B8C8] border border-gray-700 hover:bg-[#1a1a24] transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-50"
          >
            {loading ? "Deletando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}