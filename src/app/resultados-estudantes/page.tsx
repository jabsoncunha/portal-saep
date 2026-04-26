"use client";

import { useState, useEffect, useMemo } from "react";
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
  CheckCircle2
} from "lucide-react";
import dynamicData from "@/data/estudantes_2026.json";

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
    LP?: number;
    LG?: number;
    MA?: number;
    MÉDIA: number;
  };
}

interface AnoEscolar {
  ano: number;
  estudantes: Estudante[];
  questoes: {
    questao: string;
    habilidade: string;
    gabarito: string;
  }[];
}

export default function ResultadosEstudantesPage() {
  const [selectedAno, setSelectedAno] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnidade, setSelectedUnidade] = useState("TODAS");
  const [selectedTurma, setSelectedTurma] = useState("TODAS");
  const [selectedEstudante, setSelectedEstudante] = useState<Estudante | null>(null);
  
  const currentAnoData = (dynamicData as any).anos_escolares.find((a: any) => a.ano === selectedAno);
  
  const allUnidades = useMemo<string[]>(() => {
    if (!currentAnoData) return [];
    const unidades = new Set(currentAnoData.estudantes.map((e: Estudante) => e.unidade));
    return ["TODAS", ...Array.from(unidades).sort()] as string[];
  }, [currentAnoData]);

  const allTurmas = useMemo<string[]>(() => {
    if (!currentAnoData || selectedUnidade === "TODAS") return ["TODAS"];
    const turmas = new Set(
      currentAnoData.estudantes
        .filter((e: Estudante) => e.unidade === selectedUnidade)
        .map((e: Estudante) => e.turma)
    );
    return ["TODAS", ...Array.from(turmas).sort()] as string[];
  }, [currentAnoData, selectedUnidade]);

  // Resetar turma ao mudar unidade
  useEffect(() => {
    setSelectedTurma("TODAS");
  }, [selectedUnidade]);

  const filteredEstudantes = useMemo<Estudante[]>(() => {
    if (!currentAnoData) return [];
    return (currentAnoData.estudantes as Estudante[]).filter((e: Estudante) => {
      const matchSearch = e.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.matricula.toString().includes(searchTerm);
      const matchUnidade = selectedUnidade === "TODAS" || e.unidade === selectedUnidade;
      const matchTurma = selectedTurma === "TODAS" || e.turma === selectedTurma;
      return matchSearch && matchUnidade && matchTurma;
    }).slice(0, 500); // Limite de 500 para performance de renderização
  }, [currentAnoData, searchTerm, selectedUnidade, selectedTurma]);

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (score >= 6) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-rose-600 bg-rose-50 border-rose-100";
  };

  if (!currentAnoData) return null;

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-slate-50">
        {/* Header */}
        <header className="px-8 py-10 bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="flex items-center gap-3 text-blue-600 mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest">Acompanhamento Individual</span>
            <ChevronRight size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resultados por Estudante</span>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div>
              <h1 className="text-4xl font-black text-slate-900 font-outfit tracking-tight">Painel de Estudantes 2026</h1>
              <p className="mt-1 text-slate-500 font-bold">Consulte o desempenho individual e o detalhamento de respostas de cada aluno.</p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Seletor de Ano */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
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

              <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                <Download size={16} />
                EXPORTAR LISTA
              </button>
            </div>
          </div>
        </header>

        <main className="p-8">
          {/* Toolbar de Filtros */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
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

            <div className="flex items-center gap-3 bg-white px-5 py-2 rounded-2xl border border-slate-200 shadow-sm">
              <School className="text-slate-400" size={18} />
              <select 
                value={selectedUnidade}
                onChange={(e) => setSelectedUnidade(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none font-black text-xs text-slate-700 py-2 uppercase appearance-none cursor-pointer"
              >
                <option value="TODAS">TODAS AS UNIDADES</option>
                {allUnidades.filter((u: string) => u !== "TODAS").map((u: string) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 bg-white px-5 py-2 rounded-2xl border border-slate-200 shadow-sm">
              <Filter className="text-slate-400" size={18} />
              <select 
                value={selectedTurma}
                onChange={(e) => setSelectedTurma(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none font-black text-xs text-slate-700 py-2 uppercase appearance-none cursor-pointer"
                disabled={selectedUnidade === "TODAS"}
              >
                <option value="TODAS">TODAS AS TURMAS</option>
                {allTurmas.filter((t: string) => t !== "TODAS").map((t: string) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="bg-blue-50 px-6 py-4 rounded-2xl border border-blue-100 flex items-center justify-between">
              <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Total Localizado</span>
              <span className="text-xl font-black text-blue-600">{currentAnoData.estudantes.filter((e: any) => {
                const matchUnidade = selectedUnidade === "TODAS" || e.unidade === selectedUnidade;
                const matchTurma = selectedTurma === "TODAS" || e.turma === selectedTurma;
                return matchUnidade && matchTurma;
              }).length}</span>
            </div>
          </div>

          {/* Tabela de Estudantes */}
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Estudante</th>
                    <th className="p-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Unidade / Turma</th>
                    <th className="p-6 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">LP / LG</th>
                    <th className="p-6 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">MA</th>
                    <th className="p-6 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">Média</th>
                    <th className="p-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEstudantes.map((estudante: Estudante, idx: number) => (
                    <tr key={estudante.matricula} className="group hover:bg-slate-50 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                            {estudante.nome.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-700">{estudante.nome}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">MATRÍCULA: {estudante.matricula}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <p className="text-xs font-black text-slate-600 uppercase">{estudante.unidade}</p>
                        <p className="text-[10px] text-blue-500 font-black tracking-widest">TURMA: {estudante.turma}</p>
                      </td>
                      <td className="p-6 text-center">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-black border ${getScoreColor(estudante.notas.LP ?? estudante.notas.LG ?? 0)}`}>
                          {(estudante.notas.LP ?? estudante.notas.LG ?? 0).toFixed(1)}
                        </span>
                      </td>
                      <td className="p-6 text-center">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-black border ${getScoreColor(estudante.notas.MA ?? 0)}`}>
                          {(estudante.notas.MA ?? 0).toFixed(1)}
                        </span>
                      </td>
                      <td className="p-6 text-center">
                        <span className="text-lg font-black text-slate-900">
                          {(estudante.notas.MÉDIA ?? 0).toFixed(1)}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <button 
                          onClick={() => setSelectedEstudante(estudante)}
                          className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <FileText size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredEstudantes.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-20 text-center">
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
        </main>

        {/* Modal de Detalhes do Estudante */}
        {selectedEstudante && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
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
                  className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {/* Resumo de Notas no Modal */}
                <div className="grid grid-cols-3 gap-6 mb-10">
                  <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Língua Portuguesa</p>
                    <p className="text-3xl font-black text-slate-900">{(selectedEstudante.notas.LP ?? selectedEstudante.notas.LG ?? 0).toFixed(1)}</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Matemática</p>
                    <p className="text-3xl font-black text-slate-900">{(selectedEstudante.notas.MA ?? 0).toFixed(1)}</p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-[24px] border border-blue-100">
                    <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-2">Média Final</p>
                    <p className="text-3xl font-black text-blue-600">{(selectedEstudante.notas.MÉDIA ?? 0).toFixed(1)}</p>
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-500" size={24} />
                  Detalhamento de Respostas
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {Object.entries(selectedEstudante.respostas).map(([questao, resposta]) => (
                    <div key={questao} className="p-4 bg-white border border-slate-100 rounded-2xl flex flex-col items-center gap-2 group hover:border-blue-200 hover:shadow-sm transition-all">
                      <span className="text-[10px] font-black text-slate-400 uppercase">{questao}</span>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                        resposta ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-300"
                      }`}>
                        {resposta || "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
                <button 
                  onClick={() => setSelectedEstudante(null)}
                  className="px-8 py-4 bg-white text-slate-500 font-black rounded-2xl border border-slate-200 hover:bg-slate-100 transition-all text-xs uppercase tracking-widest"
                >
                  Fechar
                </button>
                <button className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 text-xs uppercase tracking-widest flex items-center gap-2">
                  <Download size={16} />
                  PDF do Estudante
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
