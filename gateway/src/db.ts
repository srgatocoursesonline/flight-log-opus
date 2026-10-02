import pg from 'pg';
import { config } from './config.js';

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export interface JwtClaims {
  sub: string | null;
  role: 'anon' | 'authenticated' | 'service_role';
  aud: string;
  email?: string;
  session_id?: string | null;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

const ANON_CLAIMS: JwtClaims = {
  sub: null,
  role: 'anon',
  aud: 'authenticated',
};

/**
 * Executa a função dentro de uma transação Postgres com o contexto JWT
 * configurado exatamente como o PostgREST faria:
 *   SET LOCAL role <role>; SET LOCAL request.jwt.claims '<json>';
 * Garante que RLS e auth.uid() funcionem verbatim.
 */
export async function withContext<T>(
  claims: JwtClaims | undefined,
  fn: (client: any) => Promise<T>,
): Promise<T> {
  const extra: JwtClaims = claims ?? { sub: null, role: 'anon', aud: 'authenticated' };
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const claimsJson = JSON.stringify(extra);
    await client.query('SELECT set_config($1, $2, true)', ['request.jwt.claims', claimsJson]);
    await client.query('SELECT set_config($1, $2, true)', ['role', extra.role]);
    try {
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    }
  } finally {
    client.release();
  }
}

interface JwtClaimsAlias {
  sub: string | null;
  role: 'anon' | 'authenticated' | 'service_role';
  aud: string;
  [key: string]: unknown;
}
void (0 as unknown as JwtClaimsAlias);

export async function withDb<T>(
  fn: (client: any) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    const result = await fn(client);
    return result;
  } finally {
    client.release();
  }
}

export async function transaction<T>(
  client: pg.PoolClient,
  fn: () => Promise<T>,
): Promise<T> {
  await client.query('BEGIN');
  try {
    const result = await fn();
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  }
}
