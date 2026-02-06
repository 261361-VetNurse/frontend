import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';

export async function DELETE(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const endpoint = `/v1/upload/image${queryString ? `?${queryString}` : ''}`;
    return proxyRequest(request, endpoint, { method: 'DELETE' });
}
