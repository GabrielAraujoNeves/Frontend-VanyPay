// src/hooks/useFiltros.ts
import { useState, useMemo } from "react";
import type { EstoqueItem } from "../types/estoque";

export function useFiltros(itens: EstoqueItem[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");

  const filteredItens = useMemo(() => {
    return itens.filter(item => {
      const matchSearch = item.nomeProduto
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      const matchStatus = filterStatus === "todos" || 
        (filterStatus === "baixo" && item.isEstoqueBaixo) ||
        (filterStatus === "alto" && item.isEstoqueAlto) ||
        (filterStatus === "vencido" && item.isVencido) ||
        (filterStatus === "proximo" && item.isProximoVencer);
      
      return matchSearch && matchStatus;
    });
  }, [itens, searchTerm, filterStatus]);

  return {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filteredItens
  };
}