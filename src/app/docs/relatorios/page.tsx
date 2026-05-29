"use client";

import { useState, useMemo } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { 
  Search, 
  ChevronRight, 
  FileSpreadsheet,
  Download,
  Calendar
} from "lucide-react";
import FileCard from "@/components/FileCard";

const RELATORIOS_DATA = [
  {
    id: "rel-diag-2025",
    name: "Relatório Final Avaliação Diagnóstica - 2025",
    type: "PDF",
    size: "3.5 MB",
    date: "30 de Maio",
    url: "https://semedpalmas-my.sharepoint.com/personal/avaliacaoeformacao_semed_palmas_to_gov_br/_layouts/15/download.aspx?SourceUrl=/personal/avaliacaoeformacao_semed_palmas_to_gov_br/Documents/Material_SAEP/Relatorios_result_2025/Cópia de  Relatório da Avaliação Diagnóstica -2024  (1).pdf",
    isExternal: false
  },
  {
    id: "rel-bim-1-2025",
    name: "Relatório Final Bimestral 1 - 2025",
    type: "PDF",
    size: "4.2 MB",
    date: "30 de Maio",
    url: "https://semedpalmas-my.sharepoint.com/personal/avaliacaoeformacao_semed_palmas_to_gov_br/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Favaliacaoeformacao%5Fsemed%5Fpalmas%5Fto%5Fgov%5Fbr%2FDocuments%2FMaterial%5FSAEP%2FRelatorios%5Fresult%5F2025%2F%5FRELATO%CC%81RIO%20DA%20AVALIAC%CC%A7A%CC%83O%20BIMESTRAL%201%20%2D2025%20%283%29%2Epdf&download=1",
    isExternal: false
  }
];

export default function RelatoriosPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFiles = useMemo(() => {
    return RELATORIOS_DATA.filter(file => 
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
        {/* Header */}
        <header className="px-8 pt-12 pb-16 bg-white border-b border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-50 rounded-full opacity-50 blur-3xl" />
          
          <div className="relative z-10 flex flex-col gap-8 max-w-[1600px] mx-auto">
            <div className="flex items-center gap-3 text-emerald-600 mb-2">
              <span className="text-xs font-black uppercase tracking-widest">Resultados</span>
              <ChevronRight size={14} />
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Relatórios Finais</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 font-outfit tracking-tighter leading-none">
                  Relatórios <span className="text-emerald-600">Finais</span>
                </h1>
                <p className="text-slate-500 font-bold text-lg max-w-2xl leading-relaxed">
                  Consulte os relatórios analíticos consolidados das avaliações do SAEP e monitoramentos bimestrais.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8 max-w-[1600px] mx-auto w-full mt-10">
          <div className="flex flex-col gap-10">
            {/* Search */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="relative w-full md:w-[450px] group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Buscar relatório..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-4.5 bg-white rounded-2xl border border-slate-200 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold text-slate-700 transition-all text-sm"
                />
              </div>

              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Documentos Disponíveis</span>
                  <p className="text-xl font-black text-slate-900">{filteredFiles.length} relatórios</p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <FileSpreadsheet size={24} />
                </div>
              </div>
            </div>

            {/* Grid of Files */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFiles.length > 0 ? (
                filteredFiles.map((file) => (
                  <FileCard 
                    key={file.id}
                    name={file.name}
                    type={file.type}
                    size={file.size}
                    date={file.date}
                    downloadUrl={file.url}
                    isExternal={file.isExternal}
                  />
                ))
              ) : (
                <div className="col-span-full py-32 flex flex-col items-center justify-center gap-6 bg-white rounded-[40px] border border-slate-100 border-dashed">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                    <Search size={48} />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Nenhum relatório encontrado</h3>
                    <p className="text-slate-500 font-bold mt-1">Verifique o nome do documento ou limpe o filtro.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
