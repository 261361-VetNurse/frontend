import { beforeEach, describe, expect, it, vi } from 'vitest';

const proxyRequestMock = vi.fn();

vi.mock('@/lib/api-proxy', () => ({
  proxyRequest: (...args: unknown[]) => proxyRequestMock(...args),
}));

import { GET as appointmentsGet, POST as appointmentsPost } from './appointments/route';
import { POST as notificationReadPost } from './notifications/[id]/read/route';
import { PATCH as appointmentEditPatch } from './appointments/[id]/edit/route';

describe('api route contracts', () => {
  beforeEach(() => {
    proxyRequestMock.mockReset();
    proxyRequestMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
  });

  it('appointments GET forwards query string and uses default GET method', async () => {
    const request = {
      nextUrl: new URL('http://localhost/api/appointments?status=upcoming'),
    };

    await appointmentsGet(request as any);

    expect(proxyRequestMock).toHaveBeenCalledWith(
      request,
      '/v1/appointments?status=upcoming'
    );
  });

  it('appointments POST forwards to create endpoint with POST method', async () => {
    const request = new Request('http://localhost/api/appointments', {
      method: 'POST',
      body: JSON.stringify({ location: 'Novel CMU' }),
      headers: { 'Content-Type': 'application/json' },
    });

    await appointmentsPost(request as any);

    expect(proxyRequestMock).toHaveBeenCalledWith(
      request,
      '/v1/appointments',
      { method: 'POST' }
    );
  });

  it('notification read route forwards dynamic id and POST method', async () => {
    const request = new Request('http://localhost/api/notifications/notif_001/read', { method: 'POST' });

    await notificationReadPost(request as any, {
      params: Promise.resolve({ id: 'notif_001' }),
    });

    expect(proxyRequestMock).toHaveBeenCalledWith(
      request,
      '/notifications/notif_001/read',
      { method: 'POST' }
    );
  });

  it('appointment edit route forwards id and PATCH method', async () => {
    const request = new Request('http://localhost/api/appointments/apt-001/edit', { method: 'PATCH' });

    await appointmentEditPatch(request as any, {
      params: Promise.resolve({ id: 'apt-001' }),
    });

    expect(proxyRequestMock).toHaveBeenCalledWith(
      request,
      '/v1/appointments/apt-001/edit',
      { method: 'PATCH' }
    );
  });
});
