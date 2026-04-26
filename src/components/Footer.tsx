import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-white mt-auto">
      {/* Top Section: Branding & Info */}
      <div className="pt-16 pb-12 px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start space-y-4">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-black text-slate-900 font-outfit tracking-tighter">DAE</h2>
              <div className="h-8 w-px bg-slate-200" />
              <span className="text-sm font-black text-blue-600 uppercase tracking-[0.3em]">Portal Saep</span>
            </div>
            <p className="text-sm text-slate-500 font-medium max-w-sm text-center md:text-left leading-relaxed">
              Diretoria de Avaliação e Estatística. Transformando a educação de Palmas através de dados, transparência e inovação pedagógica.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="text-center md:text-right">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Desenvolvido por</p>
              <p className="text-xs font-bold text-slate-900 uppercase tracking-tighter">Jabson Cunha</p>
            </div>
            <div className="h-10 w-px bg-slate-100 hidden md:block" />
            <div className="flex gap-8">
              <a href="#" className="text-xs text-slate-400 hover:text-blue-600 font-black uppercase tracking-widest transition-colors">Privacidade</a>
              <a href="#" className="text-xs text-slate-400 hover:text-blue-600 font-black uppercase tracking-widest transition-colors">Contato</a>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#003B7E] py-8 px-12">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[10px] text-blue-200/50 font-black uppercase tracking-[0.4em]">
            © 2026 DAE | Secretaria Municipal de Educação | Palmas-TO
          </p>
        </div>
      </div>
    </footer>
  );
}
