import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../service/api";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [error, setError] = useState("");  // ← adicione para mostrar erros
    const [loading, setLoading] = useState(false);  // ← adicione para loading

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const data = await authService({
                email: email,
                password: senha
            });

            console.log("Resposta do login:", data);
            
            // ✅ CORREÇÃO: o backend retorna "token", não "accessToken"
            const token = data.token || data.accessToken;
            
            if (token) {
                localStorage.setItem("token", token);
                localStorage.setItem("userRole", data.role || "ADMIN");
                console.log("Token salvo com sucesso!");
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

            {/* Efeito de brilho */}
            <div className="absolute w-[500px] h-[500px] bg-[#7B2CFF] opacity-20 blur-[180px] rounded-full" />

            {/* Card Login */}
            <div className="relative z-10 w-full max-w-md bg-[#12121A] border border-[#7B2CFF]/20 rounded-3xl p-8 shadow-2xl">

                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-[#F5F5FA]">
                        VynPay
                    </h1>
                    <p className="text-[#B8B8C8] mt-3">
                        Sistema de pagamentos inteligente
                    </p>
                </div>

                {/* Mensagem de erro */}
                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[#B8B8C8] mb-2">
                            E-mail
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Digite seu e-mail"
                            className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] placeholder:text-[#B8B8C8] outline-none transition-all focus:border-[#7B2CFF] focus:ring-2 focus:ring-[#B47DFF]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[#B8B8C8] mb-2">
                            Senha
                        </label>
                        <input
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            placeholder="Digite sua senha"
                            className="w-full bg-[#08080D] border border-gray-700 rounded-xl px-4 py-3 text-[#F5F5FA] placeholder:text-[#B8B8C8] outline-none transition-all focus:border-[#7B2CFF] focus:ring-2 focus:ring-[#B47DFF]"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl font-semibold text-white bg-[#7B2CFF] transition-all duration-300 hover:bg-[#9A4DFF] hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                </form>

                {/* Links */}
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