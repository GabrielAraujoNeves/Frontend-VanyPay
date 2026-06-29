import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  DollarSign,
  Calendar,
  RefreshCw,
  Clock,
  Percent,
  AlertCircle
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { relatorioService, dashboardService } from "../service/api";
import type { DashboardRelatorio, RelatorioDiaResponse, Comanda, ComandaItem } from "../service/types";

// Cores para o gráfico de pizza
const COLORS = ['#7B2CFF', '#9A4DFF', '#B47DFF', '#D4B8FF', '#7B2CFF80'];

export default function Dashboard() {
  const [relatorio, setRelatorio] = useState<RelatorioDiaResponse | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardRelatorio | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carregar dados do dashboard
      const dashboardResponse = await dashboardService.getDashboard();
      console.log("Dashboard Data:", dashboardResponse);
      setDashboardData(dashboardResponse);

      // Carregar relatório do dia
      const response = await relatorioService.getRelatorioDia();
      console.log("Relatório do dia:", response);
      setRelatorio(response);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Dados para o gráfico de vendas por hora
  const getVendasPorHora = () => {
    if (!relatorio?.comandas || relatorio.comandas.length === 0) {
      return [];
    }
    
    const horas: { [key: string]: number } = {};
    for (let i = 0; i < 24; i++) {
      horas[`${i.toString().padStart(2, '0')}:00`] = 0;
    }
    
    relatorio.comandas.forEach((comanda: Comanda) => {
      // Usar dataAbertura em vez de createdAt
      if (comanda.dataAbertura) {
        const hora = new Date(comanda.dataAbertura).getHours();
        const horaKey = `${hora.toString().padStart(2, '0')}:00`;
        horas[horaKey] += comanda.valorTotal || 0;
      }
    });
    
    return Object.entries(horas).map(([hora, valor]) => ({
      hora,
      vendas: valor,
      quantidade: relatorio.comandas.filter((c: Comanda) => {
        if (!c.dataAbertura) return false;
        return new Date(c.dataAbertura).getHours() === parseInt(hora);
      }).length
    }));
  };

  // Dados para o gráfico de produtos mais vendidos
  const getProdutosMaisVendidos = () => {
    if (!relatorio?.comandas || relatorio.comandas.length === 0) {
      return [];
    }
    
    const produtos: { [key: string]: { quantidade: number; total: number } } = {};
    
    relatorio.comandas.forEach((comanda: Comanda) => {
      if (comanda.items && comanda.items.length > 0) {
        comanda.items.forEach((item: ComandaItem) => {
          if (!produtos[item.produtoNome]) {
            produtos[item.produtoNome] = { quantidade: 0, total: 0 };
          }
          produtos[item.produtoNome].quantidade += item.quantidade;
          produtos[item.produtoNome].total += item.subtotal;
        });
      }
    });
    
    return Object.entries(produtos)
      .map(([nome, data]) => ({
        nome: nome.length > 15 ? nome.substring(0, 15) + '...' : nome,
        quantidade: data.quantidade,
        total: data.total
      }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);
  };

  const vendasPorHora = getVendasPorHora();
  const produtosMaisVendidos = getProdutosMaisVendidos();
  const hasData = relatorio && relatorio.quantidadeComandas > 0;

  // Cards de métricas do dashboard
  const metricCards = [
    {
      id: 'vendasHoje',
      title: 'Vendas Hoje',
      value: formatCurrency(dashboardData?.vendasHoje || 0),
      icon: DollarSign,
      color: '#7B2CFF'
    },
    {
      id: 'comandasAbertas',
      title: 'Comandas Abertas',
      value: dashboardData?.comandasAbertas || 0,
      icon: ShoppingBag,
      color: '#FF6B6B'
    },
    {
      id: 'vendasMes',
      title: 'Vendas do Mês',
      value: formatCurrency(dashboardData?.vendasMes || 0),
      icon: TrendingUp,
      color: '#4ECDC4'
    },
    {
      id: 'vendasAno',
      title: 'Vendas do Ano',
      value: formatCurrency(dashboardData?.vendasAno || 0),
      icon: Calendar,
      color: '#FFD93D'
    },
    {
      id: 'itensPerdidos',
      title: 'Itens Perdidos Hoje',
      value: dashboardData?.itensPerdidosHoje || 0,
      icon: AlertCircle,
      color: '#FF6B6B'
    }
  ];

  // Custom formatters para o Tooltip
  const currencyFormatter = (value: any) => {
    if (typeof value === 'number') {
      return [formatCurrency(value), 'Valor'];
    }
    return [value, 'Valor'];
  };

  const quantityFormatter = (value: any) => {
    if (typeof value === 'number') {
      return [value.toString(), 'Quantidade'];
    }
    return [value, 'Quantidade'];
  };

  // Função para obter a cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ABERTA':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'FECHADA':
        return 'bg-green-500/20 text-green-400';
      case 'CANCELADA':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Função para obter o texto do status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'ABERTA':
        return 'ABERTA';
      case 'FECHADA':
        return 'FECHADA';
      case 'CANCELADA':
        return 'CANCELADA';
      default:
        return status || 'PENDENTE';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#F5F5FA] flex items-center gap-2">
            <TrendingUp size={28} className="text-[#7B2CFF]" />
            Dashboard
          </h1>
          <p className="text-[#B8B8C8] mt-1">
            Visão geral das vendas e métricas do negócio
            {dashboardData?.dataAtual && (
              <span className="ml-2 text-[#7B2CFF]">
                • {formatDate(dashboardData.dataAtual)}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-[#12121A] border border-gray-700 rounded-xl px-4 py-2">
            <Calendar size={18} className="text-[#B8B8C8]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-[#F5F5FA] outline-none"
            />
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-[#12121A] border border-gray-700 rounded-xl text-[#B8B8C8] hover:text-white hover:border-[#7B2CFF] transition-all"
          >
            <RefreshCw size={18} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas do Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {metricCards.map((card) => (
          <div
            key={card.id}
            className="bg-gradient-to-br from-[#12121A] to-[#0a0a12] rounded-2xl border border-[#7B2CFF]/20 p-5 transition-all hover:border-[#7B2CFF]/50"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[#B8B8C8] text-xs uppercase tracking-wider">{card.title}</p>
                <p className="text-2xl font-bold text-[#F5F5FA] mt-1">{card.value}</p>
              </div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${card.color}20` }}>
                <card.icon size={18} style={{ color: card.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7B2CFF]"></div>
          <p className="text-[#B8B8C8] mt-2">Carregando dados...</p>
        </div>
      ) : !hasData ? (
        <div className="bg-[#12121A] rounded-2xl border border-[#7B2CFF]/20 p-12 text-center">
          <TrendingDown size={48} className="mx-auto text-[#B8B8C8] mb-4" />
          <p className="text-[#F5F5FA] font-semibold text-lg">Nenhuma venda registrada hoje</p>
          <p className="text-[#B8B8C8] mt-2">Não há dados de vendas para o dia selecionado</p>
        </div>
      ) : (
        <>
          {/* Gráfico de Vendas por Hora */}
          <div className="bg-[#12121A] rounded-2xl border border-[#7B2CFF]/20 p-6">
            <h2 className="text-xl font-bold text-[#F5F5FA] mb-4 flex items-center gap-2">
              <Clock size={20} className="text-[#7B2CFF]" />
              Vendas por Hora
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={vendasPorHora}>
                <defs>
                  <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7B2CFF" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#7B2CFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="hora" stroke="#B8B8C8" />
                <YAxis stroke="#B8B8C8" tickFormatter={(value: number) => formatCurrency(value)} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#12121A', border: '1px solid #7B2CFF', borderRadius: '12px' }}
                  labelStyle={{ color: '#F5F5FA' }}
                  formatter={currencyFormatter}
                />
                <Legend />
                <Area type="monotone" dataKey="vendas" stroke="#7B2CFF" fillOpacity={1} fill="url(#colorVendas)" name="Valor Vendido" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Produtos Mais Vendidos */}
          {produtosMaisVendidos.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#12121A] rounded-2xl border border-[#7B2CFF]/20 p-6">
                <h2 className="text-xl font-bold text-[#F5F5FA] mb-4 flex items-center gap-2">
                  <ShoppingBag size={20} className="text-[#7B2CFF]" />
                  Produtos Mais Vendidos
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={produtosMaisVendidos} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" stroke="#B8B8C8" />
                    <YAxis dataKey="nome" type="category" stroke="#B8B8C8" width={100} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#12121A', border: '1px solid #7B2CFF', borderRadius: '12px' }}
                      labelStyle={{ color: '#F5F5FA' }}
                      formatter={quantityFormatter}
                    />
                    <Bar dataKey="quantidade" fill="#7B2CFF" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-[#12121A] rounded-2xl border border-[#7B2CFF]/20 p-6">
                <h2 className="text-xl font-bold text-[#F5F5FA] mb-4 flex items-center gap-2">
                  <Percent size={20} className="text-[#7B2CFF]" />
                  Distribuição por Produto
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={produtosMaisVendidos}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => {
                        const name = entry.nome || '';
                        const percent = entry.percent || 0;
                        return `${name}: ${(percent * 100).toFixed(0)}%`;
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="quantidade"
                    >
                      {produtosMaisVendidos.map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#12121A', border: '1px solid #7B2CFF', borderRadius: '12px' }}
                      formatter={quantityFormatter}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Últimas Comandas */}
          {relatorio.comandas && relatorio.comandas.length > 0 && (
            <div className="bg-[#12121A] rounded-2xl border border-[#7B2CFF]/20 p-6">
              <h2 className="text-xl font-bold text-[#F5F5FA] mb-4 flex items-center gap-2">
                <ShoppingBag size={20} className="text-[#7B2CFF]" />
                Últimas Comandas
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 text-[#B8B8C8] font-medium">Horário</th>
                      <th className="text-left py-3 text-[#B8B8C8] font-medium">Mesa</th>
                      <th className="text-left py-3 text-[#B8B8C8] font-medium">Status</th>
                      <th className="text-right py-3 text-[#B8B8C8] font-medium">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatorio.comandas.slice(0, 10).map((comanda: Comanda) => (
                      <tr key={comanda.id} className="border-b border-gray-800/50 hover:bg-[#7B2CFF]/5 transition-all">
                        <td className="py-3 text-[#F5F5FA]">
                          {comanda.dataAbertura ? formatTime(comanda.dataAbertura) : 'N/A'}
                        </td>
                        <td className="py-3 text-[#F5F5FA]">
                          {comanda.mesa || comanda.identificadorComanda || 'Não informado'}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(comanda.status)}`}>
                            {getStatusText(comanda.status)}
                          </span>
                        </td>
                        <td className="py-3 text-right text-[#F5F5FA] font-semibold">
                          {formatCurrency(comanda.valorTotal || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}