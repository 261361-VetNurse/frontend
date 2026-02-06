import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL !== undefined ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:8000';

export async function proxyRequest(
    request: Request,
    endpoint: string,
    options: {
        method?: string;
        headers?: Record<string, string>;
        body?: any;
        skipAuth?: boolean;
    } = {}
) {
    const { method = 'GET', skipAuth = false } = options;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Forward Authorization header if present
    if (!skipAuth) {
        const authHeader = request.headers.get('Authorization');
        if (authHeader) {
            // Assume Client sends "Bearer <token>"
            // Backend expects "access_token" header usually, but let's check input context. 
            // client.ts uses 'access_token': token.
            // So we will extract token from "Bearer <token>" or just pass it if client sends raw token in specific header.
            // To be standard, let's assume Client sends "Authorization: Bearer <token>"
            // and we convert it to 'access_token': <token> for backend.
            const token = authHeader.replace('Bearer ', '');
            (headers as any)['access_token'] = token;
        } else {
            // Fallback: Check for 'access_token' header directly from client
            const directToken = request.headers.get('access_token');
            if (directToken) {
                (headers as any)['access_token'] = directToken;
            }
        }
    }

    try {
        const url = `${API_BASE_URL}${endpoint}`;
        console.log(`[Proxy] ${method} ${url}`);

        const fetchOptions: RequestInit = {
            method,
            headers,
        };

        if (options.body) {
            fetchOptions.body = JSON.stringify(options.body);
        } else if (method !== 'GET' && method !== 'HEAD') {
            // Try to read body from request if not explicitly passed
            try {
                const body = await request.json();
                fetchOptions.body = JSON.stringify(body);
            } catch (e) {
                // No body or parse error, ignore
            }
        }

        const response = await fetch(url, fetchOptions);

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            return NextResponse.json(
                { error: data.detail || 'Backend API Error' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('[Proxy Error]', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
