"use client";

import { useState, useEffect, useMemo } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { 
  ChevronRight, 
  Lightbulb, 
  Target, 
  Info,
  Download,
  Filter,
  BarChart
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

// Normaliza uma linha da tabela avaliacoes_bim2 para o formato padrão do portal
// Armazena com ambos os formatos de chave (q1 e q_1) pois o lookup do gabarito
// usa gab.item.toLowerCase() que retorna "q_1" (com underscore).
function normalizeBim2Row(row: any): any {
  const normalized: any = { ...row };
  for (let i = 1; i <= 42; i++) {
    if (row[`Q_${i}`] !== undefined) {
      normalized[`q${i}`] = row[`Q_${i}`];   // formato sem underscore
      normalized[`q_${i}`] = row[`Q_${i}`];  // formato com underscore (usado pelo lookup do gabarito)
    }
  }
  return normalized;
}

interface QuestaoGabarito {
  item: string;
  gabarito: string;
  habilidade: string;
  disciplina: string;
}

export default function ResultadosHabilidadesPage() {
  const { user } = useAuth();
  const [selectedAno, setSelectedAno] = useState(1);
  const [selectedAvaliacao, setSelectedAvaliacao] = useState("ad_2026");
  const [selectedComponente, setSelectedComponente] = useState("LÍNGUA PORTUGUESA");
  const [isLoading, setIsLoading] = useState(true);
  
  const [gabarito, setGabarito] = useState<QuestaoGabarito[]>([]);
  const [turmasData, setTurmasData] = useState<any[]>([]);
  const [componentes, setComponentes] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!user?.inep) return;
      setIsLoading(true);
      
      try {
        const isBim2 = selectedAvaliacao === "bim2_2026";
        const respTable = isBim2 ? "avaliacoes_bim2" : `respostas_${selectedAno}ano_${selectedAvaliacao}`;
        const gabTable = isBim2 ? "gabaritos" : `gabarito_${selectedAno}ano_${selectedAvaliacao}`;

        const respQuery = isBim2
          ? supabase.from(respTable).select("*").eq("ano_escolar", selectedAno).eq("inep", user.inep)
          : supabase.from(respTable).select("*").eq("inep", user.inep);
        const gabQuery = isBim2
          ? supabase.from(gabTable).select("*").eq("ano_escolar", selectedAno).eq("bimestre", 2)
          : supabase.from(gabTable).select("*");

        const [respRes, gabRes] = await Promise.all([respQuery, gabQuery]);

        if (respRes.error) throw respRes.error;
        if (gabRes.error) throw gabRes.error;

        const students = (respRes.data || []).map((row: any) =>
          isBim2 ? normalizeBim2Row(row) : row
        );

        // Mapeamento de abreviaturas do bim2 para nomes completos
        const DISC_MAP: Record<string, string> = {
          LP: "L\u00cdNGUA PORTUGUESA",
          MA: "MATEM\u00c1TICA",
          CN: "CI\u00caNCIAS NATURAIS",
          CH: "CI\u00caNCIAS HUMANAS",
        };

        const gabItems = (gabRes.data || []).map((g: any) => ({
          ...g,
          disciplina: isBim2 ? (DISC_MAP[g.disciplina?.toUpperCase()] || g.disciplina.toUpperCase()) : g.disciplina,
        })) as QuestaoGabarito[];
        
        setGabarito(gabItems);

        // Identificar componentes disponíveis
        const comps = Array.from(new Set(gabItems.map(g => g.disciplina.toUpperCase())));
        setComponentes(comps);
        if (!comps.includes(selectedComponente)) {
          setSelectedComponente(comps[0] || "LÍNGUA PORTUGUESA");
        }

        // Agrupar por Turma e calcular rendimento por questão
        const turmasMap: Record<string, any> = {};
        
        students.forEach(student => {
          const tName = student.turma;
          if (!turmasMap[tName]) {
            turmasMap[tName] = { 
               nome: tName, 
               totalEstudantes: 0,
               acertosPorQuestao: {} 
            };
          }
          turmasMap[tName].totalEstudantes++;
          
          gabItems.forEach(gab => {
            const qKey = gab.item.toLowerCase();
            const studentAns = student[qKey];
            if (studentAns === gab.gabarito) {
              turmasMap[tName].acertosPorQuestao[qKey] = (turmasMap[tName].acertosPorQuestao[qKey] || 0) + 1;
            }
          });
        });

        const processedTurmas = Object.values(turmasMap).map(t => {
          const rendimento: Record<string, number> = {};
          gabItems.forEach(gab => {
            const qKey = gab.item.toLowerCase();
            rendimento[qKey] = t.totalEstudantes > 0 
              ? (t.acertosPorQuestao[qKey] || 0) / t.totalEstudantes * 100 
              : 0;
          });
          return { ...t, rendimento };
        }).sort((a, b) => a.nome.localeCompare(b.nome));

        setTurmasData(processedTurmas);
      } catch (err) {
        console.error("Erro ao processar dados de habilidades:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [selectedAno, selectedAvaliacao, user?.inep, selectedComponente]);

  // Auto-detect first year with data for the logged-in INEP and evaluation
  useEffect(() => {
    async function detectDefaultYear() {
      if (!user?.inep) return;
      try {
        const years = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const isBim2 = selectedAvaliacao === "bim2_2026";
        const results = await Promise.all(
          years.map(async (ano) => {
            if (isBim2) {
              const { count, error } = await supabase
                .from("avaliacoes_bim2")
                .select("*", { count: "exact", head: true })
                .eq("ano_escolar", ano)
                .eq("inep", user.inep);
              return { ano, count: error ? 0 : (count || 0) };
            }
            const { count, error } = await supabase
              .from(`respostas_${ano}ano_${selectedAvaliacao}`)
              .select("*", { count: "exact", head: true })
              .eq("inep", user.inep);
            return { ano, count: error ? 0 : (count || 0) };
          })
        );
        const firstWithData = results.find(r => r.count > 0);
        if (firstWithData && firstWithData.ano !== selectedAno) {
          setSelectedAno(firstWithData.ano);
        }
      } catch (err) {
        console.error("Erro ao detectar ano padrão:", err);
      }
    }
    detectDefaultYear();
  }, [user?.inep, selectedAvaliacao]);

  const filteredQuestoes = useMemo(() => {
    return gabarito.filter(q => q.disciplina.toUpperCase() === selectedComponente);
  }, [gabarito, selectedComponente]);

  const NIVEIS = [
    { label: "Excelente", range: "≥ 90%",  color: "bg-emerald-500", text: "text-white",       min: 90 },
    { label: "Bom",       range: "80-89%", color: "bg-emerald-400", text: "text-white",       min: 80 },
    { label: "Regular",   range: "70-79%", color: "bg-amber-400",   text: "text-amber-950", min: 70 },
    { label: "Atenção",   range: "60-69%", color: "bg-orange-400", text: "text-white",       min: 60 },
    { label: "Crítico",   range: "< 60%",  color: "bg-rose-500",   text: "text-white",       min: 0  },
  ];

  const getHeatmapColor = (pct: number) => {
    const nivel = NIVEIS.find(n => pct >= n.min);
    return nivel ? `${nivel.color} ${nivel.text}` : "bg-rose-500 text-white";
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-slate-50">
        <header className="px-8 py-10 bg-white border-b border-slate-200 sticky top-[72px] z-40">
          <div className="flex items-center gap-3 text-blue-600 mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest">Gestão Escolar</span>
            <ChevronRight size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Análise de Habilidades por Turma</span>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div>
              <h1 className="text-4xl font-black text-slate-900 font-outfit tracking-tight">Rendimento por Turma 2026</h1>
              <p className="mt-1 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                {user?.escola} — INEP {user?.inep}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 mr-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((ano) => (
                  <button
                    key={ano}
                    onClick={() => setSelectedAno(ano)}
                    className={`w-10 h-10 rounded-lg font-black text-xs transition-all ${
                      selectedAno === ano ? "bg-white text-blue-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {ano}º
                  </button>
                ))}
              </div>

              {/* Seletor de Avaliação */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 mr-2">
                {[
                  { id: "ad_2026", label: "DIAGNÓSTICA" },
                  { id: "bim1_2026", label: "BIMESTRAL 1" },
                  { id: "bim2_2026", label: "BIMESTRAL 2" }
                ].map((av) => (
                  <button
                    key={av.id}
                    onClick={() => setSelectedAvaliacao(av.id)}
                    className={`px-4 h-10 rounded-lg font-black text-[10px] transition-all ${
                      selectedAvaliacao === av.id 
                        ? "bg-white text-blue-600 shadow-sm border border-slate-200" 
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {av.label}
                  </button>
                ))}
              </div>

              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                {componentes.map((comp) => (
                  <button
                    key={comp}
                    onClick={() => setSelectedComponente(comp)}
                    className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${
                      selectedComponente === comp ? "bg-white text-blue-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {comp}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <main className="p-8">
          <div className="mb-8 flex flex-col md:flex-row gap-6 items-stretch md:items-center">
            <div className="flex flex-wrap items-center gap-4 bg-white px-8 py-5 rounded-[24px] border border-slate-200 shadow-sm flex-1">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">
                <Info size={14} />
                Níveis de Aprendizagem:
              </div>
              {NIVEIS.map((nivel) => (
                <div key={nivel.label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-md ${nivel.color}`} />
                  <span className="text-[10px] font-bold text-slate-600">
                    {nivel.label} <span className="text-slate-400">({nivel.range})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden">
            {isLoading ? (
              <div className="p-40 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                <p className="font-bold text-slate-500">Calculando rendimento pedagógico das turmas...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="sticky left-0 z-20 bg-slate-50 p-6 text-left min-w-[200px] border-r border-slate-200">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Turma</span>
                      </th>
                      {filteredQuestoes.map((q) => (
                        <th key={q.item} className="p-4 text-center min-w-[85px] border-r border-slate-100">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{q.item.toUpperCase()}</span>
                            <span className="text-[10px] font-black text-slate-900 tracking-tighter whitespace-nowrap">{q.habilidade}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {turmasData.map((turma, idx) => (
                      <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                        <td className="sticky left-0 z-20 bg-white group-hover:bg-slate-50 p-6 border-r border-slate-200 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)]">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-700">{turma.nome}</span>
                            <span className="text-[10px] text-slate-400 font-bold">{turma.totalEstudantes} Estudantes</span>
                          </div>
                        </td>
                        {filteredQuestoes.map((q) => {
                          const pct = turma.rendimento[q.item.toLowerCase()] || 0;
                          return (
                            <td key={q.item} className="p-1 border-r border-slate-50">
                              <div className={`h-11 flex items-center justify-center rounded-xl font-black text-[11px] transition-transform hover:scale-110 cursor-default ${getHeatmapColor(pct)}`}>
                                {pct.toFixed(0)}%
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#003B7E] p-8 rounded-[32px] text-white shadow-xl flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                <BarChart className="text-[#00d2ff]" size={32} />
              </div>
              <div>
                <p className="text-blue-200 text-xs font-black uppercase tracking-widest">Total de Turmas</p>
                <h4 className="text-3xl font-black">{turmasData.length}</h4>
              </div>
            </div>
            {/* Adicionar mais cards informativos aqui conforme necessário */}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
