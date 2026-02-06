import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';

export async function GET(request: NextRequest, { params }: { params: { id: string; medicineId: string } }) {
    return proxyRequest(request, `/v1/medications/${params.id}/${params.medicineId}`);
}
