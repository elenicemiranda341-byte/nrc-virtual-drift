import { ArrowUpRight } from 'lucide-react';
import type { ChampionshipStatePayload, DriftCategoryType } from '../types/championship.ts';
import { ResilientImage } from './ResilientImage.tsx';

import fdcStadiumImg from '../assets/images/track_fdc_stadium_1793100562573.jpg';
import emerlawCircuitImg from '../assets/images/track_emerlaw_circuit_1793100564493.jpg';

interface CategoriesSectionProps {
  state: ChampionshipStatePayload | null;
  onSelectCategoryAndScroll: (category: DriftCategoryType) => void;
}

export function CategoriesSection({
  state,
  onSelectCategoryAndScroll,
}: CategoriesSectionProps) {
  const proRemaining = state?.stats.remainingPro ?? 16;
  const proMax = state?.settings.proMaxSpots ?? 16;
  const streetRemaining = state?.stats.remainingStreet ?? 16;
  const streetMax = state?.settings.streetMaxSpots ?? 16;
  const isOpen = state?.settings.isOpen ?? true;

  const categories: Array<{
    code: DriftCategoryType;
    title: string;
    trackName: string;
    image: string;
    imageAlt: string;
    remaining: number;
    maxSpots: number;
    summary: string;
    specs: Array<{ label: string; value: string }>;
  }> = [
    {
      code: 'PRO',
      title: 'Categoria PRO',
      trackName: 'FDC Stadium X W1',
      image: fdcStadiumImg,
      imageAlt: 'Vista aérea noturna do circuito fechado de estádio FDC Stadium X W1',
      remaining: proRemaining,
      maxSpots: proMax,
      summary:
        'Divisão principal voltada a pilotos experientes que dominam entradas agressivas próximo ao muro externo, ângulo elevado constante e precisão milimétrica sobre a linha branca em arena fechada.',
      specs: [
        { label: 'Pista oficial', value: 'FDC Stadium X W1' },
        { label: 'Perfil do traçado', value: 'Arena de estádio com banco externo e zonas internas' },
        { label: 'Exigência técnica', value: 'Alta velocidade de entrada e máxima proximidade' },
      ],
    },
    {
      code: 'STREET',
      title: 'Categoria STREET',
      trackName: 'Emerlaw Circuit',
      image: emerlawCircuitImg,
      imageAlt: 'Vista aérea do traçado técnico misto Emerlaw Circuit com curvas em S encadeadas',
      remaining: streetRemaining,
      maxSpots: streetMax,
      summary:
        'Divisão de acesso competitivo desenhada para transições limpas, controle progressivo de acelerador e fluidez contínua em curvas encadeadas de raio médio e hairpins técnicos.',
      specs: [
        { label: 'Pista oficial', value: 'Emerlaw Circuit' },
        { label: 'Perfil do traçado', value: 'Circuito misto com S encadeados e curvas de raio longo' },
        { label: 'Exigência técnica', value: 'Fluidez de transição, linha limpa e constância' },
      ],
    },
  ];

  return (
    <section
      id="categorias"
      className="border-b border-[#232830] bg-[#090A0C] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-wide text-[#39FF14]">
            01. Divisões & Circuitos Oficiais
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#F1F3F5] sm:text-4xl [text-wrap:balance]">
            Categorias oficiais e pistas homologadas
          </h2>
          <p className="mt-3 text-base text-[#949CA8]">
            Cada categoria compete em um traçado específico selecionado pela direção de prova NRC
            para testar diferentes níveis de comprometimento, linha e controle de carro.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2">
          {categories.map((cat) => {
            const categoryAvailable = isOpen && cat.remaining > 0;

            return (
              <article
                key={cat.code}
                className="flex flex-col overflow-hidden rounded-xl border border-[#232830] bg-[#111317] transition-colors duration-150 hover:border-[#343B46]"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-[#090A0C]">
                  <ResilientImage
                    src={cat.image}
                    alt={cat.imageAlt}
                    fallbackLabel={`${cat.title} — ${cat.trackName}`}
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#111317] via-transparent to-transparent" />
                </div>

                <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-[#949CA8]">
                      <span>
                        Divisão {cat.code} · Circuito homologado
                      </span>
                      <span className="font-mono tabular-nums text-[#D0D6DE]">
                        {cat.remaining} de {cat.maxSpots} vagas livres
                      </span>
                    </div>

                    <h3 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#F1F3F5]">
                      {cat.title} — <span className="text-[#39FF14]">{cat.trackName}</span>
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-[#949CA8]">
                      {cat.summary}
                    </p>

                    <dl className="mt-6 divide-y divide-[#232830] border-t border-b border-[#232830]">
                      {cat.specs.map((spec) => (
                        <div
                          key={spec.label}
                          className="flex flex-col justify-between gap-1 py-3 sm:flex-row sm:items-center sm:gap-4"
                        >
                          <dt className="text-xs font-medium text-[#949CA8]">{spec.label}</dt>
                          <dd className="text-xs font-semibold text-[#F1F3F5] sm:text-right">
                            {spec.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-4">
                    <span className="text-xs font-medium text-[#949CA8]">
                      {categoryAvailable
                        ? 'Inscrições disponíveis nesta divisão'
                        : !isOpen
                          ? 'Inscrições encerradas no momento'
                          : 'Vagas esgotadas nesta categoria'}
                    </span>

                    <button
                      type="button"
                      disabled={!categoryAvailable}
                      onClick={() => onSelectCategoryAndScroll(cat.code)}
                      className={`inline-flex min-h-10 items-center gap-1.5 rounded-md px-4 py-2 text-xs font-bold transition-colors duration-150 whitespace-nowrap shrink-0 ${
                        categoryAvailable
                          ? 'bg-[#39FF14] text-[#090A0C] hover:bg-[#32E010] cursor-pointer'
                          : 'border border-[#232830] bg-[#171A20] text-[#68707C] cursor-not-allowed'
                      }`}
                    >
                      <span>
                        {categoryAvailable
                          ? `Inscrever na ${cat.code}`
                          : 'Indisponível'}
                      </span>
                      {categoryAvailable && (
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
