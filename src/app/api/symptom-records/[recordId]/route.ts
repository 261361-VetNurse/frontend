import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';

export async function GET(request: NextRequest, { params }: { params: { recordId: string } }) {
    return proxyRequest(request, `/v1/symptom-records/${params.recordId}`);
}

export async function PATCH(request: NextRequest, { params }: { params: { recordId: string } }) {
    return proxyRequest(request, `/v1/symptom-records/${params.recordId}`, { method: 'PATCH' });
}
