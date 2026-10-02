import express, { type Request, type Response, type NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { pool, type JwtClaims } from './db.js';
import { verifyAnyToken } from './keys.js';
import { authRouter } from './routes/auth.js';
import { restRouter } from './routes/rest.js';
import { storageRouter } from './routes/storage.js';
import { oauthRouter } from './routes/oauth.js';

// ============================================
// MIDDLEWARE: resolve claims (Authorization > apikey > anon)
// ============================================
function resolveClaims(req: Request, res: Response, next: NextFunction): void {
  res.locals.claims = { sub: null, role: 'anon', aud: 'authenticated' } satisfies JwtClaims;

  const authz = (req.headers.authorization ?? '').toString();
  if (authz.startsWith('Bearer ')) {
    const token = authz.slice(7).trim();
    if (token) {
      const { claims, expired } = verifyAnyToken(token);
      if (claims && !expired) {
        res.locals.claims = claims;
        next();
        return;
      }
    }
  } else {
    const apiKey = (req.headers.apikey ?? '').toString();
    if (apiKey) {
      const { claims } = verifyAnyToken(apiKey);
      if (claims && (claims.role === 'anon' || claims.role === 'service_role')) {
        res.locals.claims = claims;
        next();
        return;
      }
    }
  }
  res.status(401).json({
    message: 'Invalid API key',
    error_description: 'invalid claim: missing apikey claim',
    code: 401,
  });
}

// ============================================
// CORS
// ============================================
const app = express();
app.set('trust proxy', 1);

if (config.corsOrigins.length) {
  app.use((req, res, next) => {
    const origin = req.headers.origin?.toString() ?? '';
    if (config.corsOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader(
        'Access-Control-Allow-Headers',
        'authorization, apikey, content-type, prefer, range, accept, x-client-info, x-upsert, x-supabase-api-version, accept-profile, content-profile',
      );
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD',
      );
      res.setHeader('Access-Control-Expose-Headers', 'content-range, x-total-count');
      if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
      }
    }
    next();
  });
}

// Body parsers — só interpretam JSON/urlencoded; uploads binários passam intactos
app.use(express.json({ limit: '32mb' }));
app.use(express.urlencoded({ extended: true }));

// Health (antes do 404)
app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'up' });
  } catch {
    res.status(500).json({ status: 'degraded', db: 'down' });
  }
});

// Storage: claims opcionais são tratados DENTRO do router (público sem apikey)
app.use('/storage/v1', storageRouter);

// Auth (rate limit de login)
const loginLimiter = rateLimit({
  windowMs: config.loginRateLimitWindowMs,
  max: config.loginRateLimitMax,
  standardHeaders: true,
});
app.use('/auth/v1/token', (req, res, next) => {
  if (String(req.query.grant_type) === 'password') {
    return loginLimiter(req, res, next);
  }
  next();
});
app.use('/auth/v1', authRouter);
app.use('/auth/v1', oauthRouter);

// REST
app.use('/rest/v1', resolveClaims, restRouter);

// 404 no formato gateway
app.use((req, res) => {
  res.status(404).json({
    code: 'PGRST121',
    message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
    details: null,
    hint: null,
  });
});

// Error handler global
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[gateway] erro:', err?.message ?? err);
  if (res.headersSent) return;
  res.status(err?.status && Number.isInteger(err.status) ? err.status : 500).json({
    code: err?.code ?? 'GATEWAY_UNHANDLED_ERROR',
    message: err?.message ?? 'Internal error',
    details: err?.detail ?? null,
    hint: err?.hint ?? null,
  });
});

const server = app.listen(config.port, () => {
  console.log(`[gateway] API compatível Supabase na porta ${config.port}`);
  console.log('[gateway] rotas: /auth/v1/* /rest/v1/* /storage/v1/* /health');
});

function shutdown(): void {
  console.log('[gateway] encerrando...');
  server.close(() => {
    void pool.end();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('unhandledRejection', (reason) => {
  console.error('[gateway] unhandledRejection:', reason);
});
