import { useState, useEffect } from "react";
import { 
  Plus, Trash2, RefreshCw, X, Link2, Unlink, 
  CreditCard, User, Check, Wallet, Sparkles, Search, DoorOpen
} from "lucide-react";
import { cartaoService, comandaService } from "../service/api";
import type { Cartao, Comanda } from "../service/types";
import ModalConfirmarDelete from "./ModalConfirmarDelete";

interface ModalCartaoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function ModalCriarCartao({ isOpen, onClose, onSuccess }: ModalCartaoProps) {
  const [numeroCartao, setNumeroCartao] = useState("");
  const [nomeCliente, setNomeCliente] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await cartaoService.create({
        numeroCartao: numeroCartao.padStart(4, '0'),
        nomeCliente
      });
      onSuccess();
      onClose();
      setNumeroCartao("");
      setNomeCliente("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao criar cartão");
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
            <CreditCard size={24} className="text-[#7B2CFF]" />
            Novo Cartão
          </h2>
          <button onClick={onClose} className="text-[#B8B8C8] hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#B8B8C8] mb-2">Número do Cartão</label>
            <input
              type="text"
              value={numeroCartao}
              onChange={(e) => setNumeroCartao(e.target.value.replace(/\D/g, '').slice(0, 4))}
              required
              maxLength={4}
              className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
              placeholder="Ex: 1001, 1002, 1003..."
            />
            <p className="text-[#B8B8C8] text-xs mt-1">Número de 4 dígitos (1000 - 9999)</p>
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
            {loading ? "Criando..." : "Criar Cartão"}
          </button>
        </form>
      </div>
    </div>
  );
}

interface ModalVincularCartaoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cartoes: Cartao[];
}

function ModalVincularCartao({ isOpen, onClose, onSuccess, cartoes }: ModalVincularCartaoProps) {
  const [cartaoPrincipal, setCartaoPrincipal] = useState("");
  const [cartaoSecundario, setCartaoSecundario] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cartoesNaoVinculados = cartoes.filter(c => 
    c.isAtivo && !c.cartaoVinculado && c.numeroCartao !== cartaoPrincipal
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartaoPrincipal === cartaoSecundario) {
      setError("Não é possível vincular o mesmo cartão");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      await cartaoService.vincular({
        cartaoPrincipal,
        cartaoSecundario
      });
      onSuccess();
      onClose();
      setCartaoPrincipal("");
      setCartaoSecundario("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao vincular cartões");
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
            Vincular Cartões
          </h2>
          <button onClick={onClose} className="text-[#B8B8C8] hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#B8B8C8] mb-2">Cartão Principal</label>
            <select
              value={cartaoPrincipal}
              onChange={(e) => setCartaoPrincipal(e.target.value)}
              required
              className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
            >
              <option value="">Selecione o cartão principal</option>
              {cartoes.filter(c => c.isAtivo && !c.cartaoVinculado).map((c) => (
                <option key={c.id} value={c.numeroCartao}>
                  {c.numeroCartao} - {c.nomeCliente}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#B8B8C8] mb-2">Cartão Secundário</label>
            <select
              value={cartaoSecundario}
              onChange={(e) => setCartaoSecundario(e.target.value)}
              required
              className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
            >
              <option value="">Selecione o cartão secundário</option>
              {cartoesNaoVinculados.map((c) => (
                <option key={c.id} value={c.numeroCartao}>
                  {c.numeroCartao} - {c.nomeCliente}
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
            {loading ? "Vinculando..." : "Vincular Cartões"}
          </button>
        </form>
      </div>
    </div>
  );
}

interface ModalAbrirComandaCartaoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cartao: Cartao | null;
}

function ModalAbrirComandaCartao({ isOpen, onClose, onSuccess, cartao }: ModalAbrirComandaCartaoProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cartao) return;
    
    setLoading(true);
    setError("");

    try {
      await cartaoService.abrirComanda(cartao.numeroCartao, cartao.nomeCliente);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao abrir comanda");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !cartao) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#12121A] rounded-2xl w-full max-w-md p-6 border border-[#7B2CFF]/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#F5F5FA] flex items-center gap-2">
            <DoorOpen size={24} className="text-green-500" />
            Abrir Comanda
          </h2>
          <button onClick={onClose} className="text-[#B8B8C8] hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-[#08080D] rounded-xl p-4">
            <p className="text-[#B8B8C8] text-sm">Cartão</p>
            <p className="text-2xl font-bold text-[#F5F5FA]">{cartao.numeroCartao}</p>
            <p className="text-[#B8B8C8] mt-2">Cliente: {cartao.nomeCliente}</p>
          </div>

          {error && <div className="text-red-400 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white bg-green-500 hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? "Abrindo..." : "Confirmar Abertura"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CartoesManager() {
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCriarModal, setShowCriarModal] = useState(false);
  const [showVincularModal, setShowVincularModal] = useState(false);
  const [showAbrirModal, setShowAbrirModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cartaoSelecionado, setCartaoSelecionado] = useState<Cartao | null>(null);
  const [comandaInfo, setComandaInfo] = useState<Comanda | null>(null);
  const [filtro, setFiltro] = useState<"todas" | "ativas" | "vinculadas">("todas");

  const loadCartoes = async () => {
    setLoading(true);
    try {
      const response = await cartaoService.listAll();
      setCartoes(response.cartoes || []);
    } catch (error) {
      console.error("Erro ao carregar cartões:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCartoes();
  }, []);

  const handleDesvincular = async (cartao: Cartao) => {
    if (!cartao.cartaoVinculado) return;
    try {
      await cartaoService.desvincular(cartao.numeroCartao);
      await loadCartoes();
    } catch (error) {
      console.error("Erro ao desvincular cartão:", error);
    }
  };

  const handleDesativar = async () => {
    if (!cartaoSelecionado) return;
    try {
      await cartaoService.desativar(cartaoSelecionado.numeroCartao);
      setShowDeleteModal(false);
      await loadCartoes();
    } catch (error) {
      console.error("Erro ao desativar cartão:", error);
    }
  };

  const handleBuscarComanda = async (cartao: Cartao) => {
    try {
      const comanda = await cartaoService.buscarComanda(cartao.numeroCartao);
      setComandaInfo(comanda);
      setTimeout(() => {
        setComandaInfo(null);
      }, 3000);
    } catch (error) {
      console.error("Erro ao buscar comanda:", error);
    }
  };

  const cartoesFiltrados = cartoes.filter(c => {
    if (filtro === "vinculadas") return c.cartaoVinculado !== null;
    if (filtro === "ativas") return c.isAtivo;
    return true;
  });

  const cartoesPrincipais = cartoes.filter(c => 
    c.isAtivo && !c.cartaoVinculado && !cartoes.some(v => v.cartaoVinculado === c.numeroCartao)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#F5F5FA] flex items-center gap-2">
            <Wallet size={28} className="text-[#7B2CFF]" />
            Gerenciar Cartões
          </h1>
          <p className="text-[#B8B8C8] mt-1">Gerencie os cartões para eventos</p>
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
              onClick={() => setFiltro("vinculadas")}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${filtro === "vinculadas" ? "bg-[#7B2CFF] text-white" : "text-[#B8B8C8] hover:text-white"}`}
            >
              Vinculadas
            </button>
          </div>
          <button
            onClick={loadCartoes}
            className="flex items-center gap-2 px-4 py-2 bg-[#12121A] border border-gray-700 rounded-xl text-[#B8B8C8] hover:text-white hover:border-[#7B2CFF] transition-all"
          >
            <RefreshCw size={18} />
            <span>Atualizar</span>
          </button>
          <button
            onClick={() => setShowVincularModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#7B2CFF]/20 rounded-xl text-[#B47DFF] hover:bg-[#7B2CFF]/30 transition-all"
          >
            <Link2 size={18} />
            <span>Vincular</span>
          </button>
          <button
            onClick={() => setShowCriarModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#7B2CFF] rounded-xl text-white hover:bg-[#9A4DFF] transition-all"
          >
            <Plus size={18} />
            <span>Novo Cartão</span>
          </button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-[#12121A] to-[#0a0a12] rounded-2xl border border-[#7B2CFF]/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#7B2CFF]/10 rounded-full">
              <CreditCard size={20} className="text-[#7B2CFF]" />
            </div>
            <div>
              <p className="text-[#B8B8C8] text-sm">Total de Cartões</p>
              <p className="text-2xl font-bold text-[#F5F5FA]">{cartoes.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#12121A] to-[#0a0a12] rounded-2xl border border-[#7B2CFF]/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-full">
              <Check size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-[#B8B8C8] text-sm">Cartões Ativos</p>
              <p className="text-2xl font-bold text-[#F5F5FA]">{cartoes.filter(c => c.isAtivo).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#12121A] to-[#0a0a12] rounded-2xl border border-[#7B2CFF]/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-full">
              <Link2 size={20} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-[#B8B8C8] text-sm">Cartões Vinculados</p>
              <p className="text-2xl font-bold text-[#F5F5FA]">{cartoes.filter(c => c.cartaoVinculado).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#12121A] to-[#0a0a12] rounded-2xl border border-[#7B2CFF]/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-full">
              <Wallet size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-[#B8B8C8] text-sm">Grupos</p>
              <p className="text-2xl font-bold text-[#F5F5FA]">{cartoesPrincipais.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comanda Info Toast */}
      {comandaInfo && (
        <div className="fixed bottom-4 right-4 bg-green-500/20 border border-green-500/30 rounded-xl p-4 z-50 animate-slide-up">
          <div className="flex items-center gap-3">
            <Check size={20} className="text-green-400" />
            <div>
              <p className="text-green-400 font-semibold">Comanda {comandaInfo.numeroComanda}</p>
              <p className="text-[#B8B8C8] text-sm">Status: {comandaInfo.status}</p>
              <p className="text-[#B8B8C8] text-sm">Valor: R$ {comandaInfo.valorTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Cartões */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7B2CFF]"></div>
        </div>
      ) : cartoesFiltrados.length === 0 ? (
        <div className="text-center py-12 bg-[#12121A] rounded-2xl">
          <CreditCard size={48} className="mx-auto text-[#B8B8C8] mb-4" />
          <p className="text-[#B8B8C8]">Nenhum cartão encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cartoesFiltrados.map((cartao) => {
            const isVinculado = cartao.cartaoVinculado !== null;
            const isPrincipal = cartoes.some(c => c.cartaoVinculado === cartao.numeroCartao);
            const cartoesVinculados = cartoes.filter(c => c.cartaoVinculado === cartao.numeroCartao);
            
            return (
              <div
                key={cartao.id}
                className={`bg-gradient-to-br from-[#12121A] to-[#0a0a12] rounded-2xl border p-4 transition-all ${
                  !cartao.isAtivo 
                    ? "border-gray-500/50 opacity-60" 
                    : isVinculado 
                    ? "border-yellow-500/50" 
                    : isPrincipal
                    ? "border-green-500/50"
                    : "border-[#7B2CFF]/20"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <CreditCard size={18} className="text-[#7B2CFF]" />
                      <h3 className="text-xl font-bold text-[#F5F5FA]">{cartao.numeroCartao}</h3>
                    </div>
                    <p className="text-[#B8B8C8] text-sm mt-1 flex items-center gap-1">
                      <User size={12} />
                      {cartao.nomeCliente}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      cartao.isAtivo 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-gray-500/20 text-gray-400"
                    }`}>
                      {cartao.isAtivo ? "ATIVO" : "INATIVO"}
                    </span>
                    {isVinculado && (
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                        Vinculado a {cartao.cartaoVinculado}
                      </span>
                    )}
                    {isPrincipal && (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                        Principal de {cartoesVinculados.length}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  {cartao.isAtivo && (
                    <button
                      onClick={() => {
                        setCartaoSelecionado(cartao);
                        setShowAbrirModal(true);
                      }}
                      className="flex-1 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                    >
                      <DoorOpen size={14} />
                      Abrir Comanda
                    </button>
                  )}
                  {cartao.isAtivo && isVinculado && (
                    <button
                      onClick={() => handleDesvincular(cartao)}
                      className="flex-1 py-2 rounded-xl bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Unlink size={14} />
                      Desvincular
                    </button>
                  )}
                  {cartao.isAtivo && !isVinculado && !isPrincipal && (
                    <button
                      onClick={() => {
                        setCartaoSelecionado(cartao);
                        setShowDeleteModal(true);
                      }}
                      className="flex-1 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 size={14} />
                      Desativar
                    </button>
                  )}
                  <button
                    onClick={() => handleBuscarComanda(cartao)}
                    className="px-4 py-2 rounded-xl bg-[#7B2CFF]/20 text-[#B47DFF] hover:bg-[#7B2CFF]/30 transition-all"
                    title="Ver comanda"
                  >
                    <Search size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <ModalCriarCartao
        isOpen={showCriarModal}
        onClose={() => setShowCriarModal(false)}
        onSuccess={() => {
          setShowCriarModal(false);
          loadCartoes();
        }}
      />

      <ModalVincularCartao
        isOpen={showVincularModal}
        onClose={() => setShowVincularModal(false)}
        onSuccess={() => {
          setShowVincularModal(false);
          loadCartoes();
        }}
        cartoes={cartoes}
      />

      <ModalAbrirComandaCartao
        isOpen={showAbrirModal}
        onClose={() => {
          setShowAbrirModal(false);
          setCartaoSelecionado(null);
        }}
        onSuccess={() => {
          setShowAbrirModal(false);
          setCartaoSelecionado(null);
          loadCartoes();
        }}
        cartao={cartaoSelecionado}
      />

      <ModalConfirmarDelete
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCartaoSelecionado(null);
        }}
        onConfirm={handleDesativar}
        title="Desativar Cartão"
        message={`Tem certeza que deseja desativar o cartão ${cartaoSelecionado?.numeroCartao} - ${cartaoSelecionado?.nomeCliente}?`}
      />
    </div>
  );
}