import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FolderArchive,
  Lock,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { API_BASE_URL } from '../hooks/useChampionship.ts';
import type {
  ChampionshipStatePayload,
  DriftCategoryType,
  PilotRegistration,
} from '../types/championship.ts';

interface DeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: ChampionshipStatePayload | null;
  onApplyServerState: (nextState: ChampionshipStatePayload) => void;
}

type DevTab = 'overview' | 'registrations' | 'downloads' | 'guide';

export function DeveloperModal({
  isOpen,
  onClose,
  state,
  onApplyServerState,
}: DeveloperModalProps) {
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<DevTab>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | DriftCategoryType>('ALL');

  const [proMaxInput, setProMaxInput] = useState<number>(16);
  const [streetMaxInput, setStreetMaxInput] = useState<number>(16);
  const [totalMaxInput, setTotalMaxInput] = useState<number>(32);

  const [actionBusy, setActionBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [pilotPendingDelete, setPilotPendingDelete] = useState<PilotRegistration | null>(null);

  useEffect(() => {
    if (state?.settings) {
      setProMaxInput(state.settings.proMaxSpots);
      setStreetMaxInput(state.settings.streetMaxSpots);
      setTotalMaxInput(state.settings.totalMaxSpots);
    }
  }, [state?.settings]);

  useEffect(() => {
    if (!isOpen) {
      setFeedback(null);
      setLoginError(null);
      setPilotPendingDelete(null);
    }
  }, [isOpen]);

  const registrations = state?.registrations ?? [];
  const stats = state?.stats;
  const settings = state?.settings;

  const filteredRegistrations = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
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
        String(pilot.id).includes(q)
      );
    });
  }, [registrations, searchTerm, categoryFilter]);

  if (!isOpen) return null;

  const sourceZipHref = adminToken
    ? `${API_BASE_URL}/api/admin/export-zip?target=source&token=${encodeURIComponent(adminToken)}`
    : '#';

  const netlifyZipHref = adminToken
    ? `${API_BASE_URL}/api/admin/export-zip?target=netlify&token=${encodeURIComponent(adminToken)}`
    : '#';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ password: passwordInput }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(
          'Servidor administrativo não conectado nesta hospedagem estática. Acesse pelo link oficial do AI Studio / Cloud Run.'
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha na autenticação administrativa.');
      }

      setAdminToken(data.token as string);
      setPasswordInput('');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível validar a senha no servidor.';
      setLoginError(message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleToggleOpenStatus = async () => {
    if (!adminToken || !settings) return;
    setActionBusy(true);
    setFeedback(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken,
        },
        body: JSON.stringify({ isOpen: !settings.isOpen }),
      });

      const data = await response.json();
      if (response.status === 401) {
        setAdminToken(null);
        throw new Error('Sessão expirada. Autentique-se novamente.');
      }
      if (!response.ok) {
        throw new Error(data.error || 'Falha ao alterar status das inscrições.');
      }

      onApplyServerState(data.state as ChampionshipStatePayload);
      setFeedback({
        type: 'success',
        message: !settings.isOpen
          ? 'Inscrições reabertas em todos os dispositivos.'
          : 'Inscrições encerradas imediatamente em todos os dispositivos.',
      });
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao atualizar status.',
      });
    } finally {
      setActionBusy(false);
    }
  };

  const handleSaveSpots = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    setActionBusy(true);
    setFeedback(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken,
        },
        body: JSON.stringify({
          totalMaxSpots: Number(totalMaxInput),
          proMaxSpots: Number(proMaxInput),
          streetMaxSpots: Number(streetMaxInput),
        }),
      });

      const data = await response.json();
      if (response.status === 401) {
        setAdminToken(null);
        throw new Error('Sessão expirada. Autentique-se novamente.');
      }
      if (!response.ok) {
        throw new Error(data.error || 'Falha ao salvar limites de vagas.');
      }

      onApplyServerState(data.state as ChampionshipStatePayload);
      setFeedback({
        type: 'success',
        message: 'Limites de vagas salvos no servidor e sincronizados em tempo real.',
      });
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao salvar limites de vagas.',
      });
    } finally {
      setActionBusy(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!adminToken || !pilotPendingDelete) return;
    setActionBusy(true);
    setFeedback(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/registrations/${pilotPendingDelete.id}`,
        {
          method: 'DELETE',
          headers: {
            'X-Admin-Token': adminToken,
          },
        }
      );

      const data = await response.json();
      if (response.status === 401) {
        setAdminToken(null);
        throw new Error('Sessão expirada. Autentique-se novamente.');
      }
      if (!response.ok) {
        throw new Error(data.error || 'Não foi possível excluir a inscrição.');
      }

      onApplyServerState(data.state as ChampionshipStatePayload);
      setFeedback({
        type: 'success',
        message: `Inscrição de ${pilotPendingDelete.nickname} removida e vaga liberada.`,
      });
      setPilotPendingDelete(null);
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao excluir inscrição.',
      });
    } finally {
      setActionBusy(false);
    }
  };

  const handleExportCsv = () => {
    const header = [
      'ID',
      'Nome',
      'Nickname',
      'Carro',
      'FR_Legends_ID',
      'Categoria',
      'Pista',
      'Data_Hora',
    ];
    const rows = registrations.map((r) => [
      String(r.id),
      `"${r.pilotName.replace(/"/g, '""')}"`,
      `"${r.nickname.replace(/"/g, '""')}"`,
      `"${r.carModel.replace(/"/g, '""')}"`,
      `"${r.frLegendsId.replace(/"/g, '""')}"`,
      r.category,
      `"${r.track}"`,
      r.createdAt,
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inscritos-nrc-drift-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dev-panel-title"
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-[#232830] bg-[#111317] shadow-2xl">
        {/* Top Modal Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-[#232830] bg-[#090A0C] px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            {adminToken ? (
              <ShieldCheck className="h-5 w-5 shrink-0 text-[#39FF14]" aria-hidden="true" />
            ) : (
              <Lock className="h-5 w-5 shrink-0 text-[#949CA8]" aria-hidden="true" />
            )}
            <h2
              id="dev-panel-title"
              className="truncate font-display text-xl font-bold tracking-wide text-[#F1F3F5] sm:text-2xl"
            >
              Painel de Desenvolvedor — NRC / ryancar2
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {adminToken && (
              <button
                type="button"
                onClick={() => setAdminToken(null)}
                className="min-h-9 rounded-md border border-[#232830] bg-[#171A20] px-3 py-1.5 text-xs font-semibold text-[#949CA8] hover:text-[#F1F3F5] whitespace-nowrap shrink-0 cursor-pointer"
              >
                Bloquear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar painel"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#232830] bg-[#171A20] text-[#D0D6DE] hover:text-[#F1F3F5] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {!adminToken ? (
            <form onSubmit={handleLogin} className="mx-auto max-w-md py-6 sm:py-8">
              <p className="text-sm leading-relaxed text-[#949CA8]">
                Acesso administrativo protegido no servidor. Informe a senha de desenvolvedor para
                gerenciar vagas, inscrições ou baixar o código-fonte (.ZIP) direto no celular.
              </p>

              {loginError && (
                <div
                  role="alert"
                  className="mt-4 rounded-lg border border-rose-500/40 bg-rose-950/30 p-3 text-xs text-rose-200"
                >
                  {loginError}
                </div>
              )}

              <div className="mt-5">
                <label
                  htmlFor="dev-password-input"
                  className="block text-xs font-semibold text-[#D0D6DE]"
                >
                  Senha Administrativa
                </label>
                <input
                  id="dev-password-input"
                  type="password"
                  required
                  autoFocus
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Digite a senha de acesso"
                  className="mt-2 block min-h-11 w-full rounded-md border border-[#232830] bg-[#090A0C] px-3.5 py-2.5 font-mono text-sm text-[#F1F3F5] placeholder-[#68707C] focus:border-[#39FF14]"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="mt-5 flex min-h-11 w-full items-center justify-center rounded-md bg-[#39FF14] px-4 py-2.5 text-sm font-bold text-[#090A0C] transition-colors hover:bg-[#32E010] disabled:opacity-50 cursor-pointer"
              >
                {loginLoading ? 'Verificando no servidor...' : 'Entrar no Painel'}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Sub-navigation Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#232830] pb-4">
                <div className="flex flex-wrap gap-1.5 rounded-lg border border-[#232830] bg-[#090A0C] p-1">
                  {(
                    [
                      { id: 'overview', label: 'Vagas & Status' },
                      {
                        id: 'registrations',
                        label: `Inscritos (${registrations.length})`,
                      },
                      { id: 'downloads', label: 'Baixar Código (.ZIP)' },
                      { id: 'guide', label: 'Banco & Publicação' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`min-h-9 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        activeTab === tab.id
                          ? 'bg-[#39FF14] text-[#090A0C]'
                          : 'text-[#949CA8] hover:text-[#F1F3F5]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeTab === 'registrations' && registrations.length > 0 && (
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-[#232830] bg-[#090A0C] px-3.5 py-1.5 text-xs font-semibold text-[#F1F3F5] hover:border-[#39FF14]/60 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-[#39FF14]" aria-hidden="true" />
                    <span>Exportar CSV</span>
                  </button>
                )}
              </div>

              {feedback && (
                <div
                  role="status"
                  className={`flex items-center gap-2.5 rounded-lg border p-3.5 text-xs font-medium ${
                    feedback.type === 'success'
                      ? 'border-[#39FF14]/40 bg-[#39FF14]/10 text-[#F1F3F5]'
                      : 'border-rose-500/40 bg-rose-950/30 text-rose-200'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#39FF14]" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Direct Mobile Code Download Banner */}
                  <div className="flex flex-col justify-between gap-4 rounded-lg border border-[#232830] bg-[#090A0C] p-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-sm font-bold text-[#F1F3F5]">
                        Baixar Projeto no Celular ou Computador
                      </p>
                      <p className="mt-0.5 text-xs text-[#949CA8]">
                        Baixe o código completo (.ZIP) ou o pacote pronto para subir no Netlify Drop.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <a
                        href={sourceZipHref}
                        download="nrc-codigo-completo.zip"
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-md bg-[#39FF14] px-4 py-2 text-xs font-bold text-[#090A0C] hover:bg-[#32E010] whitespace-nowrap shrink-0"
                      >
                        <FolderArchive className="h-4 w-4" aria-hidden="true" />
                        <span>Baixar Código (.ZIP)</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setActiveTab('downloads')}
                        className="min-h-10 rounded-md border border-[#232830] bg-[#171A20] px-3.5 py-2 text-xs font-semibold text-[#F1F3F5] hover:border-[#39FF14]/60 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Opção Netlify
                      </button>
                    </div>
                  </div>

                  {/* Live KPI Strip */}
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-lg border border-[#232830] bg-[#090A0C] p-4">
                      <p className="text-xs text-[#949CA8]">Total inscritos</p>
                      <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-[#F1F3F5]">
                        {stats?.totalRegistered ?? 0}
                      </p>
                      <p className="mt-0.5 font-mono text-xs tabular-nums text-[#949CA8]">
                        {stats?.occupancyPercent ?? 0}% ocupação
                      </p>
                    </div>

                    <div className="rounded-lg border border-[#232830] bg-[#090A0C] p-4">
                      <p className="text-xs text-[#949CA8]">Vagas livres</p>
                      <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-[#39FF14]">
                        {stats?.remainingTotal ?? 0}
                      </p>
                      <p className="mt-0.5 font-mono text-xs tabular-nums text-[#949CA8]">
                        de {settings?.totalMaxSpots ?? 32} totais
                      </p>
                    </div>

                    <div className="rounded-lg border border-[#232830] bg-[#090A0C] p-4">
                      <p className="text-xs text-[#949CA8]">Divisão PRO</p>
                      <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-[#F1F3F5]">
                        {stats?.proRegistered ?? 0}{' '}
                        <span className="text-sm font-normal text-[#949CA8]">
                          / {settings?.proMaxSpots ?? 16}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-[#949CA8]">FDC Stadium X W1</p>
                    </div>

                    <div className="rounded-lg border border-[#232830] bg-[#090A0C] p-4">
                      <p className="text-xs text-[#949CA8]">Divisão STREET</p>
                      <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-[#F1F3F5]">
                        {stats?.streetRegistered ?? 0}{' '}
                        <span className="text-sm font-normal text-[#949CA8]">
                          / {settings?.streetMaxSpots ?? 16}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-[#949CA8]">Emerlaw Circuit</p>
                    </div>
                  </div>

                  {/* Registration Gate Control */}
                  <div className="flex flex-col justify-between gap-4 rounded-lg border border-[#232830] bg-[#090A0C] p-5 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-sm font-bold text-[#F1F3F5]">
                        Status Oficial do Campeonato:{' '}
                        <span
                          className={
                            settings?.isOpen ? 'text-[#39FF14]' : 'text-rose-400'
                          }
                        >
                          {settings?.isOpen ? 'Inscrições Abertas' : 'Inscrições Fechadas'}
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-[#949CA8]">
                        Ao fechar as inscrições, novos cadastros são bloqueados imediatamente no
                        servidor e na interface de todos os aparelhos.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={actionBusy}
                      onClick={() => void handleToggleOpenStatus()}
                      className={`min-h-10 rounded-md px-4 py-2 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        settings?.isOpen
                          ? 'border border-rose-500/50 bg-rose-950/40 text-rose-200 hover:bg-rose-900/50'
                          : 'bg-[#39FF14] text-[#090A0C] hover:bg-[#32E010]'
                      }`}
                    >
                      {settings?.isOpen ? 'Fechar Inscrições' : 'Abrir Inscrições'}
                    </button>
                  </div>

                  {/* Spot Capacity Control Form */}
                  <form
                    onSubmit={handleSaveSpots}
                    className="rounded-lg border border-[#232830] bg-[#090A0C] p-5"
                  >
                    <h3 className="font-display text-xl font-bold text-[#F1F3F5]">
                      Controle de Vagas por Categoria e Limite Geral
                    </h3>
                    <p className="mt-1 text-xs text-[#949CA8]">
                      Ajuste a capacidade máxima de cada pista e o teto geral de pilotos do
                      campeonato.
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label
                          htmlFor="admin-pro-spots"
                          className="block text-xs font-semibold text-[#D0D6DE]"
                        >
                          Vagas PRO (FDC Stadium X W1)
                        </label>
                        <input
                          id="admin-pro-spots"
                          type="number"
                          min={0}
                          max={500}
                          value={proMaxInput}
                          onChange={(e) => {
                            const nextPro = Number(e.target.value);
                            setProMaxInput(nextPro);
                            setTotalMaxInput(nextPro + streetMaxInput);
                          }}
                          className="mt-1.5 block min-h-10 w-full rounded-md border border-[#232830] bg-[#111317] px-3 py-2 font-mono text-sm tabular-nums text-[#F1F3F5] focus:border-[#39FF14]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="admin-street-spots"
                          className="block text-xs font-semibold text-[#D0D6DE]"
                        >
                          Vagas STREET (Emerlaw Circuit)
                        </label>
                        <input
                          id="admin-street-spots"
                          type="number"
                          min={0}
                          max={500}
                          value={streetMaxInput}
                          onChange={(e) => {
                            const nextStreet = Number(e.target.value);
                            setStreetMaxInput(nextStreet);
                            setTotalMaxInput(proMaxInput + nextStreet);
                          }}
                          className="mt-1.5 block min-h-10 w-full rounded-md border border-[#232830] bg-[#111317] px-3 py-2 font-mono text-sm tabular-nums text-[#F1F3F5] focus:border-[#39FF14]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="admin-total-spots"
                          className="block text-xs font-semibold text-[#D0D6DE]"
                        >
                          Teto Geral de Vagas
                        </label>
                        <input
                          id="admin-total-spots"
                          type="number"
                          min={1}
                          max={500}
                          value={totalMaxInput}
                          onChange={(e) => setTotalMaxInput(Number(e.target.value))}
                          className="mt-1.5 block min-h-10 w-full rounded-md border border-[#232830] bg-[#111317] px-3 py-2 font-mono text-sm tabular-nums text-[#F1F3F5] focus:border-[#39FF14]"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={actionBusy}
                        className="min-h-10 rounded-md bg-[#39FF14] px-5 py-2 text-xs font-bold text-[#090A0C] transition-colors hover:bg-[#32E010] disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Salvar Limites de Vagas
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'registrations' && (
                <div className="space-y-4">
                  {/* Confirmation Banner Before Deleting */}
                  {pilotPendingDelete && (
                    <div
                      role="alertdialog"
                      aria-label="Confirmar exclusão de piloto"
                      className="flex flex-col justify-between gap-4 rounded-lg border border-rose-500/50 bg-rose-950/40 p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="text-sm font-bold text-rose-100">
                          Confirmar exclusão de {pilotPendingDelete.nickname}?
                        </p>
                        <p className="mt-0.5 text-xs text-rose-200/80">
                          Carro: {pilotPendingDelete.carModel} · ID FR Legends:{' '}
                          {pilotPendingDelete.frLegendsId} · Categoria{' '}
                          {pilotPendingDelete.category}. Esta ação liberará a vaga imediatamente.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={actionBusy}
                          onClick={() => setPilotPendingDelete(null)}
                          className="min-h-9 rounded-md border border-[#232830] bg-[#111317] px-3.5 py-1.5 text-xs font-semibold text-[#F1F3F5] cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          disabled={actionBusy}
                          onClick={() => void handleConfirmDelete()}
                          className="min-h-9 rounded-md bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-500 cursor-pointer"
                        >
                          {actionBusy ? 'Excluindo...' : 'Confirmar Exclusão'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Search & Filter */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1">
                      <Search
                        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#68707C]"
                        aria-hidden="true"
                      />
                      <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Pesquisar por nome, nickname ou ID FR Legends..."
                        className="min-h-10 w-full rounded-md border border-[#232830] bg-[#090A0C] py-2 pr-3 pl-9 text-xs text-[#F1F3F5] placeholder-[#68707C] focus:border-[#39FF14]"
                      />
                    </div>

                    <div className="inline-flex rounded-lg border border-[#232830] bg-[#090A0C] p-1 shrink-0">
                      {(['ALL', 'PRO', 'STREET'] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategoryFilter(cat)}
                          className={`min-h-8 rounded-md px-3 py-1 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                            categoryFilter === cat
                              ? 'bg-[#39FF14] text-[#090A0C]'
                              : 'text-[#949CA8] hover:text-[#F1F3F5]'
                          }`}
                        >
                          {cat === 'ALL' ? 'Todas' : cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Admin Registrations Table */}
                  <div className="overflow-x-auto rounded-lg border border-[#232830] bg-[#090A0C]">
                    {filteredRegistrations.length === 0 ? (
                      <p className="p-8 text-center text-xs text-[#949CA8]">
                        Nenhuma inscrição encontrada com os critérios atuais.
                      </p>
                    ) : (
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="border-b border-[#232830] text-[#949CA8]">
                            <th className="py-3 pr-3 pl-4 font-mono">ID</th>
                            <th className="px-3 py-3">Nickname</th>
                            <th className="px-3 py-3">Piloto</th>
                            <th className="px-3 py-3">Carro</th>
                            <th className="px-3 py-3">FR Legends ID</th>
                            <th className="px-3 py-3">Categoria · Pista</th>
                            <th className="py-3 pr-4 pl-3 text-right">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#232830]">
                          {filteredRegistrations.map((pilot) => (
                            <tr key={pilot.id} className="hover:bg-[#111317]">
                              <td className="py-2.5 pr-3 pl-4 font-mono tabular-nums text-[#68707C]">
                                #{pilot.id}
                              </td>
                              <td className="px-3 py-2.5 font-semibold text-[#F1F3F5]">
                                {pilot.nickname}
                              </td>
                              <td className="px-3 py-2.5 text-[#D0D6DE]">{pilot.pilotName}</td>
                              <td className="px-3 py-2.5 text-[#F1F3F5]">{pilot.carModel}</td>
                              <td className="px-3 py-2.5 font-mono tabular-nums text-[#D0D6DE]">
                                {pilot.frLegendsId}
                              </td>
                              <td className="px-3 py-2.5">
                                <span
                                  className={
                                    pilot.category === 'PRO'
                                      ? 'font-bold text-[#39FF14]'
                                      : 'font-bold text-[#F1F3F5]'
                                  }
                                >
                                  {pilot.category}
                                </span>
                                <span className="mx-1 text-[#68707C]">·</span>
                                <span className="text-[#949CA8]">{pilot.track}</span>
                              </td>
                              <td className="py-2.5 pr-4 pl-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => setPilotPendingDelete(pilot)}
                                  className="inline-flex min-h-8 items-center gap-1 rounded border border-rose-500/30 bg-rose-950/30 px-2.5 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-900/50 whitespace-nowrap shrink-0 cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                  <span>Excluir</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'downloads' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Option 1: Full Source Code ZIP */}
                    <div className="flex flex-col justify-between rounded-lg border border-[#232830] bg-[#090A0C] p-5">
                      <div>
                        <h3 className="font-display text-xl font-bold text-[#F1F3F5]">
                          01. Código-Fonte Completo (.ZIP)
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-[#949CA8]">
                          Contém todos os arquivos originais do projeto (`src/`, `public/`,
                          `server.ts`, `package.json`, `netlify.toml` e logo NRC). Ideal para
                          subir no GitHub, editar ou hospedar com servidor completo.
                        </p>
                      </div>

                      <div className="mt-5">
                        <a
                          href={sourceZipHref}
                          download="nrc-codigo-completo.zip"
                          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[#39FF14] px-4 py-2.5 text-xs font-bold text-[#090A0C] transition-colors hover:bg-[#32E010]"
                        >
                          <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
                          <span>Baixar Código Completo (.ZIP)</span>
                        </a>
                      </div>
                    </div>

                    {/* Option 2: Netlify Drop Ready ZIP */}
                    <div className="flex flex-col justify-between rounded-lg border border-[#232830] bg-[#090A0C] p-5">
                      <div>
                        <h3 className="font-display text-xl font-bold text-[#F1F3F5]">
                          02. Pacote Pronto p/ Netlify Drop (.ZIP)
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-[#949CA8]">
                          Contém o site já compilado (`index.html`, imagens e `_redirects` na raiz
                          do `.zip`). Basta acessar `app.netlify.com/drop` pelo navegador do celular
                          e enviar este arquivo `.zip` direto, sem descompactar.
                        </p>
                      </div>

                      <div className="mt-5">
                        <a
                          href={netlifyZipHref}
                          download="nrc-netlify-pronto.zip"
                          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-[#39FF14]/60 bg-[#171A20] px-4 py-2.5 text-xs font-bold text-[#39FF14] transition-colors hover:bg-[#39FF14] hover:text-[#090A0C]"
                        >
                          <FolderArchive className="h-4 w-4 shrink-0" aria-hidden="true" />
                          <span>Baixar ZIP p/ Netlify Drop</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#232830] bg-[#090A0C] p-4 text-xs leading-relaxed text-[#949CA8]">
                    <p className="font-semibold text-[#F1F3F5]">
                      Dica importante para celular (Android / iPhone):
                    </p>
                    <p className="mt-1">
                      Se você estiver dentro da janela interna do aplicativo Google, toque nos{' '}
                      <strong className="text-[#F1F3F5]">3 pontinhos (⋮)</strong> no canto superior
                      direito da tela e escolha{' '}
                      <strong className="text-[#F1F3F5]">Abrir no Chrome</strong> caso o navegador
                      interno bloqueie downloads diretos. Para manter o banco de dados PostgreSQL
                      funcionando em tempo real entre todos os pilotos sem configuração extra, o
                      link compartilhado/publicado aqui do próprio AI Studio (Cloud Run) já está
                      100% online.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'guide' && (
                <div className="space-y-4 rounded-lg border border-[#232830] bg-[#090A0C] p-5 text-xs leading-relaxed text-[#D0D6DE]">
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#F1F3F5]">
                      1. Banco de Dados Online & Sincronização em Tempo Real
                    </h3>
                    <p className="mt-1 text-[#949CA8]">
                      O campeonato utiliza banco relacional PostgreSQL em nuvem (Cloud SQL) com ORM
                      Drizzle (`src/db/schema.ts`) pareado com servidor WebSocket (`/api/ws`) em
                      `server.ts`. Todas as inscrições, vagas e alterações de status são gravadas
                      atomicamente no banco e transmitidas instantaneamente para todos os celulares
                      e computadores abertos.
                    </p>
                  </div>

                  <div className="border-t border-[#232830] pt-4">
                    <h3 className="font-display text-lg font-bold text-[#F1F3F5]">
                      2. Segurança Administrativa no Servidor
                    </h3>
                    <p className="mt-1 text-[#949CA8]">
                      A senha administrativa nunca é exposta no código do navegador. O endpoint
                      `POST /api/admin/login` valida a credencial no backend com comparação em tempo
                      constante (`crypto.timingSafeEqual`), limite anti-força-bruta por IP e emite
                      um token assinado via HMAC-SHA256 exigido em todas as rotas `/api/admin/*`.
                    </p>
                  </div>

                  <div className="border-t border-[#232830] pt-4">
                    <h3 className="font-display text-lg font-bold text-[#F1F3F5]">
                      3. Publicando pelo Celular (Cloud Run ou Netlify)
                    </h3>
                    <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-[#949CA8]">
                      <li>
                        <strong className="text-[#F1F3F5]">Com Banco em Tempo Real (Recomendado):</strong>{' '}
                        abra o AI Studio no navegador Chrome em modo{' '}
                        <strong className="text-[#F1F3F5]">Para computador</strong> e toque em{' '}
                        <strong className="text-[#F1F3F5]">Deploy</strong> (Cloud Run) para gerar o
                        link público oficial já conectado ao PostgreSQL.
                      </li>
                      <li>
                        <strong className="text-[#F1F3F5]">No Netlify pelo Celular:</strong> use a
                        aba <strong className="text-[#F1F3F5]">Baixar Código (.ZIP)</strong> aqui do
                        painel para baixar o <strong className="text-[#F1F3F5]">nrc-netlify-pronto.zip</strong>{' '}
                        e envie-o em `app.netlify.com/drop` pelo navegador do celular.
                      </li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
