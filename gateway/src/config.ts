import dotenv from 'dotenv';
dotenv.config();

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }
  return v;
}

export const config = {
  port: Number(process.env.PORT ?? 4001),

  databaseUrl: required('DATABASE_URL'),

  jwtSecret: required('JWT_SECRET'),

  anonKey: required('ANON_KEY'),
  serviceKey: required('SERVICE_KEY'),

  accessExpiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN ?? 3600),
  refreshExpiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN ?? 30 * 24 * 3600),

  loginRateLimitMax: Number(process.env.LOGIN_RATE_LIMIT_MAX ?? 30),
  loginRateLimitWindowMs: Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'Flight Log Opus <no-reply@localhost>',
  },

  corsOrigins: (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
} as const;
