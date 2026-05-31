import { useState, useEffect } from "react";
import { Clock, Percent, Calendar, Play, StopCircle, Save, RefreshCw, ShoppingBag, Check } from "lucide-react";
import { happyHourService, produtoService } from "../service/api";

import type { HappyHourProduct, Produto } from "../service/types";

export default function HappyHourManager() {
  const [discountPercent, setDiscountPercent] = useState(50);
  const [startTime, setStartTime] = useState("17:00:00");
  const [endTime, setEndTime] = useState("20:00:00");
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [allProducts, setAllProducts] = useState<Produto[]>([]);
  const [happyHourProducts, setHappyHourProducts] = useState<HappyHourProduct[]>([]);
  const [isHappyHourActive, setIsHappyHourActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Carregar produtos disponíveis e status do Happy Hour
  const loadData = async () => {
    setLoadingProducts(true);
    try {
      // Carregar produtos disponíveis
      const produtosResponse = await produtoService.listAll();
      setAllProducts(produtosResponse.produtos);

      // Carregar status do Happy Hour
      const happyHourResponse = await happyHourService.getProducts();
      setHappyHourProducts(happyHourResponse.produtos);
      setIsHappyHourActive(happyHourResponse.isHappyHourActive);

      // Pré-selecionar produtos que já estão no Happy Hour
      const activeProductIds = happyHourResponse.produtos
        .filter(p => p.isInHappyHour)
        .map(p => p.id);
      setSelectedProducts(activeProductIds);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setMessage({ type: 'error', text: 'Erro ao carregar dados do Happy Hour' });
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Alternar seleção de produto
  const toggleProduct = (productId: number) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Selecionar todos
  const selectAll = () => {
    setSelectedProducts(allProducts.map(p => p.id));
  };

  // Desmarcar todos
  const clearAll = () => {
    setSelectedProducts([]);
  };

  // Ativar/Configurar Happy Hour
  const handleActivate = async () => {
    if (selectedProducts.length === 0) {
      setMessage({ type: 'error', text: 'Selecione pelo menos um produto para o Happy Hour' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await happyHourService.configure({
        discountPercent,
        startTime,
        endTime,
        productIds: selectedProducts
      });
      
      setMessage({ type: 'success', text: 'Happy Hour configurado e ativado com sucesso!' });
      await loadData(); // Recarregar dados
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error("Erro ao ativar Happy Hour:", error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Erro ao ativar Happy Hour' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Desativar Happy Hour
  const handleDeactivate = async () => {
    setLoading(true);
    setMessage(null);

    try {
      await happyHourService.deactivate();
      setMessage({ type: 'success', text: 'Happy Hour desativado com sucesso!' });
      await loadData(); // Recarregar dados
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error("Erro ao desativar Happy Hour:", error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Erro ao desativar Happy Hour' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#F5F5FA]">Happy Hour</h1>
          <p className="text-[#B8B8C8] mt-1">Configure descontos especiais para horários específicos</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-[#12121A] border border-gray-700 rounded-xl text-[#B8B8C8] hover:text-white hover:border-[#7B2CFF] transition-all"
          >
            <RefreshCw size={18} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Status Banner */}
      {isHappyHourActive && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Play size={20} className="text-green-400" />
          </div>
          <div>
            <p className="text-green-400 font-semibold">Happy Hour Ativo!</p>
            <p className="text-[#B8B8C8] text-sm">Descontos especiais estão sendo aplicados nos horários configurados</p>
          </div>
        </div>
      )}

      {/* Configuração */}
      <div className="bg-[#12121A] rounded-2xl border border-[#7B2CFF]/20 p-6">
        <h2 className="text-xl font-bold text-[#F5F5FA] mb-4">Configuração do Happy Hour</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Desconto */}
          <div>
            <label className="block text-[#B8B8C8] mb-2 flex items-center gap-2">
              <Percent size={16} />
              Percentual de Desconto (%)
            </label>
            <input
              type="number"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              min="0"
              max="100"
              step="5"
              className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
            />
            <p className="text-[#B8B8C8] text-xs mt-1">Desconto aplicado sobre o preço original</p>
          </div>

          {/* Horário Início */}
          <div>
            <label className="block text-[#B8B8C8] mb-2 flex items-center gap-2">
              <Clock size={16} />
              Horário de Início
            </label>
            <input
              type="time"
              value={startTime.substring(0, 5)}
              onChange={(e) => setStartTime(`${e.target.value}:00`)}
              step="1"
              className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
            />
          </div>

          {/* Horário Fim */}
          <div>
            <label className="block text-[#B8B8C8] mb-2 flex items-center gap-2">
              <Calendar size={16} />
              Horário de Término
            </label>
            <input
              type="time"
              value={endTime.substring(0, 5)}
              onChange={(e) => setEndTime(`${e.target.value}:00`)}
              step="1"
              className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
            />
          </div>
        </div>
      </div>

      {/* Seleção de Produtos */}
      <div className="bg-[#12121A] rounded-2xl border border-[#7B2CFF]/20 p-6">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
          <h2 className="text-xl font-bold text-[#F5F5FA] flex items-center gap-2">
            <ShoppingBag size={20} />
            Produtos em Promoção
          </h2>
          
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="px-3 py-1 bg-[#7B2CFF]/20 rounded-lg text-[#B47DFF] text-sm hover:bg-[#7B2CFF]/30 transition-all"
            >
              Selecionar Todos
            </button>
            <button
              onClick={clearAll}
              className="px-3 py-1 bg-gray-700/20 rounded-lg text-[#B8B8C8] text-sm hover:bg-gray-700/30 transition-all"
            >
              Limpar Todos
            </button>
          </div>
        </div>

        {loadingProducts ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7B2CFF]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-2">
            {allProducts.map((product) => {
              const isSelected = selectedProducts.includes(product.id);
              const happyHourInfo = happyHourProducts.find(p => p.id === product.id);
              const hasDiscount = happyHourInfo?.isInHappyHour;
              
              return (
                <button
                  key={product.id}
                  onClick={() => toggleProduct(product.id)}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all text-left
                    ${isSelected 
                      ? 'border-[#7B2CFF] bg-[#7B2CFF]/10' 
                      : 'border-gray-700 bg-[#08080D] hover:border-[#7B2CFF]/50'
                    }
                  `}
                >
                  {hasDiscount && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Check size={12} />
                        Ativo
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-[#F5F5FA]">{product.nome}</h3>
                    {isSelected && (
                      <Check size={18} className="text-[#7B2CFF]" />
                    )}
                  </div>
                  
                  <p className="text-[#B8B8C8] text-sm mb-2 line-clamp-2">{product.descricao}</p>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      {hasDiscount && happyHourInfo ? (
                        <div className="space-y-1">
                          <span className="text-[#B8B8C8] text-xs line-through">
                            {formatPrice(happyHourInfo.precoOriginal)}
                          </span>
                          <span className="text-green-400 font-bold block">
                            {formatPrice(happyHourInfo.precoPromocional)}
                          </span>
                          <span className="text-green-400 text-xs">
                            -{happyHourInfo.descontoPercent}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#F5F5FA] font-bold">
                          {formatPrice(product.preco)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
        
        <p className="text-[#B8B8C8] text-sm mt-4">
          {selectedProducts.length} produto(s) selecionado(s)
        </p>
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-4">
        {isHappyHourActive ? (
          <button
            onClick={handleDeactivate}
            disabled={loading}
            className="flex-1 py-3 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <StopCircle size={20} />
            {loading ? "Desativando..." : "Desativar Happy Hour"}
          </button>
        ) : (
          <button
            onClick={handleActivate}
            disabled={loading}
            className="flex-1 py-3 rounded-xl font-semibold text-white bg-[#7B2CFF] hover:bg-[#9A4DFF] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Play size={20} />
            {loading ? "Ativando..." : "Ativar Happy Hour"}
          </button>
        )}
      </div>

      {/* Mensagem de Feedback */}
      {message && (
        <div className={`p-4 rounded-xl ${
          message.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
}