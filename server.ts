import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { compress } from 'hono/compress';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const app = new Hono();

// ── Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, etc.)
app.use('*', secureHeaders());

// Enable compression
app.use('*', compress());

// ── CORS — restrict to explicit allowed origins, not wildcard ────────────────
const ALLOWED_ORIGINS = [
    process.env.VITE_WEB_URL,
    'http://localhost:5173',
    'http://localhost:3000',
].filter(Boolean) as string[];

app.use('*', cors({
    origin: (origin) => {
        if (!origin) return ALLOWED_ORIGINS[0] || '';
        return ALLOWED_ORIGINS.includes(origin) ? origin : '';
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
    credentials: true,
    maxAge: 3600,
}));

// S3 Client Setup
const {
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME,
    VITE_R2_PUBLIC_URL,
} = process.env;

const R2_PUBLIC_URL = VITE_R2_PUBLIC_URL;

const s3Client =
    R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY
        ? new S3Client({
            region: 'auto',
            endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: R2_ACCESS_KEY_ID,
                secretAccessKey: R2_SECRET_ACCESS_KEY,
            },
        })
        : null;

const ALLOWED_FOLDERS = ['pets', 'users', 'records'] as const;

// ── Backend reverse proxy ────────────────────────────────────────────────────
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

async function proxyToBackend(c: any) {
    const url = new URL(c.req.url);
    const targetUrl = `${BACKEND_URL}${url.pathname}${url.search}`;

    const headers = new Headers(c.req.raw.headers);
    headers.delete('host');

    const body = ['GET', 'HEAD'].includes(c.req.method) ? undefined : c.req.raw.body;

    try {
        const response = await fetch(targetUrl, {
            method: c.req.method,
            headers,
            body,
        });
        return new Response(response.body, {
            status: response.status,
            headers: response.headers,
        });
    } catch (err) {
        // Only log in development — in production pipe to your error reporter
        if (process.env.NODE_ENV !== 'production') {
            console.error('[proxy] Backend unreachable:', err);
        }
        return c.json({ detail: 'Backend unavailable' }, 502);
    }
}

app.all('/v1/*', proxyToBackend);
app.all('/auth/line/*', proxyToBackend);
app.all('/auth/me', proxyToBackend);
app.all('/auth/notify/*', proxyToBackend);

// ── Basic health check ───────────────────────────────────────────────────────
app.get('/api/health', (c) => {
    return c.json({ status: 'ok' });
});

// ── Session management (HttpOnly cookie auth) ───────────────────────────────
const COOKIE_NAME = 'auth-token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * POST /api/auth/session
 * Body: { token: string }
 * Validates the JWT against the backend, then sets an HttpOnly cookie and returns the user.
 */
app.post('/api/auth/session', async (c) => {
    try {
        const { token } = await c.req.json<{ token: string }>();
        if (!token || typeof token !== 'string') {
            return c.json({ detail: 'Token is required' }, 400);
        }

        // Validate token by calling backend /auth/me
        const meResponse = await fetch(`${BACKEND_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!meResponse.ok) {
            return c.json({ detail: 'Invalid or expired token' }, 401);
        }

        const user = await meResponse.json();

        // Set HttpOnly, SameSite=Strict cookie
        const cookieAttributes = [
            `${COOKIE_NAME}=${token}`,
            'Path=/',
            'HttpOnly',
            'SameSite=Strict',
            `Max-Age=${COOKIE_MAX_AGE}`,
            ...(IS_PRODUCTION ? ['Secure'] : []),
        ].join('; ');

        c.header('Set-Cookie', cookieAttributes);
        return c.json({ user });
    } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('[session] Failed to create session:', err);
        }
        return c.json({ detail: 'Failed to create session' }, 500);
    }
});

/**
 * GET /api/auth/session
 * Reads the auth-token cookie, validates with backend, returns user.
 */
app.get('/api/auth/session', async (c) => {
    const cookieHeader = c.req.header('Cookie') || '';
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
    const token = match?.[1];

    if (!token) {
        return c.json({ detail: 'No session' }, 401);
    }

    try {
        const meResponse = await fetch(`${BACKEND_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!meResponse.ok) {
            // Clear invalid cookie
            c.header('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`);
            return c.json({ detail: 'Session expired' }, 401);
        }

        const user = await meResponse.json();
        // Also return the token so client can use it for Authorization headers in API calls
        return c.json({ user, token });
    } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('[session] Failed to validate session:', err);
        }
        return c.json({ detail: 'Session validation failed' }, 500);
    }
});

/**
 * DELETE /api/auth/session
 * Clears the auth cookie (logout).
 */
app.delete('/api/auth/session', (c) => {
    c.header('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`);
    return c.json({ ok: true });
});

// ── Presigned URL for R2 uploads ─────────────────────────────────────────────
app.post('/api/upload/presigned-url', async (c) => {
    if (!s3Client || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
        return c.json({ detail: 'Server configuration error' }, 500);
    }

    try {
        const body = await c.req.json();
        const { filename, content_type, folder = 'pets' } = body;

        if (!filename || !content_type) {
            return c.json({ detail: 'Filename and content_type are required' }, 400);
        }

        const targetFolder = ALLOWED_FOLDERS.includes(folder) ? folder : 'pets';
        const fileExt = filename.split('.').pop() || 'jpg';
        const uniqueFilename = `${targetFolder}/${crypto.randomUUID()}.${fileExt}`;

        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: uniqueFilename,
            ContentType: content_type,
        });

        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        const normalizedPublicUrl = R2_PUBLIC_URL.replace(/\/+$/, '');
        const publicUrl = `${normalizedPublicUrl}/${uniqueFilename}`;

        return c.json({
            success: true,
            upload_url: uploadUrl,
            public_url: publicUrl,
            filename: uniqueFilename,
        });
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('[presigned-url] Failed to generate presigned URL:', error);
        }
        return c.json({ detail: 'Failed to generate upload URL' }, 500);
    }
});

// ── Serve frontend static assets with long-term cache ────────────────────────
app.use('/assets/*', async (c, next) => {
    c.header('Cache-Control', 'public, max-age=31536000, immutable');
    await next();
});
app.use('/assets/*', serveStatic({ root: './dist' }));

// ── Serve all other static files (SVG, PNG, ICO, JS, CSS, etc.) via Bun.file
app.get('/*', async (c, next) => {
    const url = new URL(c.req.url);
    const pathname = url.pathname;

    // Only handle paths that look like files (have an extension)
    if (!pathname.match(/\.[a-zA-Z0-9]+$/)) {
        return next();
    }

    try {
        const file = Bun.file(`./dist${pathname}`);
        if (await file.exists()) {
            const ext = pathname.split('.').pop()?.toLowerCase();
            const mimeTypes: Record<string, string> = {
                svg: 'image/svg+xml',
                png: 'image/png',
                jpg: 'image/jpeg',
                jpeg: 'image/jpeg',
                gif: 'image/gif',
                webp: 'image/webp',
                ico: 'image/x-icon',
                js: 'application/javascript',
                css: 'text/css',
                json: 'application/json',
                woff: 'font/woff',
                woff2: 'font/woff2',
                ttf: 'font/ttf',
            };
            const contentType = ext && mimeTypes[ext] ? mimeTypes[ext] : 'application/octet-stream';
            return new Response(file, {
                headers: { 'Content-Type': contentType },
            });
        }
    } catch (_) {
        // fall through to SPA
    }
    return next();
});

// ── SPA fallback ─────────────────────────────────────────────────────────────
app.get('*', async (c) => {
    try {
        const file = Bun.file('./dist/index.html');
        return c.html(await file.text());
    } catch (e) {
        return c.text('Frontend not built. Run `bun run build` first.', 404);
    }
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
process.on('SIGTERM', () => {
    process.exit(0);
});

process.on('SIGINT', () => {
    process.exit(0);
});

const port = parseInt(process.env.PORT || '3000', 10);

export default {
    port,
    fetch: app.fetch,
};
