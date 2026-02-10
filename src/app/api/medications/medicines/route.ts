import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';

export async function POST(request: NextRequest) {
    return proxyRequest(request, '/v1/medications/medicines');
}
