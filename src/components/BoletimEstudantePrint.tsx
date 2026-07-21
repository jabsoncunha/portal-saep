import React, { forwardRef } from 'react';

interface Respostas {
  [key: string]: string | null;
}

export interface EstudanteDetalhe {
  matricula: number;
  nome: string;
  pcd: boolean;
  unidade: string;
  turma: string;
  respostas: Respostas;
  notas: {
    LP?: number | null;
    LG?: number | null;
    MA?: number | null;
    CN?: number | null;
    CH?: number | null;
    MÉDIA: number;
  };
}

interface BoletimEstudantePrintProps {
  estudante: EstudanteDetalhe | null;
  escola: string | undefined;
  ano: number;
  avaliacao: string;
  gabarito: Record<string, string>;
}

export const BoletimEstudantePrint = forwardRef<HTMLDivElement, BoletimEstudantePrintProps>(
  ({ estudante, escola, ano, avaliacao, gabarito }, ref) => {
    if (!estudante) return null;

    const avaliacaoLabel = avaliacao === "ad_2026" ? "AVALIAÇÃO DIAGNÓSTICA" : "1º BIMESTRE";
    const lg = (estudante.notas.LP ?? estudante.notas.LG);

    return (
      <div ref={ref} className="p-8 bg-white text-slate-900 w-full print:block" style={{ fontFamily: 'Arial, sans-serif' }}>
        {/* Header */}
        <div className="bg-blue-800 text-white p-3 font-bold text-xl uppercase tracking-wider mb-6">
          BOLETIM INDIVIDUAL DO ESTUDANTE
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-8 text-sm font-bold uppercase border border-slate-400 p-4 bg-slate-50">
          <div>ALUNO(A): {estudante.nome} {estudante.pcd ? "(PCD)" : ""}</div>
          <div>MATRÍCULA: {estudante.matricula}</div>
          <div>ESCOLA: {escola}</div>
          <div>ANO/TURMA: {ano}º ANO - {estudante.turma}</div>
          <div>AVALIAÇÃO: {avaliacaoLabel}</div>
        </div>

        {/* Resumo de Notas */}
        <div className="mb-8">
          <div className="bg-slate-200 text-slate-800 p-2 font-bold uppercase mb-4 border border-slate-400">
            Resumo de Notas
          </div>
          <table className="w-full border-collapse border border-slate-400 text-center text-sm">
            <thead>
              <tr className="bg-slate-100 font-bold uppercase">
                <th className="border border-slate-400 p-3">Língua Portuguesa</th>
                <th className="border border-slate-400 p-3">Matemática</th>
                {ano >= 3 && <th className="border border-slate-400 p-3">Ciências da Natureza</th>}
                {ano >= 3 && <th className="border border-slate-400 p-3">Ciências Humanas</th>}
                <th className="border border-slate-400 p-3 bg-blue-100">Média Final</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-400 p-3 text-lg font-bold">
                  {lg !== null && lg !== undefined ? lg.toFixed(2) : "-"}
                </td>
                <td className="border border-slate-400 p-3 text-lg font-bold">
                  {estudante.notas.MA !== null && estudante.notas.MA !== undefined ? estudante.notas.MA.toFixed(2) : "-"}
                </td>
                {ano >= 3 && (
                  <td className="border border-slate-400 p-3 text-lg font-bold">
                    {estudante.notas.CN !== null && estudante.notas.CN !== undefined ? estudante.notas.CN.toFixed(2) : "-"}
                  </td>
                )}
                {ano >= 3 && (
                  <td className="border border-slate-400 p-3 text-lg font-bold">
                    {estudante.notas.CH !== null && estudante.notas.CH !== undefined ? estudante.notas.CH.toFixed(2) : "-"}
                  </td>
                )}
                <td className="border border-slate-400 p-3 text-lg font-bold bg-blue-50/50 text-blue-800">
                  {estudante.notas.MÉDIA.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Detalhamento de Respostas */}
        <div>
          <div className="bg-slate-200 text-slate-800 p-2 font-bold uppercase mb-4 border border-slate-400">
            Detalhamento de Respostas
          </div>
          <div className="grid grid-cols-6 gap-2">
            {Object.entries(estudante.respostas).map(([questao, resposta]) => {
              const qNum = parseInt(questao.replace('Q', ''));
              const dbKey = `q${qNum}`;
              const gabVal = gabarito[dbKey];
              const isWrong = gabVal && resposta && gabVal !== resposta;
              const isCorrect = gabVal && resposta && gabVal === resposta;

              let bgColor = "bg-white";
              let textColor = "text-slate-800";
              
              // Cores mais suaves para impressão
              if (isWrong) {
                bgColor = "bg-red-100";
                textColor = "text-red-900";
              } else if (isCorrect) {
                bgColor = "bg-green-100";
                textColor = "text-green-900";
              } else if (!resposta) {
                bgColor = "bg-gray-100";
                textColor = "text-gray-500";
              }

              return (
                <div key={questao} className={`border border-slate-400 p-2 flex flex-col items-center justify-center ${bgColor}`}>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">{questao}</div>
                  <div className={`text-base font-black ${textColor}`}>
                    {resposta || "—"}
                  </div>
                  {isWrong && (
                    <div className="text-[9px] font-bold text-red-700 mt-1">
                      GAB: {gabVal}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

BoletimEstudantePrint.displayName = 'BoletimEstudantePrint';
