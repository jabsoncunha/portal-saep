"use client";

import { useState, useEffect, useMemo } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { 
  ChevronRight, 
  BarChart3, 
  School, 
  BookOpen, 
  TrendingUp,
  ArrowUpRight,
  Target,
  Users
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function IndicadoresGeraisPage() {
  const { user } = useAuth();
  const [selectedAno, setSelectedAno] = useState(1);
  const [selectedAvaliacao, setSelectedAvaliacao] = useState("ad_2026");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [turmas, setTurmas] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!user?.inep) return;
      setIsLoading(true);
      
      try {
        const tableName = `respostas_${selectedAno}ano_${selectedAvaliacao}`;
        const { data, error } = await supabase
          .from(tableName)
          .select("*")
          .eq("inep", user.inep);
          
        if (error) throw error;
        
        const students = data || [];
        
        const parseGrade = (val: any) => {
          if (val === null || val === undefined || val === "" || val === "_") return null;
          const parsed = parseFloat(String(val).replace(",", "."));
          return isNaN(parsed) ? null : parsed;
        };

        // Calcular médias globais da escola
        let sumLP = 0, countLP = 0;
        let sumMA = 0, countMA = 0;
        let sumCN = 0, countCN = 0;
        let sumCH = 0, countCH = 0;
        let sumMedia = 0, countMedia = 0;

        students.forEach(s => {
          const lgVal = parseGrade(s.lg || s.lp);
          if (lgVal !== null) {
            sumLP += lgVal;
            countLP++;
          }
          const maVal = parseGrade(s.ma);
          if (maVal !== null) {
            sumMA += maVal;
            countMA++;
          }
          const cnVal = parseGrade(s.cn || s.ci);
          if (cnVal !== null) {
            sumCN += cnVal;
            countCN++;
          }
          const chVal = parseGrade(s.ch);
          if (chVal !== null) {
            sumCH += chVal;
            countCH++;
          }

          const grades: number[] = [];
          if (lgVal !== null) grades.push(lgVal);
          if (maVal !== null) grades.push(maVal);
          if (cnVal !== null) grades.push(cnVal);
          if (chVal !== null) grades.push(chVal);
          
          if (grades.length > 0) {
            sumMedia += grades.reduce((a, b) => a + b, 0) / grades.length;
            countMedia++;
          }
        });

        setStats({
          total: students.length,
          mediaLP: countLP > 0 ? sumLP / countLP : 0,
          mediaMA: countMA > 0 ? sumMA / countMA : 0,
          mediaCN: countCN > 0 ? sumCN / countCN : 0,
          mediaCH: countCH > 0 ? sumCH / countCH : 0,
          mediaGeral: countMedia > 0 ? sumMedia / countMedia : 0
        });

        // Agrupar por Turma
        const turmasMap: Record<string, any> = {};
        students.forEach(s => {
          const tName = s.turma;
          if (!turmasMap[tName]) {
            turmasMap[tName] = {
              nome: tName,
              total: 0,
              sumLP: 0, countLP: 0,
              sumMA: 0, countMA: 0,
              sumCN: 0, countCN: 0,
              sumCH: 0, countCH: 0,
              sumMedia: 0, countMedia: 0
            };
          }
          const t = turmasMap[tName];
          t.total++;
          
          const lgVal = parseGrade(s.lg || s.lp);
          if (lgVal !== null) {
            t.sumLP += lgVal;
            t.countLP++;
          }
          const maVal = parseGrade(s.ma);
          if (maVal !== null) {
            t.sumMA += maVal;
            t.countMA++;
          }
          const cnVal = parseGrade(s.cn || s.ci);
          if (cnVal !== null) {
            t.sumCN += cnVal;
            t.countCN++;
          }
          const chVal = parseGrade(s.ch);
          if (chVal !== null) {
            t.sumCH += chVal;
            t.countCH++;
          }
          
          const grades: number[] = [];
          if (lgVal !== null) grades.push(lgVal);
          if (maVal !== null) grades.push(maVal);
          if (cnVal !== null) grades.push(cnVal);
          if (chVal !== null) grades.push(chVal);
          
          if (grades.length > 0) {
            const studentMedia = grades.reduce((a, b) => a + b, 0) / grades.length;
            t.sumMedia += studentMedia;
            t.countMedia++;
          }
        });

        const processedTurmas = Object.values(turmasMap).map((t: any) => ({
          nome: t.nome,
          total: t.total,
          media: t.countMedia > 0 ? t.sumMedia / t.countMedia : 0,
          mediaLP: t.countLP > 0 ? t.sumLP / t.countLP : 0,
          mediaMA: t.countMA > 0 ? t.sumMA / t.countMA : 0,
          mediaCN: t.countCN > 0 ? t.sumCN / t.countCN : 0,
          mediaCH: t.countCH > 0 ? t.sumCH / t.countCH : 0
        })).sort((a, b) => b.media - a.media);

        setTurmas(processedTurmas);
      } catch (err) {
        console.error("Erro ao buscar indicadores:", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [selectedAno, selectedAvaliacao, user?.inep]);

  // Auto-detect first year with data for the logged-in INEP and evaluation
  useEffect(() => {
    async function detectDefaultYear() {
      if (!user?.inep) return;
      try {
        const years = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const results = await Promise.all(
          years.map(async (ano) => {
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
        <header className="px-8 py-12 bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-3 text-blue-600 mb-4">
            <span className="text-xs font-black uppercase tracking-widest">Dashboards</span>
            <ChevronRight size={14} />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Indicadores Estratégicos</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 font-outfit tracking-tight">Desempenho Escolar 2026</h1>
              <p className="mt-1 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                {user?.escola} — INEP {user?.inep}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((ano) => (
                  <button
                    key={ano}
                    onClick={() => setSelectedAno(ano)}
                    className={`px-4 py-2 rounded-xl font-black text-sm transition-all ${
                      selectedAno === ano 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105" 
                        : "text-slate-500 hover:bg-white"
                    }`}
                  >
                    {ano}º ANO
                  </button>
                ))}
              </div>

              {/* Seletor de Avaliação */}
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                {[
                  { id: "ad_2026", label: "DIAGNÓSTICA" },
                  { id: "bim1_2026", label: "BIMESTRAL 1" }
                ].map((av) => (
                  <button
                    key={av.id}
                    onClick={() => setSelectedAvaliacao(av.id)}
                    className={`px-4 py-2 rounded-xl font-black text-sm transition-all ${
                      selectedAvaliacao === av.id 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105" 
                        : "text-slate-500 hover:bg-white"
                    }`}
                  >
                    {av.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 space-y-8 w-full max-w-[1600px] mx-auto">
          {isLoading ? (
            <div className="p-40 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
              <p className="font-bold text-slate-500">Consolidando indicadores da unidade...</p>
            </div>
          ) : (
            <>
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${selectedAno >= 3 ? "5" : "4"} gap-6`}>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                      <TrendingUp size={24} />
                    </div>
                    <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-1 rounded-full">ESCOLA</span>
                  </div>
                  <p className="text-slate-500 text-xs font-black uppercase tracking-wider">Média Geral</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-3xl font-black text-slate-900 font-outfit">
                      {stats?.mediaGeral.toFixed(2)}
                    </h3>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                      <BookOpen size={24} />
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs font-black uppercase tracking-wider">LP / LG</p>
                  <h3 className="text-3xl font-black text-slate-900 font-outfit mt-1">
                    {stats?.mediaLP.toFixed(2)}
                  </h3>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                      <BarChart3 size={24} />
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs font-black uppercase tracking-wider">Matemática</p>
                  <h3 className="text-3xl font-black text-slate-900 font-outfit mt-1">
                    {stats?.mediaMA.toFixed(2)}
                  </h3>
                </div>

                {selectedAno >= 3 && (
                  <>
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                          <BookOpen size={24} />
                        </div>
                      </div>
                      <p className="text-slate-500 text-xs font-black uppercase tracking-wider">Ciências Nat.</p>
                      <h3 className="text-3xl font-black text-slate-900 font-outfit mt-1">
                        {stats?.mediaCN.toFixed(2)}
                      </h3>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-2xl bg-orange-50 text-orange-600">
                          <BookOpen size={24} />
                        </div>
                      </div>
                      <p className="text-slate-500 text-xs font-black uppercase tracking-wider">Ciências Hum.</p>
                      <h3 className="text-3xl font-black text-slate-900 font-outfit mt-1">
                        {stats?.mediaCH.toFixed(2)}
                      </h3>
                    </div>
                  </>
                )}

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
                      <Users size={24} />
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs font-black uppercase tracking-wider">Total de Alunos</p>
                  <h3 className="text-3xl font-black text-slate-900 font-outfit mt-1">{stats?.total}</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-1 space-y-6">
                  <div className="bg-[#002B5B] text-white p-8 rounded-[32px] shadow-xl">
                    <h4 className="text-xl font-black mb-6 flex items-center gap-3">
                      <Target className="text-[#00d2ff]" />
                      Ranking de Turmas
                    </h4>
                    <div className="space-y-4">
                      {turmas.map((t, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-black text-[#00d2ff]">{i + 1}º</span>
                            <div>
                              <p className="text-sm font-black truncate">{t.nome}</p>
                              <p className="text-[10px] text-white/50 font-bold uppercase">{t.total} Alunos</p>
                            </div>
                          </div>
                          <span className="text-lg font-black text-white">{t.media.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="xl:col-span-2 bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h4 className="text-xl font-black text-slate-900">Detalhamento por Turma</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Turma</th>
                          <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">LP / LG</th>
                          <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Matemática</th>
                          {selectedAno >= 3 && (
                            <>
                              <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Ciências Nat.</th>
                              <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Ciências Hum.</th>
                            </>
                          )}
                          <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Média Final</th>
                          <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {turmas.map((t, i) => (
                          <tr key={i} className="group hover:bg-blue-50/30 transition-colors">
                            <td className="px-8 py-5">
                              <span className="text-sm font-black text-slate-700">{t.nome}</span>
                            </td>
                            <td className="px-8 py-5 text-center font-bold text-slate-600">
                              {t.mediaLP.toFixed(2)}
                            </td>
                            <td className="px-8 py-5 text-center font-bold text-slate-600">
                              {t.mediaMA.toFixed(2)}
                            </td>
                            {selectedAno >= 3 && (
                              <>
                                <td className="px-8 py-5 text-center font-bold text-slate-600">
                                  {t.mediaCN.toFixed(2)}
                                </td>
                                <td className="px-8 py-5 text-center font-bold text-slate-600">
                                  {t.mediaCH.toFixed(2)}
                                </td>
                              </>
                            )}
                            <td className="px-8 py-5 text-center">
                              <span className={`text-sm font-black ${getScoreColor(t.media)}`}>
                                {t.media.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-center">
                               <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getBgScoreColor(t.media)}`}>
                                 {t.media >= 8 ? "Avançado" : t.media >= 6 ? "Intermediário" : "Crítico"}
                               </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
