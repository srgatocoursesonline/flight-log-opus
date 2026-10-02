import { Router, type Request, type Response, type NextFunction } from 'express';
import express from 'express';
import { withContext, type JwtClaims } from '../db.js';
import { verifyAnyToken } from '../keys.js';

export const storageRouter = Router();

const jsonErr = (res: Response, status: number, message: string): void => {
  res.status(status).json({ error: message, message });
};

/**
 * Storage: claims OPTIONAL (download público <img> não manda apikey).
 * Sem header → anon (RLS do storage protege).
 */
storageRouter.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.claims = { sub: null, role: 'anon', aud: 'authenticated' } satisfies JwtClaims;
  const authz = (req.headers.authorization ?? '').toString();
  const apiKey = (req.headers.apikey ?? '').toString();
  const token = authz.startsWith('Bearer ') ? authz.slice(7).trim() : apiKey;
  if (token) {
    const { claims, expired } = verifyAnyToken(token);
    if (claims && !expired) {
      res.locals.claims = claims;
    }
  }
  next();
});

function parsePath(wildpath: string): string {
  return decodeURIComponent(wildpath).replace(/^\//, '');
}

// ============================================
// STATUS
// ============================================
storageRouter.get('/status', (_req, res) => {
  res.json({ status: 'ok' });
});

// ============================================
// BUCKETS
// ============================================
storageRouter.get('/bucket', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claims = res.locals.claims as JwtClaims;
    await withContext(claims, async (client) => {
      const rows = await client.query(
        `SELECT id, name, public, file_size_limit AS "file_size_limit",
                allowed_mime_types AS "allowed_mime_types", created_at, updated_at
           FROM storage.buckets
          ORDER BY name`,
      );
      res.json(rows.rows);
    });
  } catch (e) {
    next(e);
  }
});

storageRouter.get('/bucket/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claims = res.locals.claims as JwtClaims;
    await withContext(claims, async (client) => {
      const row = await client.query(
        `SELECT id, name, public, file_size_limit AS "file_size_limit",
                allowed_mime_types AS "allowed_mime_types", created_at, updated_at
           FROM storage.buckets WHERE id = $1`,
        [req.params.id],
      );
      if (row.rowCount === 0) return jsonErr(res, 404, 'Bucket not found');
      res.json(row.rows[0]);
    });
  } catch (e) {
    next(e);
  }
});

// ============================================
// LIST (POST /object/list/:bucket) — ANTES do upload genérico
// ============================================
const uploadRaw = express.raw({ type: () => true, limit: '16mb' });

storageRouter.post('/object/list/:bucket', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claims = res.locals.claims as JwtClaims;
    const bucket = req.params.bucket;
    const prefix = ((req.body?.prefix ?? '') as string) || '';
    const limit = Number(req.body?.limit ?? 100);
    const offset = Number(req.body?.offset ?? 0);
    await withContext(claims, async (client) => {
      const bucketRow = await client.query(`SELECT * FROM storage.buckets WHERE id = $1`, [bucket]);
      if (bucketRow.rowCount === 0) return jsonErr(res, 404, 'Bucket not found');
      const rows = await client.query(
        `SELECT id, name, metadata, created_at, updated_at
           FROM storage.objects
          WHERE bucket_id = $1 AND name LIKE $2
          ORDER BY name
          LIMIT $3 OFFSET $4`,
        [bucket, `${prefix}%`, limit, offset],
      );
      res.json(
        rows.rows.map((r: any) => ({
          name: r.name,
          id: r.id,
          metadata: r.metadata ?? {},
          created_at: r.created_at,
          updated_at: r.updated_at,
        })),
      );
    });
  } catch (e) {
    next(e);
  }
});

// ============================================
// UPLOAD (POST /object/:bucket/:path) — raw bytes
// ============================================
function extractObjectPath(req: Request): { bucket: string; name: string } | null {
  // multi-segment: /object/:bucket/:path...
  let base = (req.originalUrl ?? '').split('?')[0];
  base = base.replace(/^.*?\/storage\/v1/, '');
  const m = base.match(/^\/object\/([^/]+)\/(.+)$/);
  if (m) {
    return { bucket: decodeURIComponent(m[1]), name: parsePath(m[2]) };
  }
  const m2 = base.match(/^\/object\/([^/]+)$/);
  if (m2) {
    const name = ((req.query.name ?? '') as string) || '';
    if (!name) return null;
    return { bucket: decodeURIComponent(m2[1]), name: parsePath(name) };
  }
  return null;
}

storageRouter.post(
  /\/object\/.*/,
  uploadRaw,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loc = extractObjectPath(req);
      if (!loc) return jsonErr(res, 400, 'Path necessário para upload');
      const claims = res.locals.claims as JwtClaims;
      const mimetype = (req.headers['content-type'] ?? '').toString().split(';')[0] || 'application/octet-stream';
      const content: Buffer = Buffer.isBuffer(req.body)
        ? req.body
        : Buffer.from(typeof req.body === 'string' ? req.body : '');
      const wasUpsert = (req.headers['x-upsert'] ?? 'true').toString() === 'true';

      await withContext(claims, async (client) => {
        const bucketRow = await client.query(`SELECT * FROM storage.buckets WHERE id = $1`, [loc.bucket]);
        if (bucketRow.rowCount === 0) return jsonErr(res, 404, 'Bucket not found');
        if (bucketRow.rows[0].file_size_limit && content.length > Number(bucketRow.rows[0].file_size_limit)) {
          return jsonErr(res, 413, 'Arquivo excede o limite do bucket');
        }
        const exists = await client.query(
          `SELECT id FROM storage.objects WHERE bucket_id = $1 AND name = $2`,
          [loc.bucket, loc.name],
        );
        let id: string;
        if (exists.rowCount > 0) {
          if (!wasUpsert) return jsonErr(res, 409, 'The resource already exists');
          id = exists.rows[0].id;
          await client.query(
            `UPDATE storage.objects
                SET content = $1, metadata = $2::jsonb, updated_at = now()
              WHERE id = $3`,
            [content, JSON.stringify({ mimetype, size: content.length, lastModified: new Date().toISOString() }), id],
          );
        } else {
          const inserted = await client.query(
            `INSERT INTO storage.objects (bucket_id, name, owner_id, metadata, content)
             VALUES ($1, $2, $3, $4::jsonb, $5)
             RETURNING id`,
            [
              loc.bucket,
              loc.name,
              claims.sub,
              JSON.stringify({ mimetype, size: content.length, lastModified: new Date().toISOString() }),
              content,
            ],
          );
          id = inserted.rows[0].id;
        }
        res.status(200).json({ Id: id, Key: `${loc.bucket}/${loc.name}` });
      });
    } catch (e) {
      next(e);
    }
  },
);

// ============================================
// DOWNLOAD público (GET /object/public/:bucket/:path)
// ============================================
storageRouter.get(
  /^\/object\/public\/([^/]+)\/(.+)$/,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let bucket = String(req.params[0] ?? '');
      let name = String(req.params[1] ?? '');
      if (!bucket) {
        // fallback via originalUrl
        const base = (req.originalUrl ?? '').split('?')[0].replace(/^.*?\/storage\/v1/, '');
        const m = base.match(/^\/object\/public\/([^/]+)\/(.+)$/);
        if (!m) return jsonErr(res, 400, 'rota inválida');
        bucket = decodeURIComponent(m[1]);
        name = parsePath(m[2]);
      } else {
        name = parsePath(name);
        bucket = decodeURIComponent(bucket);
      }
      const claims = res.locals.claims as JwtClaims; // anon ok
      await withContext(claims, async (client) => {
        const row = await client.query(
          `SELECT o.metadata, o.content, b.public
             FROM storage.objects o
             JOIN storage.buckets b ON b.id = o.bucket_id
            WHERE o.bucket_id = $1 AND o.name = $2`,
          [bucket, name],
        );
        if (row.rowCount === 0) return jsonErr(res, 404, 'Object not found');
        const obj = row.rows[0];
        if (!obj.public) return jsonErr(res, 401, 'Bucket não é público');
        if (obj.content) {
          const metadata = obj.metadata ?? {};
          res.setHeader('Content-Type', metadata.mimetype ?? 'application/octet-stream');
          res.setHeader('Cache-Control', 'public, max-age=3600');
          res.send(obj.content);
          return;
        }
        res.status(404).json({ error: 'Object not found', message: 'Object not found' });
      });
    } catch (e) {
      next(e);
    }
  },
);

// ============================================
// DOWNLOAD autenticado (GET /object/:bucket/:path)
// ============================================
storageRouter.get(
  /^\/object\/([^/]+)\/(.+)$/,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const base = (req.originalUrl ?? '').split('?')[0].replace(/^.*?\/storage\/v1/, '');
      const m = base.match(/^\/object\/([^/]+)\/(.+)$/);
      if (!m) return jsonErr(res, 400, 'rota inválida');
      const bucket = decodeURIComponent(m[1]);
      const name = parsePath(m[2]);
      const claims = res.locals.claims as JwtClaims;
      await withContext(claims, async (client) => {
        const row = await client.query(
          `SELECT o.metadata, o.content FROM storage.objects o WHERE o.bucket_id = $1 AND o.name = $2`,
          [bucket, name],
        );
        if (row.rowCount === 0) return jsonErr(res, 404, 'Object not found');
        const metadata = row.rows[0].metadata ?? {};
        res.setHeader('Content-Type', metadata.mimetype ?? 'application/octet-stream');
        res.send(row.rows[0].content);
      });
    } catch (e) {
      next(e);
    }
  },
);

// ============================================
// DELETE (DELETE /object/:bucket/:path)
// ============================================
storageRouter.delete(
  /^\/object\/([^/]+)\/(.+)$/,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const base = (req.originalUrl ?? '').split('?')[0].replace(/^.*?\/storage\/v1/, '');
      const m = base.match(/^\/object\/([^/]+)\/(.+)$/);
      if (!m) return jsonErr(res, 400, 'rota inválida');
      const bucket = decodeURIComponent(m[1]);
      const name = parsePath(m[2]);
      const claims = res.locals.claims as JwtClaims;
      await withContext(claims, async (client) => {
        const deleted = await client.query(
          `DELETE FROM storage.objects WHERE bucket_id = $1 AND name = $2 RETURNING id`,
          [bucket, name],
        );
        res.json(deleted.rowCount ? [{ id: deleted.rows[0].id }] : []);
      });
    } catch (e) {
      next(e);
    }
  },
);
