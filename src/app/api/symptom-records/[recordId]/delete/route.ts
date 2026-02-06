import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';

export async function DELETE(request: NextRequest, { params }: { params: { recordId: string } }) {
    return proxyRequest(request, `/v1/symptom-records/${params.recordId}/delete`, { method: 'DELETE' });
}
