import React, { forwardRef } from 'react';

export interface EstudanteBoletim {
  matricula: number;
  nome: string;
  pcd: boolean;
  unidade: string;
  turma: string;
  notas: {
    LP?: number | null;
    LG?: number | null;
    MA?: number | null;
    CN?: number | null;
    CH?: number | null;
    MÉDIA: number;
  };
}

interface BoletimTurmaPrintProps {
  estudantes: EstudanteBoletim[];
  escola: string | undefined;
  ano: number;
  turma: string;
  avaliacao: string;
}

export const BoletimTurmaPrint = forwardRef<HTMLDivElement, BoletimTurmaPrintProps>(
  ({ estudantes, escola, ano, turma, avaliacao }, ref) => {
    // Labels da avaliação
    const avaliacaoLabel = avaliacao === "ad_2026" ? "AVALIAÇÃO DIAGNÓSTICA" : "1º BIMESTRE";

    return (
      <div ref={ref} className="p-8 bg-white text-slate-900 w-full print:block" style={{ fontFamily: 'Arial, sans-serif' }}>
        {/* Header Style similar to example but with portal colors */}
        <div className="bg-blue-800 text-white p-3 font-bold text-xl uppercase tracking-wider mb-6">
          BOLETIM DE RESULTADOS ESCOLARES
        </div>
        
        <div className="flex justify-between mb-6 text-sm font-bold uppercase">
          <div>ESCOLA: {escola}</div>
          <div>AVALIAÇÃO: {avaliacaoLabel}</div>
        </div>
        <div className="flex justify-between mb-6 text-sm font-bold uppercase">
          <div>ANO/SÉRIE: {ano}º ANO - {turma === "TODAS" ? "TODAS AS TURMAS" : turma}</div>
          <div>TOTAL DE ALUNOS: {estudantes.length}</div>
        </div>

        <table className="w-full border-collapse border border-slate-400 text-xs text-center">
          <thead>
            <tr className="bg-slate-200 font-bold uppercase">
              <th className="border border-slate-400 p-2 text-left">ALUNO</th>
              <th className="border border-slate-400 p-2">MATRÍCULA</th>
              <th className="border border-slate-400 p-2">TURMA</th>
              <th className="border border-slate-400 p-2">LP / LG</th>
              <th className="border border-slate-400 p-2">MA</th>
              {ano >= 3 && <th className="border border-slate-400 p-2">CN</th>}
              {ano >= 3 && <th className="border border-slate-400 p-2">CH</th>}
              <th className="border border-slate-400 p-2 bg-blue-100">MÉDIA GERAL</th>
            </tr>
          </thead>
          <tbody>
            {estudantes.map(e => {
              const lg = (e.notas.LP ?? e.notas.LG);
              return (
                <tr key={e.matricula} className="border border-slate-400 hover:bg-slate-50">
                  <td className="border border-slate-400 p-2 text-left">{e.nome} {e.pcd ? "(PCD)" : ""}</td>
                  <td className="border border-slate-400 p-2">{e.matricula}</td>
                  <td className="border border-slate-400 p-2">{e.turma}</td>
                  <td className="border border-slate-400 p-2">{lg !== null && lg !== undefined ? lg.toFixed(2) : "-"}</td>
                  <td className="border border-slate-400 p-2">{e.notas.MA !== null && e.notas.MA !== undefined ? e.notas.MA.toFixed(2) : "-"}</td>
                  {ano >= 3 && <td className="border border-slate-400 p-2">{e.notas.CN !== null && e.notas.CN !== undefined ? e.notas.CN.toFixed(2) : "-"}</td>}
                  {ano >= 3 && <td className="border border-slate-400 p-2">{e.notas.CH !== null && e.notas.CH !== undefined ? e.notas.CH.toFixed(2) : "-"}</td>}
                  <td className="border border-slate-400 p-2 font-bold bg-blue-50/50">{e.notas.MÉDIA.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {estudantes.length === 0 && (
          <div className="text-center p-4 border border-t-0 border-slate-400 font-bold text-slate-500">
            Nenhum aluno encontrado para os filtros selecionados.
          </div>
        )}
      </div>
    );
  }
);

BoletimTurmaPrint.displayName = 'BoletimTurmaPrint';
