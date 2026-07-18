import { useState, useEffect } from "react";
import { 
  Plus, Trash2, RefreshCw, X, Users, Link2, Unlink, 
  Tag, User, Check, AlertCircle, Sparkles
} from "lucide-react";
import { pulseiraService } from "../service/api";
import type { Pulseira } from "../service/types";
import ModalConfirmarDelete from "./ModalConfirmarDelete";

interface ModalPulseiraProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function ModalCriarPulseira({ isOpen, onClose, onSuccess }: ModalPulseiraProps) {
  const [numeroPulseira, setNumeroPulseira] = useState("");
  const [nomeCliente, setNomeCliente] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validar se contém apenas números
      if (!/^\d+$/.test(numeroPulseira)) {
        setError("Número da pulseira deve conter apenas números");
        setLoading(false);
        return;
      }
      
      await pulseiraService.create({
        numeroPulseira: numeroPulseira.padStart(3, '0'),
        nomeCliente
      });
      onSuccess();
      onClose();
      setNumeroPulseira("");
      setNomeCliente("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao criar pulseira");
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
            <Tag size={24} className="text-[#7B2CFF]" />
            Nova Pulseira
          </h2>
          <button onClick={onClose} className="text-[#B8B8C8] hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#B8B8C8] mb-2">Número da Pulseira</label>
            <input
              type="text"
              value={numeroPulseira}
              onChange={(e) => setNumeroPulseira(e.target.value.replace(/\D/g, '').slice(0, 3))}
              required
              maxLength={3}
              className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
              placeholder="Ex: 001, 002, 003..."
            />
            <p className="text-[#B8B8C8] text-xs mt-1">Número de 3 dígitos (001 - 999)</p>
          </div>

          <div>
            <label className="block text-[#B8B8C8] mb-2">Nome do Cliente</label>
            <input
              type="text"
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
              required
              className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
              placeholder="Ex: João Silva"
            />
          </div>

          {error && <div className="text-red-400 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white bg-[#7B2CFF] hover:bg-[#9A4DFF] disabled:opacity-50"
          >
            {loading ? "Criando..." : "Criar Pulseira"}
          </button>
        </form>
      </div>
    </div>
  );
}

interface ModalAgruparPulseiraProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pulseiras: Pulseira[];
}

function ModalAgruparPulseira({ isOpen, onClose, onSuccess, pulseiras }: ModalAgruparPulseiraProps) {
  const [pulseiraPrincipal, setPulseiraPrincipal] = useState("");
  const [pulseiraSecundaria, setPulseiraSecundaria] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pulseirasAtivas = pulseiras.filter(p => p.isAtivo && !p.pulseiraAgrupadaCom);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pulseiraPrincipal === pulseiraSecundaria) {
      setError("Não é possível agrupar a mesma pulseira");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      await pulseiraService.agrupar({
        pulseiraPrincipal,
        pulseiraSecundaria
      });
      onSuccess();
      onClose();
      setPulseiraPrincipal("");
      setPulseiraSecundaria("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao agrupar pulseiras");
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
            <Link2 size={24} className="text-[#7B2CFF]" />
            Agrupar Pulseiras
          </h2>
          <button onClick={onClose} className="text-[#B8B8C8] hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#B8B8C8] mb-2">Pulseira Principal</label>
            <select
              value={pulseiraPrincipal}
              onChange={(e) => setPulseiraPrincipal(e.target.value)}
              required
              className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
            >
              <option value="">Selecione a pulseira principal</option>
              {pulseirasAtivas.map((p) => (
                <option key={p.id} value={p.numeroPulseira}>
                  {p.numeroPulseira} - {p.nomeCliente}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#B8B8C8] mb-2">Pulseira Secundária</label>
            <select
              value={pulseiraSecundaria}
              onChange={(e) => setPulseiraSecundaria(e.target.value)}
              required
              className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
            >
              <option value="">Selecione a pulseira secundária</option>
              {pulseirasAtivas
                .filter(p => p.numeroPulseira !== pulseiraPrincipal)
                .map((p) => (
                  <option key={p.id} value={p.numeroPulseira}>
                    {p.numeroPulseira} - {p.nomeCliente}
                  </option>
                ))}
            </select>
          </div>

          {error && <div className="text-red-400 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white bg-[#7B2CFF] hover:bg-[#9A4DFF] disabled:opacity-50"
          >
            {loading ? "Agrupando..." : "Agrupar Pulseiras"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PulseirasManager() {
  const [pulseiras, setPulseiras] = useState<Pulseira[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCriarModal, setShowCriarModal] = useState(false);
  const [showAgruparModal, setShowAgruparModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pulseiraSelecionada, setPulseiraSelecionada] = useState<Pulseira | null>(null);
  const [filtro, setFiltro] = useState<"todas" | "ativas" | "agrupadas">("todas");

  const loadPulseiras = async () => {
    setLoading(true);
    try {
      let response;
      if (filtro === "ativas") {
        response = await pulseiraService.listAtivas();
      } else {
        response = await pulseiraService.listAll();
      }
      setPulseiras(response.pulseiras || []);
    } catch (error) {
      console.error("Erro ao carregar pulseiras:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPulseiras();
  }, [filtro]);

  const handleDesagrupar = async (pulseira: Pulseira) => {
    if (!pulseira.pulseiraAgrupadaCom) return;
    try {
      await pulseiraService.desagrupar(pulseira.numeroPulseira);
      await loadPulseiras();
    } catch (error) {
      console.error("Erro ao desagrupar pulseira:", error);
    }
  };

  const handleDesativar = async () => {
    if (!pulseiraSelecionada) return;
    try {
      await pulseiraService.desativar(pulseiraSelecionada.numeroPulseira);
      setShowDeleteModal(false);
      await loadPulseiras();
    } catch (error) {
      console.error("Erro ao desativar pulseira:", error);
    }
  };

  const pulseirasFiltradas = pulseiras.filter(p => {
    if (filtro === "agrupadas") return p.pulseiraAgrupadaCom !== null;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#F5F5FA] flex items-center gap-2">
            <Sparkles size={28} className="text-[#7B2CFF]" />
            Gerenciar Pulseiras
          </h1>
          <p className="text-[#B8B8C8] mt-1">Gerencie as pulseiras para eventos</p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex gap-2 bg-[#12121A] border border-gray-700 rounded-xl p-1">
            <button
              onClick={() => setFiltro("todas")}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${filtro === "todas" ? "bg-[#7B2CFF] text-white" : "text-[#B8B8C8] hover:text-white"}`}
            >
              Todas
            </button>
            <button
              onClick={() => setFiltro("ativas")}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${filtro === "ativas" ? "bg-[#7B2CFF] text-white" : "text-[#B8B8C8] hover:text-white"}`}
            >
              Ativas
            </button>
            <button
              onClick={() => setFiltro("agrupadas")}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${filtro === "agrupadas" ? "bg-[#7B2CFF] text-white" : "text-[#B8B8C8] hover:text-white"}`}
            >
              Agrupadas
            </button>
          </div>
          <button
            onClick={loadPulseiras}
            className="flex items-center gap-2 px-4 py-2 bg-[#12121A] border border-gray-700 rounded-xl text-[#B8B8C8] hover:text-white hover:border-[#7B2CFF] transition-all"
          >
            <RefreshCw size={18} />
            <span>Atualizar</span>
          </button>
          <button
            onClick={() => setShowAgruparModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#7B2CFF]/20 rounded-xl text-[#B47DFF] hover:bg-[#7B2CFF]/30 transition-all"
          >
            <Link2 size={18} />
            <span>Agrupar</span>
          </button>
          <button
            onClick={() => setShowCriarModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#7B2CFF] rounded-xl text-white hover:bg-[#9A4DFF] transition-all"
          >
            <Plus size={18} />
            <span>Nova Pulseira</span>
          </button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#12121A] to-[#0a0a12] rounded-2xl border border-[#7B2CFF]/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#7B2CFF]/10 rounded-full">
              <Tag size={20} className="text-[#7B2CFF]" />
            </div>
            <div>
              <p className="text-[#B8B8C8] text-sm">Total de Pulseiras</p>
              <p className="text-2xl font-bold text-[#F5F5FA]">{pulseiras.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#12121A] to-[#0a0a12] rounded-2xl border border-[#7B2CFF]/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-full">
              <Check size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-[#B8B8C8] text-sm">Pulseiras Ativas</p>
              <p className="text-2xl font-bold text-[#F5F5FA]">{pulseiras.filter(p => p.isAtivo).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#12121A] to-[#0a0a12] rounded-2xl border border-[#7B2CFF]/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-full">
              <Link2 size={20} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-[#B8B8C8] text-sm">Pulseiras Agrupadas</p>
              <p className="text-2xl font-bold text-[#F5F5FA]">{pulseiras.filter(p => p.pulseiraAgrupadaCom).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Pulseiras */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7B2CFF]"></div>
        </div>
      ) : pulseirasFiltradas.length === 0 ? (
        <div className="text-center py-12 bg-[#12121A] rounded-2xl">
          <Tag size={48} className="mx-auto text-[#B8B8C8] mb-4" />
          <p className="text-[#B8B8C8]">Nenhuma pulseira encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pulseirasFiltradas.map((pulseira) => {
            const isAgrupada = pulseira.pulseiraAgrupadaCom !== null;
            const pulseiraPrincipal = pulseiras.find(p => p.numeroPulseira === pulseira.pulseiraAgrupadaCom);
            const pulseirasSecundarias = pulseiras.filter(p => p.pulseiraAgrupadaCom === pulseira.numeroPulseira);
            
            return (
              <div
                key={pulseira.id}
                className={`bg-gradient-to-br from-[#12121A] to-[#0a0a12] rounded-2xl border p-4 transition-all ${
                  !pulseira.isAtivo 
                    ? "border-gray-500/50 opacity-60" 
                    : isAgrupada 
                    ? "border-yellow-500/50" 
                    : pulseirasSecundarias.length > 0
                    ? "border-green-500/50"
                    : "border-[#7B2CFF]/20"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Tag size={18} className="text-[#7B2CFF]" />
                      <h3 className="text-xl font-bold text-[#F5F5FA]">{pulseira.numeroPulseira}</h3>
                    </div>
                    <p className="text-[#B8B8C8] text-sm mt-1 flex items-center gap-1">
                      <User size={12} />
                      {pulseira.nomeCliente}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      pulseira.isAtivo 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-gray-500/20 text-gray-400"
                    }`}>
                      {pulseira.isAtivo ? "ATIVA" : "INATIVA"}
                    </span>
                    {isAgrupada && (
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                        Agrupada com {pulseira.pulseiraAgrupadaCom}
                      </span>
                    )}
                    {pulseirasSecundarias.length > 0 && (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                        Principal de {pulseirasSecundarias.length}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  {pulseira.isAtivo && !isAgrupada && pulseiraPrincipal === undefined && (
                    <button
                      onClick={() => {
                        setPulseiraSelecionada(pulseira);
                        setShowDeleteModal(true);
                      }}
                      className="flex-1 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 size={14} />
                      Desativar
                    </button>
                  )}
                  {isAgrupada && (
                    <button
                      onClick={() => handleDesagrupar(pulseira)}
                      className="flex-1 py-2 rounded-xl bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Unlink size={14} />
                      Desagrupar
                    </button>
                  )}
                  {pulseira.isAtivo && !isAgrupada && pulseiraPrincipal === undefined && pulseirasSecundarias.length === 0 && (
                    <button
                      onClick={() => {
                        setPulseiraSelecionada(pulseira);
                        setShowDeleteModal(true);
                      }}
                      className="flex-1 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 size={14} />
                      Desativar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <ModalCriarPulseira
        isOpen={showCriarModal}
        onClose={() => setShowCriarModal(false)}
        onSuccess={() => {
          setShowCriarModal(false);
          loadPulseiras();
        }}
      />

      <ModalAgruparPulseira
        isOpen={showAgruparModal}
        onClose={() => setShowAgruparModal(false)}
        onSuccess={() => {
          setShowAgruparModal(false);
          loadPulseiras();
        }}
        pulseiras={pulseiras}
      />

      <ModalConfirmarDelete
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPulseiraSelecionada(null);
        }}
        onConfirm={handleDesativar}
        title="Desativar Pulseira"
        message={`Tem certeza que deseja desativar a pulseira ${pulseiraSelecionada?.numeroPulseira} - ${pulseiraSelecionada?.nomeCliente}?`}
      />
    </div>
  );
}