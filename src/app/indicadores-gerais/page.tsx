"use client";

import { useState, useEffect, useMemo } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  ChevronRight,
  BarChart3,
  BookOpen,
  TrendingUp,
  Target,
  Users,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
  Award,
  Zap,
  GitCompare,
  Filter,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  Cell,
  LabelList,
} from "recharts";

const AVALIACOES = [
  { id: "ad_2026", label: "DIAGNÓSTICA" },
  { id: "bim1_2026", label: "BIMESTRAL 1" },
  { id: "bim2_2026", label: "BIMESTRAL 2" },
];

// Normaliza uma linha da tabela avaliacoes_bim2 para o formato padrão usado pelo portal
function normalizeBim2Row(row: any): any {
  const normalized: any = { ...row };
  // Renomear colunas de nota para o formato padrão
  normalized.lg = row.nota_lp ?? null;
  normalized.lp = row.nota_lp ?? null;
  normalized.ma = row.nota_ma ?? null;
  normalized.cn = row.nota_cn ?? null;
  normalized.ch = row.nota_ch ?? null;
  // Renomear colunas de resposta: Q_1 -> q1
  for (let i = 1; i <= 42; i++) {
    const bim2Key = `Q_${i}`;
    const stdKey = `q${i}`;
    if (row[bim2Key] !== undefined) {
      normalized[stdKey] = row[bim2Key];
    }
  }
  return normalized;
}

async function fetchStudents(ano: number, avaliacao: string, inep: string | number) {
  if (avaliacao === "bim2_2026") {
    const { data, error } = await supabase
      .from("avaliacoes_bim2")
      .select("*")
      .eq("ano_escolar", ano)
      .eq("inep", inep);
    if (error) throw error;
    return (data || []).map(normalizeBim2Row);
  }
  const { data, error } = await supabase
    .from(`respostas_${ano}ano_${avaliacao}`)
    .select("*")
    .eq("inep", inep);
  if (error) throw error;
  return data || [];
}

async function fetchGabaritoForAno(ano: number, avaliacao: string): Promise<Record<string, { gabarito: string; habilidade: string }>> {
  let data: any[] | null = null;
  let error: any = null;

  if (avaliacao === "bim2_2026") {
    const res = await supabase
      .from("gabaritos")
      .select("item, gabarito, habilidade")
      .eq("ano_escolar", ano)
      .eq("bimestre", 2);
    data = res.data;
    error = res.error;
  } else {
    const tableName = `gabarito_${ano}ano_${avaliacao}`;
    const res = await supabase.from(tableName).select("item, gabarito, habilidade");
    data = res.data;
    error = res.error;
    if (error) {
      const fallback = await supabase.from(tableName).select("item, gabarito");
      data = fallback.data;
      error = fallback.error;
    }
  }

  if (!error && data) {
    const gab: Record<string, { gabarito: string; habilidade: string }> = {};
    data.forEach((row: any) => {
      const keyNormalized = String(row.item).toLowerCase().replace("_", "");
      gab[keyNormalized] = {
        gabarito: String(row.gabarito).toUpperCase(),
        habilidade: row.habilidade || ""
      };
    });
    return gab;
  }
  return {};
}

async function countStudents(ano: number, avaliacao: string, inep: string | number): Promise<number> {
  if (avaliacao === "bim2_2026") {
    const { count } = await supabase
      .from("avaliacoes_bim2")
      .select("*", { count: "exact", head: true })
      .eq("ano_escolar", ano)
      .eq("inep", inep);
    return count || 0;
  }
  const { count } = await supabase
    .from(`respostas_${ano}ano_${avaliacao}`)
    .select("*", { count: "exact", head: true })
    .eq("inep", inep);
  return count || 0;
}

interface TurmaStats {
  nome: string;
  total: number;
  media: number;
  mediaLP: number;
  mediaMA: number;
  mediaCN: number;
  mediaCH: number;
}

interface QuestaoStats {
  questao: string;
  totalRespostas: number;
  totalErros: number;
  taxaErro: number;
  gabarito: string;
  habilidade: string;
  distratores: Record<string, number>;
}

interface GlobalStats {
  total: number;
  mediaLP: number;
  mediaMA: number;
  mediaCN: number;
  mediaCH: number;
  mediaGeral: number;
}

const parseGrade = (val: any): number | null => {
  if (val === null || val === undefined || val === "" || val === "_") return null;
  const parsed = parseFloat(String(val).replace(",", "."));
  return isNaN(parsed) ? null : parsed;
};

function calcStats(students: any[]): GlobalStats {
  let sumLP = 0, countLP = 0;
  let sumMA = 0, countMA = 0;
  let sumCN = 0, countCN = 0;
  let sumCH = 0, countCH = 0;
  let sumMedia = 0, countMedia = 0;

  students.forEach((s) => {
    const lgVal = parseGrade(s.lg ?? s.lp);
    if (lgVal !== null) { sumLP += lgVal; countLP++; }
    const maVal = parseGrade(s.ma);
    if (maVal !== null) { sumMA += maVal; countMA++; }
    const cnVal = parseGrade(s.cn ?? s.ci);
    if (cnVal !== null) { sumCN += cnVal; countCN++; }
    const chVal = parseGrade(s.ch);
    if (chVal !== null) { sumCH += chVal; countCH++; }
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

  return {
    total: students.length,
    mediaLP: countLP > 0 ? sumLP / countLP : 0,
    mediaMA: countMA > 0 ? sumMA / countMA : 0,
    mediaCN: countCN > 0 ? sumCN / countCN : 0,
    mediaCH: countCH > 0 ? sumCH / countCH : 0,
    mediaGeral: countMedia > 0 ? sumMedia / countMedia : 0,
  };
}

function calcTurmas(students: any[], ano: number): TurmaStats[] {
  const map: Record<string, any> = {};
  students.forEach((s) => {
    const t = s.turma;
    if (!map[t]) map[t] = { nome: t, total: 0, sumLP: 0, countLP: 0, sumMA: 0, countMA: 0, sumCN: 0, countCN: 0, sumCH: 0, countCH: 0, sumMedia: 0, countMedia: 0 };
    const r = map[t];
    r.total++;
    const lgVal = parseGrade(s.lg ?? s.lp);
    if (lgVal !== null) { r.sumLP += lgVal; r.countLP++; }
    const maVal = parseGrade(s.ma);
    if (maVal !== null) { r.sumMA += maVal; r.countMA++; }
    const cnVal = parseGrade(s.cn ?? s.ci);
    if (cnVal !== null) { r.sumCN += cnVal; r.countCN++; }
    const chVal = parseGrade(s.ch);
    if (chVal !== null) { r.sumCH += chVal; r.countCH++; }
    const grades: number[] = [];
    if (lgVal !== null) grades.push(lgVal);
    if (maVal !== null) grades.push(maVal);
    if (cnVal !== null) grades.push(cnVal);
    if (chVal !== null) grades.push(chVal);
    if (grades.length > 0) {
      r.sumMedia += grades.reduce((a: number, b: number) => a + b, 0) / grades.length;
      r.countMedia++;
    }
  });
  return Object.values(map).map((r: any) => ({
    nome: r.nome,
    total: r.total,
    media: r.countMedia > 0 ? r.sumMedia / r.countMedia : 0,
    mediaLP: r.countLP > 0 ? r.sumLP / r.countLP : 0,
    mediaMA: r.countMA > 0 ? r.sumMA / r.countMA : 0,
    mediaCN: r.countCN > 0 ? r.sumCN / r.countCN : 0,
    mediaCH: r.countCH > 0 ? r.sumCH / r.countCH : 0,
  })).sort((a, b) => a.nome.localeCompare(b.nome));
}

function calcHabilidades(students: any[], gabarito: Record<string, { gabarito: string; habilidade: string }>): QuestaoStats[] {
  if (students.length === 0) return [];
  
  const questaoStats: Record<string, { total: number; erros: number; distratores: Record<string, number> }> = {};
  
  students.forEach((s) => {
    Object.entries(s).forEach(([key, val]) => {
      if (!key.startsWith("q") || !/^q_?\d+$/.test(key)) return;
      
      const normalizedKey = key.replace("_", "");
      
      const cleanVal = val === null || val === undefined ? "" : String(val).trim().toUpperCase();
      if (cleanVal === "" || cleanVal === "_" || cleanVal === "-") return;
      
      if (!questaoStats[normalizedKey]) {
        questaoStats[normalizedKey] = { total: 0, erros: 0, distratores: {} };
      }
      questaoStats[normalizedKey].total++;
      questaoStats[normalizedKey].distratores[cleanVal] = (questaoStats[normalizedKey].distratores[cleanVal] || 0) + 1;
      
      const gabObj = gabarito[normalizedKey];
      if (gabObj && cleanVal !== gabObj.gabarito) {
        questaoStats[normalizedKey].erros++;
      }
    });
  });

  return Object.entries(questaoStats)
    .map(([q, stat]) => ({
      questao: q.toUpperCase(),
      totalRespostas: stat.total,
      totalErros: stat.erros,
      taxaErro: stat.total > 0 ? (stat.erros / stat.total) * 100 : 0,
      gabarito: gabarito[q]?.gabarito ?? "?",
      habilidade: gabarito[q]?.habilidade ?? "",
      distratores: stat.distratores,
    }))
    .sort((a, b) => b.taxaErro - a.taxaErro);
}

interface HabilidadeStats {
  habilidade: string;
  totalRespostas: number;
  totalErros: number;
  taxaErro: number;
  questoes: {
    questao: string;
    taxaErro: number;
    gabarito: string;
    distratores: Record<string, number>;
    totalRespostas: number;
  }[];
}

function getHabilidadeCode(hab: string): string {
  const match = hab.match(/^([A-Za-z0-9]+)/);
  return match ? match[1] : hab.substring(0, 8);
}

function calcGroupedHabilidades(questoes: QuestaoStats[]): HabilidadeStats[] {
  const map: Record<string, { totalRespostas: number; totalErros: number; questoes: HabilidadeStats["questoes"] }> = {};
  
  questoes.forEach((q) => {
    const habName = q.habilidade || "Sem Habilidade Cadastrada";
    if (!map[habName]) {
      map[habName] = { totalRespostas: 0, totalErros: 0, questoes: [] };
    }
    map[habName].totalRespostas += q.totalRespostas;
    map[habName].totalErros += q.totalErros;
    map[habName].questoes.push({
      questao: q.questao,
      taxaErro: q.taxaErro,
      gabarito: q.gabarito,
      distratores: q.distratores,
      totalRespostas: q.totalRespostas,
    });
  });

  return Object.entries(map)
    .map(([habilidade, data]) => ({
      habilidade,
      totalRespostas: data.totalRespostas,
      totalErros: data.totalErros,
      taxaErro: data.totalRespostas > 0 ? (data.totalErros / data.totalRespostas) * 100 : 0,
      questoes: data.questoes.sort((a, b) => a.questao.localeCompare(b.questao, undefined, { numeric: true })),
    }))
    .sort((a, b) => b.taxaErro - a.taxaErro);
}

const getScoreColor = (score: number) => {
  if (score >= 8) return "text-emerald-600";
  if (score >= 6) return "text-amber-500";
  return "text-rose-600";
};

const getScoreBadge = (score: number) => {
  if (score >= 8) return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (score >= 6) return "bg-amber-50 text-amber-700 border border-amber-200";
  return "bg-rose-50 text-rose-700 border border-rose-200";
};

const getBarColor = (score: number) => {
  if (score >= 8) return "#10b981";
  if (score >= 6) return "#f59e0b";
  return "#f43f5e";
};

const DeltaChip = ({ prev, curr }: { prev: number; curr: number }) => {
  const delta = curr - prev;
  if (Math.abs(delta) < 0.01) return <span className="flex items-center gap-1 text-slate-400 text-xs font-black"><Minus size={12} /> Igual</span>;
  if (delta > 0) return <span className="flex items-center gap-1 text-emerald-600 text-xs font-black"><ArrowUp size={12} /> +{delta.toFixed(2)}</span>;
  return <span className="flex items-center gap-1 text-rose-600 text-xs font-black"><ArrowDown size={12} /> {delta.toFixed(2)}</span>;
};

export default function IndicadoresGeraisPage() {
  const { user } = useAuth();
  const [selectedAno, setSelectedAno] = useState(1);
  const [selectedAvaliacao, setSelectedAvaliacao] = useState("ad_2026");
  const [activeTab, setActiveTab] = useState<"overview" | "habilidades" | "comparacao">("overview");
  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [turmas, setTurmas] = useState<TurmaStats[]>([]);
  const [habilidades, setHabilidades] = useState<QuestaoStats[]>([]);
  const [gabarito, setGabarito] = useState<Record<string, { gabarito: string; habilidade: string }>>({});

  const [selectedHabilidadeFilter, setSelectedHabilidadeFilter] = useState<string>("all");

  // Reset Habilidade Filter when year or evaluation changes
  useEffect(() => {
    setSelectedHabilidadeFilter("all");
  }, [selectedAno, selectedAvaliacao]);

  // Reset activeTab if we select ad_2026 (Diagnóstica) since it has no previous comparison
  useEffect(() => {
    if (selectedAvaliacao === "ad_2026") {
      setStatsComp(null);
      setStatsAd(null);
      if (activeTab === "comparacao") {
        setActiveTab("overview");
      }
    }
  }, [selectedAvaliacao, activeTab]);

  const groupedHabilidades = useMemo(() => {
    return calcGroupedHabilidades(habilidades);
  }, [habilidades]);

  const uniqueHabilidadesList = useMemo(() => {
    return groupedHabilidades.map(h => h.habilidade).sort((a, b) => a.localeCompare(b));
  }, [groupedHabilidades]);

  const selectedHabilidadeData = useMemo(() => {
    if (selectedHabilidadeFilter === "all") return null;
    return groupedHabilidades.find(h => h.habilidade === selectedHabilidadeFilter) || null;
  }, [groupedHabilidades, selectedHabilidadeFilter]);

  const chartDataAll = useMemo(() => {
    return groupedHabilidades.map((h) => ({
      name: getHabilidadeCode(h.habilidade),
      fullName: h.habilidade,
      taxaErro: parseFloat(h.taxaErro.toFixed(1)),
    }));
  }, [groupedHabilidades]);

  // Para comparação entre avaliações
  const [statsComp, setStatsComp] = useState<GlobalStats | null>(null);
  const [statsAd, setStatsAd] = useState<GlobalStats | null>(null);
  const [isLoadingComp, setIsLoadingComp] = useState(false);

  // Fetch gabarito
  useEffect(() => {
    async function fetchGabarito() {
      const gab = await fetchGabaritoForAno(selectedAno, selectedAvaliacao);
      setGabarito(gab);
    }
    fetchGabarito();
  }, [selectedAno, selectedAvaliacao]);

  // Fetch main data
  useEffect(() => {
    async function fetchData() {
      if (!user?.inep) return;
      setIsLoading(true);
      try {
        const students = await fetchStudents(selectedAno, selectedAvaliacao, user.inep);
        setStats(calcStats(students));
        setTurmas(calcTurmas(students, selectedAno));
        setHabilidades(calcHabilidades(students, gabarito));
      } catch (err) {
        console.error("Erro:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [selectedAno, selectedAvaliacao, user?.inep, gabarito]);

  // Fetch comparison data (the PREVIOUS avaliação)
  useEffect(() => {
    async function fetchComp() {
      if (!user?.inep || activeTab !== "comparacao") return;
      setIsLoadingComp(true);
      try {
        // Ordem cronológica: ad_2026 -> bim1_2026 -> bim2_2026
        const order = ["ad_2026", "bim1_2026", "bim2_2026"];
        const idx = order.indexOf(selectedAvaliacao);
        const otherAv = idx > 0 ? order[idx - 1] : order[1];
        const students = await fetchStudents(selectedAno, otherAv, user.inep);
        setStatsComp(calcStats(students));

        if (selectedAvaliacao === "bim2_2026") {
          const studentsAd = await fetchStudents(selectedAno, "ad_2026", user.inep);
          setStatsAd(calcStats(studentsAd));
        } else {
          setStatsAd(null);
        }
      } catch {
        setStatsComp(null);
        setStatsAd(null);
      } finally {
        setIsLoadingComp(false);
      }
    }
    fetchComp();
  }, [activeTab, selectedAno, selectedAvaliacao, user?.inep]);

  // Auto-detect first year
  useEffect(() => {
    async function detect() {
      if (!user?.inep) return;
      try {
        const results = await Promise.all(
          [1, 2, 3, 4, 5, 6, 7, 8, 9].map(async (ano) => {
            const count = await countStudents(ano, selectedAvaliacao, user.inep);
            return { ano, count };
          })
        );
        const first = results.find((r) => r.count > 0);
        if (first && first.ano !== selectedAno) setSelectedAno(first.ano);
      } catch {}
    }
    detect();
  }, [user?.inep, selectedAvaliacao]);

  const radarData = useMemo(() => {
    if (!stats) return [];
    const subjects: { subject: string; value: number }[] = [
      { subject: "LP / LG", value: parseFloat(stats.mediaLP.toFixed(2)) },
      { subject: "Matemática", value: parseFloat(stats.mediaMA.toFixed(2)) },
    ];
    if (selectedAno >= 3) {
      subjects.push({ subject: "Ciências Nat.", value: parseFloat(stats.mediaCN.toFixed(2)) });
      subjects.push({ subject: "Ciências Hum.", value: parseFloat(stats.mediaCH.toFixed(2)) });
    }
    return subjects;
  }, [stats, selectedAno]);

  const barDataTurmas = useMemo(() => {
    return turmas.map((t) => ({
      name: t.nome,
      "LP / LG": parseFloat(t.mediaLP.toFixed(2)),
      Matemática: parseFloat(t.mediaMA.toFixed(2)),
      ...(selectedAno >= 3 && {
        "Ciências Nat.": parseFloat(t.mediaCN.toFixed(2)),
        "Ciências Humanas": parseFloat(t.mediaCH.toFixed(2)),
      }),
      "Média Geral": parseFloat(t.media.toFixed(2)),
    }));
  }, [turmas, selectedAno]);

  const top10Deficitarias = useMemo(() => habilidades.slice(0, 10), [habilidades]);

  const compData = useMemo(() => {
    if (!stats || !statsComp) return [];
    const labels: { key: keyof GlobalStats; label: string }[] = [
      { key: "mediaGeral", label: "Média Geral" },
      { key: "mediaLP", label: "LP / LG" },
      { key: "mediaMA", label: "Matemática" },
    ];
    if (selectedAno >= 3) {
      labels.push({ key: "mediaCN", label: "Ciências Nat." });
      labels.push({ key: "mediaCH", label: "Ciências Hum." });
    }
    const avLabels: Record<string, string> = { "ad_2026": "Diagnóstica", "bim1_2026": "BIM 1", "bim2_2026": "BIM 2" };
    const order = ["ad_2026", "bim1_2026", "bim2_2026"];
    const idx = order.indexOf(selectedAvaliacao);
    const otherAv = idx > 0 ? order[idx - 1] : order[1];
    const av1Label = avLabels[selectedAvaliacao] || selectedAvaliacao;
    const av2Label = avLabels[otherAv] || otherAv;
    
    return labels.map(({ key, label }) => {
      const dataObj: any = { name: label };
      if (selectedAvaliacao === "bim2_2026" && statsAd) {
        dataObj["Diagnóstica"] = parseFloat((statsAd[key] as number).toFixed(2));
        dataObj["BIM 1"] = parseFloat((statsComp[key] as number).toFixed(2));
        dataObj["BIM 2"] = parseFloat((stats[key] as number).toFixed(2));
      } else {
        dataObj[av2Label] = parseFloat((statsComp[key] as number).toFixed(2));
        dataObj[av1Label] = parseFloat((stats[key] as number).toFixed(2));
      }
      return dataObj;
    });
  }, [stats, statsComp, statsAd, selectedAno, selectedAvaliacao]);

  const DISC_COLORS = ["#7c3aed", "#06b6d4", "#10b981", "#f97316", "#2563eb"];

  // Gera um renderer de label em pill acima da barra, com borda colorida
  const makeLabel = (color: string) => (props: any) => {
    const { x, y, width, value } = props;
    if (value === null || value === undefined || value === 0) return null;
    const text = typeof value === "number" ? value.toFixed(1) : String(value);
    const pw = Math.max(text.length * 6.5 + 18, 40);
    return (
      <g>
        <rect x={x + width / 2 - pw / 2} y={y - 32} width={pw} height={22} rx={11} fill="white" stroke={color} strokeWidth={1.5} />
        <text x={x + width / 2} y={y - 17} textAnchor="middle" fontSize={10} fontWeight={800} fill={color}>{text}</text>
      </g>
    );
  };

  // Label de percentual (para o gráfico de habilidades)
  const makePctLabel = (color: string) => (props: any) => {
    const { x, y, width, value } = props;
    if (!value) return null;
    const text = `${Number(value).toFixed(0)}%`;
    const pw = Math.max(text.length * 7 + 14, 38);
    return (
      <g>
        <rect x={x + width / 2 - pw / 2} y={y - 32} width={pw} height={22} rx={11} fill="white" stroke={color} strokeWidth={1.5} />
        <text x={x + width / 2} y={y - 17} textAnchor="middle" fontSize={10} fontWeight={800} fill={color}>{text}</text>
      </g>
    );
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-slate-50">
        {/* Header */}
        <header className="px-8 pt-12 pb-8 bg-white border-b border-slate-200 sticky top-[72px] z-40 shadow-sm">
          <div className="flex items-center gap-3 text-blue-600 mb-4">
            <span className="text-xs font-black uppercase tracking-widest">Dashboards</span>
            <ChevronRight size={14} />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Indicadores Gerais</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Indicadores Gerais 2026</h1>
              <p className="mt-1 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                {user?.escola} — INEP {user?.inep}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Anos */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((ano) => (
                  <button
                    key={ano}
                    onClick={() => setSelectedAno(ano)}
                    className={`px-3 py-2 rounded-xl font-black text-xs transition-all ${
                      selectedAno === ano
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105"
                        : "text-slate-500 hover:bg-white"
                    }`}
                  >
                    {ano}º
                  </button>
                ))}
              </div>
              {/* Avaliações */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                {AVALIACOES.map((av) => (
                  <button
                    key={av.id}
                    onClick={() => setSelectedAvaliacao(av.id)}
                    className={`px-4 py-2 rounded-xl font-black text-xs transition-all ${
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

          {/* Tabs */}
          <div className="flex gap-1 mt-6 bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200">
            {[
              { id: "overview", label: "Visão Geral", icon: BarChart3 },
              { id: "habilidades", label: "Habilidades Deficitárias", icon: AlertTriangle },
              ...(selectedAvaliacao !== "ad_2026"
                ? [{ id: "comparacao", label: "Análise das Avaliações", icon: GitCompare }]
                : []),
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all ${
                  activeTab === id
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </header>

        <main className="p-8 space-y-8 w-full max-w-[1600px] mx-auto mt-8">
          {isLoading ? (
            <div className="p-40 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
              <p className="font-bold text-slate-500">Consolidando indicadores da unidade...</p>
            </div>
          ) : (
            <>
              {/* ─── KPI Cards ─── */}
              <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${selectedAno >= 3 ? "lg:grid-cols-6" : "lg:grid-cols-4"}`}>
                {[
                  { label: "Média Geral", value: stats?.mediaGeral, icon: TrendingUp, color: "blue", bg: "bg-blue-600", badge: "ESCOLA" },
                  { label: "LP / LG", value: stats?.mediaLP, icon: BookOpen, color: "amber", bg: "bg-amber-500" },
                  { label: "Matemática", value: stats?.mediaMA, icon: BarChart3, color: "indigo", bg: "bg-indigo-600" },
                  ...(selectedAno >= 3
                    ? [
                        { label: "Ciências Nat.", value: stats?.mediaCN, icon: Zap, color: "emerald", bg: "bg-emerald-600" },
                        { label: "Ciências Hum.", value: stats?.mediaCH, icon: Target, color: "orange", bg: "bg-orange-500" },
                      ]
                    : []),
                  { label: "Total Alunos", value: stats?.total, icon: Users, color: "rose", bg: "bg-rose-500", isCount: true },
                ].map(({ label, value, icon: Icon, color, bg, badge, isCount }) => {
                  const compKeyMap: Record<string, keyof GlobalStats> = {
                    "Média Geral": "mediaGeral",
                    "LP / LG": "mediaLP",
                    "Matemática": "mediaMA",
                    "Ciências Nat.": "mediaCN",
                    "Ciências Hum.": "mediaCH",
                  };
                  const compKey = compKeyMap[label];
                  const prevValue = statsComp && compKey ? statsComp[compKey] : null;

                  return (
                    <div key={label} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-2xl ${bg} text-white shadow-sm`}>
                          <Icon size={20} />
                        </div>
                        {badge && <span className="text-[9px] font-black bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded-full uppercase tracking-widest">{badge}</span>}
                      </div>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
                      <p className={`text-3xl font-black ${isCount ? "text-slate-900" : getScoreColor(value ?? 0)}`}>
                        {isCount ? value : (value ?? 0).toFixed(2)}
                      </p>
                      
                      {!isCount && selectedAvaliacao !== "ad_2026" && prevValue !== null && prevValue !== undefined && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <DeltaChip prev={prevValue} curr={value ?? 0} />
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">vs anterior ({prevValue.toFixed(2)})</span>
                        </div>
                      )}

                      {!isCount && (
                        <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              (value ?? 0) >= 8 ? "bg-emerald-500" : (value ?? 0) >= 6 ? "bg-amber-400" : "bg-rose-500"
                            }`}
                            style={{ width: `${Math.min(((value ?? 0) / 10) * 100, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ─── OVERVIEW TAB ─── */}
              {activeTab === "overview" && (
                <div className="space-y-8">
                  {/* Gráfico de Barras por Turma */}
                  <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <div>
                        <h4 className="text-xl font-black text-slate-900">Desempenho por Turma</h4>
                        <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">Comparativo das médias por disciplina e turma</p>
                      </div>
                    </div>
                    <div className="p-8">
                      {turmas.length === 0 ? (
                        <p className="text-center text-slate-400 font-bold py-20">Nenhum dado disponível.</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={360}>
                          <BarChart data={barDataTurmas} margin={{ top: 44, left: 0, right: 20, bottom: 0 }} barGap={3}>
                            <XAxis dataKey="name" tick={{ fontWeight: 700, fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                            <Tooltip
                              contentStyle={{ borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", fontWeight: 700, fontSize: 12 }}
                              formatter={(value: any, name: any) => [value.toFixed(2), name]}
                            />
                            <Legend wrapperStyle={{ fontWeight: 700, fontSize: 11, paddingTop: 16 }} />
                            {["LP / LG", "Matemática", ...(selectedAno >= 3 ? ["Ciências Nat.", "Ciências Humanas"] : [])].map((key, i) => (
                              <Bar key={key} dataKey={key} fill={DISC_COLORS[i]} radius={[8, 8, 0, 0]} maxBarSize={24}>
                                <LabelList content={makeLabel(DISC_COLORS[i])} />
                              </Bar>
                            ))}
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Radar */}
                    <div className="bg-[#001e3c] rounded-[32px] p-8 text-white shadow-xl flex flex-col">
                      <h4 className="text-base font-black mb-1 flex items-center gap-2">
                        <Target size={18} className="text-blue-400" />
                        Perfil de Desempenho
                      </h4>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-6">Por disciplina — {selectedAno}º Ano</p>
                      <div className="flex-1 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={260}>
                          <RadarChart data={radarData}>
                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 700 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} />
                            <Radar name="Média" dataKey="value" stroke="#60a5fa" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} dot={{ fill: "#60a5fa", r: 4 }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Ranking Turmas */}
                    <div className="xl:col-span-2 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                      <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                        <h4 className="text-xl font-black text-slate-900 flex items-center gap-3"><Award size={20} className="text-amber-500" /> Turmas</h4>
                        <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">Ordenado pela média geral</p>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {[...turmas].sort((a, b) => b.media - a.media).map((t, i) => (
                          <div key={i} className="flex items-center justify-between px-8 py-4 hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-4">
                              <span className={`w-8 h-8 flex items-center justify-center rounded-xl font-black text-xs ${
                                i === 0 ? "bg-amber-100 text-amber-700" :
                                i === 1 ? "bg-slate-100 text-slate-600" :
                                i === 2 ? "bg-orange-100 text-orange-700" : "bg-slate-50 text-slate-400"
                              }`}>{i + 1}º</span>
                              <div>
                                <p className="font-black text-slate-800 text-sm">{t.nome}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.total} alunos</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="hidden md:flex gap-2 text-right">
                                <span className="text-xs text-slate-400 font-bold">LP: <span className="text-slate-700">{t.mediaLP.toFixed(2)}</span></span>
                                <span className="text-xs text-slate-400 font-bold">MA: <span className="text-slate-700">{t.mediaMA.toFixed(2)}</span></span>
                              </div>
                              <span className={`px-3 py-1 rounded-xl text-xs font-black ${getScoreBadge(t.media)}`}>{t.media.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── HABILIDADES TAB ─── */}
              {activeTab === "habilidades" && (
                <div className="space-y-8">
                  {/* Filtro de Habilidade */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Filter size={16} />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-700">Análise por Habilidade:</span>
                      </div>
                      <select
                        value={selectedHabilidadeFilter}
                        onChange={(e) => setSelectedHabilidadeFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-[450px] truncate"
                      >
                        <option value="all">Todas as Habilidades ({groupedHabilidades.length})</option>
                        {uniqueHabilidadesList.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {selectedHabilidadeFilter === "all" 
                        ? "Exibindo rendimento geral por habilidade" 
                        : "Analisando itens da habilidade selecionada"}
                    </div>
                  </div>

                  <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                      <h4 className="text-xl font-black text-slate-900 flex items-center gap-3">
                        <AlertTriangle size={20} className="text-rose-500" />
                        {selectedHabilidadeFilter === "all" 
                          ? "Habilidades com Maior Taxa de Erro" 
                          : `Itens da Habilidade: ${getHabilidadeCode(selectedHabilidadeFilter)}`}
                      </h4>
                      <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">
                        {(() => {
                          const avLabel: Record<string, string> = { "ad_2026": "Diagnóstica", "bim1_2026": "BIM 1", "bim2_2026": "BIM 2" };
                          const label = avLabel[selectedAvaliacao] || selectedAvaliacao;
                          return selectedHabilidadeFilter === "all"
                            ? `Habilidades que precisam de atenção pedagógica — ${selectedAno}º Ano / ${label}`
                            : `Análise detalhada dos itens correspondentes — ${selectedAno}º Ano / ${label}`;
                        })()}
                      </p>
                    </div>

                    {groupedHabilidades.length === 0 ? (
                      <div className="p-20 text-center text-slate-400 font-bold">
                        Dados de gabarito não disponíveis para calcular habilidades deficitárias.
                      </div>
                    ) : selectedHabilidadeFilter === "all" ? (
                      <>
                        {/* Gráfico de Barras - Todas as Habilidades */}
                        <div className="px-8 pt-8">
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartDataAll} margin={{ top: 44, left: 0, right: 20, bottom: 20 }}>
                              <XAxis dataKey="name" tick={{ fontWeight: 700, fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                              <Tooltip
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xl max-w-sm">
                                        <p className="text-xs font-black text-slate-800 mb-1">{data.fullName}</p>
                                        <p className="text-xs text-rose-600 font-bold">Taxa de Erro: {data.taxaErro}%</p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Bar dataKey="taxaErro" radius={[8, 8, 0, 0]} maxBarSize={36}>
                                {chartDataAll.map((entry, i) => {
                                  const color = entry.taxaErro >= 70 ? "#f43f5e" : entry.taxaErro >= 50 ? "#f59e0b" : "#6366f1";
                                  return (
                                    <Cell key={i} fill={color} />
                                  );
                                })}
                                <LabelList content={(props: any) => {
                                  const { x, y, width, value, index } = props;
                                  if (!value) return null;
                                  const entry = chartDataAll[index];
                                  const color = entry?.taxaErro >= 70 ? "#f43f5e" : entry?.taxaErro >= 50 ? "#f59e0b" : "#6366f1";
                                  const text = `${Number(value).toFixed(0)}%`;
                                  const pw = Math.max(text.length * 7 + 14, 38);
                                  return (
                                    <g>
                                      <rect x={x + width / 2 - pw / 2} y={y - 32} width={pw} height={22} rx={11} fill="white" stroke={color} strokeWidth={1.5} />
                                      <text x={x + width / 2} y={y - 17} textAnchor="middle" fontSize={10} fontWeight={800} fill={color}>{text}</text>
                                    </g>
                                  );
                                }} />
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Lista detalhada - Todas as Habilidades */}
                        <div className="p-8 pt-4">
                          <div className="grid grid-cols-1 gap-4">
                            {groupedHabilidades.map((h, i) => (
                              <div key={h.habilidade} className={`p-6 rounded-3xl border flex flex-col md:flex-row justify-between md:items-center gap-6 ${
                                h.taxaErro >= 70 ? "bg-rose-50 border-rose-100" :
                                h.taxaErro >= 50 ? "bg-amber-50 border-amber-100" : "bg-blue-50 border-blue-100"
                              }`}>
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-start gap-4">
                                    <span className="text-lg font-black text-slate-400 w-6 mt-0.5">{i + 1}</span>
                                    <div>
                                      <h5 className="font-black text-slate-800 text-sm leading-snug">
                                        {h.habilidade}
                                      </h5>
                                      <div className="mt-3 flex flex-wrap gap-2 items-center">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-2">Itens correspondentes:</span>
                                        {h.questoes.map((q) => (
                                          <span key={q.questao} className="text-[10px] font-black uppercase bg-white border border-slate-200 px-2.5 py-1 rounded-xl text-slate-600 flex items-center gap-1.5 shadow-sm">
                                            {q.questao}
                                            <span className="text-slate-300">|</span>
                                            <span className="text-slate-400">GAB: {q.gabarito}</span>
                                            <span className="text-slate-300">|</span>
                                            <span className={q.taxaErro >= 70 ? "text-rose-600" : q.taxaErro >= 50 ? "text-amber-600" : "text-blue-600"}>
                                              {q.taxaErro.toFixed(0)}% erro
                                            </span>
                                          </span>
                                        ))}
                                      </div>
                                      <p className="text-[10px] text-blue-600 font-black mt-2 tracking-wide uppercase flex items-center gap-1.5">
                                        <span className="text-xs">💡</span> Filtre esta habilidade no topo para analisar a distribuição dos distratores
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-2 min-w-[140px]">
                                  <div className="flex items-baseline gap-1">
                                    <span className={`text-3xl font-black ${
                                      h.taxaErro >= 70 ? "text-rose-600" : h.taxaErro >= 50 ? "text-amber-600" : "text-blue-600"
                                    }`}>{h.taxaErro.toFixed(0)}%</span>
                                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">erro médio</span>
                                  </div>
                                  <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-slate-100">
                                    <div
                                      className={`h-full rounded-full transition-all duration-700 ${
                                        h.taxaErro >= 70 ? "bg-rose-500" : h.taxaErro >= 50 ? "bg-amber-400" : "bg-blue-400"
                                      }`}
                                      style={{ width: `${h.taxaErro}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      selectedHabilidadeData && (
                        <>
                          {/* Gráfico de Barras - Habilidade Específica */}
                          <div className="px-8 pt-8">
                            <ResponsiveContainer width="100%" height={260}>
                              <BarChart data={selectedHabilidadeData.questoes} margin={{ left: 20, right: 40, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="questao" tick={{ fontWeight: 700, fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontWeight: 700, fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                <Tooltip
                                  formatter={(value: any) => [`${Number(value).toFixed(1)}%`, "Taxa de Erro"]}
                                  contentStyle={{ borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", fontWeight: 700, fontSize: 12 }}
                                />
                                <Bar dataKey="taxaErro" radius={[6, 6, 0, 0]} maxBarSize={45}>
                                  {selectedHabilidadeData.questoes.map((entry, i) => (
                                    <Cell key={i} fill={entry.taxaErro >= 70 ? "#f43f5e" : entry.taxaErro >= 50 ? "#f59e0b" : "#60a5fa"} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Lista detalhada - Habilidade Específica */}
                          <div className="p-8 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {selectedHabilidadeData.questoes.map((q, i) => {
                                const getOptions = (dist: Record<string, number>) => {
                                  const opts = ["A", "B", "C", "D"];
                                  if (Object.keys(dist).includes("E")) opts.push("E");
                                  return opts;
                                };
                                return (
                                  <div key={q.questao} className={`flex flex-col gap-4 p-6 rounded-[24px] border shadow-sm ${
                                    q.taxaErro >= 70 ? "bg-rose-50/50 border-rose-100" :
                                    q.taxaErro >= 50 ? "bg-amber-50/50 border-amber-100" : "bg-blue-50/30 border-blue-100/50"
                                  }`}>
                                    <div className="flex items-center gap-4">
                                      <span className="text-lg font-black text-slate-400 w-6 text-center">{i + 1}</span>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="font-black text-slate-800 text-sm">{q.questao}</span>
                                          <span className="text-[10px] font-black uppercase bg-white border border-slate-200 px-2.5 py-0.5 rounded-full text-slate-500">
                                            GABARITO: {q.gabarito}
                                          </span>
                                        </div>
                                        <div className="mt-3 h-2 bg-white rounded-full overflow-hidden border border-slate-100">
                                          <div
                                            className={`h-full rounded-full transition-all duration-700 ${
                                              q.taxaErro >= 70 ? "bg-rose-500" : q.taxaErro >= 50 ? "bg-amber-400" : "bg-blue-400"
                                            }`}
                                            style={{ width: `${q.taxaErro}%` }}
                                          />
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <span className={`text-xl font-black block ${
                                          q.taxaErro >= 70 ? "text-rose-600" : q.taxaErro >= 50 ? "text-amber-600" : "text-blue-600"
                                        }`}>{q.taxaErro.toFixed(0)}%</span>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">taxa erro</span>
                                      </div>
                                    </div>

                                    {/* Distratores */}
                                    <div className="pt-4 border-t border-slate-200/50">
                                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Distribuição das Respostas:</p>
                                      <div className="flex flex-wrap gap-2">
                                        {getOptions(q.distratores).map((opt) => {
                                          const count = q.distratores[opt] || 0;
                                          const pct = q.totalRespostas > 0 ? (count / q.totalRespostas) * 100 : 0;
                                          const isCorrect = opt === q.gabarito;
                                          return (
                                            <div key={opt} className={`flex-1 min-w-[70px] p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                                              isCorrect 
                                                ? "bg-emerald-500 text-white border-emerald-600 shadow-sm" 
                                                : pct > 0
                                                  ? "bg-white border-slate-200 text-slate-700 shadow-sm"
                                                  : "bg-slate-50/50 border-slate-100 text-slate-300"
                                            }`}>
                                              <div className="flex items-center gap-1">
                                                <span className="font-black text-xs">{opt}</span>
                                                {isCorrect && <span className="text-[8px] bg-white text-emerald-600 px-1 py-0.25 rounded font-black">GAB</span>}
                                              </div>
                                              <span className="text-xs font-black mt-1">{pct.toFixed(0)}%</span>
                                              <span className={`text-[8px] font-bold mt-0.5 ${isCorrect ? "text-emerald-100" : "text-slate-400"}`}>{count} al.</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* ─── COMPARAÇÃO TAB ─── */}
              {activeTab === "comparacao" && (
                <div className="space-y-8">
                  {isLoadingComp ? (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                      <p className="font-bold text-slate-500">Carregando dados para comparação...</p>
                    </div>
                  ) : !statsComp ? (
                    <div className="p-20 text-center bg-white rounded-[32px] border border-slate-100">
                      <p className="font-bold text-slate-400">Não há dados disponíveis para a outra avaliação.</p>
                    </div>
                  ) : (
                    <>

                      {/* Gráfico comparativo */}
                      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                           <h4 className="text-xl font-black text-slate-900 flex items-center gap-3">
                             <GitCompare size={20} className="text-blue-500" />
                             {selectedAvaliacao === "bim2_2026"
                                ? "Diagnóstica vs Bimestral 1 vs Bimestral 2"
                                : "Diagnóstica vs Bimestral 1"}
                           </h4>
                          <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">Evolução do desempenho por disciplina</p>
                        </div>
                        <div className="p-8">
                          <ResponsiveContainer width="100%" height={340}>
                            <BarChart data={compData} barGap={6} margin={{ top: 44, left: 0, right: 20, bottom: 0 }}>
                              <XAxis dataKey="name" tick={{ fontWeight: 700, fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                              <Tooltip
                                contentStyle={{ borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", fontWeight: 700, fontSize: 12 }}
                                formatter={(value: any, name: any) => [value.toFixed(2), name]}
                              />
                              <Legend wrapperStyle={{ fontWeight: 700, fontSize: 11, paddingTop: 16 }} />
                              {compData.length > 0 &&
                                Object.keys(compData[0]).filter((k) => k !== "name").map((key, i) => {
                                  const color = selectedAvaliacao === "bim2_2026"
                                    ? (key === "Diagnóstica" ? "#2563eb" : key === "BIM 1" ? "#f97316" : "#10b981")
                                    : (key === "Diagnóstica" ? "#f97316" : "#10b981");
                                  return (
                                    <Bar key={key} dataKey={key} fill={color} radius={[8, 8, 0, 0]} maxBarSize={36}>
                                      <LabelList content={makeLabel(color)} />
                                    </Bar>
                                  );
                                })}
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
