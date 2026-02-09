import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';

export async function POST(request: NextRequest) {
    const body = await request.json();
    return proxyRequest(request, '/auth/line/exchange', {
        method: 'POST',
        body,
        skipAuth: true
    });
}
