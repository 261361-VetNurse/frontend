import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; medicineId: string }> }) {
    // Although name is deleteMedicine, backend uses PATCH .../delete
    const { id, medicineId } = await params;
    return proxyRequest(request, `/v1/medications/${id}/${medicineId}/delete`, {
        method: 'PATCH'
    });
}
