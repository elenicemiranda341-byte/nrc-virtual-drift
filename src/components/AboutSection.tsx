import { NRC_OFFICIAL_LOGO_PATH } from './NrcLogo.tsx';

export function AboutSection() {
  const judges = [
    {
      index: '01',
      name: 'Ryan',
      fullName: 'Ryan (Ryan Miranda Faria)',
      role: 'Fundador NRC · Juiz Chefe',
      focus: 'Supervisão geral de prova, leitura de linha ideal e consistência técnica',
    },
    {
      index: '02',
      name: 'Vitor',
      fullName: 'Vitor',
      role: 'Juiz Oficial do Campeonato',
      focus: 'Avaliação de ângulo, estabilidade de contra-esterço e limites de pista',
    },
    {
      index: '03',
      name: 'Vitor',
      fullName: 'Vitor',
      role: 'Juiz Oficial do Campeonato',
      focus: 'Avaliação de estilo, agressividade na entrada e fluidez nas transições',
    },
  ];

  return (
    <section
      id="organizacao"
      className="border-b border-[#232830] bg-[#090A0C] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Founder Story & NRC Heritage */}
          <article className="flex flex-col justify-between rounded-xl border border-[#232830] bg-[#111317] p-6 sm:p-8 lg:col-span-6">
            <div>
              <div className="mb-5 flex items-center gap-4">
                <img
                  src={NRC_OFFICIAL_LOGO_PATH}
                  alt="Emblema oficial da equipe NRC — Negative Rotation Crew"
                  className="h-16 w-28 shrink-0 rounded-lg border border-[#232830] bg-black object-cover object-center"
                />
                <p className="text-xs font-semibold tracking-wide text-[#39FF14]">
                  05. História, Fundador & Dedicação
                </p>
              </div>

              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#F1F3F5] sm:text-4xl [text-wrap:balance]">
                Ryan Miranda Faria & a origem da Negative Rotation Crew
              </h2>

              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[#949CA8]">
                <span>Fundador da Equipe NRC</span>
                <span aria-hidden="true">·</span>
                <span>Fundador do Campeonato</span>
                <span aria-hidden="true">·</span>
                <span>ryancar2</span>
              </div>

              <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#D0D6DE]">
                <p>
                  <strong className="font-semibold text-[#F1F3F5]">Ryan Miranda Faria</strong> é o
                  fundador da equipe{' '}
                  <strong className="font-semibold text-[#39FF14]">
                    NRC (Negative Rotation Crew)
                  </strong>{' '}
                  e o fundador oficial deste campeonato de drift virtual no FR Legends.
                </p>
                <p>
                  Cada etapa, escolha de traçado —{' '}
                  <span className="text-[#F1F3F5]">FDC Stadium X W1</span> na PRO e{' '}
                  <span className="text-[#F1F3F5]">Emerlaw Circuit</span> na STREET — e cada regra
                  deste projeto foram{' '}
                  <strong className="font-semibold text-[#F1F3F5]">
                    desenvolvidos com carinho
                  </strong>{' '}
                  para valorizar os pilotos, incentivar disputas limpas e fortalecer a cena de drift
                  virtual no FR Legends.
                </p>
              </div>
            </div>

            <div className="mt-8 border-t border-[#232830] pt-5">
              <p className="font-display text-xl font-bold tracking-wide text-[#F1F3F5]">
                “Este campeonato foi desenvolvido com carinho para entregar respeito, competitividade
                real e paixão pelo drift a cada entrada na pista.”
              </p>
              <p className="mt-1.5 text-xs font-medium text-[#949CA8]">
                Ryan Miranda Faria — Fundador da equipe NRC & do Campeonato NRC Virtual Drift
              </p>
            </div>
          </article>

          {/* Right Column: Official Judging Panel */}
          <article className="flex flex-col justify-between rounded-xl border border-[#232830] bg-[#111317] p-6 sm:p-8 lg:col-span-6">
            <div>
              <p className="text-xs font-semibold tracking-wide text-[#39FF14]">
                Direção de Prova & Avaliação
              </p>

              <h3 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#F1F3F5] sm:text-4xl [text-wrap:balance]">
                Juízes Oficiais do Campeonato
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-[#949CA8]">
                Todas as voltas de Qualify e batalhas das categorias PRO e STREET são avaliadas ao
                vivo pela bancada oficial seguindo rigorosamente os critérios de Linha (40%), Ângulo
                (30%) e Estilo (30%).
              </p>

              <div className="mt-6 divide-y divide-[#232830] border-t border-b border-[#232830]">
                {judges.map((judge) => (
                  <div key={judge.index} className="py-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-xs font-semibold tabular-nums text-[#39FF14]">
                          Juiz {judge.index}
                        </span>
                        <h4 className="font-display text-2xl font-bold tracking-wide text-[#F1F3F5]">
                          {judge.fullName}
                        </h4>
                      </div>
                      <span className="text-xs font-medium text-[#D0D6DE]">{judge.role}</span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#949CA8]">{judge.focus}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-xs text-[#949CA8]">
              <span>Bancada oficial: Ryan, Vitor e Vitor</span>
              <span className="font-mono tabular-nums text-[#D0D6DE]">
                3 juízes · Escala 0 a 10 (100 pts)
              </span>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
