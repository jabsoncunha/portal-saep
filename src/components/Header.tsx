"use client";

import { Bell, Search, LogOut, School, ChevronDown } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = (e: any) => {
      setIsScrolled(e.target.scrollTop > 20);
    };
    const mainElement = document.querySelector("main");
    if (mainElement) mainElement.addEventListener("scroll", handleScroll);
    return () => mainElement?.removeEventListener("scroll", handleScroll);
  }, []);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    router.push("/");
  };

  // Iniciais da escola para o avatar
  const initials = user?.escola
    ? user.escola
        .split(" ")
        .filter((w: string) => w.length > 3)
        .slice(0, 2)
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
    : "EU";

  // Nome resumido para exibição
  const schoolShort = user?.escola
    ? user.escola.length > 40
      ? user.escola.slice(0, 38) + "…"
      : user.escola
    : "";

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 px-8 py-6 flex items-center justify-between ${
        isScrolled
          ? "bg-white shadow-md border-b border-slate-100 py-4"
          : "bg-[#003B7E]/30 backdrop-blur-sm"
      }`}
    >
      {/* Lado esquerdo */}
      <div className="flex flex-col">
        <span
          className={`text-sm font-black uppercase tracking-widest ${
            isScrolled ? "text-blue-500" : "text-blue-300"
          }`}
        >
          {isAuthenticated ? "Olá, Gestor!" : "Bem-vindo!"}
        </span>
        <h2
          className={`text-2xl font-black leading-tight max-w-2xl truncate ${
            isScrolled ? "text-slate-800" : "text-white"
          }`}
        >
          {isAuthenticated && user ? schoolShort : "Painel de Monitoramento SAEP"}
        </h2>
      </div>

      {/* Lado direito */}
      <div className="flex items-center gap-4">
        {/* Busca */}
        <div
          className={`hidden lg:flex items-center rounded-2xl px-5 py-3 gap-3 w-80 transition-all focus-within:w-96 border ${
            isScrolled
              ? "bg-slate-100 border-slate-200 focus-within:bg-white focus-within:border-blue-300"
              : "bg-white/10 border-white/20 focus-within:bg-white focus-within:border-blue-300"
          }`}
        >
          <Search size={20} className={isScrolled ? "text-slate-400" : "text-blue-200"} />
          <input
            type="text"
            placeholder="Pesquisar..."
            className={`bg-transparent border-none outline-none text-base w-full font-medium ${
              isScrolled
                ? "text-slate-700 placeholder:text-slate-400"
                : "text-white placeholder:text-blue-200/50 focus:text-slate-800 focus:placeholder:text-slate-400"
            }`}
          />
        </div>

        {/* Notificações */}
        <button
          className={`p-3.5 rounded-2xl transition-all ${
            isScrolled
              ? "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          <Bell size={24} />
        </button>

        {/* Usuário */}
        {isAuthenticated && user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              id="btn-user-menu"
              onClick={() => setDropdownOpen((v) => !v)}
              className={`flex items-center gap-3.5 px-4 py-2.5 rounded-[24px] transition-all border font-bold text-base ${
                isScrolled
                  ? "bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50 shadow-sm"
                  : "bg-white/15 border-white/25 text-white hover:bg-white/25"
              }`}
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00d2ff] to-blue-600 flex items-center justify-center text-sm font-black text-white flex-shrink-0">
                {initials}
              </div>
              <div className="hidden sm:flex flex-col items-start leading-tight max-w-[200px]">
                <span className="text-sm font-black uppercase tracking-wide truncate w-full">
                  {user.escola.split(" ").slice(0, 3).join(" ")}
                </span>
                <span className={`text-xs font-bold ${isScrolled ? "text-slate-400" : "text-blue-200"}`}>
                  INEP {user.inep}
                </span>
              </div>
              <ChevronDown
                size={18}
                className={`transition-transform flex-shrink-0 ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                {/* Info da escola */}
                <div className="p-5 bg-gradient-to-br from-[#003B7E] to-blue-700">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
                      <School size={22} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-blue-200 font-black uppercase tracking-widest">
                        Conectado como
                      </p>
                      <p className="text-white font-black text-base leading-tight truncate">
                        {user.escola}
                      </p>
                      <p className="text-[#00d2ff] text-sm font-bold mt-0.5">
                        INEP: {user.inep}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="p-3">
                  <button
                    id="btn-logout-dropdown"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-red-600 hover:bg-red-50 transition-all font-bold text-base group"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                      <LogOut size={20} className="text-red-500" />
                    </div>
                    Sair do Portal
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            id="btn-entrar-header"
            onClick={() => router.push("/login")}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl transition-all font-black text-base uppercase tracking-widest active:scale-95 ${
              isScrolled
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200"
                : "bg-white text-[#003B7E] hover:bg-blue-50"
            }`}
          >
            Entrar
          </button>
        )}
      </div>
    </header>
  );
}
