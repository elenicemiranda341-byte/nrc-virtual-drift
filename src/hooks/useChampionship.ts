import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ChampionshipStatePayload,
  CreateRegistrationInput,
  PilotRegistration,
  WsServerMessage,
} from '../types/championship.ts';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

interface RegisterResult {
  registration: PilotRegistration;
  state: ChampionshipStatePayload;
}

const STATIC_EMPTY_STATE: ChampionshipStatePayload = {
  settings: {
    isOpen: true,
    totalMaxSpots: 32,
    proMaxSpots: 16,
    streetMaxSpots: 16,
    updatedAt: new Date(0).toISOString(),
  },
  registrations: [],
  stats: {
    totalRegistered: 0,
    proRegistered: 0,
    streetRegistered: 0,
    remainingTotal: 32,
    remainingPro: 16,
    remainingStreet: 16,
    occupancyPercent: 0,
    isEffectivelyOpen: true,
    latestRegistrationAt: null,
  },
  serverTime: new Date(0).toISOString(),
};

export function useChampionship(idToken: string | null) {
  const [state, setState] = useState<ChampionshipStatePayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const attemptRef = useRef<number>(0);
  const staticOnlyModeRef = useRef<boolean>(false);

  const applyServerState = useCallback((nextState: ChampionshipStatePayload) => {
    setState(nextState);
    setError(null);
    setLoading(false);
  }, []);

  const fetchState = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/championship`, {
        headers: { Accept: 'application/json' },
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        staticOnlyModeRef.current = true;
        setState((prev) => prev ?? STATIC_EMPTY_STATE);
        setError(null);
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Não foi possível carregar os dados do campeonato.');
      }
      staticOnlyModeRef.current = false;
      applyServerState(data as ChampionshipStatePayload);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Falha de conexão com o servidor do campeonato.';
      setError(message);
      setLoading(false);
    }
  }, [applyServerState]);

  useEffect(() => {
    void fetchState();
  }, [fetchState]);

  useEffect(() => {
    let unmounted = false;
    let ws: WebSocket | null = null;

    const connectWebSocket = () => {
      if (unmounted || staticOnlyModeRef.current) return;

      let wsUrl: string;
      if (API_BASE_URL) {
        wsUrl = `${API_BASE_URL.replace(/^http/, 'ws')}/api/ws`;
      } else {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        wsUrl = `${protocol}//${window.location.host}/api/ws`;
      }

      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          attemptRef.current = 0;
        };

        ws.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data) as WsServerMessage;
            if (parsed.type === 'championship:sync' && parsed.payload) {
              applyServerState(parsed.payload);
            }
          } catch {
            // Ignore malformed messages
          }
        };

        ws.onclose = () => {
          if (unmounted || staticOnlyModeRef.current) return;
          const delay = Math.min(8000, 1000 * Math.pow(2, attemptRef.current));
          attemptRef.current += 1;
          reconnectTimerRef.current = window.setTimeout(() => {
            void fetchState();
            connectWebSocket();
          }, delay);
        };
      } catch {
        // Fallback handled by visibilitychange and manual refresh
      }
    };

    connectWebSocket();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void fetchState();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unmounted = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [applyServerState, fetchState]);

  const submitRegistration = useCallback(
    async (input: CreateRegistrationInput): Promise<PilotRegistration> => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      if (idToken) {
        headers.Authorization = `Bearer ${idToken}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/registrations`, {
        method: 'POST',
        headers,
        body: JSON.stringify(input),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(
          'Servidor de banco de dados não conectado nesta hospedagem estática. Publique pelo Cloud Run do AI Studio ou configure VITE_API_BASE_URL no Netlify.'
        );
      }

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error || 'Não foi possível concluir a inscrição.');
      }

      const result = body as RegisterResult;
      if (result.state) {
        applyServerState(result.state);
      }
      return result.registration;
    },
    [idToken, applyServerState]
  );

  return {
    state,
    loading,
    error,
    refresh: fetchState,
    submitRegistration,
    applyServerState,
  };
}
