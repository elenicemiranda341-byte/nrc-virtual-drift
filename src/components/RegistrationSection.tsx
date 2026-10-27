import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Lock, LogIn, LogOut, UserCheck } from 'lucide-react';
import {
  CATEGORY_TRACKS,
  FR_LEGENDS_CARS,
  type ChampionshipStatePayload,
  type CreateRegistrationInput,
  type DriftCategoryType,
  type PilotRegistration,
} from '../types/championship.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface RegistrationSectionProps {
  state: ChampionshipStatePayload | null;
  selectedCategory: DriftCategoryType;
  onCategoryChange: (cat: DriftCategoryType) => void;
  onSubmitRegistration: (input: CreateRegistrationInput) => Promise<PilotRegistration>;
  onNavigatePilots: () => void;
}

const CUSTOM_CAR_VALUE = '__CUSTOM_CAR__';

export function RegistrationSection({
  state,
  selectedCategory,
  onCategoryChange,
  onSubmitRegistration,
  onNavigatePilots,
}: RegistrationSectionProps) {
  const { user, signInWithGoogle, logout } = useAuth();

  const [pilotName, setPilotName] = useState('');
  const [nickname, setNickname] = useState('');
  const [frLegendsId, setFrLegendsId] = useState('');
  const [carSelection, setCarSelection] = useState('');
  const [customCarModel, setCustomCarModel] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmedPilot, setConfirmedPilot] = useState<PilotRegistration | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const settings = state?.settings;
  const stats = state?.stats;

  const isClosed = settings ? !settings.isOpen : false;
  const isAllFull = settings && stats ? settings.isOpen && stats.remainingTotal <= 0 : false;
  const proRemaining = stats?.remainingPro ?? 16;
  const streetRemaining = stats?.remainingStreet ?? 16;

  const resolvedCarModel =
    carSelection === CUSTOM_CAR_VALUE ? customCarModel.trim() : carSelection.trim();

  // Auto-switch selected category if the currently selected one fills up while the other still has spots
  useEffect(() => {
    if (selectedCategory === 'PRO' && proRemaining <= 0 && streetRemaining > 0) {
      onCategoryChange('STREET');
    } else if (selectedCategory === 'STREET' && streetRemaining <= 0 && proRemaining > 0) {
      onCategoryChange('PRO');
    }
  }, [selectedCategory, proRemaining, streetRemaining, onCategoryChange]);

  // Pre-fill pilot name from Google profile if empty
  useEffect(() => {
    if (user?.displayName && !pilotName) {
      setPilotName(user.displayName);
    }
  }, [user, pilotName]);

  const validateFields = (): string | null => {
    const cleanName = pilotName.trim();
    const cleanNick = nickname.trim();
    const cleanFrId = frLegendsId.trim().replace(/\s+/g, '');

    if (cleanName.length < 2 || cleanName.length > 60) {
      return 'Informe seu nome completo (entre 2 e 60 caracteres).';
    }
    if (cleanNick.length < 2 || cleanNick.length > 30) {
      return 'Informe seu Nickname utilizado no lobby (entre 2 e 30 caracteres).';
    }
    if (!/^[a-zA-Z0-9_#-]{3,24}$/.test(cleanFrId)) {
      return 'Informe um ID do FR Legends válido (3 a 24 caracteres alfanuméricos, sem espaços).';
    }
    if (!carSelection) {
      return 'Selecione o carro do FR Legends que você usará no campeonato.';
    }
    if (resolvedCarModel.length < 2 || resolvedCarModel.length > 50) {
      return 'Informe o nome do carro que você usará (entre 2 e 50 caracteres).';
    }
    if (selectedCategory === 'PRO' && proRemaining <= 0) {
      return 'As vagas para a categoria PRO estão esgotadas.';
    }
    if (selectedCategory === 'STREET' && streetRemaining <= 0) {
      return 'As vagas para a categoria STREET estão esgotadas.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setConfirmedPilot(null);

    if (isClosed) {
      setFormError('As inscrições estão encerradas pela organização.');
      return;
    }
    if (isAllFull) {
      setFormError('Todas as vagas disponíveis para o campeonato já foram preenchidas.');
      return;
    }

    const validationMessage = validateFields();
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    setSubmitting(true);
    try {
      const created = await onSubmitRegistration({
        pilotName: pilotName.trim(),
        nickname: nickname.trim(),
        frLegendsId: frLegendsId.trim().replace(/\s+/g, ''),
        carModel: resolvedCarModel,
        category: selectedCategory,
      });

      setConfirmedPilot(created);
      setNickname('');
      setFrLegendsId('');
      setCarSelection('');
      setCustomCarModel('');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Erro ao enviar inscrição. Tente novamente.';
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch {
      setAuthError('Não foi possível autenticar com o Google no momento.');
    }
  };

  const formDisabled = isClosed || isAllFull || submitting;

  return (
    <section
      id="inscricoes"
      className="border-b border-[#232830] bg-[#090A0C] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Context, Rules Checklist & Optional Account Link */}
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold tracking-wide text-[#39FF14]">
              02. Registro Oficial de Piloto
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#F1F3F5] sm:text-4xl [text-wrap:balance]">
              Garanta sua vaga no grid NRC Virtual Drift
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#949CA8]">
              Preencha seus dados e informe o carro que você usará nas baterias do FR Legends. Cada
              piloto pode registrar apenas uma inscrição ativa — nicknames e IDs duplicados são
              bloqueados automaticamente pelo servidor.
            </p>

            <div className="mt-7 divide-y divide-[#232830] border-t border-b border-[#232830] text-sm">
              <div className="flex items-center justify-between py-3.5">
                <span className="text-[#949CA8]">Pista Categoria PRO</span>
                <span className="font-semibold text-[#F1F3F5]">FDC Stadium X W1</span>
              </div>
              <div className="flex items-center justify-between py-3.5">
                <span className="text-[#949CA8]">Pista Categoria STREET</span>
                <span className="font-semibold text-[#F1F3F5]">Emerlaw Circuit</span>
              </div>
              <div className="flex items-center justify-between py-3.5">
                <span className="text-[#949CA8]">Vagas restantes agora</span>
                <span className="font-mono font-semibold tabular-nums text-[#39FF14]">
                  {stats?.remainingTotal ?? 0} vagas totais
                </span>
              </div>
            </div>

            {/* Optional Google Account Link for Pilot Verification */}
            <div className="mt-6 rounded-xl border border-[#232830] bg-[#111317] p-4">
              {user ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#39FF14]">
                      <UserCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>Conta Google vinculada</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-[#949CA8]">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void logout()}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-[#232830] bg-[#171A20] px-3 py-1.5 text-xs font-semibold text-[#D0D6DE] hover:text-[#F1F3F5] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Sair</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-semibold text-[#F1F3F5]">
                      Identificação Google opcional
                    </p>
                    <p className="mt-0.5 text-xs text-[#949CA8]">
                      Vincule seu e-mail ao perfil ou inscreva-se diretamente abaixo.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleGoogleSignIn()}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-[#232830] bg-[#171A20] px-3.5 py-2 text-xs font-semibold text-[#F1F3F5] transition-colors duration-150 hover:border-[#39FF14]/60 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <LogIn className="h-3.5 w-3.5 text-[#39FF14]" aria-hidden="true" />
                    <span>Conectar Google</span>
                  </button>
                </div>
              )}
              {authError && (
                <p className="mt-2 text-xs text-rose-400">{authError}</p>
              )}
            </div>
          </div>

          {/* Right Column: Registration Form Container */}
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-[#232830] bg-[#111317] p-6 sm:p-8">
              {(isClosed || isAllFull) && (
                <div
                  role="alert"
                  className="mb-6 flex items-start gap-3 rounded-lg border border-rose-500/30 bg-rose-950/30 p-4 text-sm text-rose-200"
                >
                  <Lock className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-rose-100">
                      {isClosed
                        ? 'Inscrições encerradas no momento'
                        : 'Vagas esgotadas para esta etapa'}
                    </p>
                    <p className="mt-1 text-xs text-rose-200/80">
                      {isClosed
                        ? 'A organização NRC encerrou o período de inscrições. Consulte a lista oficial de pilotos abaixo.'
                        : 'O limite máximo de pilotos foi atingido. Acompanhe o grid para eventuais aberturas de vagas.'}
                    </p>
                  </div>
                </div>
              )}

              {formError && (
                <div
                  role="alert"
                  className="mb-6 flex items-start gap-3 rounded-lg border border-rose-500/40 bg-rose-950/30 p-4 text-sm text-rose-200"
                >
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-rose-100">Não foi possível concluir</p>
                    <p className="mt-0.5 text-xs text-rose-200/90">{formError}</p>
                  </div>
                </div>
              )}

              {confirmedPilot && (
                <div
                  role="status"
                  className="mb-6 rounded-lg border border-[#39FF14]/40 bg-[#39FF14]/10 p-4"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#39FF14]" aria-hidden="true" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#F1F3F5]">
                        Inscrição confirmada com sucesso no grid oficial
                      </p>
                      <p className="mt-1 text-xs text-[#D0D6DE]">
                        Piloto <span className="font-semibold">{confirmedPilot.nickname}</span> · Carro{' '}
                        <span className="font-semibold text-[#F1F3F5]">{confirmedPilot.carModel}</span> · ID{' '}
                        <span className="font-mono">{confirmedPilot.frLegendsId}</span> · Categoria{' '}
                        <span className="font-semibold text-[#39FF14]">{confirmedPilot.category}</span>{' '}
                        ({confirmedPilot.track})
                      </p>
                      <button
                        type="button"
                        onClick={onNavigatePilots}
                        className="mt-3 text-xs font-semibold text-[#39FF14] underline underline-offset-4 hover:text-[#32E010] cursor-pointer"
                      >
                        Ver minha inscrição na lista de pilotos
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="pilot-name"
                      className="block text-xs font-semibold text-[#D0D6DE]"
                    >
                      Nome do piloto
                    </label>
                    <input
                      id="pilot-name"
                      name="pilotName"
                      type="text"
                      required
                      maxLength={60}
                      disabled={formDisabled}
                      value={pilotName}
                      onChange={(e) => setPilotName(e.target.value)}
                      placeholder="Ex.: Lucas Almeida"
                      className="mt-2 block min-h-11 w-full rounded-md border border-[#232830] bg-[#090A0C] px-3.5 py-2.5 text-sm text-[#F1F3F5] placeholder-[#68707C] transition-colors focus:border-[#39FF14] disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="pilot-nickname"
                      className="block text-xs font-semibold text-[#D0D6DE]"
                    >
                      Nickname no FR Legends
                    </label>
                    <input
                      id="pilot-nickname"
                      name="nickname"
                      type="text"
                      required
                      maxLength={30}
                      disabled={formDisabled}
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Ex.: NRC_Ryan"
                      className="mt-2 block min-h-11 w-full rounded-md border border-[#232830] bg-[#090A0C] px-3.5 py-2.5 text-sm text-[#F1F3F5] placeholder-[#68707C] transition-colors focus:border-[#39FF14] disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <label
                        htmlFor="fr-legends-id"
                        className="block text-xs font-semibold text-[#D0D6DE]"
                      >
                        ID do FR Legends
                      </label>
                      <span className="text-xs text-[#949CA8]">Perfil no jogo</span>
                    </div>
                    <input
                      id="fr-legends-id"
                      name="frLegendsId"
                      type="text"
                      required
                      maxLength={24}
                      disabled={formDisabled}
                      value={frLegendsId}
                      onChange={(e) => setFrLegendsId(e.target.value)}
                      placeholder="Ex.: FRL984210"
                      className="mt-2 block min-h-11 w-full rounded-md border border-[#232830] bg-[#090A0C] px-3.5 py-2.5 font-mono text-sm tabular-nums text-[#F1F3F5] placeholder-[#68707C] transition-colors focus:border-[#39FF14] disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="fr-legends-car"
                      className="block text-xs font-semibold text-[#D0D6DE]"
                    >
                      Carro que usará no campeonato
                    </label>
                    <select
                      id="fr-legends-car"
                      name="carSelection"
                      required
                      disabled={formDisabled}
                      value={carSelection}
                      onChange={(e) => setCarSelection(e.target.value)}
                      className="mt-2 block min-h-11 w-full rounded-md border border-[#232830] bg-[#090A0C] px-3.5 py-2.5 text-sm text-[#F1F3F5] transition-colors focus:border-[#39FF14] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="" disabled>
                        Selecione o carro...
                      </option>
                      {FR_LEGENDS_CARS.map((car) => (
                        <option key={car} value={car}>
                          {car}
                        </option>
                      ))}
                      <option value={CUSTOM_CAR_VALUE}>Outro modelo (digitar)</option>
                    </select>
                  </div>
                </div>

                {carSelection === CUSTOM_CAR_VALUE && (
                  <div>
                    <label
                      htmlFor="custom-car-model"
                      className="block text-xs font-semibold text-[#D0D6DE]"
                    >
                      Digite o modelo do carro no FR Legends
                    </label>
                    <input
                      id="custom-car-model"
                      name="customCarModel"
                      type="text"
                      required
                      maxLength={50}
                      disabled={formDisabled}
                      value={customCarModel}
                      onChange={(e) => setCustomCarModel(e.target.value)}
                      placeholder="Ex.: Nissan Laurel C33 / Twerkstallion"
                      className="mt-2 block min-h-11 w-full rounded-md border border-[#232830] bg-[#090A0C] px-3.5 py-2.5 text-sm text-[#F1F3F5] placeholder-[#68707C] transition-colors focus:border-[#39FF14] disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                )}

                {/* Category Interactive Segmented Selector */}
                <div>
                  <span className="block text-xs font-semibold text-[#D0D6DE]">
                    Categoria de disputa
                  </span>
                  <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {(['PRO', 'STREET'] as const).map((cat) => {
                      const isSelected = selectedCategory === cat;
                      const catRemaining = cat === 'PRO' ? proRemaining : streetRemaining;
                      const catExhausted = catRemaining <= 0;

                      return (
                        <button
                          key={cat}
                          type="button"
                          disabled={formDisabled || catExhausted}
                          onClick={() => onCategoryChange(cat)}
                          className={`flex flex-col items-start rounded-lg border p-4 text-left transition-colors duration-150 ${
                            isSelected
                              ? 'border-[#39FF14] bg-[#39FF14]/10'
                              : 'border-[#232830] bg-[#090A0C] hover:border-[#343B46]'
                          } ${
                            formDisabled || catExhausted
                              ? 'cursor-not-allowed opacity-50'
                              : 'cursor-pointer'
                          }`}
                        >
                          <div className="flex w-full items-center justify-between gap-2">
                            <span className="font-display text-xl font-bold tracking-wide text-[#F1F3F5]">
                              Categoria {cat}
                            </span>
                            <span
                              className={`font-mono text-xs tabular-nums ${
                                isSelected ? 'font-semibold text-[#39FF14]' : 'text-[#949CA8]'
                              }`}
                            >
                              {catExhausted ? 'Esgotada' : `${catRemaining} vagas`}
                            </span>
                          </div>
                          <span className="mt-1 text-xs text-[#949CA8]">
                            Pista: {CATEGORY_TRACKS[cat]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={formDisabled}
                    className="flex min-h-12 w-full items-center justify-center rounded-md bg-[#39FF14] px-6 py-3 text-sm font-bold text-[#090A0C] transition-colors duration-150 hover:bg-[#32E010] disabled:cursor-not-allowed disabled:bg-[#232830] disabled:text-[#68707C] cursor-pointer"
                  >
                    {submitting
                      ? 'Confirmando inscrição no servidor...'
                      : isClosed
                        ? 'Inscrições Encerradas'
                        : isAllFull
                          ? 'Vagas Esgotadas'
                          : `Confirmar Inscrição — ${selectedCategory} (${CATEGORY_TRACKS[selectedCategory]})`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
