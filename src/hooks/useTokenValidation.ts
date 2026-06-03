import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../service/api';

export const useTokenValidation = () => {
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const validateToken = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      console.log("Token não encontrado");
      setIsAuthenticated(false);
      setIsValidating(false);
      return false;
    }

    try {
      const response = await authService.validateToken();
      console.log("Validação do token:", response);
      
      if (response.valid) {
        setIsAuthenticated(true);
        
        // Atualizar role e email se necessário
        if (response.role) {
          localStorage.setItem("userRole", response.role);
        }
        if (response.email) {
          localStorage.setItem("userEmail", response.email);
        }
        
        // Salvar timestamp da última validação
        localStorage.setItem("lastTokenValidation", Date.now().toString());
        
        return true;
      } else {
        console.log("Token inválido:", response.message);
        authService.logout();
        setIsAuthenticated(false);
        navigate("/");
        return false;
      }
    } catch (error) {
      console.error("Erro ao validar token:", error);
      authService.logout();
      setIsAuthenticated(false);
      navigate("/");
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  // Verificar token a cada 3 horas (10800000 ms)
  useEffect(() => {
    validateToken();
    
    const interval = setInterval(() => {
      validateToken();
    }, 3 * 60 * 60 * 1000); // 3 horas
    
    return () => clearInterval(interval);
  }, []);

  return { isValidating, isAuthenticated, validateToken };
};