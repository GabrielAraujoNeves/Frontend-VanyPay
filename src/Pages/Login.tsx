import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../service/api";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await authService.login({
                email: email,
                password: senha
            });
            
            console.log("Resposta do login:", response);
            
            const token = response.token;
            const role = response.role || "USER";
            const userEmail = response.email || email;
            
            if (token) {
                localStorage.setItem("token", token);
                localStorage.setItem("userRole", role);
                localStorage.setItem("userEmail", userEmail);
                localStorage.setItem("lastTokenValidation", Date.now().toString());
                
                console.log("Login bem sucedido! Role:", role);
                navigate("/home");
            } else {
                setError("Token não recebido do servidor");
            }
        } catch (error: any) {
            console.error("Erro no login:", error);
            setError(error.response?.data?.message || "Erro ao fazer login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-[#08080D] flex items-center justify-center overflow-hidden px-4">
            <div className="absolute w-[500px] h-[500px] bg-[#7B2CFF] opacity-20 blur-[180px] rounded-full" />

            <div className="relative z-10 w-full max-w-md bg-[#12121A] border border-[#7B2CFF]/20 rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-[#F5F5FA]">VynPay</h1>
                    <p className="text-[#B8B8C8] mt-3">Sistema de pagamentos inteligente</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[#B8B8C8] mb-2">E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Digite seu e-mail"
                            className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none transition-all focus:border-[#7B2CFF]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[#B8B8C8] mb-2">Senha</label>
                        <input
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            placeholder="Digite sua senha"
                            className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] outline-none transition-all focus:border-[#7B2CFF]"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl font-semibold text-white bg-[#7B2CFF] transition-all hover:bg-[#9A4DFF] disabled:opacity-50"
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a href="#" className="text-[#B47DFF] hover:text-[#9A4DFF] transition-colors">
                        Esqueceu sua senha?
                    </a>
                </div>

                <div className="mt-8 text-center text-sm text-[#B8B8C8]">
                    © 2026 VynPay. Todos os direitos reservados.
                </div>
            </div>
        </div>
    );
}