import { useState } from 'react';
import { Lock, Menu, X } from 'lucide-react';
import { NrcLogo } from './NrcLogo.tsx';

interface HeaderProps {
  isEffectivelyOpen: boolean;
  onNavigate: (sectionId: string) => void;
  onOpenDevPanel: () => void;
}

const NAV_ITEMS = [
  { id: 'inicio', label: 'Início' },
  { id: 'categorias', label: 'Categorias' },
  { id: 'testeira', label: 'Testeira' },
  { id: 'id-oficial', label: 'ID' },
  { id: 'inscricoes', label: 'Inscrições' },
  { id: 'pilotos', label: 'Pilotos' },
  { id: 'regulamento', label: 'Regulamento' },
  { id: 'organizacao', label: 'Organização' },
];

export function Header({ isEffectivelyOpen, onNavigate, onOpenDevPanel }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    onNavigate(sectionId);
  };

  const handleOpenDev = () => {
    setMobileMenuOpen(false);
    onOpenDevPanel();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#232830] bg-[#090A0C]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single Brand Wordmark */}
        <a
          href="#inicio"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('inicio');
          }}
          className="whitespace-nowrap shrink-0 transition-opacity duration-150 hover:opacity-90"
        >
          <NrcLogo variant="wordmark" />
        </a>

        {/* Zone 2: Clean Single-Line Nav Links + Testeira + ID + Developer */}
        <nav
          aria-label="Navegação principal"
          className="hidden xl:flex items-center gap-4 2xl:gap-5 text-xs font-semibold text-[#949CA8]"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(item.id);
              }}
              className="whitespace-nowrap shrink-0 py-1 transition-colors duration-150 hover:text-[#F1F3F5] hover:underline hover:decoration-[#39FF14] hover:underline-offset-8"
            >
              {item.label}
            </a>
          ))}
          <button
            type="button"
            onClick={handleOpenDev}
            className="whitespace-nowrap shrink-0 py-1 transition-colors duration-150 hover:text-[#39FF14] hover:underline hover:decoration-[#39FF14] hover:underline-offset-8 cursor-pointer"
          >
            Desenvolvedor
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action + Menu Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleNavClick(isEffectivelyOpen ? 'inscricoes' : 'pilotos')}
            className="min-h-10 rounded-md bg-[#39FF14] px-4 py-2 text-xs font-bold tracking-wide text-[#090A0C] transition-colors duration-150 hover:bg-[#32E010] whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isEffectivelyOpen ? 'Inscrever-se' : 'Pilotos Inscritos'}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Fechar opções gerais' : 'Abrir opções gerais'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#232830] bg-[#111317] text-[#F1F3F5] xl:hidden cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-[#232830] bg-[#111317] px-4 py-3 xl:hidden">
          <nav className="flex flex-col space-y-1" aria-label="Opções gerais">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.id);
                }}
                className="flex min-h-11 items-center rounded-md px-3 text-sm font-semibold text-[#D0D6DE] transition-colors duration-150 hover:bg-[#171A20] hover:text-[#39FF14]"
              >
                {item.label}
              </a>
            ))}
            <div className="my-1 border-t border-[#232830]" />
            <button
              type="button"
              onClick={handleOpenDev}
              className="flex min-h-11 w-full items-center gap-2 rounded-md px-3 text-left text-sm font-semibold text-[#D0D6DE] transition-colors duration-150 hover:bg-[#171A20] hover:text-[#39FF14] cursor-pointer"
            >
              <Lock className="h-4 w-4 text-[#39FF14]" aria-hidden="true" />
              <span>Desenvolvedor</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
