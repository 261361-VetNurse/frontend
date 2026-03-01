import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { compress } from 'hono/compress';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const app = new Hono();

// Enable compression
app.use('*', compress());

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

// Basic health check
app.get('/api/health', (c) => {
    return c.json({ status: 'ok' });
});

// Presigned URL for R2 uploads
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
        console.error('[presigned-url] Failed to generate presigned URL:', error);
        return c.json({ detail: 'Failed to generate upload URL' }, 500);
    }
});

// Serve frontend static assets
app.use('/assets/*', async (c, next) => {
    c.header('Cache-Control', 'public, max-age=31536000, immutable');
    await next();
});
app.use('/assets/*', serveStatic({ root: './dist' }));
app.use('/vite.svg', serveStatic({ root: './dist' }));
app.use('/*.*', serveStatic({ root: './dist' }));

// SPA fallback: Send all other requests to index.html for client-side routing
app.get('*', async (c) => {
    try {
        const file = Bun.file('./dist/index.html');
        return c.html(await file.text());
    } catch (e) {
        return c.text('Frontend not built. Run `bun run build` first.', 404);
    }
});

// Graceful shutdown handling for container environments
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Export for Bun to serve
const port = parseInt(process.env.PORT || '3000', 10);

export default {
    port,
    fetch: app.fetch,
};
