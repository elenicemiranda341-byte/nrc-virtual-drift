import { useState } from 'react';
import { ResilientImage } from './ResilientImage.tsx';

import judgingZoneImg from '../assets/images/judging_clipping_zone_1793100566289.jpg';

export function RegulationsSection() {
  const [lineGrade, setLineGrade] = useState<number>(9);
  const [angleGrade, setAngleGrade] = useState<number>(8.5);
  const [styleGrade, setStyleGrade] = useState<number>(9);

  const linePoints = Math.round(lineGrade * 4 * 10) / 10;
  const anglePoints = Math.round(angleGrade * 3 * 10) / 10;
  const stylePoints = Math.round(styleGrade * 3 * 10) / 10;
  const totalScore = Math.round((linePoints + anglePoints + stylePoints) * 10) / 10;

  return (
    <section
      id="regulamento"
      className="border-b border-[#232830] bg-[#090A0C] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-wide text-[#39FF14]">
            04. Diretrizes de Direção de Prova
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#F1F3F5] sm:text-4xl [text-wrap:balance]">
            Regulamento Oficial NRC Virtual Drift
          </h2>
          <p className="mt-3 text-base text-[#949CA8]">
            Regras obrigatórias aplicadas às categorias PRO e STREET sob supervisão do fundador{' '}
            <span className="font-semibold text-[#F1F3F5]">Ryan Miranda Faria</span> e da bancada
            oficial de juízes (<span className="text-[#D0D6DE]">Ryan, Vitor e Vitor</span>).
          </p>
        </div>

        {/* Rule Pillars Grid (Asymmetric Bento Structure) */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* 01. Qualify */}
          <article className="rounded-xl border border-[#232830] bg-[#111317] p-6 sm:p-7 lg:col-span-6">
            <p className="font-mono text-xs font-semibold text-[#39FF14]">Seção 01</p>
            <h3 className="mt-1.5 font-display text-2xl font-bold tracking-wide text-[#F1F3F5]">
              Formato de Qualify
            </h3>
            <p className="mt-2 text-sm text-[#949CA8]">
              Procedimento oficial de tomada de nota individual para formação das chaves.
            </p>

            <dl className="mt-5 divide-y divide-[#232830] border-t border-[#232830] text-sm">
              <div className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-[#949CA8]">Número de voltas</dt>
                <dd className="font-mono font-semibold tabular-nums text-[#F1F3F5]">
                  2 voltas por piloto
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-[#949CA8]">Tempo limite em pista</dt>
                <dd className="font-mono font-semibold tabular-nums text-[#F1F3F5]">
                  Máximo de 2 minutos por entrada
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-[#949CA8]">Critério de classificação</dt>
                <dd className="font-semibold text-[#39FF14]">Vale a melhor volta</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-[#949CA8]">Controle de largada</dt>
                <dd className="text-right font-semibold text-[#F1F3F5]">
                  Entrada somente com permissão do lobby
                </dd>
              </div>
            </dl>
          </article>

          {/* 02. Track Limits & Zero-Point Infractions */}
          <article className="rounded-xl border border-[#232830] bg-[#111317] p-6 sm:p-7 lg:col-span-6">
            <p className="font-mono text-xs font-semibold text-[#39FF14]">Seção 02</p>
            <h3 className="mt-1.5 font-display text-2xl font-bold tracking-wide text-[#F1F3F5]">
              Limite de Pista & Penalidades Automáticas
            </h3>
            <p className="mt-2 text-sm text-[#949CA8]">
              Rigor técnico estrito na demarcação do traçado e preservação dos elementos de pista.
            </p>

            <dl className="mt-5 divide-y divide-[#232830] border-t border-[#232830] text-sm">
              <div className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-[#949CA8]">Referência oficial de borda</dt>
                <dd className="font-semibold text-[#F1F3F5]">A linha branca é o limite</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-[#949CA8]">4 rodas fora da linha branca</dt>
                <dd className="font-mono font-bold tabular-nums text-rose-400">0 pontos</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-[#949CA8]">Bater ou derrubar cone</dt>
                <dd className="font-mono font-bold tabular-nums text-rose-400">0 pontos</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-[#949CA8]">Rodar na pista (spin / perda total)</dt>
                <dd className="font-mono font-bold tabular-nums text-rose-400">0 pontos</dd>
              </div>
            </dl>
          </article>

          {/* 03. Judging Breakdown + Interactive Calculator (Span 7) */}
          <article className="rounded-xl border border-[#232830] bg-[#111317] p-6 sm:p-7 lg:col-span-7">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="font-mono text-xs font-semibold text-[#39FF14]">Seção 03</p>
                <h3 className="mt-1.5 font-display text-2xl font-bold tracking-wide text-[#F1F3F5]">
                  Critérios de Julgamento — Escala 0 a 10 (Total 100 Pontos)
                </h3>
              </div>
              <span className="font-mono text-xs font-semibold tabular-nums text-[#D0D6DE]">
                40% + 30% + 30% = 100 pts
              </span>
            </div>

            <p className="mt-2 text-sm text-[#949CA8]">
              Os juízes oficiais do campeonato (<strong className="font-semibold text-[#F1F3F5]">Ryan, Vitor e Vitor</strong>) atribuem notas de 0 a 10 em cada quesito técnico, convertidas pelos pesos
              oficiais para compor a pontuação final de até 100 pontos por volta.
            </p>

            {/* Static Official Weights Breakdown */}
            <div className="mt-6 space-y-4">
              <div>
                <div className="flex items-baseline justify-between text-xs font-semibold">
                  <span className="text-[#F1F3F5]">
                    Linha — Precisão nos clipping points internos e externos
                  </span>
                  <span className="font-mono tabular-nums text-[#39FF14]">40% (até 40 pts)</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#090A0C]">
                  <div className="h-full w-2/5 rounded-full bg-[#39FF14]" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between text-xs font-semibold">
                  <span className="text-[#F1F3F5]">
                    Ângulo — Grau de inclinação e estabilidade sem correções
                  </span>
                  <span className="font-mono tabular-nums text-[#F1F3F5]">30% (até 30 pts)</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#090A0C]">
                  <div className="h-full w-[30%] rounded-full bg-[#D0D6DE]" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between text-xs font-semibold">
                  <span className="text-[#F1F3F5]">
                    Estilo — Comprometimento na entrada, fluidez e agressividade
                  </span>
                  <span className="font-mono tabular-nums text-[#F1F3F5]">30% (até 30 pts)</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#090A0C]">
                  <div className="h-full w-[30%] rounded-full bg-[#949CA8]" />
                </div>
              </div>
            </div>

            {/* Interactive Score Calculator for Pilots */}
            <div className="mt-7 border-t border-[#232830] pt-5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-[#D0D6DE]">
                  Simulador de nota de volta (critérios de 0 a 10)
                </span>
                <span className="font-mono text-lg font-bold tabular-nums text-[#39FF14]">
                  {totalScore.toFixed(1)} / 100 pts
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="flex justify-between text-xs text-[#949CA8]">
                    <span>Linha (40%)</span>
                    <span className="font-mono tabular-nums text-[#F1F3F5]">{lineGrade}</span>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.5}
                    value={lineGrade}
                    onChange={(e) => setLineGrade(Number(e.target.value))}
                    className="mt-2 w-full accent-[#39FF14] cursor-pointer"
                  />
                </label>

                <label className="block">
                  <span className="flex justify-between text-xs text-[#949CA8]">
                    <span>Ângulo (30%)</span>
                    <span className="font-mono tabular-nums text-[#F1F3F5]">{angleGrade}</span>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.5}
                    value={angleGrade}
                    onChange={(e) => setAngleGrade(Number(e.target.value))}
                    className="mt-2 w-full accent-[#39FF14] cursor-pointer"
                  />
                </label>

                <label className="block">
                  <span className="flex justify-between text-xs text-[#949CA8]">
                    <span>Estilo (30%)</span>
                    <span className="font-mono tabular-nums text-[#F1F3F5]">{styleGrade}</span>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.5}
                    value={styleGrade}
                    onChange={(e) => setStyleGrade(Number(e.target.value))}
                    className="mt-2 w-full accent-[#39FF14] cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </article>

          {/* 04. Visual Reference + Lobby Conduct (Span 5) */}
          <div className="flex flex-col justify-between rounded-xl border border-[#232830] bg-[#111317] overflow-hidden lg:col-span-5">
            <div className="relative aspect-[16/10] w-full bg-[#090A0C]">
              <ResilientImage
                src={judgingZoneImg}
                alt="Carro de drift tangenciando a linha branca e o cone interno sem contato"
                fallbackLabel="Referência de Linha Branca & Cone"
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#111317] via-transparent to-transparent" />
            </div>

            <div className="p-6 sm:p-7">
              <p className="font-mono text-xs font-semibold text-[#39FF14]">Seção 04</p>
              <h3 className="mt-1.5 font-display text-2xl font-bold tracking-wide text-[#F1F3F5]">
                Conduta no Lobby & Disciplina Esportiva
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-[#D0D6DE]">
                <li>
                  Respeito mútuo obrigatório entre todos os pilotos, juízes e espectadores no lobby.
                </li>
                <li>
                  Tolerância zero para chat tóxico, ofensas, spam ou interferência na volta de outro
                  competidor.
                </li>
                <li>
                  Qualquer comportamento antidesportivo é passível de{' '}
                  <span className="font-semibold text-[#F1F3F5]">
                    advertência formal ou desclassificação imediata
                  </span>{' '}
                  a critério da direção de prova NRC.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
