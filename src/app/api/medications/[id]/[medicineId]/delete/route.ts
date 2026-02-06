import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';

export async function PATCH(request: NextRequest, { params }: { params: { id: string; medicineId: string } }) {
    // Although name is deleteMedicine, backend uses PATCH .../delete
    return proxyRequest(request, `/v1/medications/${params.id}/${params.medicineId}/delete`, {
        method: 'PATCH'
    });
}
