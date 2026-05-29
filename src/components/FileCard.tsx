"use client";

import { Download, FileText, File as FileIcon, ExternalLink } from "lucide-react";

interface FileCardProps {
  name: string;
  type: string;
  size?: string;
  date?: string;
  downloadUrl: string;
  isExternal?: boolean;
}

export default function FileCard({ name, type, size, date, downloadUrl, isExternal = false }: FileCardProps) {
  const getFileIcon = (fileType: string) => {
    const t = fileType.toLowerCase();
    if (t.includes("pdf")) return <FileText className="text-rose-500" size={24} />;
    if (t.includes("doc") || t.includes("word")) return <FileText className="text-blue-500" size={24} />;
    if (t.includes("xls") || t.includes("excel")) return <FileSpreadsheet className="text-emerald-500" size={24} />;
    return <FileIcon className="text-slate-400" size={24} />;
  };

  return (
    <div className="group bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex items-center gap-5">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        {getFileIcon(type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-black text-slate-900 text-base truncate mb-1 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
          {name}
        </h4>
        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>{type}</span>
          {size && (
            <>
              <span className="w-1 h-1 rounded-full bg-slate-200" />
              <span>{size}</span>
            </>
          )}
          {date && (
            <>
              <span className="w-1 h-1 rounded-full bg-slate-200" />
              <span>{date}</span>
            </>
          )}
        </div>
      </div>

      <a 
        href={downloadUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className={`p-3.5 rounded-2xl transition-all active:scale-90 flex items-center justify-center ${
          isExternal 
            ? "bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600" 
            : "bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700 hover:shadow-blue-200"
        }`}
      >
        {isExternal ? <ExternalLink size={20} /> : <Download size={20} />}
      </a>
    </div>
  );
}

function FileSpreadsheet({ className, size }: { className?: string; size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/>
    </svg>
  );
}
