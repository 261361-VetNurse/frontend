import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    return proxyRequest(request, `/v1/pets/${params.id}`);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    return proxyRequest(request, `/v1/pets/${params.id}`, { method: 'PATCH' });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    return proxyRequest(request, `/v1/pets/${params.id}`, { method: 'DELETE' });
}
