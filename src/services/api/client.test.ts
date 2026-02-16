import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('api client mock-backed helpers', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'true';
  });

  it('returns mock owner registration payload', async () => {
    const { registerOwner } = await import('./client');
    const result = await registerOwner('token', { fname: 'Alice' });

    expect(result.success).toBe(true);
    expect(result.message).toContain('registered');
  });

  it('returns mock pet registration payload', async () => {
    const { registerPet } = await import('./client');
    const result = await registerPet('token', { name: 'Milo' });

    expect(result.success).toBe(true);
    expect(result.message).toContain('registered');
  });

  it('returns mock pet detail', async () => {
    const { getPetDetail } = await import('./client');
    const pet = await getPetDetail('token', '430242');

    expect(pet._id).toBe('430242');
    expect(pet.name).toBe('Mochi');
  });

  it('returns mock symptom record detail', async () => {
    const { getSymptomRecordDetail } = await import('./client');
    const detail = await getSymptomRecordDetail('token', 'sym_001');

    expect(detail._id).toBe('sym_001');
    expect(detail.note).toContain('Vomited');
  });

  it('returns mock presigned url and allows delete image', async () => {
    const { getPresignedUrl, deleteImage } = await import('./client');

    const upload = await getPresignedUrl('token', 'image/jpeg', 'pet-profile');
    expect(upload.uploadUrl).toContain('mock-r2-upload-url.com');

    await expect(deleteImage('pet-profile/mock.jpg', 'token')).resolves.toBeUndefined();
  });
});
