import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const endpoint = `/v1/medications/medicines/filter${queryString ? `?${queryString}` : ''}`;
    return proxyRequest(request, endpoint);
}
