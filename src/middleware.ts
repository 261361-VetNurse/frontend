import { NextRequest, NextResponse } from 'next/server';

// Routes that do NOT require authentication
const PUBLIC_PATHS = [
    '/pet-owners/login-page',
    '/auth',           // LINE OAuth callback landing path
    '/api/',           // All API routes handle their own auth
];

// Routes that should skip the middleware entirely (static assets, etc.)
const SKIP_PREFIXES = ['/_next', '/favicon', '/icon', '/Ava'];

const LOGIN_PAGE = '/pet-owners/login-page';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip static assets and internal Next.js routes
    if (SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
        return NextResponse.next();
    }

    // Skip public routes — no auth needed
    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    // Check for the auth cookie (set by AuthContext on login)
    const authToken = request.cookies.get('auth-token')?.value;

    if (!authToken) {
        // No token → redirect to login, preserving the intended URL for post-login redirect
        const loginUrl = new URL(LOGIN_PAGE, request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    // Run on all pages except static files and Next.js internals
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
