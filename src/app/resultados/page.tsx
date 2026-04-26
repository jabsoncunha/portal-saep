"use client";

import ResultCardItem from "@/components/ResultCardItem";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { 
  School, 
  BookText, 
  Users, 
  LayoutDashboard, 
  Target,
  ChevronRight,
  Filter,
  Calendar
} from "lucide-react";

const defaultItems = [
  { title: "RESULTADOS DAS UNIDADES", icon: School, color: "bg-cyan-500", href: "#" },
  { title: "RESULTADOS ITEM - HABILIDADE", icon: BookText, color: "bg-amber-500", href: "#" },
  { title: "RESULTADO ESTUDANTE", icon: Users, color: "bg-indigo-500", href: "#" },
  { title: "DASHBOARD", icon: LayoutDashboard, color: "bg-orange-500", href: "#" },
];

const assessmentsData = ["2026", "2025", "2024", "2023"].map(year => ({
  year,
  sections: [
    { title: `AVALIAÇÃO DIAGNÓSTICA - ${year}`, items: defaultItems },
    { title: `AVALIAÇÃO BIMESTRAL 1 - ${year}`, items: defaultItems },
    { title: `AVALIAÇÃO BIMESTRAL 2 - ${year}`, items: defaultItems },
    { title: `AVALIAÇÃO BIMESTRAL 3 - ${year}`, items: defaultItems },
  ]
}));

export default function ResultadosPage() {
  const years = assessmentsData.map(d => d.year);

  const scrollToYear = (year: string) => {
    const element = document.getElementById(`year-${year}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <ProtectedRoute>
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header da Página */}
      <header className="px-6 py-16 bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center gap-3 text-blue-600 mb-4">
           <span className="text-sm font-black uppercase tracking-widest">Painel de Dados</span>
           <ChevronRight size={16} />
           <span className="text-sm font-black uppercase tracking-widest text-slate-400">Resultados Saep</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-5xl font-black text-slate-900 font-outfit">Resultados Saep</h1>
            <p className="mt-2 text-slate-500 font-bold text-lg">Consulte o histórico completo de avaliações da rede.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-2 rounded-[24px] border border-slate-200 shadow-inner">
              {assessmentsData.map((yearData) => {
                const yearColorMap: Record<string, string> = {
                  "2026": "hover:bg-[#00d2ff] hover:text-white text-[#00d2ff]",
                  "2025": "hover:bg-[#FFD200] hover:text-white text-[#FFD200]",
                  "2024": "hover:bg-[#000096] hover:text-white text-[#000096]",
                  "2023": "hover:bg-[#004bff] hover:text-white text-[#004bff]",
                };
                const colorClasses = yearColorMap[yearData.year] || "text-slate-500 hover:bg-white";
                
                return (
                  <button
                    key={yearData.year}
                    onClick={() => scrollToYear(yearData.year)}
                    className={`px-8 py-3.5 rounded-[18px] font-black text-lg transition-all duration-300 ${colorClasses} bg-transparent active:scale-95`}
                  >
                    {yearData.year}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="px-6 py-16 space-y-48 w-full max-w-[1800px]">
        {assessmentsData.map((yearData) => {
          const yearColorMap: Record<string, string> = {
            "2026": "text-[#00d2ff]",
            "2025": "text-[#FFD200]",
            "2024": "text-[#000096]",
            "2023": "text-[#004bff]",
          };
          const yearColor = yearColorMap[yearData.year] || "text-slate-200";

          return (
            <div key={yearData.year} id={`year-${yearData.year}`} className="scroll-mt-48">
              {/* Divisor de Ano */}
              <div className="flex items-center gap-8 mb-24">
                <div className={`text-8xl font-black ${yearColor} font-outfit tracking-tighter select-none opacity-40`}>
                  {yearData.year}
                </div>
                <div className="h-1 flex-1 bg-slate-200 rounded-full" />
              </div>

              <div className="space-y-32">
                {yearData.sections.map((assessment, index) => (
                  <section key={index} className="space-y-16">
                    <div className="flex items-center gap-10">
                      <h2 className={`text-base font-black uppercase tracking-[0.3em] whitespace-nowrap px-8 py-3 rounded-2xl border shadow-sm ${yearColor.replace('text-', 'bg-').replace('[', '').replace(']', '')}/5 ${yearColor.replace('text-', 'border-').replace('[', '').replace(']', '')}/20 ${yearColor}`}>
                        {assessment.title}
                      </h2>
                      <div className="h-px w-full bg-gradient-to-r from-slate-200 to-transparent" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-x-20 gap-y-28">
                      {assessment.items.map((item: any, i: number) => (
                        <ResultCardItem 
                          key={i}
                          title={item.title}
                          icon={item.icon}
                          color={item.color}
                          href={item.href}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          );
        })}
      </main>
    </div>
    </ProtectedRoute>
  );
}
