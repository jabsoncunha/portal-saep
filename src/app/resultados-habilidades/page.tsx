"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { 
  ChevronRight, 
  Lightbulb, 
  Target, 
  Info,
  Search,
  Filter,
  Download,
  ArrowRight
} from "lucide-react";
import habilidadesData from "@/data/habilidades_2026.json";

export default function ResultadosHabilidadesPage() {
  const [selectedAno, setSelectedAno] = useState(1);
  const [selectedComponente, setSelectedComponente] = useState("LÍNGUA PORTUGUESA (LP)");
  const [searchTerm, setSearchTerm] = useState("");
  
  const currentAnoData = (habilidadesData as any).anos_escolares.find((a: any) => a.ano === selectedAno);
  
  // Se o componente selecionado não existir no novo ano, reseta para o primeiro disponível
  useEffect(() => {
    if (currentAnoData && !currentAnoData.componentes_curriculares.includes(selectedComponente)) {
      setSelectedComponente(currentAnoData.componentes_curriculares[0]);
    }
  }, [selectedAno, currentAnoData]);

  if (!currentAnoData) return null;

  // Filtrar unidades pela busca
  const filteredUnidades = (currentAnoData?.unidades || []).filter((u: any) => 
    u.unidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrar questões do componente selecionado
  const filteredQuestoes = (currentAnoData?.questoes || []).filter((q: any) => q.componente === selectedComponente);
  const questaoKeys = filteredQuestoes.map((q: any) => q.questao);

  const getHeatmapColor = (pct: number) => {
    if (pct >= 90) return "bg-emerald-500 text-white";
    if (pct >= 80) return "bg-emerald-400 text-white";
    if (pct >= 70) return "bg-amber-400 text-amber-950";
    if (pct >= 60) return "bg-orange-400 text-white";
    return "bg-rose-500 text-white";
  };

  const getLegendColor = (label: string) => {
    if (label === "Excelente (≥ 90%)") return "bg-emerald-500";
    if (label === "Bom (80-89%)") return "bg-emerald-400";
    if (label === "Regular (70-79%)") return "bg-amber-400";
    if (label === "Atenção (60-69%)") return "bg-orange-400";
    return "bg-rose-500";
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-slate-50">
        {/* Header */}
        <header className="px-8 py-10 bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="flex items-center gap-3 text-blue-600 mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest">Análise Pedagógica</span>
            <ChevronRight size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rendimento por Habilidade</span>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div>
              <h1 className="text-4xl font-black text-slate-900 font-outfit tracking-tight">Matriz de Habilidades 2026</h1>
              <p className="mt-1 text-slate-500 font-bold">Visualize o rendimento detalhado por descritor em cada unidade.</p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Seletor de Ano */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 mr-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((ano) => (
                  <button
                    key={ano}
                    onClick={() => setSelectedAno(ano)}
                    className={`w-10 h-10 rounded-lg font-black text-xs transition-all ${
                      selectedAno === ano 
                        ? "bg-white text-blue-600 shadow-sm border border-slate-200" 
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {ano}º
                  </button>
                ))}
              </div>

              {/* Filtro Componente */}
              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                {(currentAnoData?.componentes_curriculares as string[] || []).map((comp) => (
                  <button
                    key={comp}
                    onClick={() => setSelectedComponente(comp)}
                    className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${
                      selectedComponente === comp 
                        ? "bg-white text-blue-600 shadow-sm border border-slate-200" 
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {comp.replace(" (LP)", "").replace(" (MA)", "").replace(" (LG)", "").replace(" (CN)", "").replace(" (CH)", "")}
                  </button>
                ))}
              </div>

              <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                <Download size={16} />
                EXPORTAR
              </button>
            </div>
          </div>
        </header>

        <main className="p-8">
          {/* Toolbar: Busca e Legenda */}
          <div className="mb-8 flex flex-col md:flex-row gap-6 items-stretch md:items-center">
            <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Buscar unidade escolar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-8 py-5 bg-white rounded-[24px] border border-slate-200 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-700 transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 bg-white px-8 py-5 rounded-[24px] border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">
                <Info size={14} />
                Níveis:
              </div>
              {["Excelente (≥ 90%)", "Bom (80-89%)", "Regular (70-79%)", "Atenção (60-69%)", "Crítico (< 60%)"].map((label) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-md ${getLegendColor(label)}`} />
                  <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap">{label.split(" (")[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tabela Heatmap */}
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="sticky left-0 z-20 bg-slate-50 p-6 text-left min-w-[320px] border-r border-slate-200">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Unidade Escolar</span>
                    </th>
                    {(filteredQuestoes as any[]).map((q: any) => (
                      <th key={String(q.questao)} className="p-4 text-center min-w-[85px] border-r border-slate-100">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{q.questao}</span>
                          <span className="text-[10px] font-black text-slate-900 tracking-tighter whitespace-nowrap">{q.habilidade}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUnidades.length > 0 ? (
                    filteredUnidades.map((unidade, idx) => (
                      <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                        <td className="sticky left-0 z-20 bg-white group-hover:bg-slate-50 p-6 border-r border-slate-200 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)]">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] font-black">
                              {idx + 1}
                            </div>
                            <span className="text-sm font-black text-slate-700 truncate max-w-[240px]">{unidade.unidade}</span>
                          </div>
                        </td>
                        {(filteredQuestoes as any[]).map((q: any) => {
                          const hData = (unidade.habilidades as any[]).find(h => h.questao === q.questao);
                          // Garantir que pct seja um número válido, mesmo se hData ou rendimento_pct for null
                          const pct = (hData && typeof hData.rendimento_pct === "number") ? hData.rendimento_pct : 0;
                          return (
                            <td key={String(q.questao)} className="p-1 border-r border-slate-50">
                              <div className={`h-11 flex items-center justify-center rounded-xl font-black text-[11px] transition-transform hover:scale-110 cursor-default ${getHeatmapColor(pct)}`}>
                                {pct.toFixed(0)}%
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={filteredQuestoes.length + 1} className="p-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                            <Search size={32} />
                          </div>
                          <p className="font-bold text-slate-500">Nenhuma escola encontrada com esse nome.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards de Descritores */}
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                <Lightbulb size={20} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Destaque de Habilidades</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredQuestoes.slice(0, 6).map((q, i) => (
                <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm group hover:border-blue-400 transition-all">
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Target size={24} />
                    </div>
                    <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest">{q.questao}</span>
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-2">{q.habilidade}</h4>
                  <p className="text-sm text-slate-500 font-bold leading-relaxed mb-6">
                    Descrição pedagógica mapeada para o {selectedAno}º Ano em {selectedComponente.split(" (")[0]}.
                  </p>
                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Tópico Base</span>
                    </div>
                    <span className="text-sm font-black text-slate-700">BNCC 2026</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
