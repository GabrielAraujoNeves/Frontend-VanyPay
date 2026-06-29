import { useState, useEffect } from "react";
import { Plus, Trash2, Users, Armchair, RefreshCw, X, DoorOpen, Eye } from "lucide-react";
import { mesaService, comandaService } from "../service/api";
import type { Mesa } from "../service/types";
import ModalConfirmarDelete from "./ModalConfirmarDelete";
import MesaDetalhesModal from "./MesaDetalhesModal";

interface ModalMesaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mesa?: Mesa | null;
}

function ModalMesa({ isOpen, onClose, onSuccess, mesa }: ModalMesaProps) {
  const [numeroMesa, setNumeroMesa] = useState("");
  const [capacidade, setCapacidade] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mesa) {
      setNumeroMesa(mesa.numeroMesa.toString());
      setCapacidade(mesa.capacidade.toString());
    } else {
      setNumeroMesa("");
      setCapacidade("");
    }
  }, [mesa]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await mesaService.create({
        numeroMesa: parseInt(numeroMesa),
        capacidade: parseInt(capacidade)
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao criar mesa");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#12121A] rounded-2xl w-full max-w-md p-6 border border-[#7B2CFF]/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#F5F5FA]">
            {mesa ? "Editar Mesa" : "Nova Mesa"}
          </h2>
          <button onClick={onClose} className="text-[#B8B8C8] hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#B8B8C8] mb-2">Número da Mesa</label>
            <input
              type="number"
              value={numeroMesa}
              onChange={(e) => setNumeroMesa(e.target.value)}
              required
              min="1"
              className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
              placeholder="Ex: 35"
            />
          </div>

          <div>
            <label className="block text-[#B8B8C8] mb-2">Capacidade (lugares)</label>
            <input
              type="number"
              value={capacidade}
              onChange={(e) => setCapacidade(e.target.value)}
              required
              min="1"
              max="20"
              className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
              placeholder="Ex: 4"
            />
          </div>

          {error && <div className="text-red-400 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white bg-[#7B2CFF] hover:bg-[#9A4DFF] disabled:opacity-50"
          >
            {loading ? "Salvando..." : mesa ? "Atualizar" : "Criar Mesa"}
          </button>
        </form>
      </div>
    </div>
  );
}

interface ModalAbrirComandaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mesa: Mesa | null;
}

function ModalAbrirComanda({ isOpen, onClose, onSuccess, mesa }: ModalAbrirComandaProps) {
  const [clientes, setClientes] = useState<string[]>([]);
  const [clienteInput, setClienteInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const adicionarCliente = () => {
    if (clienteInput.trim() && clientes.length < (mesa?.capacidade || 4)) {
      setClientes([...clientes, clienteInput.trim()]);
      setClienteInput("");
    }
  };

  const removerCliente = (index: number) => {
    setClientes(clientes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mesa) return;
    
    setLoading(true);
    setError("");

    try {
      await comandaService.abrirMesa(mesa.id, clientes);
      onSuccess();
      onClose();
      setClientes([]);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao abrir comanda");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !mesa) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#12121A] rounded-2xl w-full max-w-md p-6 border border-[#7B2CFF]/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#F5F5FA]">
            Abrir Comanda - Mesa {mesa.numeroMesa}
          </h2>
          <button onClick={onClose} className="text-[#B8B8C8] hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#B8B8C8] mb-2">
              Clientes (max. {mesa.capacidade})
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={clienteInput}
                onChange={(e) => setClienteInput(e.target.value)}
                placeholder="Nome do cliente"
                className="flex-1 bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
              />
              <button
                type="button"
                onClick={adicionarCliente}
                disabled={clientes.length >= mesa.capacidade}
                className="px-4 py-2 bg-[#7B2CFF]/20 rounded-xl text-[#B47DFF] hover:bg-[#7B2CFF]/30 disabled:opacity-50"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {clientes.length > 0 && (
            <div className="bg-[#08080D] rounded-xl p-3">
              <p className="text-[#B8B8C8] text-sm mb-2">Clientes adicionados:</p>
              <div className="space-y-1">
                {clientes.map((cliente, index) => (
                  <div key={index} className="flex justify-between items-center text-[#F5F5FA]">
                    <span>{cliente}</span>
                    <button
                      type="button"
                      onClick={() => removerCliente(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <div className="text-red-400 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading || clientes.length === 0}
            className="w-full py-3 rounded-xl font-semibold text-white bg-green-500 hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? "Abrindo..." : "Abrir Comanda"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function MesasManager() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAbrirModal, setShowAbrirModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [mesaSelecionada, setMesaSelecionada] = useState<Mesa | null>(null);
  const [filtro, setFiltro] = useState<"todas" | "ocupadas" | "livres">("todas");

  const loadMesas = async () => {
    setLoading(true);
    try {
      let response;
      if (filtro === "ocupadas") {
        response = await mesaService.listOcupadas();
      } else {
        response = await mesaService.listAll();
      }
      setMesas(response.mesas || []);
    } catch (error) {
      console.error("Erro ao carregar mesas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMesas();
  }, [filtro]);

  const handleLiberarMesa = async (mesa: Mesa) => {
    try {
      await mesaService.liberar(mesa.id);
      await loadMesas();
    } catch (error) {
      console.error("Erro ao liberar mesa:", error);
    }
  };

  const handleDeleteMesa = async () => {
    if (!mesaSelecionada) return;
    try {
      await mesaService.delete(mesaSelecionada.id);
      setShowDeleteModal(false);
      await loadMesas();
    } catch (error) {
      console.error("Erro ao deletar mesa:", error);
    }
  };

  const handleAbrirDetalhes = (mesa: Mesa) => {
    setMesaSelecionada(mesa);
    setShowDetalhesModal(true);
  };

  const mesasFiltradas = filtro === "livres" 
    ? mesas.filter(m => !m.isOcupada)
    : mesas;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#F5F5FA] flex items-center gap-2">
            <Armchair size={28} className="text-[#7B2CFF]" />
            Gerenciar Mesas
          </h1>
          <p className="text-[#B8B8C8] mt-1">Gerencie as mesas do seu estabelecimento</p>
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
              onClick={() => setFiltro("ocupadas")}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${filtro === "ocupadas" ? "bg-[#7B2CFF] text-white" : "text-[#B8B8C8] hover:text-white"}`}
            >
              Ocupadas
            </button>
            <button
              onClick={() => setFiltro("livres")}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${filtro === "livres" ? "bg-[#7B2CFF] text-white" : "text-[#B8B8C8] hover:text-white"}`}
            >
              Livres
            </button>
          </div>
          <button
            onClick={loadMesas}
            className="flex items-center gap-2 px-4 py-2 bg-[#12121A] border border-gray-700 rounded-xl text-[#B8B8C8] hover:text-white hover:border-[#7B2CFF] transition-all"
          >
            <RefreshCw size={18} />
            <span>Atualizar</span>
          </button>
          <button
            onClick={() => {
              setMesaSelecionada(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#7B2CFF] rounded-xl text-white hover:bg-[#9A4DFF] transition-all"
          >
            <Plus size={18} />
            <span>Nova Mesa</span>
          </button>
        </div>
      </div>

      {/* Lista de Mesas */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7B2CFF]"></div>
        </div>
      ) : mesasFiltradas.length === 0 ? (
        <div className="text-center py-12 bg-[#12121A] rounded-2xl">
          <Armchair size={48} className="mx-auto text-[#B8B8C8] mb-4" />
          <p className="text-[#B8B8C8]">Nenhuma mesa encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mesasFiltradas.map((mesa) => (
            <div
              key={mesa.id}
              className={`bg-gradient-to-br from-[#12121A] to-[#0a0a12] rounded-2xl border p-6 transition-all ${
                mesa.isOcupada ? "border-red-500/50" : "border-[#7B2CFF]/20"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-2xl font-bold text-[#F5F5FA]">Mesa {mesa.numeroMesa}</h3>
                  <p className="text-[#B8B8C8] text-sm">Capacidade: {mesa.capacidade} pessoas</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  mesa.isOcupada 
                    ? "bg-red-500/20 text-red-400" 
                    : "bg-green-500/20 text-green-400"
                }`}>
                  {mesa.isOcupada ? "OCUPADA" : "LIVRE"}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                {mesa.isOcupada ? (
                  <>
                    <button
                      onClick={() => handleAbrirDetalhes(mesa)}
                      className="flex-1 py-2 rounded-xl bg-[#7B2CFF]/20 text-[#B47DFF] hover:bg-[#7B2CFF]/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Eye size={16} />
                      Ver Detalhes
                    </button>
                    <button
                      onClick={() => handleLiberarMesa(mesa)}
                      className="flex-1 py-2 rounded-xl bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <DoorOpen size={16} />
                      Liberar Mesa
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setMesaSelecionada(mesa);
                      setShowAbrirModal(true);
                    }}
                    className="flex-1 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                  >
                    <DoorOpen size={16} />
                    Abrir Comanda
                  </button>
                )}
                <button
                  onClick={() => {
                    setMesaSelecionada(mesa);
                    setShowDeleteModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <ModalMesa
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          loadMesas();
        }}
        mesa={null}
      />

      <ModalAbrirComanda
        isOpen={showAbrirModal}
        onClose={() => {
          setShowAbrirModal(false);
          setMesaSelecionada(null);
        }}
        onSuccess={() => {
          setShowAbrirModal(false);
          setMesaSelecionada(null);
          loadMesas();
        }}
        mesa={mesaSelecionada}
      />

      <ModalConfirmarDelete
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setMesaSelecionada(null);
        }}
        onConfirm={handleDeleteMesa}
        title="Deletar Mesa"
        message={`Tem certeza que deseja deletar a Mesa ${mesaSelecionada?.numeroMesa}? Esta ação não pode ser desfeita.`}
      />

      <MesaDetalhesModal
        isOpen={showDetalhesModal}
        onClose={() => {
          setShowDetalhesModal(false);
          setMesaSelecionada(null);
        }}
        mesa={mesaSelecionada}
      />
    </div>
  );
}