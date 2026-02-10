import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';

export async function POST(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const lineId = searchParams.get('line_id');
    const topic = searchParams.get('topic');
    const date = searchParams.get('date');

    let queryString = '';
    if (lineId && topic && date) {
        queryString = `?line_id=${encodeURIComponent(lineId)}&topic=${encodeURIComponent(topic)}&date=${encodeURIComponent(date)}`;
    }

    return proxyRequest(request, `/auth/notify/appointment${queryString}`);
}
