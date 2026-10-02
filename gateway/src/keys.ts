import jwt from 'jsonwebtoken';
import { config } from './config.js';
import type { JwtClaims } from './db.js';

const ACCESS_EXPIRES = Number(config.accessExpiresIn);

export function verifyAnyToken(token: string): { claims: JwtClaims | null; expired: boolean } {
  try {
    const claims = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] }) as jwt.JwtPayload;
    return { claims: claims as unknown as JwtClaims, expired: false };
  } catch (err: any) {
    if (err?.name === 'TokenExpiredError') {
      try {
        const claims = jwt.decode(token) as JwtClaims | null;
        return { claims, expired: true };
      } catch {
        return { claims: null, expired: true };
      }
    }
    return { claims: null, expired: false };
  }
}

/** Assina o access token do usuário (mesma forma de claims do GoTrue). */
export function signAccessToken(params: {
  sub: string;
  email: string | null;
  sessionId: string;
  appMetadata: Record<string, unknown>;
  userMetadata: Record<string, unknown>;
}): string {
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign(
    {
      aud: 'authenticated',
      role: 'authenticated',
      email: params.email ?? undefined,
      session_id: params.sessionId,
      app_metadata: params.appMetadata,
      user_metadata: params.userMetadata,
      iat: now,
      exp: now + ACCESS_EXPIRES,
      iss: 'flight-log-opus-gateway',
      sub: params.sub,
    },
    config.jwtSecret,
    { algorithm: 'HS256' },
  );
}
