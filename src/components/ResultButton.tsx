import { ArrowUpRight } from "lucide-react";

interface ResultButtonProps {
  label: string;
  color: string;
}

export default function ResultButton({ label, color }: ResultButtonProps) {
  return (
    <div
      className={`relative flex items-center justify-center p-4 rounded-2xl shadow-sm border border-white/10 ${color}`}
    >
      <span className="font-black text-white tracking-widest uppercase text-lg text-center leading-tight">
        {label}
      </span>
    </div>
  );
}
