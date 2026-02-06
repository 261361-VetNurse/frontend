import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    return proxyRequest(request, `/v1/appointments/${params.id}`);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    return proxyRequest(request, `/v1/appointments/${params.id}`, { method: 'DELETE' });
}
