import { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import ProdutosList from "../Components/ProdutosList";
import ModalCategoria from "../Components/ModalCategoria";
import ModalProduto from "../Components/ModalProduto";
import ModalEditarProduto from "../Components/ModalEditarProduto";
import ModalConfirmarDelete from "../Components/ModalConfirmarDelete";
import HappyHourManager from "../Components/HappyHourManager";
import { categoriaService, produtoService } from "../service/api";
import type { Categoria, Produto } from "../service/types";

export default function Home() {
  const [activeMenu, setActiveMenu] = useState("produtos");
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [showProdutoModal, setShowProdutoModal] = useState(false);
  const [showEditarProdutoModal, setShowEditarProdutoModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [refreshProdutos, setRefreshProdutos] = useState(0);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [deletando, setDeletando] = useState(false);

  // Função para carregar categorias do endpoint correto
  const loadCategorias = async () => {
    try {
      const response = await categoriaService.listAll();
      console.log("Categorias carregadas:", response);
      setCategorias(response.categorias || []);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      setCategorias([]);
    }
  };

  useEffect(() => {
    loadCategorias();
  }, [refreshProdutos]);

  const handleRefresh = () => {
    setRefreshProdutos(prev => prev + 1);
  };

  const handleAddCategoria = () => {
    setShowCategoriaModal(true);
  };

  const handleAddProduto = () => {
    setShowProdutoModal(true);
  };

  const handleEditProduto = (produto: Produto) => {
    setProdutoSelecionado(produto);
    setShowEditarProdutoModal(true);
  };

  const handleDeleteProduto = (produto: Produto) => {
    setProdutoSelecionado(produto);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!produtoSelecionado) return;
    
    setDeletando(true);
    try {
      await produtoService.delete(produtoSelecionado.id);
      handleRefresh();
      setShowDeleteModal(false);
      setProdutoSelecionado(null);
    } catch (error: any) {
      console.error("Erro ao deletar produto:", error);
      alert(error.response?.data?.error || "Erro ao deletar produto");
    } finally {
      setDeletando(false);
    }
  };

  // Renderizar conteúdo baseado no menu ativo
  const renderContent = () => {
    switch (activeMenu) {
      case "produtos":
        return (
          <ProdutosList 
            categorias={categorias}
            onOpenProdutoModal={handleAddProduto}
            onEditProduto={handleEditProduto}
            onDeleteProduto={handleDeleteProduto}
            refreshTrigger={refreshProdutos}
          />
        );
      case "happyhour":
        return <HappyHourManager />;
      case "dashboard":
        return (
          <div>
            <h1 className="text-3xl font-bold text-[#F5F5FA]">Dashboard</h1>
            <p className="text-[#B8B8C8] mt-2">Bem-vindo ao VynPay.</p>
          </div>
        );
      case "pagamentos":
        return (
          <div>
            <h1 className="text-3xl font-bold text-[#F5F5FA]">Pagamentos</h1>
            <p className="text-[#B8B8C8] mt-2">Gerencie os pagamentos do sistema.</p>
          </div>
        );
      case "clientes":
        return (
          <div>
            <h1 className="text-3xl font-bold text-[#F5F5FA]">Clientes</h1>
            <p className="text-[#B8B8C8] mt-2">Gerencie seus clientes.</p>
          </div>
        );
      case "configuracoes":
        return (
          <div>
            <h1 className="text-3xl font-bold text-[#F5F5FA]">Configurações</h1>
            <p className="text-[#B8B8C8] mt-2">Configure as preferências do sistema.</p>
          </div>
        );
      case "pedidos":
        return (
          <div>
            <h1 className="text-3xl font-bold text-[#F5F5FA]">Pedidos</h1>
            <p className="text-[#B8B8C8] mt-2">Gerencie os pedidos.</p>
          </div>
        );
      default:
        return (
          <div>
            <h1 className="text-3xl font-bold text-[#F5F5FA]">Dashboard</h1>
            <p className="text-[#B8B8C8] mt-2">Bem-vindo ao VynPay.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#08080D]">
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu}
        onAddCategoria={handleAddCategoria}
        onAddProduto={handleAddProduto}
      />

      <main className="flex-1 p-8 overflow-y-auto">
        {renderContent()}
      </main>

      <ModalCategoria
        isOpen={showCategoriaModal}
        onClose={() => setShowCategoriaModal(false)}
        onSuccess={() => {
          handleRefresh();
          setShowCategoriaModal(false);
        }}
      />

      <ModalProduto
        isOpen={showProdutoModal}
        onClose={() => setShowProdutoModal(false)}
        onSuccess={() => {
          handleRefresh();
          setShowProdutoModal(false);
        }}
        categorias={categorias}
      />

      <ModalEditarProduto
        isOpen={showEditarProdutoModal}
        onClose={() => {
          setShowEditarProdutoModal(false);
          setProdutoSelecionado(null);
        }}
        onSuccess={() => {
          handleRefresh();
          setShowEditarProdutoModal(false);
          setProdutoSelecionado(null);
        }}
        produto={produtoSelecionado}
        categorias={categorias}
      />

      <ModalConfirmarDelete
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setProdutoSelecionado(null);
        }}
        onConfirm={confirmDelete}
        title="Deletar Produto"
        message={`Tem certeza que deseja deletar o produto "${produtoSelecionado?.nome}"? Esta ação não pode ser desfeita.`}
        loading={deletando}
      />
    </div>
  );
}