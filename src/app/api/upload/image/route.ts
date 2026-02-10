import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';

export async function POST(request: NextRequest) {
    return proxyRequest(request, '/v1/upload/image');
}

export async function DELETE(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const endpoint = `/v1/upload/image${queryString ? `?${queryString}` : ''}`;
    return proxyRequest(request, endpoint);
}
