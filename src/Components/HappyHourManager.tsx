import { useState, useEffect } from "react";
import { 
  Clock, Percent, Calendar, Play, RefreshCw, 
  ShoppingBag, Check, Gift, Sparkles, CalendarDays, Settings,
  Power, AlertCircle
} from "lucide-react";
import { happyHourService } from "../service/api";
import type { HappyHourProduct } from "../service/types";

// Mapeamento dos dias da semana
const DAYS_OF_WEEK = [
  { value: "MON", label: "Segunda", labelShort: "Seg" },
  { value: "TUE", label: "Terça", labelShort: "Ter" },
  { value: "WED", label: "Quarta", labelShort: "Qua" },
  { value: "THU", label: "Quinta", labelShort: "Qui" },
  { value: "FRI", label: "Sexta", labelShort: "Sex" },
  { value: "SAT", label: "Sábado", labelShort: "Sáb" },
  { value: "SUN", label: "Domingo", labelShort: "Dom" },
];

export default function HappyHourManager() {
  const [discountPercent, setDiscountPercent] = useState(50);
  const [startTime, setStartTime] = useState("17:00:00");
  const [endTime, setEndTime] = useState("20:00:00");
  const [selectedDays, setSelectedDays] = useState<string[]>(["MON", "TUE", "WED", "THU", "FRI"]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [allProducts, setAllProducts] = useState<HappyHourProduct[]>([]);
  const [isHappyHourActive, setIsHappyHourActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasConfig, setHasConfig] = useState(false);

  // Carregar produtos e status do Happy Hour
  const loadData = async () => {
    setLoadingProducts(true);
    try {
      const productsResponse = await happyHourService.getProducts();
      setAllProducts(productsResponse.produtos);
      setIsHappyHourActive(productsResponse.isHappyHourActive);
      
      const hasAnyPromotion = productsResponse.produtos.some(p => p.isInHappyHour);
      setHasConfig(hasAnyPromotion || productsResponse.isHappyHourActive);
      
      const promotedProduct = productsResponse.produtos.find(p => p.isInHappyHour);
      if (promotedProduct) {
        setDiscountPercent(promotedProduct.descontoPercent);
      }
      
      const activeProductIds = productsResponse.produtos
        .filter(p => p.isInHappyHour)
        .map(p => p.id);
      if (activeProductIds.length > 0) {
        setSelectedProducts(activeProductIds);
      }
      
    } catch (error) {
      console.error("❌ Erro ao carregar dados:", error);
      setMessage({ type: 'error', text: 'Erro ao carregar dados do Happy Hour' });
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Função para formatar hora corretamente (HH:MM:SS)
  const formatTime = (time: string): string => {
    // Remove qualquer formatação extra e garante HH:MM:SS
    const parts = time.split(':');
    if (parts.length >= 2) {
      const hours = parts[0].padStart(2, '0');
      const minutes = parts[1].padStart(2, '0');
      const seconds = parts[2] ? parts[2].padStart(2, '0') : '00';
      return `${hours}:${minutes}:${seconds}`;
    }
    return "00:00:00";
  };

  // Alternar seleção de dia
  const toggleDay = (dayValue: string) => {
    setSelectedDays(prev =>
      prev.includes(dayValue)
        ? prev.filter(d => d !== dayValue)
        : [...prev, dayValue]
    );
  };

  // Selecionar todos os dias
  const selectAllDays = () => {
    setSelectedDays(DAYS_OF_WEEK.map(day => day.value));
  };

  // Selecionar dias úteis
  const selectWeekdays = () => {
    setSelectedDays(["MON", "TUE", "WED", "THU", "FRI"]);
  };

  // Selecionar fim de semana
  const selectWeekend = () => {
    setSelectedDays(["SAT", "SUN"]);
  };

  // Limpar todos os dias
  const clearAllDays = () => {
    setSelectedDays([]);
  };

  // Alternar seleção de produto
  const toggleProduct = (productId: number) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Selecionar todos os produtos
  const selectAllProducts = () => {
    setSelectedProducts(allProducts.map(p => p.id));
  };

  // Desmarcar todos os produtos
  const clearAllProducts = () => {
    setSelectedProducts([]);
  };

  // Ativar/Configurar Happy Hour
  const handleActivate = async () => {
    if (selectedDays.length === 0) {
      setMessage({ type: 'error', text: 'Selecione pelo menos um dia da semana para o Happy Hour' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    // Validar produtos
    if (selectedProducts.length === 0) {
      setMessage({ type: 'error', text: 'Selecione pelo menos um produto para o Happy Hour' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    // FORMATAR OS HORÁRIOS CORRETAMENTE
    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endTime);
    const configData = {
      discountPercent: Number(discountPercent),
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      daysOfWeek: selectedDays,
      productIds: selectedProducts
    };

    // Verificar autenticação
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    setLoading(true);
    setMessage(null);

    try {
      const response = await happyHourService.configure(configData);
      setMessage({ type: 'success', text: response.message || 'Happy Hour configurado com sucesso!' });
      await loadData();
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.log("\n❌ ERRO NA REQUISIÇÃO:");
      console.log("Status:", error.response?.status);
      console.log("Mensagem:", error.response?.data);
      
      if (error.response?.status === 403) {
        setMessage({ type: 'error', text: 'Erro 403: Acesso negado. Verifique se você tem permissão de ADMIN.' });
      } else if (error.response?.status === 400) {
        setMessage({ type: 'error', text: error.response?.data?.message || 'Erro nos dados enviados. Verifique os horários e produtos.' });
      } else {
        setMessage({ type: 'error', text: error.response?.data?.message || 'Erro ao configurar Happy Hour' });
      }
      
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
      const response = await happyHourService.deactivate();
      setMessage({ type: 'success', text: 'Happy Hour desativado com sucesso!' });
      await loadData();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error("❌ Erro ao desativar:", error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Erro ao desativar Happy Hour' });
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

  // Obter dias selecionados para exibição
  const getSelectedDaysText = () => {
    const sortedDays = DAYS_OF_WEEK.filter(day => selectedDays.includes(day.value));
    if (sortedDays.length === 7) return "Todos os dias";
    if (sortedDays.length === 0) return "Nenhum dia selecionado";
    return sortedDays.map(day => day.labelShort).join(", ");
  };

  // Produtos que estão em promoção
  const produtosEmPromocao = allProducts.filter(p => p.isInHappyHour);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#F5F5FA] flex items-center gap-2">
            <Gift size={28} className="text-[#7B2CFF]" />
            Happy Hour
          </h1>
          <p className="text-[#B8B8C8] mt-1">Configure descontos especiais para dias e horários específicos</p>
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
      {hasConfig && (
        <div className={`rounded-xl p-6 ${isHappyHourActive 
          ? 'bg-gradient-to-r from-green-500/20 to-green-500/5 border border-green-500/30'
          : 'bg-yellow-500/10 border border-yellow-500/20'
        }`}>
          <div className="flex items-center gap-4 flex-wrap">
            <div className={`p-3 rounded-full ${isHappyHourActive ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
              {isHappyHourActive ? (
                <Sparkles size={28} className="text-green-400" />
              ) : (
                <AlertCircle size={28} className="text-yellow-400" />
              )}
            </div>
            <div className="flex-1">
              {isHappyHourActive ? (
                <>
                  <p className="text-2xl font-bold text-green-400">🎉 HAPPY HOUR ATIVO! 🎉</p>
                  <p className="text-[#B8B8C8] mt-1">
                    {discountPercent}% de desconto em {produtosEmPromocao.length} produto(s)!
                  </p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-yellow-400">Happy Hour Configurado</p>
                  <p className="text-[#B8B8C8] mt-1">
                    Aguardando o horário programado para ativação
                  </p>
                </>
              )}
              <p className="text-[#B8B8C8] text-sm mt-1">
                Horário: {formatTime(startTime).substring(0, 5)} - {formatTime(endTime).substring(0, 5)} | Dias: {getSelectedDaysText()}
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#7B2CFF]">
                {discountPercent}%
              </div>
              <div className="text-[#B8B8C8] text-sm">de desconto</div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Produtos em Promoção */}
      {produtosEmPromocao.length > 0 && (
        <div className="bg-[#12121A] rounded-2xl border border-[#7B2CFF]/20 p-6">
          <h2 className="text-xl font-bold text-[#F5F5FA] mb-4 flex items-center gap-2">
            <ShoppingBag size={20} className="text-[#7B2CFF]" />
            Produtos com Desconto
            {isHappyHourActive && (
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                Promoção Ativa!
              </span>
            )}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {produtosEmPromocao.map((produto) => (
              <div key={produto.id} className="bg-gradient-to-br from-[#08080D] to-[#0a0a12] rounded-xl p-5 border border-green-500/20 hover:border-green-500/50 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-[#F5F5FA]">{produto.nome}</h3>
                  <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    -{produto.descontoPercent}%
                  </div>
                </div>
                
                <p className="text-[#B8B8C8] text-sm mb-4 line-clamp-2">{produto.descricao}</p>
                
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-[#B8B8C8] text-sm line-through">
                    {formatPrice(produto.precoOriginal)}
                  </span>
                  <span className="text-[#7B2CFF] font-bold text-2xl">
                    {formatPrice(produto.precoPromocional)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Configuração */}
      <div className="bg-[#12121A] rounded-2xl border border-[#7B2CFF]/20 p-6">
        <h2 className="text-xl font-bold text-[#F5F5FA] mb-4 flex items-center gap-2">
          <Settings size={20} className="text-[#7B2CFF]" />
          {hasConfig ? "Editar Configuração" : "Configuração do Happy Hour"}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              onChange={(e) => setStartTime(e.target.value + ":00")}
              className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
            />
            <p className="text-[#B8B8C8] text-xs mt-1">Formato: HH:MM (ex: 17:00)</p>
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
              onChange={(e) => setEndTime(e.target.value + ":00")}
              className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
            />
            <p className="text-[#B8B8C8] text-xs mt-1">Formato: HH:MM (ex: 20:00)</p>
          </div>
        </div>

        {/* Seleção de Dias da Semana */}
        <div className="mb-8">
          <label className="block text-[#B8B8C8] mb-3 flex items-center gap-2">
            <CalendarDays size={16} />
            Dias da Semana
          </label>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={selectAllDays}
              className="px-3 py-1 bg-[#7B2CFF]/20 rounded-lg text-[#B47DFF] text-xs hover:bg-[#7B2CFF]/30 transition-all"
            >
              Todos
            </button>
            <button
              onClick={selectWeekdays}
              className="px-3 py-1 bg-[#7B2CFF]/20 rounded-lg text-[#B47DFF] text-xs hover:bg-[#7B2CFF]/30 transition-all"
            >
              Dias Úteis
            </button>
            <button
              onClick={selectWeekend}
              className="px-3 py-1 bg-[#7B2CFF]/20 rounded-lg text-[#B47DFF] text-xs hover:bg-[#7B2CFF]/30 transition-all"
            >
              Fim de Semana
            </button>
            <button
              onClick={clearAllDays}
              className="px-3 py-1 bg-gray-700/20 rounded-lg text-[#B8B8C8] text-xs hover:bg-gray-700/30 transition-all"
            >
              Limpar
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = selectedDays.includes(day.value);
              return (
                <button
                  key={day.value}
                  onClick={() => toggleDay(day.value)}
                  className={`
                    py-3 rounded-xl font-medium transition-all
                    ${isSelected 
                      ? 'bg-[#7B2CFF] text-white' 
                      : 'bg-[#08080D] border border-gray-700 text-[#B8B8C8] hover:border-[#7B2CFF]'
                    }
                  `}
                >
                  <div className="text-sm hidden md:block">{day.label}</div>
                  <div className="text-xs md:hidden">{day.labelShort}</div>
                </button>
              );
            })}
          </div>
          
          <p className="text-[#B8B8C8] text-xs mt-3">
            Dias selecionados: {getSelectedDaysText()}
          </p>
        </div>

        {/* Seleção de Produtos */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <h2 className="text-xl font-bold text-[#F5F5FA] flex items-center gap-2">
              <ShoppingBag size={20} />
              Selecione os Produtos
            </h2>
            
            <div className="flex gap-2">
              <button
                onClick={selectAllProducts}
                className="px-3 py-1 bg-[#7B2CFF]/20 rounded-lg text-[#B47DFF] text-sm hover:bg-[#7B2CFF]/30 transition-all"
              >
                Selecionar Todos
              </button>
              <button
                onClick={clearAllProducts}
                className="px-3 py-1 bg-gray-700/20 rounded-lg text-[#B8B8C8] text-sm hover:bg-gray-700/30 transition-all"
              >
                Limpar Todos
              </button>
            </div>
          </div>

          {loadingProducts ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7B2CFF]"></div>
              <p className="text-[#B8B8C8] mt-2">Carregando produtos...</p>
            </div>
          ) : allProducts.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag size={48} className="mx-auto text-[#B8B8C8] mb-4" />
              <p className="text-[#B8B8C8]">Nenhum produto encontrado</p>
              <p className="text-[#B8B8C8] text-sm mt-2">Cadastre produtos para ativar o Happy Hour</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto p-2">
              {allProducts.map((product) => {
                const isSelected = selectedProducts.includes(product.id);
                const isInPromotion = product.isInHappyHour;
                
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
                      ${isInPromotion && !isSelected ? 'border-green-500/50 bg-green-500/5' : ''}
                    `}
                  >
                    {isInPromotion && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Check size={12} />
                          Em promoção
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
                    
                    <div>
                      {isInPromotion ? (
                        <div className="space-y-1">
                          <span className="text-[#B8B8C8] text-xs line-through">
                            {formatPrice(product.precoOriginal)}
                          </span>
                          <span className="text-green-400 font-bold block">
                            {formatPrice(product.precoPromocional)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#F5F5FA] font-bold">
                          {formatPrice(product.precoOriginal)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          
          <p className="text-[#B8B8C8] text-sm mt-4">
            {selectedProducts.length} produto(s) selecionado(s)
          </p>
          
          <div className="mt-4 p-3 bg-[#7B2CFF]/10 rounded-xl">
            <p className="text-[#B8B8C8] text-sm">
              💡 Dica: Selecione os produtos e dias da semana que deseja aplicar o desconto do Happy Hour
            </p>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-4">
        {hasConfig ? (
          <button
            onClick={handleDeactivate}
            disabled={loading}
            className="flex-1 py-3 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Power size={20} />
            {loading ? "Desativando..." : "Desativar Happy Hour"}
          </button>
        ) : (
          <button
            onClick={handleActivate}
            disabled={loading || selectedProducts.length === 0 || selectedDays.length === 0}
            className="flex-1 py-3 rounded-xl font-semibold text-white bg-[#7B2CFF] hover:bg-[#9A4DFF] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Play size={20} />
            {loading ? "Configurando..." : "Ativar Happy Hour"}
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