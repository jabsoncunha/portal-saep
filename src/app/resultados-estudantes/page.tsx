"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { 
  ChevronRight, 
  Search, 
  User, 
  School, 
  GraduationCap, 
  FileText,
  Filter,
  Download,
  Info,
  X,
  Target,
  CheckCircle2,
  Users,
  TrendingUp
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { BoletimTurmaPrint } from "@/components/BoletimTurmaPrint";
import { BoletimEstudantePrint } from "@/components/BoletimEstudantePrint";

// Normaliza uma linha da tabela avaliacoes_bim2 para o formato padrão do portal
function normalizeBim2Row(row: any): any {
  const normalized: any = { ...row };
  normalized.lg = row.nota_lp ?? null;
  normalized.lp = row.nota_lp ?? null;
  normalized.ma = row.nota_ma ?? null;
  normalized.cn = row.nota_cn ?? null;
  normalized.ch = row.nota_ch ?? null;
  for (let i = 1; i <= 42; i++) {
    if (row[`Q_${i}`] !== undefined) normalized[`q${i}`] = row[`Q_${i}`];
  }
  return normalized;
}

interface Respostas {
  [key: string]: string | null;
}

interface Estudante {
  unidade: string;
  turma: string;
  matricula: number;
  nome: string;
  pcd: boolean;
  respostas: Respostas;
  notas: {
    LP?: number | null;
    LG?: number | null;
    MA?: number | null;
    CN?: number | null;
    CH?: number | null;
    MÉDIA: number;
    validGradesSum?: number;
    validGradesCount?: number;
  };
}

export default function ResultadosEstudantesPage() {
  const { user } = useAuth();
  const [selectedAno, setSelectedAno] = useState(1);
  const [selectedAvaliacao, setSelectedAvaliacao] = useState("ad_2026");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnidade, setSelectedUnidade] = useState("TODAS");
  const [selectedTurma, setSelectedTurma] = useState("TODAS");
  const [selectedEstudante, setSelectedEstudante] = useState<Estudante | null>(null);
  
  const [estudantes, setEstudantes] = useState<Estudante[]>([]);
  const [gabarito, setGabarito] = useState<Record<string, string>>({});
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(true);
  
  const boletimEstudanteRef = useRef<HTMLDivElement>(null);
  const handleDownloadPDF = useReactToPrint({
    contentRef: boletimEstudanteRef,
    documentTitle: selectedEstudante ? `Boletim_Individual_${selectedEstudante.nome.replace(/\s+/g, '_')}_${selectedEstudante.matricula}` : "Boletim",
  });

  const boletimTurmaRef = useRef<HTMLDivElement>(null);
  const handleDownloadBoletimTurma = useReactToPrint({
    contentRef: boletimTurmaRef,
    documentTitle: `Boletim_Turma_${selectedTurma}_Ano${selectedAno}`,
  });

  const handleExportCSV = () => {
    if (filteredEstudantes.length === 0) return;

    let csvContent = "ESTUDANTE;MATRICULA;UNIDADE;TURMA;PCD;LP_LG;MA";
    
    if (selectedAno >= 3) {
      csvContent += ";CN;CH";
    }
    csvContent += ";MEDIA\n";

    filteredEstudantes.forEach((e) => {
      const nome = `"${e.nome}"`;
      const pcd = e.pcd ? "SIM" : "NAO";
      const lg = (e.notas.LP ?? e.notas.LG ?? 0).toFixed(2).replace('.', ',');
      const ma = (e.notas.MA ?? 0).toFixed(2).replace('.', ',');
      const media = (e.notas.MÉDIA ?? 0).toFixed(2).replace('.', ',');

      let row = `${nome};${e.matricula};"${e.unidade}";"${e.turma}";${pcd};${lg};${ma}`;
      
      if (selectedAno >= 3) {
        const cn = (e.notas.CN ?? 0).toFixed(2).replace('.', ',');
        const ch = (e.notas.CH ?? 0).toFixed(2).replace('.', ',');
        row += `;${cn};${ch}`;
      }
      
      row += `;${media}`;
      csvContent += row + "\n";
    });

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Relatorio_Estudantes_${selectedAno}Ano_${selectedAvaliacao.toUpperCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [globalStats, setGlobalStats] = useState<{
    rede: number;
    regioes: { name: string; avg: number; studentCount: number }[];
    atendimentos: { name: string; avg: number; studentCount: number }[];
    racaCores: { name: string; avg: number; studentCount: number }[];
    rendas: { name: string; avg: number; studentCount: number }[];
  } | null>(null);

  // Fetch data from Supabase based on selected year, evaluation, and INEP
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      if (!user?.inep) return;
      
      // Limpa dados anteriores imediatamente ao trocar filtros
      setIsLoadingData(true);
      setIsLoadingGlobal(true);
      setGlobalStats(null);
      setEstudantes([]);

      try {
        const isBim2 = selectedAvaliacao === "bim2_2026";
        const tableName = isBim2 ? "avaliacoes_bim2" : `respostas_${selectedAno}ano_${selectedAvaliacao}`;
        const gabaritoTable = isBim2 ? "gabaritos" : `gabarito_${selectedAno}ano_${selectedAvaliacao}`;

        // Fetch students and gabarito in parallel
        let studentsQuery = isBim2
          ? supabase.from(tableName).select("*").eq("ano_escolar", selectedAno).eq("inep", user.inep)
          : supabase.from(tableName).select("*").eq("inep", user.inep);
        let gabQuery = isBim2
          ? supabase.from(gabaritoTable).select("item, gabarito").eq("ano_escolar", selectedAno).eq("bimestre", 2)
          : supabase.from(gabaritoTable).select("item, gabarito");

        const [studentsRes, gabaritoRes] = await Promise.all([studentsQuery, gabQuery]);
          
        if (studentsRes.error) throw studentsRes.error;
        if (gabaritoRes.error) throw gabaritoRes.error;
        
        // Map Gabarito (normalize key to strip underscores)
        const gabMap: Record<string, string> = {};
        (gabaritoRes.data || []).forEach(row => {
          const keyNormalized = row.item.toLowerCase().replace('_', '');
          gabMap[keyNormalized] = row.gabarito;
        });
        if (cancelled) return;
        setGabarito(gabMap);

        const parseGrade = (val: any) => {
          if (val === null || val === undefined || val === "" || val === "_") return null;
          const parsed = parseFloat(String(val).replace(",", "."));
          return isNaN(parsed) ? null : parsed;
        };

        // Map Supabase rows to Estudante interface
        const rawStudents = (studentsRes.data || []).map((row: any) =>
          isBim2 ? normalizeBim2Row(row) : row
        );
        const mapped: Estudante[] = rawStudents.map(row => {
          const respostas: Respostas = {};
          // Construct answers object from q1...q42 or q_1...q_42
          for (let i = 1; i <= 42; i++) {
            const val = row[`q${i}`] !== undefined ? row[`q${i}`] : row[`q_${i}`];
            if (val !== undefined && val !== null) {
              respostas[`Q${i.toString().padStart(2, '0')}`] = val;
            }
          }
          
          const getGradeVal = (val1: any, val2?: any) => {
            const p1 = parseGrade(val1);
            return p1 !== null ? p1 : parseGrade(val2);
          };

          const lgVal = getGradeVal(row.lg, row.lp);
          const maVal = parseGrade(row.ma);
          const cnVal = getGradeVal(row.cn, row.ci);
          const chVal = parseGrade(row.ch);

          // Calcular MÉDIA via código com as notas disponíveis (ignora matérias faltantes/não aplicadas)
          const grades: number[] = [];
          if (lgVal !== null) grades.push(lgVal);
          if (maVal !== null) grades.push(maVal);
          if (cnVal !== null) grades.push(cnVal);
          if (chVal !== null) grades.push(chVal);
          
          const gradesSum = grades.reduce((a, b) => a + b, 0);
          const mediaCalculada = grades.length > 0 ? gradesSum / grades.length : 0;

          return {
            unidade: row.unidade,
            turma: row.turma,
            matricula: Number(row.matricula),
            nome: row.nome,
            pcd: (row.pcd || row.nome_1) === "COM PCD",
            respostas,
            notas: {
              LG: lgVal,
              MA: maVal,
              CN: cnVal,
              CH: chVal,
              MÉDIA: mediaCalculada,
              validGradesSum: gradesSum,
              validGradesCount: grades.length
            }
          };
        });
        
        // Fetch Global Data in chunks (bypassing the 1000 row limit)
        // Para bim2, busca tudo da tabela unificada
        let allData: any[] = [];
        let from = 0;
        let to = 999;
        let hasMore = true;

        while (hasMore && allData.length < 50000) {
          const chunkQuery = isBim2
            ? supabase.from("avaliacoes_bim2").select("*").eq("ano_escolar", selectedAno).range(from, to)
            : supabase.from(tableName).select("*").range(from, to);
          const { data: chunk, error: chunkErr } = await chunkQuery;

          if (chunkErr) {
            console.error("[ERRO] Fetch global chunk falhou:", chunkErr.message, chunkErr);
            hasMore = false;
          } else if (!chunk || chunk.length === 0) {
            hasMore = false;
          } else {
            allData = [...allData, ...chunk.map((r: any) => isBim2 ? normalizeBim2Row(r) : r)];
            from += 1000;
            to += 1000;
            if (chunk.length < 1000) hasMore = false;
          }
        }
        console.log(`[DEBUG] allData capturado: ${allData.length} linhas`);
        if (allData.length > 0) {
          console.log("[DEBUG] Amostra do 1º registro:", JSON.stringify(allData[0]));
        }
        
        if (allData.length > 0) {
          console.log(`[DEBUG] Varredura completa para o ${selectedAno}º ano: ${allData.length} registros capturados`);

          let totalSum = 0;
          let totalCount = 0;
          const regMap: Record<string, { sum: number; count: number; studentCount: number }> = {};
          const ateMap: Record<string, { sum: number; count: number; studentCount: number }> = {};
          const racaMap: Record<string, { sum: number; count: number; studentCount: number }> = {};
          const rendaMap: Record<string, { sum: number; count: number; studentCount: number }> = {};

          allData.forEach(r => {
            const getGradeVal = (val1: any, val2?: any) => {
              const p1 = parseGrade(val1);
              return p1 !== null ? p1 : parseGrade(val2);
            };

            const lgVal = getGradeVal(r.lg, r.lp);
            const maVal = parseGrade(r.ma);
            const cnVal = getGradeVal(r.cn, r.ci);
            const chVal = parseGrade(r.ch);

            const grades = [];
            if (lgVal !== null) grades.push(lgVal);
            if (maVal !== null) grades.push(maVal);
            if (cnVal !== null) grades.push(cnVal);
            if (chVal !== null) grades.push(chVal);

            if (r.regiao) {
              const regName = r.regiao.toUpperCase();
              if (!regMap[regName]) regMap[regName] = { sum: 0, count: 0, studentCount: 0 };
              regMap[regName].studentCount++;
            }

            if (r.atendimento) {
              let ateName = r.atendimento.toUpperCase();
              if (ateName.includes("INTEGRAL")) ateName = "INTEGRAL";
              else if (ateName.includes("PARCIAL")) ateName = "PARCIAL";
              if (!ateMap[ateName]) ateMap[ateName] = { sum: 0, count: 0, studentCount: 0 };
              ateMap[ateName].studentCount++;
            }

            const racaVal = (r.raca_cor || r.corraca || "").trim().toUpperCase();
            if (racaVal && racaVal !== "NULL" && racaVal !== "_") {
              if (!racaMap[racaVal]) racaMap[racaVal] = { sum: 0, count: 0, studentCount: 0 };
              racaMap[racaVal].studentCount++;
            }

            const rendaVal = (r.renda || "").trim().toUpperCase();
            if (rendaVal && rendaVal !== "NULL" && rendaVal !== "_") {
              const rendaLabel = `GRUPO ${rendaVal}`;
              if (!rendaMap[rendaLabel]) rendaMap[rendaLabel] = { sum: 0, count: 0, studentCount: 0 };
              rendaMap[rendaLabel].studentCount++;
            }

            if (grades.length === 0) return;

            const sumGrades = grades.reduce((a, b) => a + b, 0);
            const countGrades = grades.length;

            totalSum += sumGrades;
            totalCount += countGrades;

            if (r.regiao) {
              const regName = r.regiao.toUpperCase();
              regMap[regName].sum += sumGrades;
              regMap[regName].count += countGrades;
            }

            if (r.atendimento) {
              let ateName = r.atendimento.toUpperCase();
              if (ateName.includes("INTEGRAL")) ateName = "INTEGRAL";
              else if (ateName.includes("PARCIAL")) ateName = "PARCIAL";
              ateMap[ateName].sum += sumGrades;
              ateMap[ateName].count += countGrades;
            }

            if (racaVal && racaVal !== "NULL" && racaVal !== "_") {
              racaMap[racaVal].sum += sumGrades;
              racaMap[racaVal].count += countGrades;
            }

            if (rendaVal && rendaVal !== "NULL" && rendaVal !== "_") {
              const rendaLabel = `GRUPO ${rendaVal}`;
              rendaMap[rendaLabel].sum += sumGrades;
              rendaMap[rendaLabel].count += countGrades;
            }
          });

          const redeAvg = totalCount > 0 ? totalSum / totalCount : 0;

          console.log("[DEBUG] Categorias de Região:", Object.keys(regMap));
          console.log("[DEBUG] Categorias de Atendimento:", Object.keys(ateMap));

          
          if (!cancelled) {
            setGlobalStats({
              rede: redeAvg,
              regioes: Object.entries(regMap)
                .map(([name, d]) => ({ name, avg: d.count > 0 ? d.sum / d.count : 0, studentCount: d.studentCount }))
                .sort((a, b) => b.avg - a.avg),
              atendimentos: Object.entries(ateMap)
                .map(([name, d]) => ({ name, avg: d.count > 0 ? d.sum / d.count : 0, studentCount: d.studentCount }))
                .sort((a, b) => b.avg - a.avg),
              racaCores: Object.entries(racaMap)
                .map(([name, d]) => ({ name, avg: d.count > 0 ? d.sum / d.count : 0, studentCount: d.studentCount }))
                .sort((a, b) => b.avg - a.avg),
              rendas: Object.entries(rendaMap)
                .map(([name, d]) => ({ name, avg: d.count > 0 ? d.sum / d.count : 0, studentCount: d.studentCount }))
                .sort((a, b) => b.avg - a.avg)
            });
          }
        }

        if (!cancelled) {
          setEstudantes(mapped);
          setIsLoadingGlobal(false);
        }
      } catch (err) {
        console.error("Erro ao buscar dados do Supabase:", err);
      } finally {
        setIsLoadingData(false);
      }
    }
    
    fetchData();
    return () => { cancelled = true; };
  }, [selectedAno, selectedAvaliacao, user?.inep]);

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

  const allTurmas = useMemo<string[]>(() => {
    const turmas = new Set(estudantes.map((e: Estudante) => e.turma));
    return ["TODAS", ...Array.from(turmas).sort()] as string[];
  }, [estudantes]);

  const filteredEstudantes = useMemo<Estudante[]>(() => {
    return estudantes.filter((e: Estudante) => {
      const matchSearch = e.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.matricula.toString().includes(searchTerm);
      const matchTurma = selectedTurma === "TODAS" || e.turma === selectedTurma;
      return matchSearch && matchTurma;
    });
  }, [estudantes, searchTerm, selectedTurma]);

  const unitStats = useMemo(() => {
    const total = new Set(estudantes.map(e => e.matricula)).size;

    let sumAllGrades = 0;
    let countAllGrades = 0;
    
    let pcdSumAllGrades = 0;
    let pcdCountAllGrades = 0;

    estudantes.forEach(e => {
      if (e.notas.validGradesCount && e.notas.validGradesCount > 0) {
        sumAllGrades += e.notas.validGradesSum || 0;
        countAllGrades += e.notas.validGradesCount;
      }
      
      if (e.pcd) {
        if (e.notas.validGradesCount && e.notas.validGradesCount > 0) {
          pcdSumAllGrades += e.notas.validGradesSum || 0;
          pcdCountAllGrades += e.notas.validGradesCount;
        }
      }
    });

    const pcdStudents = estudantes.filter(e => e.pcd);
    
    return {
      avg: countAllGrades > 0 ? sumAllGrades / countAllGrades : 0,
      total,
      pcdCount: new Set(pcdStudents.map(e => e.matricula)).size,
      pcdAvg: pcdCountAllGrades > 0 ? pcdSumAllGrades / pcdCountAllGrades : 0
    };
  }, [estudantes]);

  const turmaAverages = useMemo(() => {
    const map: Record<string, { sum: number; count: number }> = {};
    estudantes.forEach(e => {
      const tName = e.turma;
      if (!map[tName]) map[tName] = { sum: 0, count: 0 };
      if (e.notas.validGradesCount && e.notas.validGradesCount > 0) {
        map[tName].sum += (e.notas.validGradesSum || 0);
        map[tName].count += e.notas.validGradesCount;
      }
    });
    return Object.entries(map).map(([name, data]) => ({
      name,
      average: data.count > 0 ? data.sum / data.count : 0
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [estudantes]);

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (score >= 6) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-rose-600 bg-rose-50 border-rose-100";
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-slate-50">
        {/* Header - Ajustado para não sobrepor com a navbar do portal */}
        <header className="px-8 pt-12 pb-10 bg-white border-b border-slate-200 sticky top-[72px] z-40 shadow-xl shadow-slate-200/60 print:relative print:top-0 print:shadow-none print:border-none print:pt-4 print:pb-4">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
              <div className="flex-shrink-0">
                <h1 className="text-6xl font-black text-slate-900 font-outfit tracking-tighter leading-none mb-4">
                  Painel de Estudantes <span className="text-blue-600">2026</span>
                </h1>
                <div className="flex items-center gap-4">
                  <div className="h-[2px] w-12 bg-blue-600" />
                  <p className="text-slate-400 font-black uppercase text-sm tracking-[0.3em]">
                    {user?.escola} — INEP {user?.inep}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 mb-2 print:hidden">
                {/* Seletor de Ano Ampliado */}
                <div className="flex bg-slate-100/50 p-1.5 rounded-[24px] border border-slate-200 backdrop-blur-sm">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((ano: number) => (
                    <button
                      key={ano}
                      onClick={() => setSelectedAno(ano)}
                      className={`w-14 h-14 rounded-2xl font-black text-sm transition-all duration-300 ${
                        selectedAno === ano 
                          ? "bg-white text-blue-600 shadow-xl shadow-blue-900/5 border border-slate-200 scale-110 z-10" 
                          : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                      }`}
                    >
                      {ano}º
                    </button>
                  ))}
                </div>

                {/* Seletor de Avaliação */}
                <div className="flex bg-slate-100/50 p-1.5 rounded-[24px] border border-slate-200 backdrop-blur-sm">
                  {[
                    { id: "ad_2026", label: "DIAGNÓSTICA" },
                    { id: "bim1_2026", label: "BIMESTRAL 1" },
                    { id: "bim2_2026", label: "BIMESTRAL 2" }
                  ].map((av) => (
                    <button
                      key={av.id}
                      onClick={() => setSelectedAvaliacao(av.id)}
                      className={`px-6 h-14 rounded-2xl font-black text-xs transition-all duration-300 ${
                        selectedAvaliacao === av.id 
                          ? "bg-white text-blue-600 shadow-xl shadow-blue-900/5 border border-slate-200 scale-105 z-10" 
                          : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                      }`}
                    >
                      {av.label}
                    </button>
                  ))}
                </div>

                <div className="relative group">
                  <button className="flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-[24px] font-black text-xs hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-blue-500/20 uppercase tracking-widest">
                    <Download size={20} />
                    Exportar Relatório
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all overflow-hidden z-50">
                    <button 
                      onClick={handleExportCSV}
                      className="w-full text-left px-6 py-4 font-black text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors border-b border-slate-100"
                    >
                      Planilha (CSV)
                    </button>
                    <button 
                      onClick={() => handleDownloadBoletimTurma()}
                      className="w-full text-left px-6 py-4 font-black text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                    >
                      Documento (Boletim PDF)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Componente Invisível para Impressão do Boletim da Turma */}
        <div className="hidden">
          <BoletimTurmaPrint 
            ref={boletimTurmaRef}
            estudantes={filteredEstudantes}
            escola={user?.escola}
            ano={selectedAno}
            turma={selectedTurma}
            avaliacao={selectedAvaliacao}
          />
          <BoletimEstudantePrint 
            ref={boletimEstudanteRef}
            estudante={selectedEstudante}
            escola={user?.escola}
            ano={selectedAno}
            avaliacao={selectedAvaliacao}
            gabarito={gabarito}
          />
        </div>

        <main className="p-8 space-y-10 w-full max-w-[1600px] mx-auto mt-8 print:overflow-visible">
          {/* Central de Inteligência e Benchmarking */}
          <div className="space-y-8">
            
            {/* Linha 1: Status Principal (Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-blue-200 transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                    <School size={24} />
                  </div>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Média Unidade</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-5xl font-black text-slate-900 leading-none">{unitStats.avg.toFixed(2)}</h3>
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-tighter">{unitStats.total} Alunos</span>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-purple-200 transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
                    <Users size={24} />
                  </div>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Estudantes PCD</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <h3 className="text-5xl font-black text-slate-900 leading-none">{unitStats.pcdCount}</h3>
                  <span className="text-lg font-bold text-purple-600">({unitStats.pcdAvg.toFixed(2)} média)</span>
                </div>
              </div>

              <div className="bg-[#002B5B] text-white p-8 rounded-[40px] shadow-xl flex flex-col justify-center relative overflow-hidden group">
                <div className="absolute -top-6 -right-6 p-8 opacity-10 group-hover:scale-125 transition-all duration-700">
                  <TrendingUp size={160} />
                </div>
                <span className="text-[11px] font-black text-blue-300 uppercase tracking-[0.4em] mb-4 relative z-10">Benchmark Rede</span>
                <h4 className="text-6xl font-black mb-2 relative z-10 tracking-tighter">{globalStats?.rede.toFixed(2)}</h4>
                <p className="text-xs text-blue-200 font-bold uppercase tracking-widest relative z-10">Performance Geral do Sistema</p>
              </div>
            </div>

            {/* Linha 2: Médias por Turma (Antigo Header - Agora Full Width) */}
            <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm group">
              <div className="flex items-center justify-between mb-10">
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] mb-1">Análise Pedagógica</span>
                  <h5 className="text-2xl font-black text-slate-900">Médias por Turma</h5>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Dados em Tempo Real</span>
                </div>
              </div>
              
              <div className="flex items-end gap-6 h-56 px-2">
                {turmaAverages.map((t) => {
                  const avgValue = isNaN(t.average) ? 0 : t.average;
                  const height = (avgValue / 10) * 100;
                  return (
                    <div key={t.name} className="flex-1 h-full flex flex-col justify-end items-center gap-5 group/bar">
                      <div className="relative w-full flex items-end justify-center flex-1">
                         <div className="absolute inset-x-0 bottom-0 top-0 bg-slate-50 rounded-full w-5 mx-auto border border-slate-100/50" />
                         <div 
                            className={`w-5 rounded-full transition-all duration-1000 group-hover/bar:w-7 shadow-xl relative z-10 ${
                              avgValue >= 8 ? "bg-gradient-to-t from-emerald-600 to-emerald-400" : 
                              avgValue >= 6 ? "bg-gradient-to-t from-amber-600 to-amber-400" : 
                              "bg-gradient-to-t from-rose-600 to-rose-400"
                            }`}
                            style={{ height: `${Math.max(height, 10)}%` }}
                         >
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/20 rounded-full" />
                         </div>
                         <div className={`absolute -top-12 left-1/2 -translate-x-1/2 text-white text-[11px] font-black px-4 py-2.5 rounded-2xl z-20 shadow-xl pointer-events-none ${
                             avgValue >= 8 ? "bg-emerald-600" : 
                             avgValue >= 6 ? "bg-amber-600" : 
                             "bg-rose-600"
                           }`}>
                            {avgValue.toFixed(2)}
                          </div>
                      </div>
                      <span className={`text-[11px] font-black px-4 py-2 rounded-2xl border-2 transition-all uppercase tracking-widest text-center shadow-sm ${
                        avgValue >= 8 ? "text-emerald-600 border-emerald-600/20 bg-emerald-50/50" : 
                        avgValue >= 6 ? "text-amber-600 border-amber-600/20 bg-amber-50/50" : 
                        "text-rose-600 border-rose-600/20 bg-rose-50/50"
                      }`}>
                        {t.name.split('-')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Linha 3: Gráficos de Inteligência Lateral (Região, Atendimento, Raça/Cor, Renda) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Card 1: Região */}
              <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm group hover:border-blue-200 transition-all">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900">Média por Região</p>
                  </div>
                </div>
                <div className="space-y-6">
                  {isLoadingGlobal ? (
                    <div className="flex flex-col items-center gap-3 py-8">
                      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Carregando...</p>
                    </div>
                  ) : !globalStats?.regioes?.length ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-slate-300">
                      <p className="text-[12px] font-black uppercase tracking-widest">Sem dados disponíveis</p>
                    </div>
                  ) : globalStats.regioes.map((reg, i) => (
                    <div key={i} className="space-y-2.5">
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-3">
                          <span className="text-[12px] font-black uppercase text-slate-500">{reg.name}</span>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{reg.studentCount} estudantes</span>
                        </div>
                        <span className="text-xl font-black text-slate-900">{reg.avg.toFixed(2)}</span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 shadow-lg"
                          style={{ width: `${(reg.avg / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Atendimento */}
              <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm group hover:border-indigo-200 transition-all">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900">Média por Atendimento</p>
                  </div>
                </div>
                <div className="space-y-6">
                  {isLoadingGlobal ? (
                    <div className="flex flex-col items-center gap-3 py-8">
                      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Carregando...</p>
                    </div>
                  ) : !globalStats?.atendimentos?.length ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-slate-300">
                      <p className="text-[12px] font-black uppercase tracking-widest">Sem dados disponíveis</p>
                    </div>
                  ) : globalStats.atendimentos.map((ate, i) => (
                    <div key={i} className="space-y-2.5">
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-3">
                          <span className="text-[12px] font-black uppercase text-slate-500">{ate.name}</span>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{ate.studentCount} estudantes</span>
                        </div>
                        <span className="text-xl font-black text-slate-900">{ate.avg.toFixed(2)}</span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-1000 shadow-lg"
                          style={{ width: `${(ate.avg / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Raça/Cor */}
              <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm group hover:border-amber-200 transition-all">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900">Média por Raça/Cor</p>
                  </div>
                </div>
                <div className="space-y-6">
                  {isLoadingGlobal ? (
                    <div className="flex flex-col items-center gap-3 py-8">
                      <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Carregando...</p>
                    </div>
                  ) : !globalStats?.racaCores?.length ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-slate-300">
                      <p className="text-[12px] font-black uppercase tracking-widest">Sem dados disponíveis</p>
                    </div>
                  ) : globalStats.racaCores.map((rc, i) => (
                    <div key={i} className="space-y-2.5">
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-3">
                          <span className="text-[12px] font-black uppercase text-slate-500">{rc.name}</span>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{rc.studentCount} estudantes</span>
                        </div>
                        <span className="text-xl font-black text-slate-900">{rc.avg.toFixed(2)}</span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-1000 shadow-lg"
                          style={{ width: `${(rc.avg / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 4: Renda */}
              <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm group hover:border-emerald-200 transition-all">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900">Média por Renda</p>
                  </div>
                </div>
                <div className="space-y-6">
                  {isLoadingGlobal ? (
                    <div className="flex flex-col items-center gap-3 py-8">
                      <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Carregando...</p>
                    </div>
                  ) : !globalStats?.rendas?.length ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-slate-300">
                      <p className="text-[12px] font-black uppercase tracking-widest">Sem dados disponíveis</p>
                    </div>
                  ) : globalStats.rendas.map((rd, i) => (
                    <div key={i} className="space-y-2.5">
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-3">
                          <span className="text-[12px] font-black uppercase text-slate-500">{rd.name}</span>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{rd.studentCount} estudantes</span>
                        </div>
                        <span className="text-xl font-black text-slate-900">{rd.avg.toFixed(2)}</span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-1000 shadow-lg"
                          style={{ width: `${(rd.avg / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print:hidden">
              <div className="relative group lg:col-span-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Nome ou Matrícula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-700 transition-all"
                />
              </div>

              <div className="flex items-center gap-3 bg-white px-5 py-2 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
                <Filter className="text-slate-400" size={18} />
                <select 
                  value={selectedTurma}
                  onChange={(e) => setSelectedTurma(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none font-black text-xs text-slate-700 py-2 uppercase appearance-none cursor-pointer"
                >
                  <option value="TODAS">TODAS AS TURMAS</option>
                  {allTurmas.filter((t: string) => t !== "TODAS").map((t: string) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 px-6 py-4 rounded-2xl border border-blue-100 flex items-center justify-between">
                <span className="text-xs font-black text-blue-900 uppercase tracking-widest">Total Localizado</span>
                <span className="text-2xl font-black text-blue-600">{filteredEstudantes.length}</span>
              </div>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden print:rounded-none print:shadow-none print:border-none">
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-8 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Estudante</th>
                    <th className="p-8 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Unidade / Turma</th>
                    <th className="p-8 text-center text-xs font-black text-slate-400 uppercase tracking-widest">LP / LG</th>
                    <th className="p-8 text-center text-xs font-black text-slate-400 uppercase tracking-widest">MA</th>
                    {selectedAno >= 3 && (
                      <>
                        <th className="p-8 text-center text-xs font-black text-slate-400 uppercase tracking-widest">CN</th>
                        <th className="p-8 text-center text-xs font-black text-slate-400 uppercase tracking-widest">CH</th>
                      </>
                    )}
                    <th className="p-8 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Média</th>
                    <th className="p-8 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingData ? (
                    <tr>
                      <td colSpan={6} className="p-24 text-center">
                        <div className="flex flex-col items-center gap-6">
                          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                          <p className="text-xl font-black text-slate-400 uppercase tracking-widest">Sincronizando dados...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredEstudantes.map((estudante: Estudante) => (
                    <tr key={estudante.matricula} className="group hover:bg-slate-50 transition-colors">
                      <td className="p-7">
                        <div className="flex items-center gap-6">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-black shadow-sm ${getScoreColor(estudante.notas.MÉDIA)}`}>
                            {estudante.nome.charAt(0)}
                          </div>
                          <div>
                            <p className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">{estudante.nome}</p>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mt-0.5">MATRÍCULA: {estudante.matricula}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-7">
                        <div className="space-y-0.5">
                          <p className="text-xs font-black text-slate-700 uppercase leading-tight">{user?.escola}</p>
                          <p className="text-[11px] font-black text-blue-600 uppercase">TURMA: {estudante.turma}</p>
                        </div>
                      </td>
                      <td className="p-7 text-center">
                        <span className={`inline-block px-4 py-2 rounded-xl text-base font-black border min-w-[65px] ${getScoreColor(estudante.notas.LG ?? 0)}`}>
                          {(estudante.notas.LG ?? 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="p-7 text-center">
                        <span className={`inline-block px-4 py-2 rounded-xl text-base font-black border min-w-[65px] ${getScoreColor(estudante.notas.MA ?? 0)}`}>
                          {(estudante.notas.MA ?? 0).toFixed(2)}
                        </span>
                      </td>
                      {selectedAno >= 3 && (
                        <>
                          <td className="p-7 text-center">
                            <span className={`inline-block px-4 py-2 rounded-xl text-base font-black border min-w-[65px] ${getScoreColor(estudante.notas.CN ?? 0)}`}>
                              {(estudante.notas.CN ?? 0).toFixed(2)}
                            </span>
                          </td>
                          <td className="p-7 text-center">
                            <span className={`inline-block px-4 py-2 rounded-xl text-base font-black border min-w-[65px] ${getScoreColor(estudante.notas.CH ?? 0)}`}>
                              {(estudante.notas.CH ?? 0).toFixed(2)}
                            </span>
                          </td>
                        </>
                      )}
                      <td className="p-7 text-center">
                        <span className="text-2xl font-black text-slate-900 tracking-tight">
                          {(estudante.notas.MÉDIA ?? 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="p-7 text-right">
                        <button 
                          onClick={() => setSelectedEstudante(estudante)}
                          className="p-3.5 bg-slate-100 text-slate-500 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <FileText size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!isLoadingData && filteredEstudantes.length === 0 && (
                    <tr>
                      <td colSpan={selectedAno >= 3 ? 8 : 6} className="p-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                            <User size={40} />
                          </div>
                          <p className="font-bold text-slate-500">Nenhum estudante localizado com esses filtros.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {filteredEstudantes.length >= 500 && (
              <div className="p-4 bg-amber-50 border-t border-amber-100 text-center">
                <p className="text-xs font-black text-amber-700 uppercase tracking-widest">Exibindo os primeiros 500 registros. Use os filtros para refinar a busca.</p>
              </div>
            )}
          </div>
        </div>
      </main>

        {/* Modal de Detalhes do Estudante */}
        {selectedEstudante && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto print:hidden">
            <div id="estudante-modal-content" className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col my-auto print:max-h-none print:shadow-none print:rounded-none">
              <div className="p-8 bg-blue-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-black">
                    {selectedEstudante.nome.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">{selectedEstudante.nome}</h2>
                    <p className="text-blue-100 text-sm font-bold opacity-80 uppercase tracking-widest">
                      {selectedEstudante.unidade} — TURMA {selectedEstudante.turma}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedEstudante(null)}
                  className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors print:hidden"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {/* Resumo de Notas no Modal */}
                <div className={`grid gap-6 mb-10 ${selectedAno >= 3 ? "grid-cols-2 md:grid-cols-5" : "grid-cols-3"}`}>
                  <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Língua Portuguesa</p>
                    <p className="text-3xl font-black text-slate-900">{(selectedEstudante.notas.LP ?? selectedEstudante.notas.LG ?? 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Matemática</p>
                    <p className="text-3xl font-black text-slate-900">{(selectedEstudante.notas.MA ?? 0).toFixed(2)}</p>
                  </div>
                  {selectedAno >= 3 && (
                    <>
                      <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ciências Nat.</p>
                        <p className="text-3xl font-black text-slate-900">{(selectedEstudante.notas.CN ?? 0).toFixed(2)}</p>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ciências Hum.</p>
                        <p className="text-3xl font-black text-slate-900">{(selectedEstudante.notas.CH ?? 0).toFixed(2)}</p>
                      </div>
                    </>
                  )}
                  <div className="bg-blue-50 p-6 rounded-[24px] border border-blue-100">
                    <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-2">Média Final</p>
                    <p className="text-3xl font-black text-blue-600">{(selectedEstudante.notas.MÉDIA ?? 0).toFixed(2)}</p>
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-500" size={24} />
                  Detalhamento de Respostas
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {Object.entries(selectedEstudante.respostas).map(([questao, resposta]: [string, string | null]) => {
                    const qKey = questao.toLowerCase(); // e.g. q01
                    const qNum = parseInt(questao.replace('Q', ''));
                    const dbKey = `q${qNum}`; // matches gabarito 'item' column format 'q1'
                    const gabVal = gabarito[dbKey];
                    const isWrong = gabVal && resposta && gabVal !== resposta;
                    const isCorrect = gabVal && resposta && gabVal === resposta;

                    return (
                      <div 
                        key={questao} 
                        className={`p-4 bg-white border rounded-2xl flex flex-col items-center gap-2 group transition-all ${
                          isWrong ? "border-rose-200 shadow-sm bg-rose-50/30" : 
                          isCorrect ? "border-emerald-200" : "border-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[10px] font-black text-slate-400 uppercase">{questao}</span>
                          {isWrong && <span className="text-[9px] font-black text-rose-500 uppercase">GAB: {gabVal}</span>}
                        </div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                          isWrong ? "bg-rose-500 text-white shadow-lg shadow-rose-200" :
                          isCorrect ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" :
                          resposta ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-300"
                        }`}>
                          {resposta || "—"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4 print:hidden">
                <button 
                  onClick={() => setSelectedEstudante(null)}
                  className="px-8 py-4 bg-white text-slate-500 font-black rounded-2xl border border-slate-200 hover:bg-slate-100 transition-all text-xs uppercase tracking-widest"
                >
                  Fechar
                </button>
                <button 
                  onClick={() => handleDownloadPDF()}
                  className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 text-xs uppercase tracking-widest flex items-center gap-2"
                >
                  <Download size={16} />
                  Boletim do Estudante
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
