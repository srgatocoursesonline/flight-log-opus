/**
 * Tradutor PostgREST → SQL (subset necessário ao escopo do app).
 *
 * Formato de filtros (padrão PostgREST): `coluna=op.valor` na query string.
 * Suporta: eq/neq/gt/gte/lt/lte/like/ilike/in/is + or(...) com um nível
 * de profundidade. NOT via `col=not.op.valor`.
 */
import type { PoolClient } from 'pg';

export interface RestErrorPayload {
  status: number;
  code: string;
  message: string;
  details: string | null;
  hint: string | null;
}

export class RestError extends Error {
  status: number;
  code: string;
  details: string | null;
  hint: string | null;

  constructor(status: number, code: string, message: string, details: string | null = null, hint: string | null = null) {
    super(message);
    this.name = 'RestError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.hint = hint;
  }
}

const IDENT_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;
const TIMESTAMP_TYPES = new Set(['timestamp with time zone']);
const RESERVED_KEYS = new Set(['select', 'order', 'limit', 'offset', 'on_conflict', 'count', 'columns', 'id_column']);
const FILTER_OPS = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'in', 'is'];

export function assertIdent(name: string, label = 'identificador'): string {
  if (!IDENT_RE.test(name)) {
    throw new RestError(400, 'PGRST100', `${label} inválido: ${name}`);
  }
  return name;
}

export interface ColumnInfo {
  name: string;
  dataType: string;
}

const colsCache = new Map<string, ColumnInfo[]>();
const pkCache = new Map<string, string[]>();

export async function tableColumns(client: PoolClient, table: string): Promise<ColumnInfo[]> {
  const cached = colsCache.get(table);
  if (cached) return cached;
  const res: { rows: ColumnInfo[] } = await client.query(
    `SELECT c.column_name AS name, c.data_type AS "dataType"
       FROM information_schema.columns c
      WHERE c.table_schema = $1 AND c.table_name = $2
      ORDER BY c.ordinal_position`,
    ['public', table],
  );
  if (!res.rows.length) {
    throw new RestError(404, 'PGRST205', `Could not find the table "${table}" in the schema cache`, null, 'Tabela não existe no schema public');
  }
  colsCache.set(table, res.rows);
  return res.rows;
}

export async function tablePKs(client: PoolClient, table: string): Promise<string[]> {
  const cached = pkCache.get(table);
  if (cached) return cached;
  const res: { rows: Array<{ name: string }> } = await client.query(
    `SELECT a.attname AS name
       FROM pg_index i
       JOIN pg_class c ON c.oid = i.indrelid
       JOIN pg_namespace n ON n.oid = c.relnamespace
       LEFT JOIN LATERAL unnest(i.indkey) WITH ORDINALITY AS k(attnum, ord) ON true
       JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = k.attnum
      WHERE i.indisprimary AND n.nspname = 'public' AND c.relname = $1
      ORDER BY k.ord`,
    [table],
  );
  const pks = res.rows.map((r) => r.name);
  pkCache.set(table, pks);
  return pks;
}

export function invalidateSchemaCache(): void {
  colsCache.clear();
  pkCache.clear();
}

// ============================================
// FORMAT TIMESTAMPTZ para RFC3339 (igual PostgREST)
// ============================================
function fmtExpr(alias: string, name: string, dataType: string): string {
  if (TIMESTAMP_TYPES.has(dataType)) {
    return `to_char("${alias}"."${name}" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"+00:00"')`;
  }
  return `"${alias}"."${name}"`;
}

// ============================================
// PROJEÇÃO
// ============================================
export async function projectionColumns(
  client: PoolClient,
  table: string,
  selectArg: string | null,
): Promise<{ cols: ColumnInfo[]; wanted: string[] }> {
  const cols = await tableColumns(client, table);
  const all = cols.map((c) => c.name);
  if (!selectArg || selectArg.trim() === '' || selectArg.trim() === '*') {
    return { cols, wanted: all };
  }
  const wanted: string[] = [];
  for (const raw of selectArg.split(',')) {
    const part = raw.trim();
    if (!part) continue;
    if (part === '*') {
      wanted.push(...all);
      continue;
    }
    if (part.includes('(') || part.includes(':')) {
      throw new RestError(400, 'PGRST203', `Selects com relações embutidas não são suportados: "${part}"`);
    }
    if (!cols.some((c) => c.name === part)) {
      throw new RestError(400, 'PGRST210', `Could not find column "${part}" in the schema cache`);
    }
    wanted.push(part);
  }
  return { cols, wanted: wanted.length ? wanted : all };
}

export function projectionSql(alias: string, cols: ColumnInfo[], wanted: string[]): string {
  return wanted
    .map((n) => {
      const dt = cols.find((c) => c.name === n)!.dataType;
      return `${fmtExpr(alias, n, dt)} AS "${n}"`;
    })
    .join(', ');
}

// ============================================
// FILTROS
// ============================================
interface WhereResult {
  whereSql: string;
  params: unknown[];
}

function pushParam(params: unknown[], value: string): string {
  params.push(value);
  return `$${params.length}`;
}

function renderSingleFilter(col: string, op: string, value: string, columns: ColumnInfo[], params: unknown[]): string {
  const colInfo = columns.find((c) => c.name === col);
  if (!colInfo) {
    throw new RestError(400, 'PGRST210', `Could not find column "${col}" in the schema cache`);
  }
  assertIdent(col);
  switch (op) {
    case 'eq':
      if (value === 'null') return `"${col}" IS NULL`;
      if (value === 'true' || value === 'false') return `"${col}" = ${pushParam(params, value)}::boolean`;
      return `"${col}" = ${pushParam(params, value)}`;
    case 'neq':
      if (value === 'null') return `"${col}" IS DISTINCT FROM NULL`;
      return `"${col}" <> ${pushParam(params, value)}`;
    case 'gt':
      return `"${col}" > ${pushParam(params, value)}`;
    case 'gte':
      return `"${col}" >= ${pushParam(params, value)}`;
    case 'lt':
      return `"${col}" < ${pushParam(params, value)}`;
    case 'lte':
      return `"${col}" <= ${pushParam(params, value)}`;
    case 'like': {
      let pattern = value;
      if (!pattern.includes('%')) pattern = `%${pattern}`;
      return `"${col}" LIKE ${pushParam(params, pattern.replace(/\*/g, '%'))}`;
    }
    case 'ilike': {
      let pattern = value;
      if (!pattern.includes('%')) pattern = `%${pattern}`;
      return `"${col}" ILIKE ${pushParam(params, pattern.replace(/\*/g, '%'))}`;
    }
    case 'in': {
      const listStr = value.replace(/^\(/, '').replace(/\)$/, '');
      const items: string[] = [];
      let buf = '';
      let inQuote = false;
      let quoteChar = '';
      for (const ch of listStr) {
        if (inQuote) {
          if (ch === quoteChar) inQuote = false;
          else buf += ch;
        } else if (ch === '"' || ch === '\'') {
          inQuote = true;
          quoteChar = ch;
        } else if (ch === ',') {
          items.push(buf);
          buf = '';
        } else {
          buf += ch;
        }
      }
      if (buf !== '') items.push(buf);
      if (!items.length) return 'FALSE';
      const placeholders = items.map((v) => pushParam(params, v));
      return `"${col}" IN (${placeholders.join(', ')})`;
    }
    case 'is': {
      const v = value.toLowerCase();
      if (v === 'null') return `"${col}" IS NULL`;
      if (v === 'true') return `"${col}" IS TRUE`;
      if (v === 'false') return `"${col}" IS FALSE`;
      return `"${col}" = ${pushParam(params, value)}`;
    }
    default:
      throw new RestError(400, 'PGRST100', `operador não suportado: ${op}`);
  }
}

/** Parse `op.valor` (com not. prefixo) e renderiza com params compartilhados. */
function parseAndRenderClause(col: string, value: string, columns: ColumnInfo[], params: unknown[]): string {
  const firstDot = value.indexOf('.');
  if (firstDot === -1) {
    throw new RestError(400, 'PGRST100', `filtro inválido: ${col}`);
  }
  let op = value.slice(0, firstDot);
  let rest = value.slice(firstDot + 1);
  let negate = false;
  if (op === 'not') {
    const subDot = rest.indexOf('.');
    if (subDot === -1) {
      throw new RestError(400, 'PGRST100', `filtro not inválido: ${col}`);
    }
    op = rest.slice(0, subDot);
    rest = rest.slice(subDot + 1);
    negate = true;
  }
  if (!FILTER_OPS.includes(op)) {
    throw new RestError(400, 'PGRST100', `operador não suportado: ${op}`);
  }
  const sql = renderSingleFilter(col, op, rest, columns, params);
  return negate ? `NOT (${sql})` : sql;
}

export async function buildWhere(
  client: PoolClient,
  table: string,
  searchParams: URLSearchParams,
): Promise<WhereResult> {
  const columns = await tableColumns(client, table);
  const params: unknown[] = [];
  const clauses: string[] = [];
  const orClauses: string[] = [];

  for (const [colRaw, valueRaw] of searchParams.entries()) {
    if (RESERVED_KEYS.has(colRaw)) continue;
    const col = assertIdent(colRaw, 'coluna');

    if (col === 'or') {
      // valor: (col.eq.val,col.eq.val)
      const inner = valueRaw.replace(/^\(/, '').replace(/\)$/, '');
      const perClause: string[] = [];
      for (const clause of splitTop(inner)) {
        const dot = clause.indexOf('.');
        if (dot === -1) {
          throw new RestError(400, 'PGRST100', `or() inválido: ${clause}`);
        }
        const orCol = assertIdent(clause.slice(0, dot));
        perClause.push(parseAndRenderClause(orCol, clause.slice(dot + 1), columns, params));
      }
      orClauses.push(`(${perClause.join(' OR ')})`);
      continue;
    }

    clauses.push(parseAndRenderClause(col, valueRaw, columns, params));
  }

  const base = clauses.length ? clauses.join(' AND ') : 'TRUE';
  let whereSql = base;
  if (orClauses.length) {
    whereSql = `(${base}) AND (${orClauses.join(' OR ')})`;
  }
  return { whereSql, params };
}

function splitTop(s: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let buf = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(buf);
      buf = '';
      continue;
    }
    buf += ch;
  }
  if (buf) parts.push(buf);
  return parts;
}

// ============================================
// ORDER
// ============================================
export function buildOrderOpt(orderParam: string | undefined, cols: ColumnInfo[]): string {
  if (!orderParam) return '';
  const byName = new Set(cols.map((c) => c.name));
  const fragments: string[] = [];
  for (const rawPart of orderParam.split(',')) {
    const part = rawPart.trim();
    if (!part) continue;
    const items = part.split('.');
    const col = assertIdent(items[0]);
    if (!byName.has(col)) {
      throw new RestError(400, 'PGRST210', `Could not find column "${col}" in the schema cache`);
    }
    let dir: 'ASC' | 'DESC' = 'ASC';
    let nulls: 'FIRST' | 'LAST' | undefined;
    for (const item of items.slice(1)) {
      if (item === 'asc') dir = 'ASC';
      else if (item === 'desc') dir = 'DESC';
      else if (item === 'nullslast') nulls = 'LAST';
      else if (item === 'nullsfirst') nulls = 'FIRST';
      else throw new RestError(400, 'PGRST100', `order inválido: ${part}`);
    }
    fragments.push(`"${col}" ${dir}${nulls ? ` NULLS ${nulls}` : ''}`);
  }
  return fragments.length ? `ORDER BY ${fragments.join(', ')}` : '';
}
