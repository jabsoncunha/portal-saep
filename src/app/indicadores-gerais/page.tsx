"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { 
  ChevronRight, 
  BarChart3, 
  School, 
  BookOpen, 
  TrendingUp,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react";
import resultadosData from "@/data/resultados_2026.json";

export default function IndicadoresGeraisPage() {
  const [selectedAno, setSelectedAno] = useState(1);
  const data = (resultadosData as any).anos_escolares.find((a: any) => a.ano === selectedAno);

  if (!data) return null;

  // Ordenar unidades por média para o ranking
  const rankedUnidades = [...data.unidades].sort((a, b) => b.MEDIA - a.MEDIA);

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-600";
    if (score >= 6) return "text-amber-600";
    return "text-rose-600";
  };

  const getBgScoreColor = (score: number) => {
    if (score >= 8) return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (score >= 6) return "bg-amber-50 text-amber-700 border-amber-100";
    return "bg-rose-50 text-rose-700 border-rose-100";
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-slate-50">
        {/* Header da Página */}
        <header className="px-8 py-12 bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-3 text-blue-600 mb-4">
            <span className="text-xs font-black uppercase tracking-widest">Dashboards</span>
            <ChevronRight size={14} />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Indicadores Estratégicos</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 font-outfit tracking-tight">Indicadores de Rede 2026</h1>
              <p className="mt-1 text-slate-500 font-bold">Acompanhamento detalhado da Avaliação Diagnóstica por Unidade Escolar.</p>
            </div>

            {/* Filtro de Ano Escolar */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              {(resultadosData as any).anos_escolares.map((anoItem: any) => (
                <button
                  key={String(anoItem.ano)}
                  onClick={() => setSelectedAno(anoItem.ano)}
                  className={`px-4 py-2 rounded-xl font-black text-sm transition-all ${
                    selectedAno === anoItem.ano 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105" 
                      : "text-slate-500 hover:bg-white"
                  }`}
                >
                  {anoItem.ano}º ANO
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="p-8 space-y-8 w-full max-w-[1600px] mx-auto">
          {/* Grid de KPIs Superiores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card Média Geral */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                  <TrendingUp size={24} />
                </div>
                <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-1 rounded-full">GERAL</span>
              </div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-wider">Média Geral (Sem PCD)</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-3xl font-black text-slate-900 font-outfit">
                  {(data.media_geral_sem_pcd?.MEDIA ?? 0).toFixed(2)}
                </h3>
                <span className="text-emerald-500 text-xs font-bold flex items-center gap-0.5">
                  <ArrowUpRight size={14} /> +2.4%
                </span>
              </div>
            </div>

            {/* Card LP / LG */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                  <BookOpen size={24} />
                </div>
                <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-2 py-1 rounded-full">DISCIPLINA</span>
              </div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-wider">Língua Portuguesa</p>
              <h3 className="text-3xl font-black text-slate-900 font-outfit mt-1">
                {(data.media_geral_sem_pcd?.LP ?? data.media_geral_sem_pcd?.LG ?? 0).toFixed(2)}
              </h3>
            </div>

            {/* Card MA */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                  <BarChart3 size={24} />
                </div>
                <span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">DISCIPLINA</span>
              </div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-wider">Matemática</p>
              <h3 className="text-3xl font-black text-slate-900 font-outfit mt-1">
                {(data.media_geral_sem_pcd?.MA ?? 0).toFixed(2)}
              </h3>
            </div>

            {/* Card Unidades */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
                  <School size={24} />
                </div>
                <span className="text-[10px] font-black bg-rose-100 text-rose-700 px-2 py-1 rounded-full">REDE</span>
              </div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-wider">Unidades Avaliadas</p>
              <h3 className="text-3xl font-black text-slate-900 font-outfit mt-1">{data.unidades.length}</h3>
            </div>
          </div>

          {/* Seção Principal: Ranking e Tabela */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Top 5 Unidades */}
            <div className="xl:col-span-1 space-y-6">
              <div className="bg-[#002B5B] text-white p-8 rounded-[32px] shadow-xl">
                <h4 className="text-xl font-black mb-6 flex items-center gap-3">
                  <TrendingUp className="text-[#00d2ff]" />
                  Top Unidades do {selectedAno}º Ano
                </h4>
                <div className="space-y-4">
                  {(rankedUnidades as any[]).slice(0, 5).map((u, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-4">
                        <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-black ${
                          i === 0 ? "bg-amber-400 text-amber-900" : 
                          i === 1 ? "bg-slate-300 text-slate-900" : 
                          i === 2 ? "bg-orange-400 text-orange-950" : "bg-white/20 text-white"
                        }`}>
                          {i + 1}º
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-black truncate">{u.unidade}</p>
                          <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Escola Municipal</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-[#00d2ff]">
                          {(u.MEDIA ?? 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Informativo */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-200">
                <h4 className="text-slate-900 font-black mb-4">Critérios de Avaliação</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-sm text-slate-600 font-bold">Acima de 8.0: Nível Avançado</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-sm text-slate-600 font-bold">6.0 a 7.9: Nível Intermediário</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-sm text-slate-600 font-bold">Abaixo de 6.0: Nível Crítico</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabela Detalhada */}
            <div className="xl:col-span-2 bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h4 className="text-xl font-black text-slate-900">Resultados por Unidade</h4>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <Filter size={20} />
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Unidade Escolar</th>
                      <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Português</th>
                      <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Matemática</th>
                      <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Média Final</th>
                      <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.unidades.map((u: any, i: number) => (
                      <tr key={i} className="group hover:bg-blue-50/30 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                              <School size={16} />
                            </div>
                            <span className="text-sm font-black text-slate-700 group-hover:text-blue-900">{u.unidade}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-center font-bold text-slate-600">
                          {(u.LP ?? u.LG ?? u.LG ?? 0).toFixed(2)}
                        </td>
                        <td className="px-8 py-5 text-center font-bold text-slate-600">
                          {(u.MA ?? 0).toFixed(2)}
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className={`text-sm font-black ${getScoreColor(u.MEDIA ?? 0)}`}>
                            {(u.MEDIA ?? 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-center">
                           <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getBgScoreColor(u.MEDIA ?? 0)}`}>
                             {(u.MEDIA ?? 0) >= 8 ? "Avançado" : (u.MEDIA ?? 0) >= 6 ? "Intermediário" : "Crítico"}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
