"use client";

import { useState, useMemo } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { 
  Search, 
  BookOpen, 
  ChevronRight, 
  Filter, 
  Download, 
  ExternalLink,
  Library,
  Calendar,
  FileText
} from "lucide-react";
import FileCard from "@/components/FileCard";

// Mock data based on user links and expected structure
const GUIAS_DATA = {
  sugestoes: [
    {
      id: "sug-1",
      name: "Sugestões de uso dos guias",
      type: "PDF",
      size: "1.2 MB",
      date: "30 de Maio",
      url: "https://drive.google.com/uc?export=download&id=158aEHjM_75cPRXPtpTlFmj4BGsFy8M-d",
      isExternal: false
    }
  ],
  2025: [
    {
      id: "2025-9",
      name: "Guia completo 9º ano - 2025",
      type: "PDF",
      size: "12.8 MB",
      date: "30 de Maio",
      url: "https://semedpalmas-my.sharepoint.com/personal/jabsoncunha_semed_palmas_to_gov_br/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Fjabsoncunha%5Fsemed%5Fpalmas%5Fto%5Fgov%5Fbr%2FDocuments%2FMaterial%20Portal%20SAEP%2FGuias%202025%2FGuia%20completo%209%C2%BA%20ano%20%2D%202025%2Epdf&download=1",
      isExternal: false
    },
    {
      id: "2025-5",
      name: "Guia completo do 5º ano - 2025",
      type: "PDF",
      size: "10.6 MB",
      date: "30 de Maio",
      url: "https://semedpalmas-my.sharepoint.com/personal/jabsoncunha_semed_palmas_to_gov_br/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Fjabsoncunha%5Fsemed%5Fpalmas%5Fto%5Fgov%5Fbr%2FDocuments%2FMaterial%20Portal%20SAEP%2FGuias%202025%2FGuia%20completo%20do%205%C2%BA%20ano%20%2D%202025%2Epdf&download=1",
      isExternal: false
    },
    {
      id: "2025-2",
      name: "Guia do 2º ano completo - 22-04",
      type: "PDF",
      size: "14.0 MB",
      date: "30 de Maio",
      url: "https://semedpalmas-my.sharepoint.com/personal/jabsoncunha_semed_palmas_to_gov_br/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Fjabsoncunha%5Fsemed%5Fpalmas%5Fto%5Fgov%5Fbr%2FDocuments%2FMaterial%20Portal%20SAEP%2FGuias%202025%2FGuia%20do%202%C2%BA%20ano%20completo%20%2D%2022%2D04%2Epdf&download=1",
      isExternal: false
    }
  ],
  2024: [
    {
      id: "2024-1",
      name: "Guia de Aprendizagem - Ciclo Completo 2024",
      type: "PDF",
      size: "4.8 MB",
      date: "2024-02-15",
      url: "https://semedpalmas-my.sharepoint.com/personal/jabsoncunha_semed_palmas_to_gov_br/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Fjabsoncunha%5Fsemed%5Fpalmas%5Fto%5Fgov%5Fbr%2FDocuments%2FMaterial%20Portal%20SAEP%2FGuias%202024&ga=1",
      isExternal: false
    }
  ]
};

export default function GuiasPage() {
  const [activeTab, setActiveTab] = useState<"2025" | "2024" | "sugestoes">("2025");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFiles = useMemo(() => {
    return GUIAS_DATA[activeTab].filter(file => 
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeTab, searchTerm]);

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
        {/* Header */}
        <header className="px-8 pt-12 pb-16 bg-white border-b border-slate-200 shadow-sm relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-50 rounded-full opacity-50 blur-3xl" />
          
          <div className="relative z-10 flex flex-col gap-8 max-w-[1600px] mx-auto">
            <div className="flex items-center gap-3 text-blue-600 mb-2">
              <span className="text-xs font-black uppercase tracking-widest">Documentação</span>
              <ChevronRight size={14} />
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Guias de Aprendizagem</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 font-outfit tracking-tighter leading-none">
                  Guias de <span className="text-blue-600">Aprendizagem</span>
                </h1>
                <p className="text-slate-500 font-bold text-lg max-w-2xl leading-relaxed">
                  Acesse os documentos de orientação pedagógica e sugestões de uso para fortalecer o ensino na rede municipal.
                </p>
              </div>

              {/* Tabs */}
              <div className="flex bg-slate-100 p-1.5 rounded-[28px] border border-slate-200 backdrop-blur-sm">
                <button
                  onClick={() => setActiveTab("2025")}
                  className={`px-8 py-4 rounded-[22px] font-black text-sm uppercase tracking-widest transition-all ${
                    activeTab === "2025" 
                      ? "bg-white text-blue-600 shadow-xl shadow-blue-900/5 border border-slate-200" 
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Guias 2025
                </button>
                <button
                  onClick={() => setActiveTab("2024")}
                  className={`px-8 py-4 rounded-[22px] font-black text-sm uppercase tracking-widest transition-all ${
                    activeTab === "2024" 
                      ? "bg-white text-blue-600 shadow-xl shadow-blue-900/5 border border-slate-200" 
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Guias 2024
                </button>
                <button
                  onClick={() => setActiveTab("sugestoes")}
                  className={`px-8 py-4 rounded-[22px] font-black text-sm uppercase tracking-widest transition-all ${
                    activeTab === "sugestoes" 
                      ? "bg-white text-blue-600 shadow-xl shadow-blue-900/5 border border-slate-200" 
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Sugestões
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8 max-w-[1600px] mx-auto w-full mt-10">
          <div className="flex flex-col gap-10">
            {/* Search & Stats */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="relative w-full md:w-[450px] group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Buscar documento por nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-4.5 bg-white rounded-2xl border border-slate-200 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-700 transition-all text-sm"
                />
              </div>

              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total de Arquivos</span>
                  <p className="text-xl font-black text-slate-900">{filteredFiles.length} documentos</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Library size={24} />
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
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Nenhum arquivo encontrado</h3>
                    <p className="text-slate-500 font-bold mt-1">Tente ajustar seus termos de busca.</p>
                  </div>
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Limpar Busca
                  </button>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
