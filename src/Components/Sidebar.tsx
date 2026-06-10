import { useState } from "react";
import {
  Home,
  CreditCard,
  ShoppingCart,
  Users,
  Settings,
  Menu,
  Package,
  PlusCircle,
  Tag,
  Clock,
  LogOut,
  Armchair,
  Sparkles,
  Wallet
} from "lucide-react";

interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  onAddCategoria: () => void;
  onAddProduto: () => void;
  onLogout: () => void;
}

export default function Sidebar({
  activeMenu,
  setActiveMenu,
  onAddCategoria,
  onAddProduto,
  onLogout
}: SidebarProps) {
  const [open, setOpen] = useState(true);
  const [showProdutosSubmenu, setShowProdutosSubmenu] = useState(false);
  const [showConfigSubmenu, setShowConfigSubmenu] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "vendas", label: "Vendas", icon: ShoppingCart },
    { id: "pagamentos", label: "Pagamentos", icon: CreditCard },
    { id: "clientes", label: "Clientes", icon: Users },
  ];

  return (
    <aside
      className={`
        bg-[#12121A]
        border-r
        border-[#7B2CFF]/20
        transition-all
        duration-300
        ${open ? "w-64" : "w-20"}
        flex flex-col
        h-screen
        sticky
        top-0
        z-10
      `}
    >
      {/* Logo */}
      <div className="p-6 flex items-center justify-between">
        {open && (
          <div>
            <h1 className="text-3xl font-bold text-[#F5F5FA]">
              VynPay
            </h1>
            <p className="text-[#B8B8C8] text-sm">
              Dashboard
            </p>
          </div>
        )}

        <button
          onClick={() => setOpen(!open)}
          className="text-[#B8B8C8] hover:text-white transition-colors"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Menu de Navegação */}
      <nav className="px-4 flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {/* Itens principais do menu */}
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveMenu(item.id)}
                className={`
                  flex items-center gap-3 w-full p-3 rounded-xl transition-all
                  ${activeMenu === item.id
                    ? "bg-[#7B2CFF] text-white"
                    : "text-[#B8B8C8] hover:bg-[#7B2CFF]/10 hover:text-white"
                  }
                `}
              >
                <item.icon size={20} />
                {open && <span>{item.label}</span>}
              </button>
            </li>
          ))}

          {/* Menu Produtos com Submenu */}
          <li>
            <button
              onClick={() => open && setShowProdutosSubmenu(!showProdutosSubmenu)}
              className={`
                flex items-center gap-3 w-full p-3 rounded-xl transition-all
                ${activeMenu === "produtos" || activeMenu === "happyhour"
                  ? "bg-[#7B2CFF] text-white"
                  : "text-[#B8B8C8] hover:bg-[#7B2CFF]/10 hover:text-white"
                }
              `}
            >
              <Package size={20} />
              {open && (
                <div className="flex-1 text-left">
                  <span>Produtos</span>
                </div>
              )}
              {open && (
                <svg
                  className={`transform transition-transform duration-200 ${showProdutosSubmenu ? "rotate-180" : ""}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              )}
            </button>

            {open && showProdutosSubmenu && (
              <ul className="ml-8 mt-2 space-y-2">
                <li>
                  <button
                    onClick={() => setActiveMenu("produtos")}
                    className="w-full text-left p-2 rounded-lg text-[#B8B8C8] hover:bg-[#7B2CFF]/10 hover:text-white transition-all text-sm"
                  >
                    Listar Produtos
                  </button>
                </li>
                <li>
                  <button
                    onClick={onAddProduto}
                    className="w-full text-left p-2 rounded-lg text-[#B8B8C8] hover:bg-[#7B2CFF]/10 hover:text-white transition-all text-sm flex items-center gap-2"
                  >
                    <PlusCircle size={14} />
                    Adicionar Produto
                  </button>
                </li>
                <li>
                  <button
                    onClick={onAddCategoria}
                    className="w-full text-left p-2 rounded-lg text-[#B8B8C8] hover:bg-[#7B2CFF]/10 hover:text-white transition-all text-sm flex items-center gap-2"
                  >
                    <Tag size={14} />
                    Adicionar Categoria
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveMenu("happyhour")}
                    className="w-full text-left p-2 rounded-lg text-[#B8B8C8] hover:bg-[#7B2CFF]/10 hover:text-white transition-all text-sm flex items-center gap-2"
                  >
                    <Clock size={14} />
                    Happy Hour
                  </button>
                </li>
              </ul>
            )}
          </li>

          {/* Menu Configurações com Submenu */}
          <li>
            <button
              onClick={() => open && setShowConfigSubmenu(!showConfigSubmenu)}
              className={`
                flex items-center gap-3 w-full p-3 rounded-xl transition-all
                ${activeMenu === "configuracoes" || activeMenu === "mesas" || activeMenu === "pulseiras" || activeMenu === "cartoes"
                  ? "bg-[#7B2CFF] text-white"
                  : "text-[#B8B8C8] hover:bg-[#7B2CFF]/10 hover:text-white"
                }
              `}
            >
              <Settings size={20} />
              {open && (
                <div className="flex-1 text-left">
                  <span>Configurações</span>
                </div>
              )}
              {open && (
                <svg
                  className={`transform transition-transform duration-200 ${showConfigSubmenu ? "rotate-180" : ""}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              )}
            </button>

            {open && showConfigSubmenu && (
              <ul className="ml-8 mt-2 space-y-2">
                <li>
                  <button
                    onClick={() => setActiveMenu("mesas")}
                    className="w-full text-left p-2 rounded-lg text-[#B8B8C8] hover:bg-[#7B2CFF]/10 hover:text-white transition-all text-sm flex items-center gap-2"
                  >
                    <Armchair size={14} />
                    Mesas
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveMenu("pulseiras")}
                    className="w-full text-left p-2 rounded-lg text-[#B8B8C8] hover:bg-[#7B2CFF]/10 hover:text-white transition-all text-sm flex items-center gap-2"
                  >
                    <Sparkles size={14} />
                    Pulseiras
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveMenu("cartoes")}
                    className="w-full text-left p-2 rounded-lg text-[#B8B8C8] hover:bg-[#7B2CFF]/10 hover:text-white transition-all text-sm flex items-center gap-2"
                  >
                    <Wallet size={14} />
                    Cartões
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveMenu("configuracoes")}
                    className="w-full text-left p-2 rounded-lg text-[#B8B8C8] hover:bg-[#7B2CFF]/10 hover:text-white transition-all text-sm"
                  >
                    Configurações Gerais
                  </button>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>

      {/* Botão de Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={20} />
          {open && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}