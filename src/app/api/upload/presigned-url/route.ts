import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { filename, content_type, folder = 'pets' } = body;

        // Validation
        if (!filename || !content_type) {
            return NextResponse.json(
                { detail: 'Filename and content_type are required' },
                { status: 400 }
            );
        }

        // Validate folder to prevent path traversal or messy storage
        const allowedFolders = ['pets', 'users', 'records'];
        const targetFolder = allowedFolders.includes(folder) ? folder : 'pets';

        // R2 Configuration
        const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
        const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
        const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
        const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
        const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

        if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
            console.error('Missing R2 environment variables');
            return NextResponse.json(
                { detail: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Initialize S3 Client
        const s3Client = new S3Client({
            region: 'auto',
            endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: R2_ACCESS_KEY_ID,
                secretAccessKey: R2_SECRET_ACCESS_KEY,
            },
        });

        // Generate Unique Filename
        const fileExt = filename.split('.').pop() || 'jpg';
        const uniqueFilename = `${targetFolder}/${crypto.randomUUID()}.${fileExt}`;

        // Generate Presigned URL
        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: uniqueFilename,
            ContentType: content_type,
        });

        // Sign the URL (expires in 1 hour)
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
        console.error('Presigned URL generation failed:', error);
        return NextResponse.json(
            { detail: 'Failed to generate upload URL' },
            { status: 500 }
        );
    }
}
