import 'dotenv/config';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import {
  ChampionshipDomainError,
  createPilotRegistration,
  deletePilotRegistration,
  getChampionshipState,
  updateChampionshipSettings,
} from './src/db/championship.ts';
import {
  type AuthRequest,
  checkLoginRateLimit,
  clearLoginFailures,
  issueAdminSessionToken,
  optionalAuth,
  recordLoginFailure,
  requireAdminSession,
  requireAuth,
  verifyAdminPasswordConstantTime,
} from './src/middleware/auth.ts';
import { buildNetlifyDistZip, buildProjectSourceZip } from './src/utils/zipBuilder.ts';
import type { WsServerMessage } from './src/types/championship.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  app.use('/api', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Admin-Token'
    );
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });

  app.use(express.json({ limit: '64kb' }));

  const wss = new WebSocketServer({ server: httpServer, path: '/api/ws' });

  async function broadcastChampionshipSync(
    reason: WsServerMessage['reason']
  ): Promise<void> {
    try {
      const state = await getChampionshipState();
      const message: WsServerMessage = {
        type: 'championship:sync',
        reason,
        payload: state,
      };
      const serialized = JSON.stringify(message);

      for (const client of wss.clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(serialized);
        }
      }
    } catch (error) {
      console.error('Failed to broadcast WebSocket championship sync:', error);
    }
  }

  wss.on('connection', async (socket) => {
    try {
      const initialState = await getChampionshipState();
      const message: WsServerMessage = {
        type: 'championship:sync',
        reason: 'initial',
        payload: initialState,
      };
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
      }
    } catch (error) {
      console.error('Failed to send initial WebSocket state:', error);
    }
  });

  const keepAliveInterval = setInterval(() => {
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.ping();
      }
    }
  }, 25000);

  wss.on('close', () => {
    clearInterval(keepAliveInterval);
  });

  // Public health check
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Authenticated Google profile synchronization
  app.post('/api/auth/sync', requireAuth, (req: AuthRequest, res) => {
    res.json({
      uid: req.user?.uid,
      email: req.user?.email,
      name: req.user?.name || null,
    });
  });

  // Public championship state (settings + registered pilots + live statistics)
  app.get('/api/championship', async (_req, res) => {
    try {
      const state = await getChampionshipState();
      res.json(state);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao consultar dados do campeonato.';
      res.status(500).json({ error: message });
    }
  });

  // Public / optionally authenticated pilot registration
  app.post('/api/registrations', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const created = await createPilotRegistration(
        {
          pilotName: req.body?.pilotName,
          nickname: req.body?.nickname,
          frLegendsId: req.body?.frLegendsId,
          carModel: req.body?.carModel,
          category: req.body?.category,
        },
        req.user?.uid || null
      );

      const updatedState = await getChampionshipState();
      void broadcastChampionshipSync('registration:created');

      res.status(201).json({
        registration: created,
        state: updatedState,
      });
    } catch (error: unknown) {
      if (error instanceof ChampionshipDomainError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado ao salvar inscrição.';
      res.status(500).json({ error: message });
    }
  });

  // Server-protected Developer Panel login (NRC000)
  app.post('/api/admin/login', (req, res) => {
    const ipKey =
      (typeof req.headers['x-forwarded-for'] === 'string'
        ? req.headers['x-forwarded-for'].split(',')[0].trim()
        : req.socket.remoteAddress) || 'unknown';

    const rateCheck = checkLoginRateLimit(ipKey);
    if (!rateCheck.allowed) {
      res.status(429).json({
        error: `Muitas tentativas incorretas. Aguarde ${rateCheck.retryAfterSec}s antes de tentar novamente.`,
      });
      return;
    }

    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!password || !verifyAdminPasswordConstantTime(password)) {
      recordLoginFailure(ipKey);
      res.status(401).json({
        error: 'Senha de desenvolvedor incorreta.',
      });
      return;
    }

    clearLoginFailures(ipKey);
    const session = issueAdminSessionToken();
    res.json(session);
  });

  app.get('/api/admin/session', requireAdminSession, (_req, res) => {
    res.json({ valid: true });
  });

  // Server-protected ZIP export for mobile download (full source code or ready-to-drop Netlify dist)
  app.get('/api/admin/export-zip', requireAdminSession, (req, res) => {
    try {
      const target = req.query.target === 'netlify' ? 'netlify' : 'source';

      if (target === 'netlify') {
        const distZip = buildNetlifyDistZip(__dirname);
        if (!distZip) {
          res.status(404).json({
            error: 'Pasta compilada (dist) ainda não encontrada. Use o download do código completo.',
          });
          return;
        }
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader(
          'Content-Disposition',
          'attachment; filename="nrc-netlify-pronto.zip"'
        );
        res.setHeader('Content-Length', String(distZip.length));
        res.setHeader('Cache-Control', 'no-store');
        res.status(200).end(distZip);
        return;
      }

      const sourceZip = buildProjectSourceZip(__dirname);
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="nrc-codigo-completo.zip"'
      );
      res.setHeader('Content-Length', String(sourceZip.length));
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).end(sourceZip);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Erro ao gerar arquivo ZIP.';
      res.status(500).json({ error: message });
    }
  });

  // Server-protected settings update (open/close registrations, spot capacity)
  app.patch('/api/admin/settings', requireAdminSession, async (req, res) => {
    try {
      await updateChampionshipSettings({
        isOpen: req.body?.isOpen,
        totalMaxSpots: req.body?.totalMaxSpots,
        proMaxSpots: req.body?.proMaxSpots,
        streetMaxSpots: req.body?.streetMaxSpots,
      });

      const updatedState = await getChampionshipState();
      void broadcastChampionshipSync('settings:updated');

      res.json({
        state: updatedState,
      });
    } catch (error: unknown) {
      if (error instanceof ChampionshipDomainError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao atualizar configurações do campeonato.';
      res.status(500).json({ error: message });
    }
  });

  // Server-protected delete pilot registration
  app.delete('/api/admin/registrations/:id', requireAdminSession, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const deleted = await deletePilotRegistration(id);
      const updatedState = await getChampionshipState();
      void broadcastChampionshipSync('registration:deleted');

      res.json({
        deleted,
        state: updatedState,
      });
    } catch (error: unknown) {
      if (error instanceof ChampionshipDomainError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      const message =
        error instanceof Error ? error.message : 'Erro ao excluir inscrição.';
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`NRC Championship Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
