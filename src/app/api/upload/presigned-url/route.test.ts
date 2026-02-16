import { beforeEach, describe, expect, it, vi } from 'vitest';

const getSignedUrlMock = vi.fn();
const s3ClientMock = vi.fn();
const putObjectCommandMock = vi.fn();

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: (...args: unknown[]) => getSignedUrlMock(...args),
}));

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: function S3Client(...args: unknown[]) {
    s3ClientMock(...args);
  },
  PutObjectCommand: function PutObjectCommand(...args: unknown[]) {
    putObjectCommandMock(...args);
  },
}));

describe('upload/presigned-url route', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete process.env.R2_ACCOUNT_ID;
    delete process.env.R2_ACCESS_KEY_ID;
    delete process.env.R2_SECRET_ACCESS_KEY;
    delete process.env.R2_BUCKET_NAME;
    delete process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  });

  it('returns 500 when required R2 env config is missing', async () => {
    const mod = await import('./route');

    const req = new Request('http://localhost/api/upload/presigned-url', {
      method: 'POST',
      body: JSON.stringify({ fileType: 'image/jpeg', folder: 'pet-profile' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await mod.POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.detail).toContain('R2 credentials missing');
  });

  it('returns 400 when fileType is missing', async () => {
    process.env.R2_ACCOUNT_ID = 'acc';
    process.env.R2_ACCESS_KEY_ID = 'key';
    process.env.R2_SECRET_ACCESS_KEY = 'secret';
    process.env.R2_BUCKET_NAME = 'bucket';

    const mod = await import('./route');

    const req = new Request('http://localhost/api/upload/presigned-url', {
      method: 'POST',
      body: JSON.stringify({ folder: 'pet-profile' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await mod.POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.detail).toBe('File type is required');
  });

  it('returns 500 when signed-url generation throws', async () => {
    process.env.R2_ACCOUNT_ID = 'acc';
    process.env.R2_ACCESS_KEY_ID = 'key';
    process.env.R2_SECRET_ACCESS_KEY = 'secret';
    process.env.R2_BUCKET_NAME = 'bucket';
    getSignedUrlMock.mockRejectedValueOnce(new Error('s3 failure'));

    const mod = await import('./route');

    const req = new Request('http://localhost/api/upload/presigned-url', {
      method: 'POST',
      body: JSON.stringify({ fileType: 'image/png', folder: 'pet-profile' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await mod.POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.detail).toBe('Failed to generate upload URL');
  });
});
