"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  BarChart3,
  BookOpen,
  Grid,
  FileEdit,
  Book,
  CheckSquare,
  FileSpreadsheet,
  Trophy,
  FileCheck,
  LogOut,
  LogIn,
  School,
  Lock,
  TrendingUp,
  Target,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
  { name: "Página inicial", href: "/", icon: Home, public: true },
  { name: "Resultados Saep", href: "/resultados", icon: BarChart3, public: false },
  { name: "Indicadores Gerais", href: "/indicadores-gerais", icon: TrendingUp, public: false },
  { name: "Habilidades", href: "/resultados-habilidades", icon: Target, public: false },
  { name: "Estudantes", href: "/resultados-estudantes", icon: Users, public: false },
];

const documents = [
  { name: "Guias de Aprendizagem", href: "/docs/guias", icon: BookOpen },
  { name: "Matrizes", href: "/docs/matrizes", icon: Grid },
  { name: "Avaliações Saep", href: "/docs/avaliacoes", icon: FileEdit },
  { name: "Manuais", href: "/docs/manuais", icon: Book },
  { name: "Gabaritos", href: "/docs/gabaritos", icon: CheckSquare },
  { name: "Relatórios Finais de Resultados", href: "/docs/relatorios", icon: FileSpreadsheet },
  { name: "Gincana", href: "/docs/gincana", icon: Trophy },
  { name: "Simulados Saeb 2026", href: "/docs/simulados", icon: FileCheck },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <aside className="w-72 bg-[#002B5B] text-white flex flex-col h-screen sticky top-0 border-r border-white/10">
      {/* Logo */}
      <Link href="/" className="py-10 flex flex-col items-center justify-center hover:bg-white/5 transition-colors cursor-pointer">
        <div className="relative w-56 h-56 flex-shrink-0">
          <Image
            src="/logodae.jpeg"
            alt="Logo DAE"
            fill
            className="object-contain rounded-[40px] shadow-2xl"
          />
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item: any) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isLocked = !item.public && !isAuthenticated;

          return (
            <Link
              key={item.name}
              href={isLocked ? "/login" : item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-blue-100/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon
                size={24}
                className={
                  isActive
                    ? "text-blue-300"
                    : "group-hover:text-blue-300 transition-colors"
                }
              />
              <span className="font-bold text-xl flex-1">{item.name}</span>
              {isLocked && (
                <Lock size={14} className="text-blue-400/50 flex-shrink-0" />
              )}
            </Link>
          );
        })}

        <div className="pt-2 space-y-1">
          {documents.map((doc: any) => {
            const Icon = doc.icon;
            const isActive = pathname === doc.href;

            return (
              <Link
                key={doc.name}
                href={isAuthenticated ? doc.href : "/login"}
                className={`flex items-center gap-3 px-4 py-2 text-sm transition-all rounded-lg group ${
                  isActive
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-blue-100/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon
                  size={22}
                  className={
                    isActive
                      ? "text-blue-300"
                      : "group-hover:text-blue-300 transition-colors"
                  }
                />
                <span className="font-bold text-lg flex-1">{doc.name}</span>
                {!isAuthenticated && (
                  <Lock size={12} className="text-blue-400/40 flex-shrink-0" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer da sidebar */}
      <div className="p-4 border-t border-white/10 space-y-3">
        {isAuthenticated && user && (
          <>
            {/* Card da escola */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#00d2ff]/20 border border-[#00d2ff]/30 flex items-center justify-center flex-shrink-0">
                  <School size={14} className="text-[#00d2ff]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-blue-200/50 uppercase font-black tracking-wider">
                    Conectado como
                  </p>
                  <p className="text-xs text-[#00d2ff] font-black">
                    INEP {user.inep}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-blue-100/70 font-bold leading-snug line-clamp-2">
                {user.escola}
              </p>
            </div>

            {/* Botão Sair */}
            <button
              id="btn-logout-sidebar"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-400/20 text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all font-black text-sm uppercase tracking-widest active:scale-95"
            >
              <LogOut size={16} />
              Sair do Portal
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
