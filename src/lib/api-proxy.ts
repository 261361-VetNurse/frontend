import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function proxyRequest(
    request: NextRequest,
    endpoint: string
) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[Proxy] ${request.method} ${url}`);

    const incomingAuth = request.headers.get('authorization');
    console.log(`[Proxy] Incoming Auth: ${incomingAuth ? incomingAuth.substring(0, 20) + '...' : 'NONE'}`);


    try {
        // Clone headers to avoid mutation issues and ensure compatibility
        const headers = new Headers(request.headers);

        // Remove host header to avoid conflicts
        headers.delete('host');

        // FORCE: Extract token from Authorization and set as access_token header
        // The backend seems to require 'access_token' header specifically
        const authHeader = headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            // Ensure access_token is set
            headers.set('access_token', token);
        } else if (authHeader) {
            // Fallback: if no Bearer prefix, maybe it's just the token?
            // But usually it is Bearer. Let's try to trust the content.
            // If the authorization header is just the token, use it.
            if (!headers.has('access_token')) {
                headers.set('access_token', authHeader);
            }
        }

        const fetchOptions: RequestInit = {
            method: request.method,
            headers: headers,
        };

        // Only attach body for non-GET/HEAD requests
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            const contentType = headers.get('content-type');

            if (contentType?.includes('application/json')) {
                try {
                    const body = await request.json();
                    fetchOptions.body = JSON.stringify(body);
                } catch (e) {
                    console.error('[Proxy] Failed to parse JSON body', e);
                }
            } else {
                // For multipart/form-data and others, forward the body as ArrayBuffer
                // This preserves the original boundary in Content-Type header
                try {
                    const arrayBuffer = await request.arrayBuffer();
                    fetchOptions.body = Buffer.from(arrayBuffer);
                } catch (e) {
                    console.error('[Proxy] Failed to read request body', e);
                }
            }
        }

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Backend API Error' }));
            return NextResponse.json(error, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[Proxy Error]', error);
        return NextResponse.json(
            { detail: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
