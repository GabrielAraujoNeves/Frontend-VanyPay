// src/hooks/useEstoque.ts
import { useState, useEffect } from "react";
import { estoqueService } from "../services";
import type { EstoqueItem } from "../types/estoque";

export function useEstoque(refreshTrigger: number = 0) {
  const [itens, setItens] = useState<EstoqueItem[]>([]);
  const [totalItens, setTotalItens] = useState(0);
  const [valorTotalEstoque, setValorTotalEstoque] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEstoque = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await estoqueService.listAll();
      setItens(response.itens || []);
      setTotalItens(response.totalItens || 0);
      setValorTotalEstoque(response.valorTotalEstoque || 0);
    } catch (error) {
      console.error("Erro ao carregar estoque:", error);
      setError("Erro ao carregar estoque");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEstoque();
  }, [refreshTrigger]);

  return {
    itens,
    totalItens,
    valorTotalEstoque,
    loading,
    error,
    loadEstoque
  };
}