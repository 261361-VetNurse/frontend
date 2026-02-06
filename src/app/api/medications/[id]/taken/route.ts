import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    return proxyRequest(request, `/v1/medications/${params.id}/taken`, {
        method: 'PATCH'
    });
}
