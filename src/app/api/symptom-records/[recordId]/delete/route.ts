import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ recordId: string }> }
) {
    const { recordId } = await params;
    return proxyRequest(request, `/v1/symptom-records/${recordId}/delete`);
}
