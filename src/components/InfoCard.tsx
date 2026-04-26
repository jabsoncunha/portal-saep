"use client";

import { Play, ArrowUpRight } from "lucide-react";

interface InfoCardProps {
  title: string;
  description: string;
  imagePath?: string;
  isVideo?: boolean;
  link?: string;
}

export default function InfoCard({ title, description, imagePath, isVideo, link }: InfoCardProps) {
  const CardWrapper = link ? "a" : "div";
  
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = isVideo && link ? getYouTubeId(link) : null;

  return (
    <CardWrapper 
      href={link} 
      target={link ? "_blank" : undefined}
      rel={link ? "noopener noreferrer" : undefined}
      className="bg-white rounded-[40px] overflow-hidden shadow-[0_10px_50px_rgba(0,43,91,0.12)] border border-white/20 hover:shadow-[0_20px_70px_rgba(0,43,91,0.25)] transition-all duration-700 group block h-full cursor-pointer relative"
    >
      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
        {/* Pré-visualização com preenchimento total */}
        {link ? (
          <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
            {isVideo && videoId ? (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${videoId}&rel=0&showinfo=0&iv_load_policy=3`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="w-full h-[160%] scale-[1.6] object-cover" // Aumentado para garantir preenchimento
              />
            ) : (
              <div className="w-full h-full relative">
                <iframe
                  src={link}
                  title="Site preview"
                  className="w-[200%] h-[200%] absolute top-0 left-0 origin-top-left scale-[0.5] border-none opacity-80 group-hover:opacity-100 transition-all duration-700 grayscale-[0.3] group-hover:grayscale-0"
                  style={{ width: "200%", height: "200%" }}
                  loading="lazy"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-100 text-slate-400">
             <span className="text-xs font-bold uppercase tracking-widest">Visualização</span>
          </div>
        )}

        {/* Overlay de gradiente */}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />
        
        {/* Ícone flutuante */}
        <div className="absolute top-4 right-4 z-30 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
           <ArrowUpRight size={18} className="text-blue-600" />
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-blue-700 transition-colors font-outfit uppercase tracking-tight">
          {title}
        </h3>
        <p className="mt-3 text-slate-500 text-lg leading-relaxed font-bold line-clamp-2">
          {description}
        </p>
        
        <div className="mt-8 flex items-center gap-3 text-sm font-black text-blue-600 group-hover:gap-5 transition-all uppercase tracking-[0.25em]">
          {isVideo ? "Assistir Vídeo" : "Acessar Plataforma"}
          <div className="h-0.5 w-8 bg-blue-600 rounded-full group-hover:w-12 transition-all" />
        </div>
      </div>
    </CardWrapper>
  );
}
