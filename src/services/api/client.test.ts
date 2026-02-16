import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('api client helpers', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('registers owner profile', async () => {
    const { registerOwner } = await import('./client');
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'registered' }), { status: 200 })
    );

    const result = await registerOwner('token', {
      first_name: 'Alice',
      last_name: 'Lee',
      phone: '0811111111',
      email: 'alice@example.com',
      address_line1: '1 Main St',
      subdistrict: 'Suthep',
      district: 'Mueang',
      province: 'Chiang Mai',
      postal_code: '50000',
    });

    expect(result.message).toBeTruthy();
    expect(result.message).toContain('registered');
  });

  it('registers pet profile', async () => {
    const { registerPet } = await import('./client');
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'registered', pet_id: 99 }), { status: 200 })
    );
    const result = await registerPet('token', {
      name: 'Milo',
      species: 'Dog',
      gender: 'Male',
      birth_date: '2024-01-01',
    });

    expect(result.pet_id).toBe(99);
  });

  it('loads pet detail', async () => {
    const { getPetDetail } = await import('./client');
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: { pet_id: 430242, name: 'Mochi' },
        }),
        { status: 200 }
      )
    );
    const pet = await getPetDetail('token', '430242');

    expect(pet.pet_id).toBe(430242);
    expect(pet.name).toBe('Mochi');
  });

  it('loads symptom record detail', async () => {
    const { getSymptomRecordDetail } = await import('./client');
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            record_id: 1,
            pet_id: 430242,
            pet_name: 'Mochi',
            pet_image: '',
            time_added: '2026-02-10T08:30:00.000Z',
            note: 'Vomited after eating breakfast.',
            note_image: [],
          },
        }),
        { status: 200 }
      )
    );
    const detail = await getSymptomRecordDetail('token', 'sym_001');

    expect(detail.record_id).toBe(1);
    expect(detail.note).toContain('Vomited');
  });

  it('loads presigned url and allows delete image', async () => {
    const { getPresignedUrl, deleteImage } = await import('./client');
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            upload_url: 'https://mock-r2-upload-url.com',
            object_key: 'pet-profile/mock.jpg',
            public_url: '/images/home.png',
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(new Response(null, { status: 200 }));

    const upload = await getPresignedUrl('token', 'image/jpeg', 'pet-profile');
    expect(upload.uploadUrl).toContain('mock-r2-upload-url.com');

    await expect(deleteImage('pet-profile/mock.jpg', 'token')).resolves.toBeUndefined();
  });
});
