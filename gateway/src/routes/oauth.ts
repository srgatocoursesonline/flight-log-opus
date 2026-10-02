import { Router, type Request, type Response, type NextFunction } from 'express';
import crypto from 'crypto';
import { config } from '../config.js';
import { withDb, transaction } from '../db.js';

export const oauthRouter = Router();

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
}

function googleConfig(): OAuthConfig | null {
  const clientId = process.env.GOOGLE_CLIENT_ID ?? '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? '';
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

function base64url(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

function fromBase64url<T>(str: string): T | null {
  try {
    return JSON.parse(Buffer.from(str, 'base64url').toString('utf8')) as T;
  } catch {
    return null;
  }
}

// ============================================
// GET /auth/v1/authorize?provider=google&redirect_to=...
// ============================================
oauthRouter.get('/authorize', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const provider = ((req.query.provider ?? 'google') as string).toLowerCase();
    const redirectTo = ((req.query.redirect_to ?? '') as string) || '';
    if (provider !== 'google') {
      return res.redirect(302, `${redirectTo}#error=unsupported_provider&error_description=Provider não suportado`);
    }
    const g = googleConfig();
    // Guarda redirectTo no state para o callback retornar ao app
    const state = base64url({ redirectTo, nonce: crypto.randomUUID() });
    if (!g) {
      // Sem provedor configurado: explica no redirect para o app exibir erro
      return res.redirect(
        302,
        `${redirectTo}?error=provider_not_configured&error_description=` +
          encodeURIComponent('Login com Google requer GOOGLE_CLIENT_ID/SECRET no gateway'),
      );
    }
    const origin = `${(req.headers['x-forwarded-proto'] ?? 'https')}://${req.headers.host}`;
    const authorizeUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authorizeUrl.searchParams.set('client_id', g.clientId);
    authorizeUrl.searchParams.set('redirect_uri', `${origin}/auth/v1/callback`);
    authorizeUrl.searchParams.set('response_type', 'code');
    authorizeUrl.searchParams.set('scope', 'openid email profile');
    authorizeUrl.searchParams.set('state', state);
    const qp = (req.query.queryParams ?? {}) as Record<string, string>;
    for (const [k, v] of Object.entries(qp)) {
      authorizeUrl.searchParams.set(k, String(v));
    }
    res.redirect(302, authorizeUrl.toString());
  } catch (e) {
    next(e);
  }
});

// ============================================
// GET /auth/v1/callback — Google OAuth callback
// ============================================
oauthRouter.get('/callback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errDesc = (req.query.error_description ?? req.query.error ?? '').toString();
    const stateData = fromBase64url<{ redirectTo: string; nonce: string }>((req.query.state ?? '').toString());
    const redirectTo = stateData?.redirectTo || '/auth/callback';
    if (errDesc) {
      return res.redirect(
        302,
        `${redirectTo}${redirectTo.includes('?') ? '&' : '?'}error=access_denied&error_description=${encodeURIComponent(errDesc)}`,
      );
    }
    const code = (req.query.code ?? '').toString();
    const g = googleConfig();
    if (!code || !g) {
      return res.redirect(302, `${redirectTo}?error=oauth_failed&error_description=Callback inválido`);
    }
    const origin = `${(req.headers['x-forwarded-proto'] ?? 'https')}://${req.headers.host}`;
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: g.clientId,
        client_secret: g.clientSecret,
        redirect_uri: `${origin}/auth/v1/callback`,
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenRes.ok) {
      return res.redirect(302, `${redirectTo}?error=oauth_failed&error_description=Token inválido`);
    }
    const tokenData = (await tokenRes.json()) as { access_token?: string };
    if (!tokenData.access_token) {
      return res.redirect(302, `${redirectTo}?error=oauth_failed&error_description=Token ausente`);
    }
    const userInfo = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (!userInfo.ok) {
      return res.redirect(302, `${redirectTo}?error=oauth_failed&error_description=UserInfo falhou`);
    }
    const ui = (await userInfo.json()) as {
      sub: string;
      email?: string;
      name?: string;
      picture?: string;
    };
    if (!ui.email) {
      return res.redirect(302, `${redirectTo}?error=oauth_failed&error_description=Google não retornou e-mail`);
    }

    const expires = Math.floor(Date.now() / 1000);
    const sessionData: Record<string, unknown> = {};
  await withDb(async (client) => {
    await transaction(client, async () => {
      // já existe identity google?
      const existingId = await client.query(
        `SELECT u.* FROM auth.identities i JOIN auth.users u ON u.id = i.user_id
          WHERE i.provider = 'google' AND i.provider_id = $1 AND u.deleted_at IS NULL LIMIT 1`,
        [ui.sub],
      );
      let user: Record<string, any>;
      const foundGoogle = existingId.rows[0] as Record<string, any> | undefined;
      if (foundGoogle) {
        user = foundGoogle;
      } else {
        // match por e-mail (GoTrue vincula por e-mail)
        const byMail = await client.query(
          `SELECT * FROM auth.users WHERE lower(email) = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1`,
          [ui.email!.toLowerCase()],
        );
        const foundByMail = byMail.rows[0] as Record<string, any> | undefined;
        if (foundByMail) {
          user = foundByMail;
        } else {
          const created = await client.query(
            `INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at,
                 raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
             VALUES (gen_random_uuid(), 'authenticated', 'authenticated', $1, '', now(),
                 $2::jsonb, $3::jsonb, now(), now())
             RETURNING *`,
            [
              ui.email!.toLowerCase(),
              JSON.stringify({ provider: 'google', providers: ['google'] }),
              JSON.stringify({ display_name: ui.name ?? 'Usuário', full_name: ui.name, avatar_url: ui.picture }),
            ],
          );
          user = created.rows[0];
        }
        await client.query(
          `INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at)
           VALUES ($1, $2, $3, $4::jsonb, 'google', now(), now())
           ON CONFLICT (provider, id) DO UPDATE SET identity_data = $4::jsonb, updated_at = now()`,
          [
            `google-${ui.sub}`,
            user.id,
            ui.sub,
            JSON.stringify({ sub: ui.sub, email: ui.email, name: ui.name, picture: ui.picture }),
          ],
        );
      }
        // cria sessão/refresh/admin
        const sessionId = crypto.randomUUID();
        const refreshToken = crypto.randomBytes(24).toString('hex');
        await client.query(
          `INSERT INTO auth.sessions (id, user_id, aal) VALUES ($1, $2, 'aal1')`,
          [sessionId, user.id],
        );
        await client.query(
          `INSERT INTO auth.refresh_tokens (token, session_id, user_id) VALUES ($1, $2, $3)`,
          [refreshToken, sessionId, user.id],
        );
        await client.query(`UPDATE auth.users SET last_sign_in_at = now(), updated_at = now() WHERE id = $1`, [user.id]);
        // monta fragmento de sessão implicit-flow (supabase-js lê o hash)
        const claims = {
          sub: user.id,
          role: 'authenticated',
          aud: 'authenticated',
          email: user.email,
          session_id: sessionId,
          app_metadata: user.raw_app_meta_data ?? {},
          user_metadata: user.raw_user_meta_data ?? {},
        };
        const jwtSign = await import('jsonwebtoken');
        const access = jwtSign.sign(claims, config.jwtSecret, { algorithm: 'HS256', expiresIn: Number(config.accessExpiresIn) });
        Object.assign(sessionData, {
          access_token: access,
          refresh_token: refreshToken,
          token_type: 'bearer',
          expires_in: Number(config.accessExpiresIn),
        });
      });
    });
    const fragment = new URLSearchParams({
      access_token: String(sessionData.access_token),
      refresh_token: String(sessionData.refresh_token),
      token_type: 'bearer',
      expires_in: String(sessionData.expires_in),
      provider: 'google',
      agora: String(expires), // não usado; harmless
    });
    // supabase-js implicit flow espera: access_token, refresh_token, expires_in, expires_at, token_type
    fragment.set('expires_at', String(Math.floor(Date.now() / 1000) + Number(config.accessExpiresIn)));
    res.redirect(302, `${redirectTo}#${fragment.toString()}`);
  } catch (e) {
    next(e);
  }
});
