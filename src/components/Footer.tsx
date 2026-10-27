import { Lock } from 'lucide-react';
import { NrcLogo } from './NrcLogo.tsx';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenDevPanel: () => void;
}

export function Footer({ onNavigate, onOpenDevPanel }: FooterProps) {
  return (
    <footer className="bg-[#090A0C] py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 border-b border-[#232830] pb-8 sm:flex-row sm:items-center">
          <div>
            <NrcLogo variant="wordmark" />
            <p className="mt-2 text-xs text-[#949CA8]">
              Fundado por Ryan Miranda Faria (NRC / ryancar2) · Juízes: Ryan, Vitor e Vitor
            </p>
            <p className="mt-1 text-xs text-[#68707C]">
              Campeonato desenvolvido com carinho para a comunidade de FR Legends.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-[#949CA8]">
            <a
              href="#inicio"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('inicio');
              }}
              className="hover:text-[#F1F3F5] whitespace-nowrap"
            >
              Início
            </a>
            <a
              href="#categorias"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('categorias');
              }}
              className="hover:text-[#F1F3F5] whitespace-nowrap"
            >
              Categorias
            </a>
            <a
              href="#testeira"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('testeira');
              }}
              className="hover:text-[#F1F3F5] whitespace-nowrap"
            >
              Testeira
            </a>
            <a
              href="#id-oficial"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('id-oficial');
              }}
              className="hover:text-[#F1F3F5] whitespace-nowrap"
            >
              ID
            </a>
            <a
              href="#inscricoes"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('inscricoes');
              }}
              className="hover:text-[#F1F3F5] whitespace-nowrap"
            >
              Inscrições
            </a>
            <a
              href="#pilotos"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('pilotos');
              }}
              className="hover:text-[#F1F3F5] whitespace-nowrap"
            >
              Pilotos
            </a>
            <a
              href="#regulamento"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('regulamento');
              }}
              className="hover:text-[#F1F3F5] whitespace-nowrap"
            >
              Regulamento
            </a>
            <a
              href="#organizacao"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('organizacao');
              }}
              className="hover:text-[#F1F3F5] whitespace-nowrap"
            >
              Organização
            </a>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-4 text-xs text-[#68707C] sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} NRC — Negative Rotation Crew Virtual Drift · Ryan Miranda
            Faria.
          </p>

          <button
            type="button"
            onClick={onOpenDevPanel}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-[#68707C] transition-colors duration-150 hover:bg-[#111317] hover:text-[#D0D6DE] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Desenvolvedor</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
