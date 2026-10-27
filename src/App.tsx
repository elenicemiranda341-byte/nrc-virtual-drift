import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { useChampionship } from './hooks/useChampionship.ts';
import type { DriftCategoryType } from './types/championship.ts';
import { Header } from './components/Header.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { CategoriesSection } from './components/CategoriesSection.tsx';
import { WindowBannerSection } from './components/WindowBannerSection.tsx';
import { IdPlateSection } from './components/IdPlateSection.tsx';
import { RegistrationSection } from './components/RegistrationSection.tsx';
import { PilotsSection } from './components/PilotsSection.tsx';
import { RegulationsSection } from './components/RegulationsSection.tsx';
import { AboutSection } from './components/AboutSection.tsx';
import { Footer } from './components/Footer.tsx';
import { DeveloperModal } from './components/DeveloperModal.tsx';

function ChampionshipAppContent() {
  const { idToken } = useAuth();
  const {
    state,
    loading,
    error,
    refresh,
    submitRegistration,
    applyServerState,
  } = useChampionship(idToken);

  const [selectedCategory, setSelectedCategory] = useState<DriftCategoryType>('PRO');
  const [devModalOpen, setDevModalOpen] = useState(false);

  const scrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleSelectCategoryAndScroll = useCallback(
    (category: DriftCategoryType) => {
      setSelectedCategory(category);
      scrollToSection('inscricoes');
    },
    [scrollToSection]
  );

  // Discreet keyboard shortcut (Alt + Shift + D) for organizers
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setDevModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#090A0C] text-[#F1F3F5]">
      <Header
        isEffectivelyOpen={state?.stats.isEffectivelyOpen ?? true}
        onNavigate={scrollToSection}
        onOpenDevPanel={() => setDevModalOpen(true)}
      />

      {error && (
        <div className="border-b border-rose-500/30 bg-rose-950/40 px-4 py-3">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 text-xs text-rose-200 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => void refresh()}
              className="inline-flex items-center gap-1.5 rounded border border-rose-400/30 px-2.5 py-1 font-semibold text-rose-100 hover:bg-rose-900/40 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Tentar novamente</span>
            </button>
          </div>
        </div>
      )}

      <main>
        <HeroSection
          state={state}
          loading={loading}
          onNavigate={scrollToSection}
          onOpenDevPanel={() => setDevModalOpen(true)}
        />

        <CategoriesSection
          state={state}
          onSelectCategoryAndScroll={handleSelectCategoryAndScroll}
        />

        <WindowBannerSection />

        <IdPlateSection />

        <RegistrationSection
          state={state}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onSubmitRegistration={submitRegistration}
          onNavigatePilots={() => scrollToSection('pilotos')}
        />

        <PilotsSection
          registrations={state?.registrations ?? []}
          loading={loading}
          onNavigateRegister={() => scrollToSection('inscricoes')}
        />

        <RegulationsSection />

        <AboutSection />
      </main>

      <Footer
        onNavigate={scrollToSection}
        onOpenDevPanel={() => setDevModalOpen(true)}
      />

      <DeveloperModal
        isOpen={devModalOpen}
        onClose={() => setDevModalOpen(false)}
        state={state}
        onApplyServerState={applyServerState}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ChampionshipAppContent />
    </AuthProvider>
  );
}
