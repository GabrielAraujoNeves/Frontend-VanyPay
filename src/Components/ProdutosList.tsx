import { useState, useEffect } from "react";
import { Search, Package, Plus, Edit2, Trash2 } from "lucide-react";
import { produtoService } from "../service/api";
import type { Categoria, Produto } from "../service/types";


interface ProdutosListProps {
  categorias: Categoria[];
  onOpenProdutoModal: () => void;
  onEditProduto: (produto: Produto) => void;
  onDeleteProduto: (produto: Produto) => void;
  refreshTrigger: number;
}

export default function ProdutosList({ 
  categorias, 
  onOpenProdutoModal, 
  onEditProduto,
  onDeleteProduto,
  refreshTrigger 
}: ProdutosListProps) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | "">("");

  const loadProdutos = async () => {
    setLoading(true);
    try {
      let response;
      if (searchTerm) {
        response = await produtoService.searchByName(searchTerm);
      } else if (categoriaFiltro !== "") {
        response = await produtoService.listByCategoria(categoriaFiltro);
      } else {
        response = await produtoService.listAll();
      }
      setProdutos(response.produtos);
      setTotal(response.total);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProdutos();
  }, [searchTerm, categoriaFiltro, refreshTrigger]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#F5F5FA]">Produtos</h2>
          <p className="text-[#B8B8C8] mt-1">Total: {total} produtos</p>
        </div>
        
        <button
          onClick={onOpenProdutoModal}
          className="flex items-center gap-2 px-6 py-3 bg-[#7B2CFF] hover:bg-[#9A4DFF] rounded-xl transition-all"
        >
          <Plus size={20} />
          <span>Novo Produto</span>
        </button>
      </div>

      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B8B8C8]" size={20} />
            <input
              type="text"
              placeholder="Buscar produto por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#12121A] border border-gray-700 rounded-xl text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
            />
          </div>
        </div>

        <div className="w-64">
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value ? parseInt(e.target.value) : "")}
            className="w-full px-4 py-2 bg-[#12121A] border border-gray-700 rounded-xl text-[#F5F5FA] outline-none focus:border-[#7B2CFF]"
          >
            <option value="">Todas categorias</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7B2CFF]"></div>
        </div>
      ) : produtos.length === 0 ? (
        <div className="text-center py-12 bg-[#12121A] rounded-2xl">
          <Package size={48} className="mx-auto text-[#B8B8C8] mb-4" />
          <p className="text-[#B8B8C8]">Nenhum produto encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {produtos.map((produto) => (
            <div key={produto.id} className="bg-[#12121A] rounded-2xl border border-[#7B2CFF]/20 p-6 hover:border-[#7B2CFF]/50 transition-all group">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-[#F5F5FA] flex-1">{produto.nome}</h3>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEditProduto(produto)}
                    className="p-2 bg-[#08080D] rounded-lg text-[#B47DFF] hover:bg-[#7B2CFF]/20 transition-all"
                    title="Editar produto"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDeleteProduto(produto)}
                    className="p-2 bg-[#08080D] rounded-lg text-red-500 hover:bg-red-500/20 transition-all"
                    title="Deletar produto"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-start mb-3">
                <span className="text-2xl font-bold text-[#7B2CFF]">{formatPrice(produto.precoOriginal)}</span>
              </div>
              
              <p className="text-[#B8B8C8] text-sm mb-4 line-clamp-2">{produto.descricao}</p>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#B8B8C8]">
                  Estoque: <span className="text-[#F5F5FA]">{produto.quantidade} unidades</span>
                </span>
                <span className="px-3 py-1 bg-[#7B2CFF]/10 rounded-full text-[#B47DFF] text-xs">
                  {produto.categoria.nome}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}