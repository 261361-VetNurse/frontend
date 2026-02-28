import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// ---------------------------------------------------------------------------
// Singleton S3Client — instantiated ONCE per cold start, not per request.
// Re-instantiating on every request creates N connection pools in memory.
// ---------------------------------------------------------------------------
const {
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME,
    NEXT_PUBLIC_R2_PUBLIC_URL: R2_PUBLIC_URL,
} = process.env;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
    // Fail loudly at startup so misconfiguration is caught immediately in logs.
    console.error('[presigned-url] Missing R2 environment variables. Upload route will return 500 for all requests.');
}

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

export async function POST(request: NextRequest) {
    if (!s3Client || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
        return NextResponse.json(
            { detail: 'Server configuration error' },
            { status: 500 }
        );
    }

    try {
        const body = await request.json();
        const { filename, content_type, folder = 'pets' } = body;

        if (!filename || !content_type) {
            return NextResponse.json(
                { detail: 'Filename and content_type are required' },
                { status: 400 }
            );
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

        return NextResponse.json({
            success: true,
            upload_url: uploadUrl,
            public_url: publicUrl,
            filename: uniqueFilename,
        });
    } catch (error) {
        console.error('[presigned-url] Failed to generate presigned URL:', error);
        return NextResponse.json(
            { detail: 'Failed to generate upload URL' },
            { status: 500 }
        );
    }
}
