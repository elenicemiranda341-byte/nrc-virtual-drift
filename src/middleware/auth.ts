import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { adminAuth } from '../lib/firebase-admin.ts';
import { getOrCreateUser } from '../db/users.ts';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
const RUNTIME_TOKEN_SECRET =
  process.env.ADMIN_TOKEN_SECRET && process.env.ADMIN_TOKEN_SECRET.trim().length >= 16
    ? process.env.ADMIN_TOKEN_SECRET.trim()
    : crypto.randomBytes(32).toString('hex');

interface RateLimitBucket {
  failures: number;
  resetAt: number;
}

const loginBuckets = new Map<string, RateLimitBucket>();

function getExpectedAdminPassword(): string {
  const envPass = process.env.ADMIN_PASSWORD?.trim();
  if (envPass && envPass.length > 0 && envPass !== 'MY_ADMIN_PASSWORD') {
    return envPass;
  }
  return 'NRC000';
}

export function verifyAdminPasswordConstantTime(candidate: string): boolean {
  const expected = getExpectedAdminPassword();
  const hashCandidate = crypto.createHash('sha256').update(candidate, 'utf8').digest();
  const hashExpected = crypto.createHash('sha256').update(expected, 'utf8').digest();
  return crypto.timingSafeEqual(hashCandidate, hashExpected);
}

export function checkLoginRateLimit(ipKey: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const bucket = loginBuckets.get(ipKey);
  if (!bucket || now > bucket.resetAt) {
    return { allowed: true, retryAfterSec: 0 };
  }
  if (bucket.failures >= 8) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  return { allowed: true, retryAfterSec: 0 };
}

export function recordLoginFailure(ipKey: string): void {
  const now = Date.now();
  const existing = loginBuckets.get(ipKey);
  if (!existing || now > existing.resetAt) {
    loginBuckets.set(ipKey, { failures: 1, resetAt: now + 5 * 60 * 1000 });
  } else {
    existing.failures += 1;
  }
}

export function clearLoginFailures(ipKey: string): void {
  loginBuckets.delete(ipKey);
}

export function issueAdminSessionToken(): { token: string; expiresAt: string } {
  const exp = Date.now() + ADMIN_SESSION_TTL_MS;
  const nonce = crypto.randomBytes(12).toString('hex');
  const payload = Buffer.from(JSON.stringify({ role: 'nrc_admin', exp, nonce }), 'utf8').toString(
    'base64url'
  );
  const signature = crypto
    .createHmac('sha256', RUNTIME_TOKEN_SECRET)
    .update(payload)
    .digest('base64url');

  return {
    token: `nrc_adm.${payload}.${signature}`,
    expiresAt: new Date(exp).toISOString(),
  };
}

export function verifyAdminSessionToken(rawToken: string | undefined): boolean {
  if (!rawToken || !rawToken.startsWith('nrc_adm.')) {
    return false;
  }
  const parts = rawToken.split('.');
  if (parts.length !== 3) {
    return false;
  }
  const [, payload, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', RUNTIME_TOKEN_SECRET)
    .update(payload)
    .digest('base64url');

  const sigBuf = Buffer.from(signature, 'utf8');
  const expBuf = Buffer.from(expectedSig, 'utf8');
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return false;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      role?: string;
      exp?: number;
    };
    if (parsed.role !== 'nrc_admin' || typeof parsed.exp !== 'number') {
      return false;
    }
    return Date.now() < parsed.exp;
  } catch {
    return false;
  }
}

export const requireAdminSession = (req: Request, res: Response, next: NextFunction) => {
  const headerToken = req.headers['x-admin-token'];
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token;
  let candidateToken: string | undefined;

  if (typeof headerToken === 'string' && headerToken.length > 0) {
    candidateToken = headerToken;
  } else if (authHeader && authHeader.startsWith('Bearer ')) {
    candidateToken = authHeader.slice('Bearer '.length).trim();
  } else if (typeof queryToken === 'string' && queryToken.length > 0) {
    candidateToken = queryToken;
  }

  if (!verifyAdminSessionToken(candidateToken)) {
    res.status(401).json({
      error: 'Sessão administrativa inválida ou expirada. Autentique-se novamente no Painel.',
    });
    return;
  }

  next();
};

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token de autenticação ausente.' });
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    if (decodedToken.email) {
      await getOrCreateUser(decodedToken.uid, decodedToken.email, decodedToken.name);
    }
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    res.status(401).json({ error: 'Token de autenticação inválido.' });
  }
};

export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token || token.startsWith('nrc_adm.')) {
    next();
    return;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    if (decodedToken.email) {
      await getOrCreateUser(decodedToken.uid, decodedToken.email, decodedToken.name);
    }
  } catch {
    // Proceed as unauthenticated guest pilot if token expired
  }
  next();
};
