"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Lock, User, AlertCircle, CheckCircle2, School } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { validateLogin } from "@/lib/schools";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showInep, setShowInep] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [schoolPreview, setSchoolPreview] = useState<string | null>(null);

  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Se já estiver logado, redireciona
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/resultados");
    }
  }, [isAuthenticated, router]);

  // Pré-visualiza a escola conforme o usuário é digitado
  useEffect(() => {
    if (username.length === 8) {
      const escola = validateLogin(username);
      setSchoolPreview(escola);
      setError("");
    } else {
      setSchoolPreview(null);
    }
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Por favor, informe o usuário e a senha.");
      return;
    }
    
    if (username !== password) {
      setError("O usuário e a senha devem ser iguais (Código INEP).");
      setIsLoading(false);
      return;
    }

    if (username.length !== 8) {
      setError("O código INEP deve conter 8 dígitos.");
      return;
    }

    setIsLoading(true);
    // Pequeno delay para UX
    await new Promise((r) => setTimeout(r, 800));

    const escola = validateLogin(username);
    if (!escola) {
      setError("LOGIN OU SENHA INVÁLIDA");
      setIsLoading(false);
      return;
    }

    login(username, escola);
    router.replace("/resultados");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#003B7E] overflow-hidden relative p-6">
      {/* Decorative blobs */}
      <div className="absolute top-[-120px] left-[-120px] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full bg-[#00d2ff]/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] rounded-full bg-yellow-400/5 blur-2xl pointer-events-none" />

      {/* Título DAE Portal Saep sem imagem */}
      <Link href="/" className="flex flex-col items-center gap-1 mb-12 relative z-10 hover:opacity-80 transition-opacity cursor-pointer">
        <h1 className="text-6xl font-black text-white tracking-tighter">DAE</h1>
        <p className="text-[#00d2ff] text-lg uppercase tracking-[0.3em] font-black">Portal SAEP</p>
      </Link>

      {/* Login form centered */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] p-10 shadow-2xl">
          <div className="mb-10">
            <div className="w-14 h-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mb-5">
              <School size={28} className="text-[#00d2ff]" />
            </div>
            <h3 className="text-3xl font-black text-white">Entrar no Portal</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Usuário field */}
            <div className="space-y-2">
              <label className="text-blue-200 text-xs font-black uppercase tracking-widest">
                USUÁRIO
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <User size={18} className="text-blue-300/60" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 8);
                    setUsername(val);
                    setError("");
                  }}
                  placeholder="00000000"
                  maxLength={8}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-blue-200/30 font-bold text-base outline-none focus:border-[#00d2ff]/60 focus:bg-white/15 transition-all tracking-[0.2em]"
                  autoComplete="off"
                  inputMode="numeric"
                />
              </div>
            </div>

            {/* Senha field */}
            <div className="space-y-2">
              <label className="text-blue-200 text-xs font-black uppercase tracking-widest">
                SENHA
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Lock size={18} className="text-blue-300/60" />
                </div>
                <input
                  id="password"
                  type={showInep ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 8);
                    setPassword(val);
                    setError("");
                  }}
                  placeholder="••••••••"
                  maxLength={8}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl pl-12 pr-12 py-4 text-white placeholder:text-blue-200/30 font-bold text-base outline-none focus:border-[#00d2ff]/60 focus:bg-white/15 transition-all"
                  autoComplete="off"
                  inputMode="numeric"
                />
                <button
                  type="button"
                  onClick={() => setShowInep(!showInep)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300/60 hover:text-blue-200 transition-colors"
                >
                  {showInep ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* School preview */}
            {schoolPreview && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#00d2ff]/10 border border-[#00d2ff]/30">
                <CheckCircle2 size={18} className="text-[#00d2ff] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#00d2ff] text-xs font-black uppercase tracking-wider mb-1">Escola identificada</p>
                  <p className="text-white font-bold text-sm leading-snug">{schoolPreview}</p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-400/30">
                <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
                <p className="text-red-300 font-bold text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              id="btn-login"
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl font-black text-base uppercase tracking-widest transition-all duration-300 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed bg-[#00d2ff] text-[#003B7E] hover:bg-white hover:text-[#003B7E] active:scale-95 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#003B7E]/40 border-t-[#003B7E] rounded-full animate-spin" />
                  Verificando...
                </>
              ) : (
                "Acessar Portal"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-blue-200/40 text-xs text-center font-bold">
              Acesso exclusivo para unidades escolares da rede municipal de Palmas — TO.
              <br />
              Em caso de dúvidas, entre em contato com a DAE.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
