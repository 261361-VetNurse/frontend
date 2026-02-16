import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';
import { proxyRequest } from './api-proxy';

describe('api-proxy', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('forwards Authorization bearer token into access_token header', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );

    const request = new Request('http://localhost/api/pets', {
      headers: {
        Authorization: 'Bearer test-token',
      },
    });

    const response = await proxyRequest(request as unknown as NextRequest, '/v1/pets');
    const body = await response.json();

    expect(body.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const fetchOptions = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = fetchOptions.headers as Record<string, string>;
    expect(headers.access_token).toBe('test-token');
  });

  it('passes through query endpoint and maps non-2xx to error object', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: 'forbidden' }), { status: 403 })
    );

    const request = new Request('http://localhost/api/pets?status=upcoming', {
      method: 'GET',
    });

    const response = await proxyRequest(request as unknown as NextRequest, '/v1/pets?status=upcoming');
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body).toEqual({ error: 'forbidden' });
  });

  it('returns 500 on network failure', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('network down'));

    const request = new Request('http://localhost/api/pets');
    const response = await proxyRequest(request as unknown as NextRequest, '/v1/pets');
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Internal Server Error' });
  });
});
