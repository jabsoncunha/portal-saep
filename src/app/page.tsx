import Image from "next/image";
import InfoCard from "@/components/InfoCard";
import ResultButton from "@/components/ResultButton";
import Link from "next/link";
import { ArrowRight, BookOpen, Presentation, Video, LayoutDashboard, GraduationCap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col pb-20">
      {/* Hero Section - Pure Solid #003B7E to match footer exactly */}
      <section className="relative h-[680px] flex items-center px-6 overflow-hidden bg-[#003B7E]">
        <div className="relative z-20 pt-10 pb-20">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-lg font-black uppercase tracking-wider mb-8">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            Portal da Diretoria de Avaliação e Estatística
          </div>

          <h1 className="text-6xl md:text-8xl font-black leading-tight font-outfit uppercase tracking-tighter">
            <span className="text-[#00d2ff]">S</span>
            <span className="text-[#FFD200]">A</span>
            <span className="text-white">E</span>
            <span className="text-[#FFD200]">P</span>
            <span className="ml-4 text-blue-400">2026</span>
          </h1>
          <p className="mt-6 text-2xl text-blue-100/80 max-w-2xl leading-relaxed font-black">
            Sistema de Avaliação Educacional de Palmas. Transformando dados em ações para uma educação de excelência.
          </p>

          {/* Action Cards - Ajustados para ficarem na mesma linha */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div className="bg-white p-5 pr-6 rounded-[32px] shadow-xl flex items-center gap-4 group cursor-pointer hover:bg-blue-50 transition-all border-2 border-[#00d2ff] w-full">
              <div className="bg-[#00d2ff] p-4 rounded-2xl group-hover:scale-110 transition-transform flex-shrink-0">
                <BookOpen className="text-white" size={24} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-xl uppercase tracking-tight">Educação</h4>
                <p className="text-slate-500 text-sm mt-1 leading-snug font-bold">Foco na qualidade do ensino e aprendizagem contínua.</p>
              </div>
            </div>

            <div className="bg-white p-5 pr-6 rounded-[32px] shadow-xl flex items-center gap-4 group cursor-pointer hover:bg-blue-50 transition-all border-2 border-[#FFD200] w-full">
              <div className="bg-[#FFD200] p-4 rounded-2xl group-hover:scale-110 transition-transform flex-shrink-0">
                <GraduationCap className="text-white" size={24} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-xl uppercase tracking-tight">Professor</h4>
                <p className="text-slate-500 text-sm mt-1 leading-snug font-bold">Acompanhamento e melhorias nas metodologias de ensino.</p>
              </div>
            </div>

            <div className="bg-white p-5 pr-6 rounded-[32px] shadow-xl flex items-center gap-4 group cursor-pointer hover:bg-blue-50 transition-all border-2 border-[#000096] w-full">
              <div className="bg-[#000096] p-4 rounded-2xl group-hover:scale-110 transition-transform flex-shrink-0">
                <Presentation className="text-white" size={24} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-xl uppercase tracking-tight">Gestão</h4>
                <p className="text-slate-500 text-sm mt-1 leading-snug font-bold">Dados estratégicos para tomadas de decisões precisas.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side Logo - Matching Attachment */}
        <div className="absolute right-12 top-[35%] -translate-y-1/2 z-10 hidden lg:block">
          <div className="relative w-[500px] h-[300px]">
            <Image 
              src="/saep-azul.jpg" 
              alt="SAEP Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </section>

      {/* Main Content Grid - ALIGNED ON DIVIDER */}
      <div className="px-6 -mt-28 relative z-30 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <InfoCard
          title="Vídeo Tutorial"
          description="Aprenda o passo a passo de como acessar a plataforma e navegar pelos painéis de resultados."
          isVideo
          imagePath="/tutorial-thumb.jpg"
          link="https://www.youtube.com/watch?v=9Sqb6KhYuUw"
        />
        <InfoCard
          title="Análise Longitudinal"
          description="Mapeamento detalhado das habilidades com maior frequência de déficit ao longo dos anos."
          imagePath="/analise-thumb.jpg"
          link="https://glowing-cucurucho-e960e7.netlify.app/"
        />
        <InfoCard
          title="Boletim da Rede 2025"
          description="Confira o desempenho consolidado de toda a rede municipal de ensino de Palmas."
          imagePath="/boletim-thumb.jpg"
          link="https://app.powerbi.com/view?r=eyJrIjoiNDg1Y2Y3MDItMGNhMC00OGRkLTlkOGYtZWVlNjZiYTRlMWRmIiwidCI6IjE0M2U0OWFiLTdiOTEtNGM0NS04MjU3LTRiYjA4ZDhmMDcwNiJ9&pageName=0b3a58fbda56ac72a07d"
        />
      </div>

      <div className="px-6 mt-32 grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* Text Section */}
        <div className="xl:col-span-7 space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-1 w-12 bg-blue-600 rounded-full" />
            <h2 className="text-6xl font-black text-slate-900 font-outfit uppercase tracking-tight">O que é o SAEP?</h2>
          </div>

          <div className="grid gap-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm border-l-[6px] border-l-blue-600 hover:shadow-md transition-shadow">
              <h4 className="text-3xl font-black text-slate-900 mb-3">Perspectiva de Avaliação</h4>
              <p className="text-slate-600 leading-relaxed font-bold text-xl">
                O SAEP é um sistema que explora diversas situações quanto ao desenvolvimento do aluno, abandonando a perspectiva meramente quantitativa de avaliação.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm border-l-[6px] border-l-blue-600 hover:shadow-md transition-shadow">
              <h4 className="text-3xl font-black text-slate-900 mb-3">Aspectos Qualitativos</h4>
              <p className="text-slate-600 leading-relaxed font-bold text-xl">
                "Buscamos contemplar também aspectos qualitativos, oferecendo subsídios para implementações de ações significativas para o desenvolvimento do aluno."
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm border-l-[6px] border-l-blue-600 hover:shadow-md transition-shadow">
              <h4 className="text-3xl font-black text-slate-900 mb-3">Objetivos Estratégicos</h4>
              <p className="text-slate-600 leading-relaxed font-bold text-xl">
                Dentre os objetivos, destacamos a oferta à sociedade de uma análise do desempenho escolar, criação de indicadores para metas de melhoria do ensino e detecção de pontos para intervenções pedagógicas eficazes.
              </p>
            </div>
          </div>

          <div className="p-10 bg-blue-50 rounded-[40px] border border-blue-100 flex flex-col md:flex-row items-center gap-8 shadow-inner">
            <div className="flex-1">
              <h4 className="text-4xl font-black text-blue-900 mb-2">Compromisso com a Excelência</h4>
              <p className="text-blue-700 font-bold text-xl leading-relaxed">Nossa missão é fornecer dados para novas estratégias metodológicas que transformem a realidade da educação pública de Palmas.</p>
            </div>
            <button className="px-10 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 uppercase tracking-widest text-sm">
              Saiba Mais
            </button>
          </div>
        </div>

        {/* Results Buttons Grid */}
        <div className="xl:col-span-5 bg-white rounded-[48px] p-10 shadow-xl border border-slate-100">
          <h3 className="text-4xl font-black text-slate-900 font-outfit mb-10 flex items-center gap-4">
            <LayoutDashboard className="text-blue-600" size={40} />
            RESULTADOS DISPONÍVEIS NOS PAINÉIS
          </h3>

          <div className="grid gap-5">
            <Link href="/indicadores-gerais">
              <ResultButton label="UNIDADES ESCOLARES" color="bg-[#00d2ff]" />
            </Link>
            
            <Link href="/resultados" className="grid gap-5 cursor-pointer">
              <ResultButton label="TURMA" color="bg-[#FFD200]" />
              <ResultButton label="COMPONENTES CURRICULARES" color="bg-[#0000ff]" />
            </Link>

            <Link href="/resultados-habilidades">
              <ResultButton label="HABILIDADES" color="bg-[#004bff]" />
            </Link>

            <Link href="/resultados-estudantes">
              <ResultButton label="ESTUDANTES" color="bg-[#003B7E]" />
            </Link>

            <Link href="/resultados" className="grid gap-5 cursor-pointer">
              <ResultButton label="RAÇA/COR" color="bg-[#000096]" />
              <ResultButton label="ATENDIMENTO" color="bg-[#00d2ff]" />
              <ResultButton label="REGIÃO" color="bg-[#FFD200]" />
            </Link>
          </div>

          <div className="mt-10 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
            <div className="flex items-center justify-between text-sm font-black text-slate-400 uppercase tracking-widest">
              <span>Status dos Dados</span>
              <span className="text-green-500 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Atualizado
              </span>
            </div>
            <div className="mt-4 h-3 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-[95%] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
