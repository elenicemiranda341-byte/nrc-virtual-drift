import { AlertTriangle, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import type { ChampionshipStatePayload } from '../types/championship.ts';
import { NrcLogo } from './NrcLogo.tsx';
import { ResilientImage } from './ResilientImage.tsx';

import heroDriftImage from '../assets/images/hero_nrc_drift_tandem_1793100562234.jpg';

interface HeroSectionProps {
  state: ChampionshipStatePayload | null;
  loading: boolean;
  onNavigate: (sectionId: string) => void;
  onOpenDevPanel: () => void;
}

export function HeroSection({ state, loading, onNavigate, onOpenDevPanel }: HeroSectionProps) {
  const settings = state?.settings;
  const stats = state?.stats;

  const isClosedByAdmin = settings ? !settings.isOpen : false;
  const isSoldOut = settings && stats ? settings.isOpen && stats.remainingTotal <= 0 : false;
  const isEffectivelyOpen = stats?.isEffectivelyOpen ?? false;

  return (
    <section id="inicio" className="border-b border-[#232830] bg-[#090A0C] pt-8 pb-12 sm:pt-12 sm:pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 2-Column Balanced Hero Split */}
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Brand Proposition & Navigation Actions */}
          <div className="flex flex-col justify-between lg:col-span-7">
            <div>
              <NrcLogo variant="emblem" />

              <h1
                className="mt-7 max-w-2xl font-display text-[clamp(2.35rem,4.2vw,3.75rem)] font-bold leading-[1.04] tracking-tight text-[#F1F3F5] [text-wrap:balance]"
              >
                Campeonato Oficial FR Legends Negative Rotation Crew Virtual Drift
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-[#949CA8]">
                Disputas técnicas divididas entre as categorias PRO e STREET com sincronização de
                grid em tempo real, controle oficial de vagas e avaliação rigorosa de linha, ângulo
                e estilo.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-[#949CA8]">
                <span>Fundador: Ryan Miranda Faria (NRC / ryancar2)</span>
                <span aria-hidden="true">·</span>
                <span>Juízes: Ryan, Vitor e Vitor</span>
                <span aria-hidden="true">·</span>
                <span>Desenvolvido com carinho</span>
              </div>
            </div>

            {/* Primary & Section Action Buttons */}
            <div className="mt-8 pt-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onNavigate('inscricoes')}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#39FF14] px-5 py-2.5 text-sm font-bold text-[#090A0C] transition-colors duration-150 hover:bg-[#32E010] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Inscrever-se</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('pilotos')}
                  className="inline-flex min-h-11 items-center rounded-md border border-[#232830] bg-[#111317] px-4 py-2.5 text-sm font-semibold text-[#F1F3F5] transition-colors duration-150 hover:border-[#39FF14]/60 hover:bg-[#171A20] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Pilotos inscritos
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('categorias')}
                  className="inline-flex min-h-11 items-center rounded-md border border-[#232830] bg-[#111317] px-4 py-2.5 text-sm font-semibold text-[#F1F3F5] transition-colors duration-150 hover:border-[#39FF14]/60 hover:bg-[#171A20] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Categorias
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('testeira')}
                  className="inline-flex min-h-11 items-center rounded-md border border-[#232830] bg-[#111317] px-4 py-2.5 text-sm font-semibold text-[#F1F3F5] transition-colors duration-150 hover:border-[#39FF14]/60 hover:bg-[#171A20] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Testeira
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('id-oficial')}
                  className="inline-flex min-h-11 items-center rounded-md border border-[#232830] bg-[#111317] px-4 py-2.5 text-sm font-semibold text-[#F1F3F5] transition-colors duration-150 hover:border-[#39FF14]/60 hover:bg-[#171A20] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  ID
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('regulamento')}
                  className="inline-flex min-h-11 items-center rounded-md border border-[#232830] bg-[#111317] px-4 py-2.5 text-sm font-semibold text-[#F1F3F5] transition-colors duration-150 hover:border-[#39FF14]/60 hover:bg-[#171A20] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Regulamento
                </button>

                <button
                  type="button"
                  onClick={onOpenDevPanel}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-[#232830] bg-[#111317] px-4 py-2.5 text-sm font-semibold text-[#D0D6DE] transition-colors duration-150 hover:border-[#39FF14]/60 hover:bg-[#171A20] hover:text-[#F1F3F5] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Lock className="h-3.5 w-3.5 text-[#39FF14]" aria-hidden="true" />
                  <span>Desenvolvedor</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Tandem Drift Visual Frame */}
          <div className="relative overflow-hidden rounded-xl border border-[#232830] bg-[#111317] lg:col-span-5">
            <ResilientImage
              src={heroDriftImage}
              alt="Dois carros de drift JDM em disputa porta a porta noturna sob refletores de estádio"
              fallbackLabel="NRC — Negative Rotation Crew Virtual Drift"
              className="aspect-video w-full object-cover lg:aspect-auto lg:h-full"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#090A0C]/90 via-[#090A0C]/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="font-display text-lg font-bold tracking-wide text-[#F1F3F5]">
                Temporada Oficial NRC Virtual Drift
              </p>
              <p className="mt-0.5 text-xs text-[#D0D6DE]">
                FDC Stadium X W1 · Emerlaw Circuit · Julgamento 100 Pontos
              </p>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Live Championship Telemetry Strip */}
        <div className="mt-8 grid grid-cols-1 gap-4 rounded-xl border border-[#232830] bg-[#111317] p-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-[#232830]">
          {/* Metric 1: Registration Status */}
          <div className="lg:pr-6">
            <p className="text-xs font-medium text-[#949CA8]">Status das inscrições</p>
            {loading ? (
              <div className="mt-2 h-7 w-40 rounded bg-[#171A20]" />
            ) : isEffectivelyOpen ? (
              <div className="mt-2 flex items-center gap-2 text-[#39FF14]">
                <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="font-display text-2xl font-bold tracking-wide">
                  Inscrições Abertas
                </span>
              </div>
            ) : isSoldOut ? (
              <div className="mt-2 flex items-center gap-2 text-amber-400">
                <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="font-display text-2xl font-bold tracking-wide">
                  Vagas Esgotadas
                </span>
              </div>
            ) : (
              <div className="mt-2 flex items-center gap-2 text-[#D0D6DE]">
                <Lock className="h-5 w-5 shrink-0 text-rose-400" aria-hidden="true" />
                <span className="font-display text-2xl font-bold tracking-wide">
                  {isClosedByAdmin ? 'Inscrições Fechadas' : 'Indisponível'}
                </span>
              </div>
            )}
            <p className="mt-1 text-xs text-[#949CA8]">
              {loading
                ? 'Sincronizando com o servidor...'
                : isEffectivelyOpen
                  ? 'Confirmação imediata no grid oficial'
                  : isSoldOut
                    ? 'Limite máximo de pilotos atingido'
                    : 'Encerradas pela direção de prova'}
            </p>
          </div>

          {/* Metric 2: Available Spots */}
          <div className="lg:px-6">
            <p className="text-xs font-medium text-[#949CA8]">Vagas disponíveis</p>
            {loading ? (
              <div className="mt-2 h-7 w-24 rounded bg-[#171A20]" />
            ) : (
              <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-[#F1F3F5]">
                {stats?.remainingTotal ?? 0}{' '}
                <span className="text-sm font-normal text-[#949CA8]">
                  de {settings?.totalMaxSpots ?? 32}
                </span>
              </p>
            )}
            <p className="mt-1 font-mono text-xs tabular-nums text-[#949CA8]">
              PRO: {stats?.remainingPro ?? 0} livres · STREET: {stats?.remainingStreet ?? 0} livres
            </p>
          </div>

          {/* Metric 3: Total Registered Pilots in Real Time */}
          <div className="lg:px-6">
            <p className="text-xs font-medium text-[#949CA8]">Total de inscritos</p>
            {loading ? (
              <div className="mt-2 h-7 w-24 rounded bg-[#171A20]" />
            ) : (
              <div className="mt-1.5 flex items-baseline justify-between gap-2">
                <span className="font-mono text-2xl font-semibold tabular-nums text-[#F1F3F5]">
                  {stats?.totalRegistered ?? 0}
                </span>
                <span className="font-mono text-xs tabular-nums text-[#949CA8]">
                  {stats?.occupancyPercent ?? 0}% preenchido
                </span>
              </div>
            )}
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#171A20]">
              <div
                className="h-full rounded-full bg-[#39FF14] transition-transform duration-200 origin-left"
                style={{
                  transform: `scaleX(${Math.min(1, Math.max(0, (stats?.occupancyPercent ?? 0) / 100))})`,
                }}
              />
            </div>
          </div>

          {/* Metric 4: Category Breakdown */}
          <div className="lg:pl-6">
            <p className="text-xs font-medium text-[#949CA8]">Divisão por categoria</p>
            {loading ? (
              <div className="mt-2 h-7 w-36 rounded bg-[#171A20]" />
            ) : (
              <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-[#F1F3F5]">
                {stats?.proRegistered ?? 0} PRO{' '}
                <span className="text-[#949CA8]">·</span> {stats?.streetRegistered ?? 0} STREET
              </p>
            )}
            <p className="mt-1 text-xs text-[#949CA8]">
              FDC Stadium X W1 · Emerlaw Circuit
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
