import { LucideIcon } from "lucide-react";

interface ResultCardItemProps {
  title: string;
  icon: LucideIcon;
  color: string;
  href: string;
}

export default function ResultCardItem({ title, icon: Icon, color, href }: ResultCardItemProps) {
  return (
    <a 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center group cursor-pointer w-full"
    >
      <div className={`w-36 h-36 rounded-[40px] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl ${color} shadow-lg border border-white/20`}>
        <Icon size={64} className="text-white" strokeWidth={1.5} />
      </div>
      <span className="mt-6 text-center text-base font-black text-slate-800 leading-tight group-hover:text-blue-700 transition-colors uppercase tracking-tight px-2">
        {title}
      </span>
    </a>
  );
}
