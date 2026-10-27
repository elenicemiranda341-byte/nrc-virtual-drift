import { useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import type { DriftCategoryType, PilotRegistration } from '../types/championship.ts';

interface PilotsSectionProps {
  registrations: PilotRegistration[];
  loading: boolean;
  onNavigateRegister: () => void;
}

type CategoryFilter = 'ALL' | DriftCategoryType;

function formatShortDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

export function PilotsSection({
  registrations,
  loading,
  onNavigateRegister,
}: PilotsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');

  const proCount = useMemo(
    () => registrations.filter((r) => r.category === 'PRO').length,
    [registrations]
  );
  const streetCount = useMemo(
    () => registrations.filter((r) => r.category === 'STREET').length,
    [registrations]
  );

  const filteredPilots = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return registrations.filter((pilot) => {
      if (categoryFilter !== 'ALL' && pilot.category !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      return (
        pilot.pilotName.toLowerCase().includes(q) ||
        pilot.nickname.toLowerCase().includes(q) ||
        pilot.frLegendsId.toLowerCase().includes(q) ||
        pilot.carModel.toLowerCase().includes(q) ||
        pilot.track.toLowerCase().includes(q)
      );
    });
  }, [registrations, searchQuery, categoryFilter]);

  return (
    <section
      id="pilotos"
      className="border-b border-[#232830] bg-[#090A0C] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wide text-[#39FF14]">
              03. Grid Oficial Sincronizado
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#F1F3F5] sm:text-4xl [text-wrap:balance]">
              Pilotos inscritos em tempo real
            </h2>
            <p className="mt-2 text-sm text-[#949CA8]">
              Lista oficial atualizada automaticamente entre todos os dispositivos conectados.
            </p>
          </div>

          {/* Search & Interactive Segmented Category Filter */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 sm:w-64">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#68707C]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar piloto, nick, carro ou ID..."
                aria-label="Pesquisar pilotos inscritos"
                className="min-h-10 w-full rounded-md border border-[#232830] bg-[#111317] py-2 pr-3 pl-9 text-xs text-[#F1F3F5] placeholder-[#68707C] transition-colors focus:border-[#39FF14]"
              />
            </div>

            <div
              role="group"
              aria-label="Filtrar por categoria"
              className="inline-flex rounded-lg border border-[#232830] bg-[#111317] p-1 shrink-0"
            >
              {(
                [
                  { id: 'ALL', label: `Todos (${registrations.length})` },
                  { id: 'PRO', label: `PRO (${proCount})` },
                  { id: 'STREET', label: `STREET (${streetCount})` },
                ] as const
              ).map((tab) => {
                const active = categoryFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCategoryFilter(tab.id)}
                    className={`min-h-8 rounded-md px-3 py-1.5 font-mono text-xs font-semibold tabular-nums transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-[#39FF14] text-[#090A0C]'
                        : 'text-[#949CA8] hover:text-[#F1F3F5]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Data Container */}
        <div className="mt-8 overflow-hidden rounded-xl border border-[#232830] bg-[#111317]">
          {loading ? (
            <div className="divide-y divide-[#232830] p-4">
              {[1, 2, 3, 4].map((row) => (
                <div key={row} className="flex items-center justify-between py-3.5">
                  <div className="h-4 w-48 rounded bg-[#171A20]" />
                  <div className="h-4 w-32 rounded bg-[#171A20]" />
                </div>
              ))}
            </div>
          ) : registrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <Users className="h-9 w-9 text-[#68707C]" aria-hidden="true" />
              <h3 className="mt-3 font-display text-2xl font-bold text-[#F1F3F5]">
                Nenhum piloto inscrito até o momento
              </h3>
              <p className="mt-1.5 max-w-md text-sm text-[#949CA8]">
                Assim que o primeiro piloto confirmar presença no formulário, sua vaga, categoria e
                pista aparecerão aqui instantaneamente.
              </p>
              <button
                type="button"
                onClick={onNavigateRegister}
                className="mt-5 min-h-10 rounded-md bg-[#39FF14] px-5 py-2 text-xs font-bold text-[#090A0C] transition-colors duration-150 hover:bg-[#32E010] whitespace-nowrap shrink-0 cursor-pointer"
              >
                Realizar primeira inscrição
              </button>
            </div>
          ) : filteredPilots.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-semibold text-[#F1F3F5]">
                Nenhum piloto encontrado para o filtro selecionado.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('ALL');
                }}
                className="mt-3 text-xs font-semibold text-[#39FF14] underline underline-offset-4 cursor-pointer"
              >
                Limpar filtros de busca
              </button>
            </div>
          ) : (
            <>
              {/* Desktop High-Density Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#232830] bg-[#090A0C]/60 text-xs font-semibold text-[#949CA8]">
                      <th className="py-3.5 pr-4 pl-6 font-mono">#</th>
                      <th className="px-4 py-3.5">Nickname</th>
                      <th className="px-4 py-3.5">Nome do piloto</th>
                      <th className="px-4 py-3.5">Carro</th>
                      <th className="px-4 py-3.5">ID FR Legends</th>
                      <th className="px-4 py-3.5">Categoria · Pista</th>
                      <th className="py-3.5 pr-6 pl-4 text-right">Horário</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#232830]">
                    {filteredPilots.map((pilot, idx) => (
                      <tr
                        key={pilot.id}
                        className="transition-colors duration-150 hover:bg-[#171A20]/70"
                      >
                        <td className="py-3 pr-4 pl-6 font-mono text-xs tabular-nums text-[#68707C]">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#F1F3F5]">
                          {pilot.nickname}
                        </td>
                        <td className="px-4 py-3 text-[#D0D6DE]">{pilot.pilotName}</td>
                        <td className="px-4 py-3 font-medium text-[#F1F3F5]">{pilot.carModel}</td>
                        <td className="px-4 py-3 font-mono text-xs tabular-nums text-[#D0D6DE]">
                          {pilot.frLegendsId}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <span
                            className={
                              pilot.category === 'PRO'
                                ? 'font-bold text-[#39FF14]'
                                : 'font-bold text-[#F1F3F5]'
                            }
                          >
                            {pilot.category}
                          </span>
                          <span className="mx-1.5 text-[#68707C]" aria-hidden="true">
                            ·
                          </span>
                          <span className="text-[#949CA8]">{pilot.track}</span>
                        </td>
                        <td className="py-3 pr-6 pl-4 text-right font-mono text-xs tabular-nums text-[#949CA8]">
                          {formatShortDate(pilot.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Structured Roster List */}
              <div className="divide-y divide-[#232830] md:hidden">
                {filteredPilots.map((pilot, idx) => (
                  <div key={pilot.id} className="p-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold text-[#F1F3F5]">
                        <span className="mr-2 font-mono text-xs tabular-nums text-[#68707C]">
                          #{String(idx + 1).padStart(2, '0')}
                        </span>
                        {pilot.nickname}
                      </span>
                      <span
                        className={`font-mono text-xs font-bold ${
                          pilot.category === 'PRO' ? 'text-[#39FF14]' : 'text-[#F1F3F5]'
                        }`}
                      >
                        {pilot.category}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#949CA8]">
                      <span>{pilot.pilotName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-medium text-[#D0D6DE]">{pilot.carModel}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">ID: {pilot.frLegendsId}</span>
                      <span aria-hidden="true">·</span>
                      <span>{pilot.track}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
