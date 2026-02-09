import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

export async function POST(request: NextRequest) {
    try {
        if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
            console.error("Missing R2 configuration");
            return NextResponse.json(
                { success: false, detail: "Server misconfiguration: R2 credentials missing" },
                { status: 500 }
            );
        }

        const { fileType, folder } = await request.json();

        if (!fileType) {
            return NextResponse.json(
                { success: false, detail: "File type is required" },
                { status: 400 }
            );
        }

        const S3 = new S3Client({
            region: 'auto',
            endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: R2_ACCESS_KEY_ID,
                secretAccessKey: R2_SECRET_ACCESS_KEY,
            },
        });

        // Generate unique filename
        const uniqueId = Math.random().toString(36).substring(2, 15);
        const extension = fileType.split('/')[1] || 'bin';
        const objectKey = `${folder ? folder + '/' : ''}${Date.now()}-${uniqueId}.${extension}`;

        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: objectKey,
            ContentType: fileType,
        });

        const uploadUrl = await getSignedUrl(S3, command, { expiresIn: 3600 });
        const publicUrl = R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${objectKey}` : uploadUrl.split('?')[0];

        return NextResponse.json({
            success: true,
            data: {
                uploadUrl,
                publicUrl,
                objectKey
            }
        });

    } catch (error) {
        console.error("Error generating presigned URL:", error);
        return NextResponse.json(
            { success: false, detail: "Failed to generate upload URL" },
            { status: 500 }
        );
    }
}
