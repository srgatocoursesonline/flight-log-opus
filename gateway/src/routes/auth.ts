import { Router, type Request, type Response, type NextFunction } from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { config } from '../config.js';
import { withDb, type JwtClaims } from '../db.js';
import { signAccessToken, verifyAnyToken } from '../keys.js';

export const authRouter = Router();

// ============================================
// HELPERS
// ============================================

const SERVICE_ROLE_CLAIMS: JwtClaims = {
  sub: null,
  role: 'service_role',
  aud: 'authenticated',
};
const ANON_CLAIMS: JwtClaims = {
  sub: null,
  role: 'anon',
  aud: 'authenticated',
};

interface AuthUserRow {
  id: string;
  email: string | null;
  email_confirmed_at: Date | null;
  encrypted_password: string | null;
  raw_app_meta_data: Record<string, unknown> | null;
  raw_user_meta_data: Record<string, unknown> | null;
  banned_until: Date | null;
  deleted_at: Date | null;
  last_sign_in_at: Date | null;
  created_at: Date;
  updated_at: Date;
  role: string | null;
  aud: string | null;
  phone: string | null;
  invited_at: Date | null;
  confirmation_token?: string | null;
  recovery_token?: string | null;
}

function iso(d: Date | null | undefined): string | null {
  return d ? new Date(d).toISOString() : null;
}

function userPayload(u: AuthUserRow, identities: unknown[] = []): Record<string, unknown> {
  return {
    id: u.id,
    aud: u.aud ?? 'authenticated',
    role: u.role ?? 'authenticated',
    email: u.email,
    email_confirmed_at: iso(u.email_confirmed_at) ?? iso(u.created_at),
    email_visibility: 0,
    phone: u.phone ?? '',
    confirmed_at: iso(u.email_confirmed_at) ?? iso(u.created_at),
    invited_at: iso(u.invited_at),
    last_sign_in_at: iso(u.last_sign_in_at),
    created_at: iso(u.created_at),
    updated_at: iso(u.updated_at),
    confirmed: !!u.email_confirmed_at || !!u.created_at,
    app_metadata: {
      provider: 'email',
      providers: ['email'],
      ...((u.raw_app_meta_data ?? {}) as Record<string, unknown>),
      ...((u.raw_app_meta_data ?? {}) as Record<string, unknown>),
    },
    user_metadata: (u.raw_user_meta_data ?? {}) as Record<string, unknown>,
    identities,
  };
}

function sessionBody(
  u: AuthUserRow,
  sessionId: string,
  refreshToken: string,
): Record<string, unknown> {
  const expiresIn = Number(config.accessExpiresIn);
  const access = signAccessToken({
    sub: u.id,
    email: u.email,
    sessionId: sessionId,
    appMetadata: (u.raw_app_meta_data ?? {}) as Record<string, unknown>,
    userMetadata: (u.raw_user_meta_data ?? {}) as Record<string, unknown>,
  });
  return {
    access_token: access,
    token_type: 'bearer',
    expires_in: expiresIn,
    expires_at: Math.floor(Date.now() / 1000) + expiresIn,
    refresh_token: refreshToken,
    user: userPayload(u),
  };
}

async function createSession(
  client: any,
  user: AuthUserRow,
  userAgent = '',
  ip = '',
): Promise<{ sessionId: string; refreshToken: string }> {
  const sessionId = crypto.randomUUID();
  const refreshToken = crypto.randomBytes(24).toString('hex');
  await client.query(
    `INSERT INTO auth.sessions (id, user_id, user_agent, ip, aal)
     VALUES ($1, $2, $3, NULLIF($4, '')::inet, 'aal1')`,
    [sessionId, user.id, userAgent.slice(0, 255), ip],
  );
  await client.query(
    `INSERT INTO auth.refresh_tokens (token, session_id, user_id)
     VALUES ($1, $2, $3)`,
    [refreshToken, sessionId, user.id],
  );
  return { sessionId, refreshToken };
}

function hmacToken(): string {
  return crypto.randomBytes(24).toString('hex');
}

async function sendMail(to: string, subject: string, html: string, text: string): Promise<void> {
  if (!config.smtp.host) return;
  const transport = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    auth: config.smtp.user
      ? { user: config.smtp.user, pass: config.smtp.pass }
      : undefined,
  });
  await transport.sendMail({
    from: config.smtp.from,
    to,
    subject,
    html,
    text,
  });
}

function parseJsonField(v: unknown, fallback: Record<string, unknown> = {}): Record<string, unknown> {
  if (v == null) return fallback;
  if (typeof v === 'object') return v as Record<string, unknown>;
  try {
    return JSON.parse(String(v));
  } catch {
    return fallback;
  }
}

function authError(res: Response, status: number, code: string, description: string): void {
  res.status(status).json({
    error: code,
    error_code: code,
    msg: description,
    message: description,
    error_description: description,
  });
}

function bearer(req: Request): { claims: JwtClaims | null; expired: boolean } {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : header;
  if (!token) return { claims: null, expired: false };
  return verifyAnyToken(token);
}

const userNotConfirmedClaim: JwtClaims = ANON_CLAIMS;

// ============================================
// POST /auth/v1/signup
// ============================================
authRouter.post('/signup', async (req, res, next) => {
  try {
    const email = (req.body?.email ?? '').trim().toLowerCase();
    const password = req.body?.password ?? '';
    const metadata = parseJsonField(req.body?.data);
    if (!email || !email.includes('@')) {
      return authError(res, 400, 'validation_failed', 'Email address is invalid');
    }
    if (!password || password.length < 6) {
      return authError(res, 400, 'weak_password', 'Password should be at least 6 characters');
    }

    await withDb(async (client) => {
      const existing = await client.query(
        `SELECT id FROM auth.users WHERE lower(email) = $1 AND deleted_at IS NULL LIMIT 1`,
        [email],
      );
      if ((existing?.rowCount ?? 0) > 0) {
        authError(res, 422, 'user_already_exists', 'A user with this email address has already been registered');
        return;
      }

      const requireConfirmation = !!config.smtp.host;
      do {
        const inserted = await client.query(
          `INSERT INTO auth.users (id, aud, role, email, encrypted_password,
             email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
             confirmation_token, confirmation_sent_at)
           VALUES (gen_random_uuid(), 'authenticated', 'authenticated', $1,
             extensions.crypt($2, extensions.gen_salt('bf', 10)),
             CASE WHEN $3::bool THEN now() ELSE NULL END,
             now(), now(), $4::jsonb, $5::jsonb,
             CASE WHEN $3::bool THEN '' ELSE $6 END,
             CASE WHEN $3::bool THEN now() ELSE now() END)
           RETURNING *`,
          [
            email,
            password,
            requireConfirmation,
            JSON.stringify({ provider: 'email', providers: ['email'] }),
            metadata,
            requireConfirmation ? '' : hmacToken(),
          ],
        );
        const user = inserted.rows[0] as AuthUserRow;

        if (!requireConfirmation) {
          // Auto-confirm (SMTP não configurado): sessão imediata
          const { sessionId, refreshToken } = await createSession(
            client,
            user,
            req.headers['user-agent'] ?? '',
            (req.headers['x-forwarded-for'] ?? '').toString().split(',')[0],
          );
          res.json(sessionBody(user, sessionId, refreshToken));
          return;
        }

        // Confirmação necessária: envia link (token em confirmation_token)
        const actionLink = `${req.headers['x-forwarded-proto'] ?? 'https'}://${req.headers.host}/auth/v1/redirect?token=${encodeURIComponent(user.confirmation_token ?? '')}&type=signup`;
        try {
          await sendMail(
            email,
            'Confirme seu cadastro - Flight Log Opus',
            `<p>Confirme seu cadastro no Flight Log Opus:</p>
             <p><a href="${actionLink}">Confirmar e-mail</a></p>`,
            `Confirme seu cadastro: ${actionLink}`,
          );
        } catch (mailError) {
          // E-mail falhou — ainda devolvemos user sem sessão; admin pode reenviar
          console.error('[auth] falha ao enviar e-mail de confirmação:', mailError);
        }
        res.status(200).json({ user: userPayload(user) });
      } while (0);
    });
  } catch (e) {
    next(e);
  }
});

// ============================================
// POST /auth/v1/token?grant_type=password|refresh_token
// ============================================
authRouter.post('/token', async (req, res, next) => {
  try {
    const grantType = (req.query.grant_type ?? '').toString();
    if (grantType === 'password') {
      const email = (req.body?.email ?? '').trim().toLowerCase();
      const password = req.body?.password ?? '';
      await withDb(async (client) => {
        const found = await client.query(
          `SELECT * FROM auth.users
            WHERE lower(email) = $1 AND deleted_at IS NULL
            ORDER BY created_at DESC LIMIT 1`,
          [email],
        );
        const user = found.rows[0] as AuthUserRow | undefined;
        if (!user || (user.banned_until && new Date(user.banned_until) > new Date())) {
          return authError(res, 400, 'invalid_grant', 'Invalid login credentials');
        }
        const ok = await client.query(
          `SELECT extensions.crypt($1, encrypted_password) = encrypted_password AS valid
             FROM auth.users WHERE id = $2`,
          [password, user.id],
        );
        if (!ok.rows[0]?.valid) {
          return authError(res, 400, 'invalid_grant', 'Invalid login credentials');
        }
        if (!user.email_confirmed_at && !!config.smtp.host) {
          return authError(res, 400, 'user_not_confirmed', 'Email not confirmed');
        }
        do {
          await client.query('UPDATE auth.users SET last_sign_in_at = now(), updated_at = now() WHERE id = $1', [user.id]);
          const { sessionId, refreshToken } = await createSession(
            client,
            user,
            req.headers['user-agent'] ?? '',
            (req.headers['x-forwarded-for'] ?? '').toString().split(',')[0],
          );
          res.json(sessionBody(user, sessionId, refreshToken));
        } while (0);
      });
      return;
    }

    if (grantType === 'refresh_token') {
      const refreshToken = (req.body?.refresh_token ?? '').toString();
      if (!refreshToken) return authError(res, 400, 'invalid_grant', 'Invalid Refresh Token');
      await withDb(async (client) => {
        const found = await client.query(
          `SELECT u.*, rt.token AS rt_token, s.id AS session_id
             FROM auth.refresh_tokens rt
             JOIN auth.sessions s ON s.id = rt.session_id AND s.deleted_at IS NULL
             JOIN auth.users u ON u.id = rt.user_id AND u.deleted_at IS NULL
            WHERE rt.token = $1 AND rt.revoked = false
            LIMIT 1`,
          [refreshToken],
        );
        if (found.rowCount === 0) {
          return authError(res, 400, 'invalid_grant', 'Invalid Refresh Token');
        }
        const user = found.rows[0] as AuthUserRow & { rt_token: string; session_id: string };
        if (user.banned_until && new Date(user.banned_until) > new Date()) {
          return authError(res, 400, 'invalid_grant', 'Invalid Refresh Token');
        }
        do {
          // rotação: revoga o token antigo, cria novo na mesma sessão
          await client.query(`UPDATE auth.refresh_tokens SET revoked = true, updated_at = now() WHERE token = $1`, [user.rt_token]);
          const newRefresh = crypto.randomBytes(24).toString('hex');
          await client.query(
            `INSERT INTO auth.refresh_tokens (token, session_id, user_id, parent)
             VALUES ($1, $2, $3, $4)`,
            [newRefresh, user.session_id, user.id, user.rt_token],
          );
          res.json(sessionBody({ ...user, last_sign_in_at: user.last_sign_in_at }, user.session_id, newRefresh));
        } while (0);
      });
      return;
    }

    authError(res, 400, 'unsupported_grant_type', `Unsupported grant type: ${grantType}`);
  } catch (e) {
    next(e);
  }
});

// ============================================
// GET /auth/v1/user + PUT /user
// ============================================
function requireUser(req: Request): JwtClaims {
  const { claims, expired } = bearer(req);
  if (!claims || expired || claims.role !== 'authenticated' || !claims.sub) {
    const e: Error & { status?: number } = new Error('invalid claim: missing sub claim');
    e.status = 401;
    throw e;
  }
  return claims;
}

authRouter.get('/user', async (req, res, next) => {
  try {
    const claims = requireUser(req);
    await withDb(async (client) => {
      const found = await client.query(`SELECT * FROM auth.users WHERE id = $1 AND deleted_at IS NULL`, [claims.sub]);
      if (found.rowCount === 0) {
        return authError(res, 404, 'user_not_found', 'User from sub claim in JWT does not exist');
      }
      res.json(userPayload(found.rows[0] as AuthUserRow));
    });
  } catch (e) {
    next(e);
  }
});

authRouter.put('/user', async (req, res, next) => {
  try {
    const claims = requireUser(req);
    await withDb(async (client) => {
      const found = await client.query(`SELECT * FROM auth.users WHERE id = $1 AND deleted_at IS NULL`, [claims.sub]);
      if (found.rowCount === 0) {
        return authError(res, 404, 'user_not_found', 'User from sub claim in JWT does not exist');
      }
      const user = found.rows[0] as AuthUserRow;
      const meta = parseJsonField(user.raw_user_meta_data);
      const incomingMeta = parseJsonField(req.body?.data);
      const merged = { ...meta, ...incomingMeta };
      do {
        await client.query(`UPDATE auth.users SET raw_user_meta_data = $2::jsonb, updated_at = now() WHERE id = $1`, [
          user.id,
          JSON.stringify(merged),
        ]);
        res.json(userPayload({ ...user, raw_user_meta_data: merged }));
      } while (0);
    });
  } catch (e) {
    next(e);
  }
});

// ============================================
// POST /auth/v1/logout
// ============================================
authRouter.post('/logout', async (req, res, next) => {
  try {
    const { claims, expired } = bearer(req);
    if (claims?.session_id) {
      await withDb(async (client) => {
        do {
          await client.query(`UPDATE auth.refresh_tokens SET revoked = true, updated_at = now() WHERE session_id = $1`, [claims.session_id]);
          await client.query(`UPDATE auth.sessions SET deleted_at = now(), updated_at = now() WHERE id = $1`, [claims.session_id]);
        } while (0);
      });
    }
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

// ============================================
// POST /auth/v1/recover
// ============================================
authRouter.post('/recover', async (req, res, next) => {
  try {
    const email = (req.body?.email ?? '').trim().toLowerCase();
    if (!email) return authError(res, 400, 'validation_failed', 'Email address is invalid');
    const proto = (req.headers['x-forwarded-proto'] ?? 'https').toString();
    const redirectTo = ((req.query.redirect_to ?? '').toString() || `${proto}://${req.headers.host}/reset-password`);
    await withDb(async (client) => {
      const found = await client.query(
        `SELECT * FROM auth.users WHERE lower(email) = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1`,
        [email],
      );
      const user = found.rows[0] as AuthUserRow | undefined;
      if (user) {
        const token = hmacToken();
        do {
          await client.query(
            `UPDATE auth.users SET recovery_token = $2, recovery_sent_at = now(), updated_at = now() WHERE id = $1`,
            [user.id, token],
          );
          const link = `${redirectTo}#token_hash=${token}&type=recovery`;
          try {
            await sendMail(
              email,
              'Recupere sua senha - Flight Log Opus',
              `<p>Redefina sua senha do Flight Log Opus:</p>
               <p><a href="${link}">Redefinir senha</a></p>
               <p>O link expira de acordo com as políticas do sistema.</p>`,
              `Redefina sua senha: ${link}`,
            );
          } catch (mailError) {
            console.error('[auth] falha SMTP (recover):', mailError);
          }
        } while (0);
      }
      // Sempre 200 (não vaza existência)
      res.status(200).json({ data: null, message: 'If your email exists in our database you will receive recovery instructions.' });
    });
  } catch (e) {
    next(e);
  }
});

// ============================================
// POST /auth/v1/verify  (verifyOtp)
// body: { type: 'signup'|'recovery', token_hash|token, email? }
// ============================================
authRouter.post('/verify', async (req, res, next) => {
  try {
    const type = (req.body?.type ?? '').toString();
    const hash = ((req.body?.token_hash ?? req.body?.token ?? '') as string).trim();
    const email = (req.body?.email ?? '').trim().toLowerCase();
    if (!hash || !['signup', 'recovery'].includes(type)) {
      return authError(res, 400, 'validation_failed', 'Invalid verify parameters');
    }
    await withDb(async (client) => {
      const query =
        type === 'signup'
          ? `SELECT * FROM auth.users WHERE confirmation_token = $1 AND deleted_at IS NULL LIMIT 1`
          : `SELECT * FROM auth.users WHERE recovery_token = $1 AND deleted_at IS NULL LIMIT 1`;
      const found = await client.query(query, [hash]);
      const user = found.rows[0] as AuthUserRow | undefined;
      if (!user || (email && user.email && user.email.toLowerCase() !== email)) {
        return authError(res, 404, 'invalid_token', 'Invalid token is provided');
      }
      do {
        if (type === 'signup') {
          await client.query(
            `UPDATE auth.users SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
               confirmed_at = COALESCE(confirmed_at, now()), confirmation_token = '', updated_at = now()
             WHERE id = $1`,
            [user.id],
          );
        } else {
          await client.query(
            `UPDATE auth.users SET recovery_token = '', updated_at = now() WHERE id = $1`,
            [user.id],
          );
        }
        const { sessionId, refreshToken } = await createSession(
          client,
          user,
          req.headers['user-agent'] ?? '',
          (req.headers['x-forwarded-for'] ?? '').toString().split(',')[0],
        );
        res.json(sessionBody(user, sessionId, refreshToken));
      } while (0);
    });
  } catch (e) {
    next(e);
  }
});

// ============================================
// GET /auth/v1/sso + settings etc — respostas mínimas p/ SDK
// ============================================
authRouter.get('/settings', (_req, res) => {
  res.json({
    external: { google: !!process.env.GOOGLE_CLIENT_ID },
    disable_signup: false,
    mailer_autoenable: false,
    mailer_oper: false,
    phone_autoenable: false,
   sms_provider: undefined,
    third_party: { okta: false },
    provider: { google: !!process.env.GOOGLE_CLIENT_ID },
  });
});

// erros de middleware
authRouter.use((e: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = e?.status ?? 500;
  res.status(status).json({
    error: 'internal_error',
    error_code: 'internal_error',
    code: String(e?.code ?? ''),
    msg: e?.message ?? 'Internal error',
    message: e?.message ?? 'Internal error',
  });
});

export { SERVICE_ROLE_CLAIMS, ANON_CLAIMS, userNotConfirmedClaim };
