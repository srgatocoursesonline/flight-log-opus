import { Router, type Request, type Response, type NextFunction } from 'express';
import { withContext, type JwtClaims } from '../db.js';
import {
  assertIdent,
  buildOrderOpt,
  buildWhere,
  projectionColumns,
  projectionSql,
  RestError,
  tableColumns,
  tablePKs,
  type ColumnInfo,
} from '../lib/postgrest.js';

export const restRouter = Router();

interface RequestOpts {
  objectSingle: boolean;
  wantRepresentation: boolean;
  wantCount: boolean;
  resolution: 'merge' | 'ignore' | null;
}

const OBJECT_ACCEPT = 'application/vnd.pgrst.object+json';

function parseOpts(req: Request): RequestOpts {
  const accept = (req.headers.accept ?? '').toString();
  const prefer = (req.headers.prefer ?? '').toString();
  return {
    objectSingle: accept.includes(OBJECT_ACCEPT),
    wantRepresentation: prefer.includes('return=representation') || accept.includes(OBJECT_ACCEPT),
    wantCount: prefer.includes('count='),
    resolution: prefer.includes('resolution=merge-duplicates')
      ? 'merge'
      : prefer.includes('resolution=ignore-duplicates')
        ? 'ignore'
        : null,
  };
}

function respondRows(
  res: Response,
  rows: unknown[],
  opts: RequestOpts,
  count: number | null,
  status = 200,
): void {
  if (opts.wantCount) {
    res.set(
      'Content-Range',
      rows.length === 0 ? `*/${count ?? 0}` : `0-${Math.max(0, rows.length - 1)}/${count ?? rows.length}`,
    );
  }
  if (opts.objectSingle) {
    if (rows.length === 1) {
      res.status(status).json(rows[0]);
      return;
    }
    res.status(406).json({
      code: 'PGRST116',
      details: rows.length
        ? `Results contain ${rows.length} rows, application/vnd.pgrst.object+json requires 1 row`
        : 'Results contain 0 rows, application/vnd.pgrst.object+json requires 1 row',
      hint: null,
      message: 'JSON object requested, multiple (or no) rows returned',
    });
    return;
  }
  res.status(status).json(rows);
}

function pgErrorToRest(err: any): { status: number; body: Record<string, unknown> } {
  if (err instanceof RestError) {
    return {
      status: err.status,
      body: { code: err.code, details: err.details, hint: err.hint, message: err.message },
    };
  }
  const code = err?.code ?? null;
  const message = err?.message ?? 'Internal error';
  const body = { code, details: err?.detail ?? null, hint: err?.hint ?? null, message };
  const map: Record<string, number> = {
    '23505': 409, // unique_violation
    '23503': 409, // foreign_key_violation
    '23514': 400, // check_violation
    '23502': 400, // not_null_violation
    '22001': 400, // string_data_right_truncation
    '22003': 400, // numeric_value_out_of_range
    '22P02': 400, // invalid_text_representation
    '42501': 403, // insufficient_privilege (RLS)
    '42703': 400, // undefined_column
    '42P01': 404, // undefined_table
    '42P02': 400, // undefined_parameter
    '28P01': 401, // invalid_authorization_specification
  };
  const status = code && code in map ? map[code] : code ? 500 : 400;
  return { status, body };
}

function isIdent(name: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name);
}

// ============================================
// PROJEÇÃO (timestamptz → RFC3339 como PostgREST)
// ============================================
function fmtExpr(alias: string, name: string, dataType: string): string {
  if (dataType === 'timestamp with time zone') {
    return `to_char("${alias}"."${name}" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"+00:00"')`;
  }
  return `"${alias}"."${name}"`;
}

function expandColumns(cols: ColumnInfo[], selectArg: string | null): string[] {
  const all = cols.map((c) => c.name);
  if (!selectArg || selectArg.trim() === '' || selectArg.trim() === '*') return all;
  const wanted: string[] = [];
  for (const raw of selectArg.split(',')) {
    const part = raw.trim();
    if (!part) continue;
    if (part === '*') {
      wanted.push(...all);
      continue;
    }
    if (part.includes('(') || part.includes(':')) {
      throw new RestError(
        400,
        'PGRST203',
        `Selects com relações embutidas não são suportados: "${part}"`,
      );
    }
    if (!cols.some((c) => c.name === part)) {
      throw new RestError(400, 'PGRST210', `Could not find column "${part}" in the schema cache`);
    }
    wanted.push(part);
  }
  return wanted.length ? wanted : all;
}

function projection(alias: string, cols: ColumnInfo[], wanted: string[]): string {
  return wanted
    .map((n) => {
      const dt = cols.find((c) => c.name === n)!.dataType;
      return `${fmtExpr(alias, n, dt)} AS "${n}"`;
    })
    .join(', ');
}

function coerceJsonb(value: unknown, dataType: string): unknown {
  if (value === null) return null;
  if (dataType === 'jsonb' || dataType === 'json') {
    return typeof value === 'string' ? value : JSON.stringify(value);
  }
  if (dataType.startsWith('pg.')) return value;
  return value;
}

// ============================================
// GET (SELECT)
// ============================================
async function runGet(
  client: any,
  res: Response,
  opts: RequestOpts,
  table: string,
  searchParams: URLSearchParams,
  headers: Request['headers'],
): Promise<void> {
  assertIdent(table, 'tabela');
  const cols = await tableColumns(client, table);
  const wanted = expandColumns(cols, searchParams.get('select'));
  const where = await buildWhere(client, table, searchParams);
  const order = await buildOrderOpt(searchParams.get('order') ?? undefined, cols);

  let limit: number | null = null;
  let offset: number | null = null;
  const limitRaw = searchParams.get('limit');
  const offsetRaw = searchParams.get('offset');
  if (limitRaw !== null) limit = Number(limitRaw);
  if (offsetRaw !== null) offset = Number(offsetRaw);
  const rangeVal = (headers.range ?? '').toString();
  const rangeMatch = rangeVal.match(/^items=(\d+)-(\d+)?$/);
  if (rangeMatch) {
    offset = Number(rangeMatch[1]);
    if (rangeMatch[2] !== undefined) limit = Number(rangeMatch[2]) - offset + 1;
  }
  if (opts.objectSingle && limit === null) limit = 2; // detecta multi para .single()

  const paginated = [
    `SELECT ${projection('t', cols, wanted)} FROM t`,
    order,
    limit !== null ? `LIMIT ${String(Math.max(0, limit))}` : '',
    offset !== null ? `OFFSET ${String(Math.max(0, offset))}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const sql = `
    WITH t AS (
      SELECT * FROM public."${table}" WHERE ${where.whereSql}
    ), r AS (
      ${paginated}
    )
    SELECT
      ${opts.wantCount ? '(SELECT count(*) FROM t) AS total,' : ''}
      COALESCE(jsonb_agg(to_jsonb(r)), '[]'::jsonb) AS data
    FROM r`;

  const result = await client.query(sql, where.params);
  const data = result.rows[0]?.data;
  if (!Array.isArray(data)) {
    throw new RestError(500, 'PGRST104', 'Erro inesperado na serialização de dados');
  }
  const count = opts.wantCount ? Number(result.rows[0]?.total ?? 0) : null;
  respondRows(res, data as unknown[], opts, count);
}

// ============================================
// INSERT (POST) — com upsert
// ============================================
async function buildRowsPayload(
  client: any,
  table: string,
  body: Record<string, unknown> | Record<string, unknown>[],
): Promise<{ colsAll: string[]; valueExprs: string[]; params: unknown[]; colsTable: ColumnInfo[] }> {
  assertIdent(table, 'tabela');
  const colsTable = await tableColumns(client, table);
  const validCols = new Set(colsTable.map((c) => c.name));
  const rows = Array.isArray(body) ? body : [body];
  if (!rows.length) {
    throw new RestError(400, 'PGRST102', 'Body vazio');
  }
  const keySet = new Set<string>();
  for (const row of rows) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      throw new RestError(400, 'PGRST102', 'Body deve ser objeto ou array de objetos');
    }
    for (const key of Object.keys(row)) {
      keySet.add(key);
    }
  }
  for (const key of keySet) {
    if (!isIdent(key)) {
      throw new RestError(400, 'PGRST100', `Nome de coluna inválido: ${key}`);
    }
    if (!validCols.has(key)) {
      throw new RestError(
        400,
        'PGRST204',
        `Could not find the "${key}" column of "${table}" in the schema cache`,
      );
    }
  }
  const colsAll = [...keySet];
  const params: unknown[] = [];
  const valueExprs = rows.map((row) => {
    const placeholders = colsAll.map((col) => {
      const dataType = colsTable.find((c) => c.name === col)!.dataType;
      const value = coerceJsonb(row?.[col] ?? null, dataType);
      params.push(value);
      return `$${params.length}`;
    });
    return `(${placeholders.join(', ')})`;
  });
  return { colsAll, valueExprs, params, colsTable };
}

async function runInsert(
  client: any,
  res: Response,
  opts: RequestOpts,
  table: string,
  searchParams: URLSearchParams,
  body: Record<string, unknown> | Record<string, unknown>[],
): Promise<void> {
  const { colsAll, valueExprs, params } = await buildRowsPayload(client, table, body);

  let conflictSql = '';
  if (opts.resolution === 'merge') {
    const requested = (searchParams.get('on_conflict') ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const conflictCols = requested.length ? requested : await tablePKs(client, table);
    if (!conflictCols.length) {
      throw new RestError(400, 'PGRST100', 'on_conflict necessário para upsert sem PK');
    }
    conflictCols.forEach((c) => assertIdent(c));
    const updateCols = colsAll.filter((c) => !conflictCols.includes(c));
    conflictSql = updateCols.length
      ? `ON CONFLICT (${conflictCols.map((c) => `"${c}"`).join(', ')}) DO UPDATE SET ${updateCols
          .map((c) => `"${c}" = EXCLUDED."${c}"`)
          .join(', ')}`
      : `ON CONFLICT (${conflictCols.map((c) => `"${c}"`).join(', ')}) DO NOTHING`;
  } else if (opts.resolution === 'ignore') {
    conflictSql = 'ON CONFLICT DO NOTHING';
  }

  const coreSql = `
    INSERT INTO public."${table}" (${colsAll.map((c) => `"${c}"`).join(', ')})
    VALUES ${valueExprs.join(', ')}
    ${conflictSql}
    RETURNING *`;

  const rows = await representationRows(client, coreSql, params, table, opts);
  respondRows(res, rows, opts, null, 201);
}

// ============================================
// UPDATE (PATCH) / DELETE
// ============================================
async function runUpdateOrDelete(
  client: any,
  res: Response,
  opts: RequestOpts,
  table: string,
  searchParams: URLSearchParams,
  method: 'PATCH' | 'DELETE',
  patchBody?: Record<string, unknown>,
): Promise<void> {
  assertIdent(table, 'tabela');
  const where = await buildWhere(client, table, searchParams);
  const params = [...where.params];

  let coreSql: string;
  if (method === 'PATCH') {
    if (!patchBody || typeof patchBody !== 'object' || Array.isArray(patchBody)) {
      throw new RestError(400, 'PGRST102', 'Body do PATCH deve ser um objeto');
    }
    const colsTable = await tableColumns(client, table);
    const validCols = new Set(colsTable.map((c) => c.name));
    const keys = Object.keys(patchBody);
    for (const k of keys) {
      if (!isIdent(k)) {
        throw new RestError(400, 'PGRST100', `Nome de coluna inválido: ${k}`);
      }
      if (!validCols.has(k)) {
        throw new RestError(
          400,
          'PGRST204',
          `Could not find the "${k}" column of "${table}" in the schema cache`,
        );
      }
    }
    if (!keys.length) {
      throw new RestError(400, 'PGRST102', 'Body do PATCH está vazio');
    }
    const sets = keys
      .map((k) => {
        const dataType = colsTable.find((c) => c.name === k)!.dataType;
        const value = coerceJsonb(patchBody[k] ?? null, dataType);
        params.push(value);
        return `"${k}" = $${params.length}`;
      })
      .join(', ');
    coreSql = `UPDATE public."${table}" SET ${sets} WHERE ${where.whereSql} RETURNING *`;
  } else {
    coreSql = `DELETE FROM public."${table}" WHERE ${where.whereSql}`;
  }

  if (!opts.wantRepresentation) {
    const result = await client.query(coreSql, params);
    res.status(method === 'DELETE' ? 204 : 200);
    res.set('Content-Range', `*/${result.rowCount}`);
    res.end();
    return;
  }
  const rows = await representationRows(client, coreSql, params, table, opts);
  respondRows(res, rows, opts, null, method === 'PATCH' ? 200 : 200);
}

// ============================================
// REPRESENTAÇÃO (CTE + projeção)
// ============================================
async function representationRows(
  client: any,
  coreSql: string,
  params: unknown[],
  table: string,
  opts: RequestOpts,
): Promise<unknown[]> {
  const cols = await tableColumns(client, table);
  const wanted = cols.map((c) => c.name);
  const rowLimit = opts.objectSingle ? 'LIMIT 2' : '';
  const sql = `
    WITH act AS (
      ${coreSql}
    ), r AS (
      SELECT ${projection('act', cols, wanted)} FROM act${rowLimit ? ` ${rowLimit}` : ''}
    )
    SELECT COALESCE(jsonb_agg(to_jsonb(r)), '[]'::jsonb) AS data FROM r`;
  const result = await client.query(sql, params);
  const data = result.rows[0]?.data;
  return Array.isArray(data) ? (data as unknown[]) : [];
}

// ============================================
// RPC (POST /rest/v1/rpc/:fn) — ROTA REGISTRADA ANTES DE /:table
// ============================================
interface FnMeta {
  oid: number;
  ret: string;
  retset: boolean;
}

restRouter.post('/rpc/:fn', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fnName = assertIdent(String(req.params.fn ?? ''), 'nome de função');
    const args = (req.body ?? {}) as Record<string, unknown>;
    await withContext(res.locals.claims as JwtClaims, async (client) => {
      // Suporte a múltiplas overloads: escolhe por compatibilidade de args
      const metas = (await (client as any).query(
        `SELECT p.oid AS oid, pg_get_function_result(p.oid) AS ret,
                p.proretset::boolean AS retset
           FROM pg_proc p
           JOIN pg_namespace n ON n.oid = p.pronamespace
          WHERE n.nspname = 'public' AND p.proname = $1
          ORDER BY p.oid`,
        [fnName],
      )) as { rows: FnMeta[]; rowCount: number | null };
      if (metas.rowCount === 0) {
        throw new RestError(404, 'PGRST202', `Could not find the function public.${fnName} in the schema cache`);
      }
      const fnOid = metas.rows[0].oid;
      const ret = metas.rows[0].ret;
      const retset = !!metas.rows[0].retset;

      // Argumentos named-call: só os presentes; default do banco preenchido.
      const argTypes = await introspectArgs(client, fnOid);
      const presentArgs = argTypes.filter(
        (arg) => arg.name !== null && Object.prototype.hasOwnProperty.call(args, arg.name),
      );
      for (const arg of presentArgs) {
        if (!isIdent(arg.name!)) {
          throw new RestError(400, 'PGRST100', `nome de argumento inválido: ${arg.name}`);
        }
      }

      const callParts = presentArgs.map((arg, i) => `"${arg.name}" := $${i + 1}`);
      const callSql = retset
        ? `SELECT * FROM public."${fnName}"(${callParts.join(', ')})`
        : `SELECT public."${fnName}"(${callParts.join(', ')}) AS __result`;
      const callParams = presentArgs.map((arg) => args[arg.name!]);

      const ran = await client.query(callSql, callParams);
      if (ret === 'void') {
        res.status(204).end();
        return;
      }
      if (retset) {
        res.json(ran.rows);
        return;
      }
      res.json(ran.rows[0]?.__result ?? null);
    });
  } catch (e) {
    next(e);
  }
});

async function introspectArgs(client: any, fnOid: number): Promise<Array<{ name: string | null; type: string }>> {
  // args IN: proargtypes (oidvector) + proargnames alinhados por posição;
  // proargmodes char: i=in, o=out, b=inout, t=table, v=variadic.
  const meta = (await (client as any).query(
    `SELECT p.proargnames AS "argnames",
            ARRAY((SELECT format_type(x, NULL) FROM unnest(p.proargtypes::regtype[]) x)) AS "argtypes",
            COALESCE(p.proargmodes, '{}'::"char"[]) AS "argmode"
       FROM pg_proc p
      WHERE p.oid = $1`,
    [fnOid],
  )) as {
    rows: Array<{ argnames: unknown; argtypes: unknown; argmode: unknown }>;
  };
  const row = meta.rows[0];
  if (!row) return [];
  const names = (Array.isArray(row.argnames) ? row.argnames : []) as Array<string | null>;
  const types = (Array.isArray(row.argtypes) ? row.argtypes : []) as string[];
  // node-pg devolve "char"[] como TEXT ('{i,o}' ou '{}'): normaliza
  let modes: Array<string | null> = [];
  if (typeof row.argmode === 'string') {
    const raw = (row.argmode as string).replace(/^\{/, '').replace(/\}$/, '');
    modes = raw === '' ? [] : raw.split(',').map((s: string) => s.replace(/^"|"$/g, ''));
  } else if (Array.isArray(row.argmode)) {
    modes = row.argmode as Array<string | null>;
  }
  const out: Array<{ name: string | null; type: string }> = [];
  for (let i = 0; i < types.length; i++) {
    const mode = modes[i] ?? 'i';
    if (mode === 'i' || mode === 'b') {
      const name = names[i] ?? null;
      out.push({ name, type: types[i] });
    }
  }
  return out;
}

// ============================================
// routing: rpc antes de tabela genérica
// ============================================
restRouter.get('/:table', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const opts = parseOpts(req);
    const table = req.params.table === 'rpc' ? 'rpc' : req.params.table;
    const searchParams = new URL(req.url, 'http://x').searchParams;
    await withContext(res.locals.claims, async (client) => {
      await runGet(client, res, opts, table, searchParams, req.headers);
    });
  } catch (e) {
    next(e);
  }
});

restRouter.post('/:table', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const opts = parseOpts(req);
    const searchParams = new URL(req.url, 'http://x').searchParams;
    const body = (req.body ?? {}) as Record<string, unknown> | Record<string, unknown>[];
    await withContext(res.locals.claims, async (client) => {
      await runInsert(client, res, opts, req.params.table, searchParams, body);
    });
  } catch (e) {
    next(e);
  }
});

restRouter.patch('/:table', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const opts = parseOpts(req);
    const searchParams = new URL(req.url, 'http://x').searchParams;
    const body = (req.body ?? {}) as Record<string, unknown>;
    await withContext(res.locals.claims, async (client) => {
      await runUpdateOrDelete(client, res, opts, req.params.table, searchParams, 'PATCH', body);
    });
  } catch (e) {
    next(e);
  }
});

restRouter.delete('/:table', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const opts = parseOpts(req);
    const searchParams = new URL(req.url, 'http://x').searchParams;
    await withContext(res.locals.claims, async (client) => {
      await runUpdateOrDelete(client, res, opts, req.params.table, searchParams, 'DELETE');
    });
  } catch (e) {
    next(e);
  }
});

// handler de erros comum: converte para shape PostgREST
// eslint-disable-next-line @typescript-eslint/no-unused-vars
restRouter.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (res.headersSent) return;
  const { status, body } = pgErrorToRest(err);
  res.status(status).json(body);
});
